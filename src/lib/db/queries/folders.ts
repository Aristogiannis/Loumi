import { eq, and, isNull } from 'drizzle-orm';
import { db } from '../index';
import { folders, conversations, type Folder, type NewFolder } from '../schema';

export async function getFoldersByUserId(userId: string): Promise<Folder[]> {
  const result = await db.query.folders.findMany({
    where: eq(folders.userId, userId),
    with: {
      conversations: {
        where: eq(conversations.archived, false),
      },
      children: true,
    },
  });
  return result;
}

export async function getRootFolders(userId: string): Promise<Folder[]> {
  const result = await db.query.folders.findMany({
    where: and(eq(folders.userId, userId), isNull(folders.parentId)),
    with: {
      children: true,
    },
  });
  return result;
}

export async function getFolderById(
  id: string,
  userId: string
): Promise<Folder | undefined> {
  const result = await db.query.folders.findFirst({
    where: and(eq(folders.id, id), eq(folders.userId, userId)),
    with: {
      conversations: {
        where: eq(conversations.archived, false),
      },
      children: true,
      parent: true,
    },
  });
  return result;
}

export async function createFolder(data: NewFolder): Promise<Folder> {
  const [folder] = await db.insert(folders).values(data).returning();
  return folder!;
}

export async function updateFolder(
  id: string,
  userId: string,
  data: Partial<Pick<Folder, 'name' | 'parentId'>>
): Promise<Folder | undefined> {
  const [folder] = await db
    .update(folders)
    .set(data)
    .where(and(eq(folders.id, id), eq(folders.userId, userId)))
    .returning();
  return folder;
}

export async function deleteFolder(id: string, userId: string): Promise<void> {
  // First, move all conversations in this folder to no folder
  await db
    .update(conversations)
    .set({ folderId: null })
    .where(and(eq(conversations.folderId, id), eq(conversations.userId, userId)));

  // Then delete the folder (children folders will be cascade deleted)
  await db
    .delete(folders)
    .where(and(eq(folders.id, id), eq(folders.userId, userId)));
}

export async function moveFolder(
  id: string,
  userId: string,
  newParentId: string | null
): Promise<Folder | undefined> {
  // Prevent circular references
  if (newParentId) {
    const isCircular = await checkCircularReference(id, newParentId, userId);
    if (isCircular) {
      throw new Error('Cannot move folder into its own descendant');
    }
  }

  return updateFolder(id, userId, { parentId: newParentId });
}

async function checkCircularReference(
  folderId: string,
  potentialParentId: string,
  userId: string
): Promise<boolean> {
  let currentId: string | null = potentialParentId;

  while (currentId) {
    if (currentId === folderId) {
      return true;
    }

    const parent: { parentId: string | null } | undefined = await db.query.folders.findFirst({
      where: and(eq(folders.id, currentId), eq(folders.userId, userId)),
      columns: { parentId: true },
    });

    currentId = parent?.parentId ?? null;
  }

  return false;
}

export interface FolderTree extends Folder {
  children: FolderTree[];
}

export async function getFolderTree(userId: string): Promise<FolderTree[]> {
  const allFolders = await getFoldersByUserId(userId);

  const folderMap = new Map<string, FolderTree>();
  const rootFolders: FolderTree[] = [];

  // First pass: create folder tree nodes
  for (const folder of allFolders) {
    folderMap.set(folder.id, { ...folder, children: [] });
  }

  // Second pass: build tree structure
  for (const folder of allFolders) {
    const node = folderMap.get(folder.id)!;
    if (folder.parentId) {
      const parent = folderMap.get(folder.parentId);
      if (parent) {
        parent.children.push(node);
      }
    } else {
      rootFolders.push(node);
    }
  }

  return rootFolders;
}
