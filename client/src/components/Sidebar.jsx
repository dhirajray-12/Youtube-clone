import { NavLink } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { useFetch } from '../useFetch.js';
import Avatar from './Avatar.jsx';
import { FireIcon, HistoryIcon, HomeIcon, LikeIcon, SubsIcon, VideosIcon } from './Icons.jsx';

export default function Sidebar({ open, onNavigate }) {
  const { user } = useAuth();
  const { data: subs } = useFetch(user ? '/me/subscriptions' : null);

  const item = (to, Icon, label) => (
    <NavLink to={to} end className="side-item" onClick={onNavigate}>
      <Icon />
      <span>{label}</span>
    </NavLink>
  );

  return (
    <aside className={`sidebar ${open ? 'open' : 'mini'}`}>
      {item('/', HomeIcon, 'Home')}
      {item('/trending', FireIcon, 'Trending')}
      {item('/feed/subscriptions', SubsIcon, 'Subscriptions')}
      <hr />
      {item('/feed/history', HistoryIcon, 'History')}
      {item('/feed/liked', LikeIcon, 'Liked videos')}
      {user && item('/studio', VideosIcon, 'Your videos')}
      {user && subs?.length > 0 && (
        <div className="side-section">
          <hr />
          <h4>Subscriptions</h4>
          {subs.map((c) => (
            <NavLink key={c.id} to={`/channel/${c.id}`} className="side-item" onClick={onNavigate}>
              <Avatar name={c.username} src={c.avatarUrl} size={24} />
              <span>{c.username}</span>
            </NavLink>
          ))}
        </div>
      )}
    </aside>
  );
}
