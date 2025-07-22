'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { IconUser, IconSettings, IconLogout, IconChevronDown } from '@tabler/icons-react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getRoleColor, ROLE_DISPLAY_NAMES } from '@/lib/services/users';
import { UserRole } from '@prisma/client';
import { useConfetti } from '@/components/ui/confetti';

export function UserMenu() {
  const { data: session } = useSession();
  const router = useRouter();
  const { trigger } = useConfetti();

  if (!session?.user) {
    return null;
  }

  const user = session.user;
  // Session user only has id, email, and role - use email for display
  const fullName = user.email?.split('@')[0] || 'User';
  const initials = fullName.slice(0, 2).toUpperCase();
  const userRole = user.role as UserRole;

  const handleSignOut = async () => {
    // Trigger confetti for a fun sign-out experience
    trigger({
      elementCount: 30,
      colors: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'],
      duration: 2000
    });

    // Small delay to show confetti before redirect
    setTimeout(async () => {
      await signOut({ callbackUrl: '/auth/sign-in' });
    }, 500);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-auto px-2 sm:px-3">
          <div className="flex items-center space-x-2">
            <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="hidden sm:flex flex-col items-start">
              <span className="text-sm font-medium leading-none">{fullName}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
            <IconChevronDown className="h-3 w-3 sm:h-4 sm:w-4 opacity-50" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{fullName}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Badge className={getRoleColor(userRole)} variant="secondary">
              {ROLE_DISPLAY_NAMES[userRole]}
            </Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push('/dashboard/profile')}
          className="cursor-pointer"
        >
          <IconUser className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.push('/dashboard/settings')}
          className="cursor-pointer"
        >
          <IconSettings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <IconLogout className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
