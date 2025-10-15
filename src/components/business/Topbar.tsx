'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { BellIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export function Topbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        {/* Logo */}
        <div className="flex items-center">
          <button
            className="lg:hidden mr-4 p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          <Link href="/business/dashboard" className="flex items-center">
            <span className="text-xl font-bold text-blue-600">Business Dashboard</span>
          </Link>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button
            className="relative p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            aria-label="Notifications"
          >
            <BellIcon className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {session?.user?.name || 'User'}
              </span>
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href="/business/dashboard/profile"
                      className={`block px-4 py-2 text-sm text-gray-700 ${
                        active ? 'bg-gray-50' : ''
                      }`}
                    >
                      Mon Profil
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href="/business/dashboard/settings"
                      className={`block px-4 py-2 text-sm text-gray-700 ${
                        active ? 'bg-gray-50' : ''
                      }`}
                    >
                      Paramètres
                    </Link>
                  )}
                </Menu.Item>
                <div className="border-t border-gray-100 my-1"></div>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className={`block w-full text-left px-4 py-2 text-sm text-red-600 ${
                        active ? 'bg-gray-50' : ''
                      }`}
                    >
                      Déconnexion
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white py-2 px-4">
          <p className="text-sm text-gray-500">Mobile menu (à implémenter)</p>
        </div>
      )}
    </header>
  );
}
