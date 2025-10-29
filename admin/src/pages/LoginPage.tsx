import { FormEvent, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';

export const LoginPage = () => {
  const location = useLocation();
  const { login, isAuthenticating } = useAuth();
  const [email, setEmail] = useState('family@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unexpected error occurred');
      }
    }
  };

  return (
    <div className="page page--centered">
      <div className="card card--shadow">
        <h1>Admin Login</h1>
        <p className="muted">
          {location.state?.from ? 'Please log in to continue' : 'Sign in with your admin credentials'}
        </p>
        <form onSubmit={handleSubmit} className="form">
          <label>
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="admin@example.com"
              required
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              required
            />
          </label>
          {error ? <p className="error">{error}</p> : null}
          <button type="submit" className="btn-primary" disabled={isAuthenticating}>
            {isAuthenticating ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};
