'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { User, Shield, CreditCard } from 'lucide-react';

const navItems = [
  {
    href: '/settings',
    label: 'Profile',
    icon: User,
  },
  {
    href: '/settings/privacy',
    label: 'Privacy',
    icon: Shield,
  },
  {
    href: '/settings/billing',
    label: 'Billing',
    icon: CreditCard,
  },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="w-48 shrink-0">
      <ul className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
