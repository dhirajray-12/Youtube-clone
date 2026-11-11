import { useState } from 'react';
import { useFetch } from '../useFetch.js';
import { VideoGrid } from '../components/VideoCard.jsx';

export default function Home() {
  const [category, setCategory] = useState('All');
  const { data: categories } = useFetch('/videos/categories');
  const { data: videos, error } = useFetch(`/videos?category=${encodeURIComponent(category)}`);

  return (
    <div className="page">
      <div className="chips">
        {['All', ...(categories || [])].map((c) => (
          <button key={c} className={`chip ${c === category ? 'active' : ''}`} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>
      {error ? <p className="error">{error}</p> : <VideoGrid videos={videos} />}
    </div>
  );
}
