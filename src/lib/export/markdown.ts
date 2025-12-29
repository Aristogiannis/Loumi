import type { Conversation, Message } from '@/types/chat';

export function exportToMarkdown(
  conversation: Conversation,
  messages: Message[]
): string {
  const lines: string[] = [];

  // Header
  lines.push(`# ${conversation.title}`);
  lines.push('');
  lines.push(`**Model:** ${conversation.model}`);
  lines.push(`**Created:** ${new Date(conversation.createdAt).toLocaleString()}`);
  lines.push(`**Last updated:** ${new Date(conversation.updatedAt).toLocaleString()}`);
  lines.push('');
  lines.push('---');
  lines.push('');

  // Messages
  for (const message of messages) {
    const roleLabel = message.role === 'user' ? '**You**' : '**Assistant**';
    const timestamp = new Date(message.createdAt).toLocaleTimeString();

    lines.push(`### ${roleLabel} (${timestamp})`);
    lines.push('');

    // Include thinking if present
    if (message.thinking) {
      lines.push('> **Thinking:**');
      lines.push('>');
      message.thinking.split('\n').forEach((line) => {
        lines.push(`> ${line}`);
      });
      lines.push('');
    }

    // Message content
    lines.push(message.content);
    lines.push('');

    // Add model info for assistant messages
    if (message.role === 'assistant' && message.model) {
      lines.push(`*Model: ${message.model}*`);
      if (message.tokensUsed) {
        lines.push(`*Tokens: ${message.tokensUsed}*`);
      }
      lines.push('');
    }

    lines.push('---');
    lines.push('');
  }

  // Footer
  lines.push('');
  lines.push(`*Exported from Loumi on ${new Date().toLocaleString()}*`);

  return lines.join('\n');
}

export function generateMarkdownFilename(conversation: Conversation): string {
  const sanitizedTitle = conversation.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50);

  const date = new Date().toISOString().split('T')[0];

  return `loumi-${sanitizedTitle}-${date}.md`;
}
