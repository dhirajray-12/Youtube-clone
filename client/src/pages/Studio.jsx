import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useFetch } from '../useFetch.js';
import { Thumbnail } from '../components/VideoCard.jsx';
import { formatCount, timeAgo } from '../utils.js';

export default function Studio() {
  const { data: videos, setData } = useFetch('/me/videos');
  const [editing, setEditing] = useState(null);

  const remove = async (id) => {
    if (!confirm('Delete this video permanently?')) return;
    await api(`/videos/${id}`, { method: 'DELETE' });
    setData(videos.filter((v) => v.id !== id));
  };

  const save = async (e) => {
    e.preventDefault();
    const updated = await api(`/videos/${editing}`, { method: 'PATCH', form: new FormData(e.target) });
    setData(videos.map((v) => (v.id === editing ? { ...v, ...updated } : v)));
    setEditing(null);
  };

  if (!videos) return <div className="spinner" />;

  return (
    <div className="page">
      <div className="search-head">
        <h1 className="page-title">Channel content</h1>
        <Link to="/upload" className="btn">Upload</Link>
      </div>
      {!videos.length ? (
        <p className="empty">You haven't uploaded any videos yet.</p>
      ) : (
        <table className="studio-table">
          <thead>
            <tr><th>Video</th><th>Date</th><th>Views</th><th>Comments</th><th>Likes</th><th /></tr>
          </thead>
          <tbody>
            {videos.map((v) => (
              <tr key={v.id}>
                <td>
                  {editing === v.id ? (
                    <form className="studio-edit" onSubmit={save}>
                      <input name="title" defaultValue={v.title} required />
                      <textarea name="description" defaultValue={v.description} rows={2} />
                      <input name="category" defaultValue={v.category} />
                      <label className="small">New thumbnail <input type="file" name="thumbnail" accept="image/*" /></label>
                      <div>
                        <button className="btn">Save</button>{' '}
                        <button type="button" className="btn ghost" onClick={() => setEditing(null)}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <Link to={`/watch/${v.id}`} className="studio-video">
                      <Thumbnail video={v} />
                      <div>
                        <strong>{v.title}</strong>
                        <div className="muted small clamp">{v.description}</div>
                      </div>
                    </Link>
                  )}
                </td>
                <td className="muted small">{timeAgo(v.createdAt)}</td>
                <td>{formatCount(v.views)}</td>
                <td>{v.commentCount}</td>
                <td>{v.likes}</td>
                <td className="nowrap">
                  <button className="link-btn" onClick={() => setEditing(v.id)}>Edit</button>{' '}
                  <button className="link-btn danger" onClick={() => remove(v.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
