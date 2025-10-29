import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import { adminFetch } from '../lib/api';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  subscriptionLevel: string;
  createdAt?: string;
}

interface UsersResponse {
  success: boolean;
  data: AdminUser[];
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

const roles = ['admin', 'member', 'planner', 'editor'];
const subscriptionLevels = ['free', 'premium', 'suspended'];

export const UsersPage = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [roleFilter, setRoleFilter] = useState('');
  const [subscriptionFilter, setSubscriptionFilter] = useState('');
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

  const totalPages = useMemo(() => Math.ceil(total / limit) || 1, [limit, total]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) return;
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });
        if (roleFilter) params.set('role', roleFilter);
        if (subscriptionFilter) params.set('subscription_level', subscriptionFilter);

        const response = await adminFetch(`/app/admin/users?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.message || 'Failed to load users');
        }

        const payload: UsersResponse = await response.json();
        setUsers(payload.data);
        setTotal(payload.meta?.total ?? payload.data.length);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Unexpected error loading users');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token, page, limit, roleFilter, subscriptionFilter]);

  const handleRoleChange = async (userId: number, newRole: string) => {
    if (!token) return;
    setUpdatingUserId(userId);
    setError('');
    try {
      const response = await adminFetch(`/app/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message || 'Failed to update user');
      }

      const payload = await response.json();
      setUsers((current) =>
        current.map((user) => (user.id === userId ? { ...user, ...payload.data } : user))
      );
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unexpected error updating user');
      }
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleSubscriptionChange = async (userId: number, subscriptionLevel: string) => {
    if (!token) return;
    setUpdatingUserId(userId);
    setError('');
    try {
      const response = await adminFetch(`/app/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subscription_level: subscriptionLevel }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message || 'Failed to update subscription');
      }

      const payload = await response.json();
      setUsers((current) =>
        current.map((user) => (user.id === userId ? { ...user, ...payload.data } : user))
      );
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unexpected error updating subscription');
      }
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="users-page">
      <header className="section-header">
        <div>
          <h2>Users</h2>
          <p className="muted">Manage platform users, roles, and subscriptions.</p>
        </div>
        <div className="filters">
          <label>
            <span>Role</span>
            <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
              <option value="">All</option>
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Subscription</span>
            <select
              value={subscriptionFilter}
              onChange={(event) => setSubscriptionFilter(event.target.value)}
            >
              <option value="">All</option>
              {subscriptionLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      {error ? <div className="alert alert--error">{error}</div> : null}

      <div className="card card--table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Subscription</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && !isLoading ? (
              <tr>
                <td colSpan={6} className="empty">
                  No users found with the current filters.
                </td>
              </tr>
            ) : null}
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(event) => handleRoleChange(user.id, event.target.value)}
                    disabled={isLoading || updatingUserId === user.id}
                  >
                    {roles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={user.subscriptionLevel}
                    onChange={(event) =>
                      handleSubscriptionChange(user.id, event.target.value)
                    }
                    disabled={isLoading || updatingUserId === user.id}
                  >
                    {subscriptionLevels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : '—'}
                </td>
              </tr>
            ))}
            {isLoading ? (
              <tr>
                <td colSpan={6} className="loading">
                  Loading users…
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <footer className="pagination">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          disabled={page <= 1 || isLoading}
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          disabled={page >= totalPages || isLoading}
        >
          Next
        </button>
        <label>
          <span>Rows per page</span>
          <select
            value={limit}
            onChange={(event) => {
              setLimit(Number(event.target.value));
              setPage(1);
            }}
            disabled={isLoading}
          >
            {[10, 20, 50, 100].map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </footer>
    </div>
  );
};
