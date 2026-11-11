import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { LogoIcon } from '../components/Icons.jsx';

function AuthForm({ title, fields, onSubmit, footer }) {
  const [values, setValues] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await onSubmit(values);
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="card auth-card" onSubmit={submit}>
        <LogoIcon />
        <h1>{title}</h1>
        {fields.map(([name, label, type = 'text']) => (
          <label key={name}>
            {label}
            <input
              type={type}
              required
              value={values[name] || ''}
              onChange={(e) => setValues({ ...values, [name]: e.target.value })}
            />
          </label>
        ))}
        {error && <p className="error">{error}</p>}
        <button className="btn" disabled={busy}>
          {busy ? 'Please wait…' : title}
        </button>
        {footer}
      </form>
    </div>
  );
}

export function Login() {
  const { login } = useAuth();
  return (
    <AuthForm
      title="Sign in"
      fields={[
        ['login', 'Username or email'],
        ['password', 'Password', 'password'],
      ]}
      onSubmit={(v) => login(v.login, v.password)}
      footer={
        <>
          <p className="muted small">Demo account: demo / password123</p>
          <p className="small">
            No account? <Link to="/register">Create one</Link>
          </p>
        </>
      }
    />
  );
}

export function Register() {
  const { register } = useAuth();
  return (
    <AuthForm
      title="Create account"
      fields={[
        ['username', 'Username (channel name)'],
        ['email', 'Email', 'email'],
        ['password', 'Password (min 6 characters)', 'password'],
      ]}
      onSubmit={register}
      footer={
        <p className="small">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      }
    />
  );
}
