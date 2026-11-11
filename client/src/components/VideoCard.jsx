import { useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from './Avatar.jsx';
import { formatCount, formatDuration, timeAgo } from '../utils.js';

export function Thumbnail({ video }) {
  const [broken, setBroken] = useState(false);
  return (
    <div className="thumb">
      {broken ? (
        <div className="thumb-fallback">{video.title}</div>
      ) : video.thumbnailUrl ? (
        <img src={video.thumbnailUrl} alt="" loading="lazy" onError={() => setBroken(true)} />
      ) : (
        <video src={`${video.videoUrl}#t=1`} preload="metadata" muted />
      )}
      {video.duration > 0 && <span className="duration">{formatDuration(video.duration)}</span>}
    </div>
  );
}

// layout: "grid" (home), "row" (search results), "compact" (watch sidebar)
export default function VideoCard({ video, layout = 'grid' }) {
  const meta = `${formatCount(video.views)} views • ${timeAgo(video.createdAt)}`;
  return (
    <div className={`video-card ${layout}`}>
      <Link to={`/watch/${video.id}`}>
        <Thumbnail video={video} />
      </Link>
      <div className="video-info">
        {layout === 'grid' && (
          <Link to={`/channel/${video.channelId}`}>
            <Avatar name={video.channelName} src={video.channelAvatar} />
          </Link>
        )}
        <div>
          <Link to={`/watch/${video.id}`} className="video-title" title={video.title}>
            {video.title}
          </Link>
          {layout === 'row' && <div className="muted small">{meta}</div>}
          <Link to={`/channel/${video.channelId}`} className="muted small channel-link">
            {layout === 'row' && <Avatar name={video.channelName} src={video.channelAvatar} size={24} />}
            {video.channelName}
          </Link>
          {layout !== 'row' && <div className="muted small">{meta}</div>}
          {layout === 'row' && video.description && <p className="muted small desc-snippet">{video.description}</p>}
        </div>
      </div>
    </div>
  );
}

export function VideoGrid({ videos, layout = 'grid', empty = 'No videos found.' }) {
  if (!videos) return <div className="spinner" />;
  if (!videos.length) return <p className="empty">{empty}</p>;
  return (
    <div className={layout === 'grid' ? 'video-grid' : 'video-list'}>
      {videos.map((v) => (
        <VideoCard key={v.id} video={v} layout={layout} />
      ))}
    </div>
  );
}
