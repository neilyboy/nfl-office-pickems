'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ClipboardList, Activity, Home } from 'lucide-react';

export function UserNav() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/picks', label: 'Make Picks', icon: ClipboardList },
    { path: '/scores', label: 'Live Scores', icon: Activity },
  ];

  return (
    <div className="flex gap-2">
      {navItems.map((item) => (
        <Button
          key={item.path}
          variant={pathname === item.path ? 'default' : 'ghost'}
          size="sm"
          onClick={() => router.push(item.path)}
        >
          <item.icon className="w-4 h-4 mr-2" />
          {item.label}
        </Button>
      ))}
    </div>
  );
}
