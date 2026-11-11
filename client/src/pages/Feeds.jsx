import { useFetch } from '../useFetch.js';
import { api } from '../api/client.js';
import { VideoGrid } from '../components/VideoCard.jsx';

export function Subscriptions() {
  const { data } = useFetch('/videos/subscriptions');
  return (
    <div className="page">
      <h1 className="page-title">Subscriptions</h1>
      <VideoGrid videos={data} empty="Subscribe to channels to see their latest videos here." />
    </div>
  );
}

export function History() {
  const { data, setData } = useFetch('/me/history');
  const clear = async () => {
    if (!confirm('Clear all watch history?')) return;
    await api('/me/history', { method: 'DELETE' });
    setData([]);
  };
  return (
    <div className="page narrow">
      <div className="search-head">
        <h1 className="page-title">Watch history</h1>
        {data?.length > 0 && (
          <button className="btn secondary" onClick={clear}>
            Clear all history
          </button>
        )}
      </div>
      <VideoGrid videos={data} layout="row" empty="Videos you watch will show up here." />
    </div>
  );
}

export function Liked() {
  const { data } = useFetch('/me/liked');
  return (
    <div className="page narrow">
      <h1 className="page-title">Liked videos</h1>
      <VideoGrid videos={data} layout="row" empty="Videos you like will show up here." />
    </div>
  );
}
