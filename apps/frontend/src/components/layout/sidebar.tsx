'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { useLogout } from '@/hooks/useAuth';
import {
  LayoutDashboard, Briefcase, Users, Calendar,
  BarChart2, Settings, LogOut,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/jobs', label: 'Vagas', icon: Briefcase },
  { href: '/candidates', label: 'Candidatos', icon: Users },
  { href: '/interviews', label: 'Entrevistas', icon: Calendar },
  { href: '/reports', label: 'Relatórios', icon: BarChart2 },
  { href: '/settings', label: 'Configurações', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-gray-100 bg-white">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-label="ATS logo">
          <rect width="28" height="28" rx="6" fill="#01696f" />
          <path d="M7 20L14 8l7 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9.5 16h9" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="font-semibold text-gray-900">ATS Open</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              pathname.startsWith(href)
                ? 'bg-primary-highlight text-primary-active'
                : 'text-gray-600 hover:bg-surface-offset'
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-xs font-semibold">
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="truncate text-xs text-gray-500">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={() => logout.mutate()}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-500 hover:bg-surface-offset transition-colors"
        >
          <LogOut size={16} /> Sair
        </button>
      </div>
    </aside>
  );
}
