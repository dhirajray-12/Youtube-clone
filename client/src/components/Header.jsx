import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import Avatar from './Avatar.jsx';
import { LogoIcon, MenuIcon, SearchIcon, UploadIcon } from './Icons.jsx';

export default function Header({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get('q') || '');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const close = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenuOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const submit = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/results?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="icon-btn" onClick={onToggleSidebar} aria-label="Toggle menu">
          <MenuIcon />
        </button>
        <Link to="/" className="logo">
          <LogoIcon />
          <span>YouTube</span>
        </Link>
      </div>

      <form className="search" onSubmit={submit} role="search">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
          aria-label="Search"
        />
        <button type="submit" aria-label="Search">
          <SearchIcon size={20} />
        </button>
      </form>

      <div className="header-right">
        {user ? (
          <>
            <Link to="/upload" className="icon-btn" title="Upload video">
              <UploadIcon />
            </Link>
            <div className="menu-wrap" ref={menuRef}>
              <button className="avatar-btn" onClick={() => setMenuOpen((o) => !o)} aria-label="Account">
                <Avatar name={user.username} src={user.avatarUrl} size={32} />
              </button>
              {menuOpen && (
                <div className="dropdown" onClick={() => setMenuOpen(false)}>
                  <div className="dropdown-user">
                    <Avatar name={user.username} src={user.avatarUrl} size={40} />
                    <div>
                      <strong>{user.username}</strong>
                      <div className="muted">{user.email}</div>
                    </div>
                  </div>
                  <Link to={`/channel/${user.id}`}>Your channel</Link>
                  <Link to="/studio">Studio</Link>
                  <Link to="/upload">Upload video</Link>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link to="/login" className="signin-btn">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
