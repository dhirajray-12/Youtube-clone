import { useFetch } from '../useFetch.js';
import { VideoGrid } from '../components/VideoCard.jsx';

export default function Trending() {
  const { data } = useFetch('/videos/trending');
  return (
    <div className="page narrow">
      <h1 className="page-title">Trending</h1>
      <VideoGrid videos={data} layout="row" />
    </div>
  );
}
