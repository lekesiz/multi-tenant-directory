'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  UserIcon,
  PhotoIcon,
  ClockIcon,
  StarIcon,
  ChartBarIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Aperçu', href: '/business/dashboard', icon: HomeIcon },
  { name: 'Mon Profil', href: '/business/dashboard/profile', icon: UserIcon },
  { name: 'Activités', href: '/business/dashboard/activities', icon: SparklesIcon },
  { name: 'Photos', href: '/business/dashboard/photos', icon: PhotoIcon },
  { name: 'Horaires', href: '/business/dashboard/hours', icon: ClockIcon },
  { name: 'Avis', href: '/business/dashboard/reviews', icon: StarIcon },
  {
    name: 'Statistiques',
    href: '/business/dashboard/analytics',
    icon: ChartBarIcon,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:pt-16 bg-white border-r border-gray-200">
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-4 py-3 text-sm font-medium rounded-lg
                transition-colors duration-200
                ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
