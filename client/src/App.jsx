import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import Home from './pages/Home.jsx';
import Trending from './pages/Trending.jsx';
import Search from './pages/Search.jsx';
import Watch from './pages/Watch.jsx';
import Channel from './pages/Channel.jsx';
import Upload from './pages/Upload.jsx';
import Studio from './pages/Studio.jsx';
import { Login, Register } from './pages/Auth.jsx';
import { History, Liked, Subscriptions } from './pages/Feeds.jsx';

export default function App() {
  const location = useLocation();
  const isWatch = location.pathname.startsWith('/watch');
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 1100);

  // The watch page uses an overlay drawer, so close it on navigation.
  useEffect(() => {
    if (isWatch || window.innerWidth <= 800) setSidebarOpen(false);
  }, [location.pathname, isWatch]);

  const overlay = isWatch || window.innerWidth <= 800;

  return (
    <>
      <Header onToggleSidebar={() => setSidebarOpen((o) => !o)} />
      <div className={`layout ${overlay ? 'overlay-mode' : ''}`}>
        {(!overlay || sidebarOpen) && (
          <Sidebar open={sidebarOpen} onNavigate={() => overlay && setSidebarOpen(false)} />
        )}
        {overlay && sidebarOpen && <div className="backdrop" onClick={() => setSidebarOpen(false)} />}
        <main className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/results" element={<Search />} />
            <Route path="/watch/:id" element={<Watch />} />
            <Route path="/channel/:id" element={<Channel />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/upload" element={<RequireAuth><Upload /></RequireAuth>} />
            <Route path="/studio" element={<RequireAuth><Studio /></RequireAuth>} />
            <Route path="/feed/subscriptions" element={<RequireAuth><Subscriptions /></RequireAuth>} />
            <Route path="/feed/history" element={<RequireAuth><History /></RequireAuth>} />
            <Route path="/feed/liked" element={<RequireAuth><Liked /></RequireAuth>} />
            <Route path="*" element={<p className="empty">Page not found.</p>} />
          </Routes>
        </main>
      </div>
    </>
  );
}
