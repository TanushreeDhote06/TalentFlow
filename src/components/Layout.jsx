import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  BriefcaseIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

const navigation = [
  { name: 'Jobs', href: '/jobs', icon: BriefcaseIcon },
  { name: 'Candidates', href: '/candidates', icon: UsersIcon },
  { name: 'Assessments', href: '/assessments/1', icon: BriefcaseIcon },

];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-blue-950 border-r border-gray-200">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-primary-600 text-white">TalentFlow</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary-50 bg-white text-black '
                      : 'text-white hover:text-black hover:bg-white'
                  )}
                >
                  <item.icon
                    className={clsx(
                      'mr-3 h-5 w-5',
                      isActive ? 'text-primary-700' : 'text-gray-400'
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              TalentFlow HR Management
            </p>
          </div>
        </div>
      </div>


      {/* Main content */}
      <div className="pl-64 ">
        <main className="py-6 px-8 ">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

