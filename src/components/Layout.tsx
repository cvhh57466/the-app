import { Link, Outlet, useLocation } from 'react-router-dom';
import { Compass, HeartHandshake, Map, Home } from 'lucide-react';

export default function Layout() {
  const location = useLocation();
  const isExplore = location.pathname.startsWith('/explore');

  return (
    <div className={`flex flex-col ${isExplore ? 'h-screen overflow-hidden' : 'min-h-screen'} bg-bg text-text-main font-sans`}>
      {/* Global Header */}
      <header className="h-[70px] bg-white border-b border-border flex items-center justify-between px-4 sm:px-8 shrink-0 z-50">
        <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
            <Compass size={20} />
          </div>
          <h1 className="text-2xl font-extrabold text-primary tracking-tight">桃園趣哪玩</h1>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-bold transition-colors ${
              location.pathname === '/' ? 'bg-primary/10 text-primary' : 'text-text-sub hover:bg-gray-100 hover:text-text-main'
            }`}
          >
            <Home size={18} />
            <span className="hidden sm:inline">首頁</span>
          </Link>
          <Link
            to="/explore"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-bold transition-colors ${
              location.pathname.startsWith('/explore') ? 'bg-primary/10 text-primary' : 'text-text-sub hover:bg-gray-100 hover:text-text-main'
            }`}
          >
            <Map size={18} />
            <span className="hidden sm:inline">探索景點</span>
          </Link>
          <Link
            to="/support"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-bold transition-colors ${
              location.pathname === '/support' ? 'bg-primary/10 text-primary' : 'text-text-sub hover:bg-gray-100 hover:text-text-main'
            }`}
          >
            <HeartHandshake size={18} />
            <span className="hidden sm:inline">支持我們</span>
          </Link>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <Outlet />
      </main>
      
      {/* Footer (Only show on non-explore pages to not break the map view) */}
      {!isExplore && (
        <footer className="bg-white border-t border-border py-8 mt-auto">
          <div className="max-w-5xl mx-auto px-4 text-center text-text-sub text-sm">
            <p className="mb-2">© {new Date().getFullYear()} 桃園趣哪玩 Taoyuan Explorer. All rights reserved.</p>
            <div className="flex justify-center gap-4 mt-4">
               <Link to="/privacy-policy" className="hover:text-primary transition-colors">隱私權政策 (Privacy Policy)</Link>
               <Link to="/terms-of-service" className="hover:text-primary transition-colors">使用者條款 (Terms of Service)</Link>
               <Link to="/support" className="hover:text-primary transition-colors">聯絡我們</Link>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
