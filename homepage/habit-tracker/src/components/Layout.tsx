import React, { useState } from 'react';
import { Menu, Search, User, Edit } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from 'next/link';
import { LayoutProps } from '../../.next/types/app/layout';
import { ThemeToggle } from "@/components/theme-toggle"

const Layout = ({ children } : LayoutProps) => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <div className="dark:bg-neutral-950 min-h-screen bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-900 dark:to-neutral-950">
      {/* Top bar */}
      <div className="dark:bg-neutral-900 fixed top-0 left-0 right-0 h-16 bg-white backdrop-blur-md z-50 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu className="h-6 w-6" />
          </Button>
          {/* <Input 
            type="search" 
            placeholder="Search..." 
            className="w-64 bg-transparent"
          /> */}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon">
            <Edit className="h-5 w-5" />
          </Button>
          <ThemeToggle />
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`fixed top-16 left-0 bottom-0 w-64 bg-white dark:bg-neutral-800 transition-all duration-300 ease-in-out z-40 ${isSidebarExpanded ? 'translate-x-0' : '-translate-x-full'}`}>
        <nav className="p-4">
          {/* Add your sidebar menu items here */}
          <ul className="space-y-2">              <li>
                <Link href="/" className="block px-4 py-2 rounded-md hover:bg-gray-100">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/enter-data" className="block px-4 py-2 rounded-md hover:bg-gray-100">
                  Data Entry
                </Link>
              </li>
              <li>
                <Link href="/meal-plan/generate" className="block px-4 py-2 rounded-md hover:bg-gray-100">
                  Meal Plan
                </Link>
              </li>
              <li>
                <Link href="/meal-plan/edit-foods" className="block px-4 py-2 rounded-md hover:bg-gray-100">
                  Edit Foods
                </Link>
              </li>
              <li>
                <a href="#" className="block px-4 py-2 rounded-md hover:bg-gray-100">
                  Settings
                </a>
              </li>
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <main className={`dark:bg-neutral-950 pt-16 transition-all duration-300 ease-in-out ${isSidebarExpanded ? 'ml-64' : 'ml-0'}`}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;