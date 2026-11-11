import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../api/client.js';

const CATEGORIES = ['General', 'Music', 'Gaming', 'Education', 'Tech', 'Sports', 'Animation', 'Film', 'Cars', 'Comedy', 'News'];

export default function Upload() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('file');
  const [preview, setPreview] = useState(null);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');

  const onVideoChange = (e) => {
    const file = e.target.files[0];
    if (preview) URL.revokeObjectURL(preview);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  // Uses XHR so we can show upload progress.
  const submit = (e) => {
    e.preventDefault();
    setError('');
    const form = new FormData(e.target);
    form.set('duration', duration);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/videos');
    xhr.setRequestHeader('Authorization', `Bearer ${getToken()}`);
    xhr.upload.onprogress = (ev) => ev.lengthComputable && setProgress(Math.round((ev.loaded / ev.total) * 100));
    xhr.onload = () => {
      const data = JSON.parse(xhr.responseText || '{}');
      if (xhr.status === 201) navigate(`/watch/${data.id}`);
      else {
        setError(data.error || 'Upload failed');
        setProgress(null);
      }
    };
    xhr.onerror = () => {
      setError('Network error');
      setProgress(null);
    };
    setProgress(0);
    xhr.send(form);
  };

  return (
    <div className="page narrow">
      <h1 className="page-title">Upload video</h1>
      <form className="card upload-form" onSubmit={submit}>
        <div className="tabs">
          <button type="button" className={mode === 'file' ? 'active' : ''} onClick={() => setMode('file')}>
            Upload file
          </button>
          <button type="button" className={mode === 'url' ? 'active' : ''} onClick={() => setMode('url')}>
            From URL
          </button>
        </div>

        {mode === 'file' ? (
          <label>
            Video file *
            <input type="file" name="video" accept="video/*" required onChange={onVideoChange} />
          </label>
        ) : (
          <label>
            Video URL (direct .mp4 / .webm link) *
            <input type="url" name="videoUrl" required placeholder="https://…/video.mp4" onBlur={(e) => setPreview(e.target.value || null)} />
          </label>
        )}

        {preview && (
          <video className="upload-preview" src={preview} controls onLoadedMetadata={(e) => setDuration(e.target.duration || 0)} />
        )}

        <label>
          Title *
          <input name="title" required maxLength={100} />
        </label>
        <label>
          Description
          <textarea name="description" rows={4} />
        </label>
        <label>
          Category
          <select name="category" defaultValue="General">
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label>
          Thumbnail (optional)
          <input type="file" name="thumbnail" accept="image/*" />
        </label>

        {error && <p className="error">{error}</p>}
        {progress !== null && (
          <div className="progress"><div style={{ width: `${progress}%` }} /><span>{progress}%</span></div>
        )}
        <button className="btn" disabled={progress !== null}>Publish</button>
      </form>
    </div>
  );
}
