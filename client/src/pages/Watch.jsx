import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../AuthContext.jsx';
import { useFetch } from '../useFetch.js';
import Avatar from '../components/Avatar.jsx';
import { DislikeIcon, LikeIcon } from '../components/Icons.jsx';
import { VideoGrid } from '../components/VideoCard.jsx';
import { formatCount, timeAgo } from '../utils.js';

export default function Watch() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: video, setData: setVideo, error } = useFetch(`/videos/${id}`);
  const { data: related } = useFetch(`/videos/${id}/related`);
  const [expanded, setExpanded] = useState(false);
  const viewed = useRef(null);

  // Count one view per video visit (guarded against StrictMode double effects).
  useEffect(() => {
    if (viewed.current === id) return;
    viewed.current = id;
    setExpanded(false);
    api(`/videos/${id}/view`, { body: {} }).catch(() => {});
  }, [id]);

  const requireUser = () => {
    if (!user) navigate('/login', { state: { from: `/watch/${id}` } });
    return !!user;
  };

  const rate = async (value) => {
    if (!requireUser()) return;
    const next = video.userLike === value ? 0 : value;
    setVideo({ ...video, ...(await api(`/videos/${id}/like`, { body: { value: next } })) });
  };

  const subscribe = async () => {
    if (!requireUser()) return;
    setVideo({ ...video, ...(await api(`/channels/${video.channelId}/subscribe`, { body: {} })) });
  };

  if (error) return <p className="empty">{error}</p>;
  if (!video) return <div className="spinner" />;

  const isOwner = user?.id === video.channelId;

  return (
    <div className="watch">
      <div className="watch-main">
        <video key={video.id} className="player" src={video.videoUrl} poster={video.thumbnailUrl || undefined} controls autoPlay />
        <h1 className="watch-title">{video.title}</h1>

        <div className="watch-bar">
          <div className="channel-row">
            <Link to={`/channel/${video.channelId}`}>
              <Avatar name={video.channelName} src={video.channelAvatar} size={40} />
            </Link>
            <div>
              <Link to={`/channel/${video.channelId}`} className="channel-name">
                {video.channelName}
              </Link>
              <div className="muted small">{formatCount(video.subscriberCount)} subscribers</div>
            </div>
            {isOwner ? (
              <Link to="/studio" className="btn secondary">Manage videos</Link>
            ) : (
              <button className={`btn ${video.subscribed ? 'secondary' : 'subscribe'}`} onClick={subscribe}>
                {video.subscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            )}
          </div>

          <div className="like-group">
            <button className={`pill ${video.userLike === 1 ? 'on' : ''}`} onClick={() => rate(1)} aria-label="Like">
              <LikeIcon size={20} /> {formatCount(video.likes)}
            </button>
            <button className={`pill ${video.userLike === -1 ? 'on' : ''}`} onClick={() => rate(-1)} aria-label="Dislike">
              <DislikeIcon size={20} /> {video.dislikes > 0 && formatCount(video.dislikes)}
            </button>
            <button
              className="pill"
              onClick={() => navigator.clipboard?.writeText(window.location.href).then(() => alert('Link copied!'))}
            >
              Share
            </button>
          </div>
        </div>

        <div className={`description ${expanded ? 'expanded' : ''}`} onClick={() => setExpanded(true)}>
          <strong>
            {video.views.toLocaleString()} views • {timeAgo(video.createdAt)} • {video.category}
          </strong>
          <p>{video.description || 'No description.'}</p>
          {expanded ? (
            <button className="link-btn" onClick={(e) => (e.stopPropagation(), setExpanded(false))}>
              Show less
            </button>
          ) : (
            <span className="link-btn">…more</span>
          )}
        </div>

        <Comments videoId={video.id} ownerId={video.channelId} />
      </div>

      <aside className="watch-side">
        <VideoGrid videos={related} layout="compact" empty="" />
      </aside>
    </div>
  );
}

function Comments({ videoId, ownerId }) {
  const { user } = useAuth();
  const { data: comments, setData } = useFetch(`/videos/${videoId}/comments`);
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const post = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const comment = await api(`/videos/${videoId}/comments`, { body: { text } });
      setData([comment, ...comments]);
      setText('');
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (id) => {
    await api(`/comments/${id}`, { method: 'DELETE' });
    setData(comments.filter((c) => c.id !== id));
  };

  return (
    <section className="comments">
      <h3>{comments ? comments.length : 0} Comments</h3>
      {user ? (
        <form className="comment-form" onSubmit={post}>
          <Avatar name={user.username} src={user.avatarUrl} size={40} />
          <div>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Add a comment…" maxLength={2000} />
            {text && (
              <div className="comment-actions">
                <button type="button" className="btn ghost" onClick={() => setText('')}>Cancel</button>
                <button className="btn">Comment</button>
              </div>
            )}
            {error && <p className="error">{error}</p>}
          </div>
        </form>
      ) : (
        <p className="muted">
          <Link to="/login">Sign in</Link> to leave a comment.
        </p>
      )}
      {comments?.map((c) => (
        <div key={c.id} className="comment">
          <Link to={`/channel/${c.userId}`}>
            <Avatar name={c.username} src={c.avatarUrl} size={40} />
          </Link>
          <div>
            <div className="small">
              <strong>@{c.username}</strong> <span className="muted">{timeAgo(c.createdAt)}</span>
            </div>
            <p>{c.text}</p>
          </div>
          {user && (user.id === c.userId || user.id === ownerId) && (
            <button className="link-btn danger" onClick={() => remove(c.id)}>Delete</button>
          )}
        </div>
      ))}
    </section>
  );
}
