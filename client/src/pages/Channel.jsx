import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../AuthContext.jsx';
import { useFetch } from '../useFetch.js';
import Avatar from '../components/Avatar.jsx';
import { VideoGrid } from '../components/VideoCard.jsx';
import { formatCount } from '../utils.js';

export default function Channel() {
  const { id } = useParams();
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const { data: channel, setData, error } = useFetch(`/channels/${id}`);
  const [tab, setTab] = useState('videos');
  const [editing, setEditing] = useState(false);

  if (error) return <p className="empty">{error}</p>;
  if (!channel) return <div className="spinner" />;

  const isOwner = user?.id === channel.id;

  const subscribe = async () => {
    if (!user) return navigate('/login', { state: { from: `/channel/${id}` } });
    setData({ ...channel, ...(await api(`/channels/${id}/subscribe`, { body: {} })) });
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    const { user: updated } = await api('/me', { method: 'PATCH', form: new FormData(e.target) });
    setUser(updated);
    setData({ ...channel, description: updated.description, avatarUrl: updated.avatarUrl });
    setEditing(false);
  };

  return (
    <div className="page">
      <div className="banner" style={{ background: `linear-gradient(135deg, ${channel.bannerColor}, #1f1f1f)` }} />
      <div className="channel-header">
        <Avatar name={channel.username} src={channel.avatarUrl} size={120} />
        <div className="channel-meta">
          <h1>{channel.username}</h1>
          <p className="muted">
            @{channel.username} • {formatCount(channel.subscriberCount)} subscribers • {channel.videoCount} videos
          </p>
          <p className="muted clamp">{channel.description}</p>
          {isOwner ? (
            <button className="btn secondary" onClick={() => setEditing((e) => !e)}>Customize channel</button>
          ) : (
            <button className={`btn ${channel.subscribed ? 'secondary' : 'subscribe'}`} onClick={subscribe}>
              {channel.subscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          )}
        </div>
      </div>

      {editing && (
        <form className="card edit-profile" onSubmit={saveProfile}>
          <label>
            Description
            <textarea name="description" defaultValue={channel.description} rows={3} />
          </label>
          <label>
            Avatar image
            <input type="file" name="avatar" accept="image/*" />
          </label>
          <button className="btn">Save</button>
        </form>
      )}

      <div className="tabs">
        {['videos', 'about'].map((t) => (
          <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
            {t[0].toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'videos' ? (
        <VideoGrid videos={channel.videos} empty="This channel has no videos yet." />
      ) : (
        <div className="about">
          <h3>Description</h3>
          <p>{channel.description || 'No description.'}</p>
          <h3>Stats</h3>
          <p className="muted">Joined {new Date(`${channel.createdAt.replace(' ', 'T')}Z`).toLocaleDateString()}</p>
          <p className="muted">{channel.totalViews.toLocaleString()} total views</p>
        </div>
      )}
    </div>
  );
}
