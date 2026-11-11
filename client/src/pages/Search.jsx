import { useSearchParams } from 'react-router-dom';
import { useFetch } from '../useFetch.js';
import { VideoGrid } from '../components/VideoCard.jsx';

export default function Search() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const sort = params.get('sort') || 'latest';
  const { data } = useFetch(`/videos?q=${encodeURIComponent(q)}&sort=${sort}`);

  return (
    <div className="page narrow">
      <div className="search-head">
        <h1 className="page-title">Results for “{q}”</h1>
        <select value={sort} onChange={(e) => setParams({ q, sort: e.target.value })} aria-label="Sort by">
          <option value="latest">Upload date</option>
          <option value="popular">View count</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>
      <VideoGrid videos={data} layout="row" empty="No results. Try different keywords." />
    </div>
  );
}
