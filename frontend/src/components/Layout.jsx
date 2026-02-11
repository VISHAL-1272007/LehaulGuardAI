import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 transition-colors duration-300">
      {/* Background Grid Pattern */}
      <div className="fixed inset-0 cyber-grid-bg opacity-20 pointer-events-none"></div>
      
      <div className="relative flex h-screen overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          
          <main className="flex-1 overflow-y-auto smooth-scroll p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
