import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../components/AuthProvider';
import { adminFetch } from '../lib/api';

interface Permission {
  id: number;
  action: string;
  description?: string | null;
  scope: string;
}

interface Role {
  id: number;
  name: string;
  description?: string | null;
  permissions: Permission[];
}

interface PermissionsResponse {
  success: boolean;
  data: {
    roles: Role[];
    permissions: Permission[];
  };
}

interface UpdateRoleResponse {
  success: boolean;
  data: {
    role: Role | null;
    permissions: Permission[];
  };
}

export const PermissionsPage = () => {
  const { token } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!token) return;
      setIsLoading(true);
      setError('');
      try {
        const response = await adminFetch('/app/admin/permissions', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.message || 'Failed to load permissions');
        }

        const payload: PermissionsResponse = await response.json();
        const loadedRoles = payload.data.roles ?? [];
        setRoles(loadedRoles);
        setPermissions(payload.data.permissions ?? []);

        if (loadedRoles.length && selectedRoleId === null) {
          const firstRole = loadedRoles[0];
          setSelectedRoleId(firstRole.id);
          setSelectedPermissions(new Set(firstRole.permissions.map((permission) => permission.action)));
        } else if (selectedRoleId !== null) {
          const role = loadedRoles.find((entry) => entry.id === selectedRoleId);
          if (role) {
            setSelectedPermissions(new Set(role.permissions.map((permission) => permission.action)));
          }
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Unexpected error loading permissions');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (selectedRoleId === null) {
      return;
    }
    const role = roles.find((entry) => entry.id === selectedRoleId);
    if (role) {
      setSelectedPermissions(new Set(role.permissions.map((permission) => permission.action)));
    }
  }, [roles, selectedRoleId]);

  const permissionsByScope = useMemo(() => {
    return permissions.reduce<Record<string, Permission[]>>((accumulator, permission) => {
      const scope = permission.scope || 'global';
      if (!accumulator[scope]) {
        accumulator[scope] = [];
      }
      accumulator[scope].push(permission);
      return accumulator;
    }, {});
  }, [permissions]);

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === selectedRoleId) ?? null,
    [roles, selectedRoleId]
  );

  const hasChanges = useMemo(() => {
    if (!selectedRole) {
      return false;
    }
    const original = new Set(selectedRole.permissions.map((permission) => permission.action));
    if (original.size !== selectedPermissions.size) {
      return true;
    }
    for (const permission of selectedPermissions) {
      if (!original.has(permission)) {
        return true;
      }
    }
    return false;
  }, [selectedRole, selectedPermissions]);

  const togglePermission = (action: string) => {
    setSelectedPermissions((current) => {
      const next = new Set(current);
      if (next.has(action)) {
        next.delete(action);
      } else {
        next.add(action);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (!token || selectedRoleId === null) {
      return;
    }
    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      const response = await adminFetch(`/app/admin/permissions/roles/${selectedRoleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ permissions: Array.from(selectedPermissions) }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message || 'Failed to update permissions');
      }

      const payload: UpdateRoleResponse = await response.json();
      const updatedRole = payload.data.role;
      const nextPermissions = payload.data.permissions ?? permissions;

      if (updatedRole) {
        setRoles((current) =>
          current.map((role) => (role.id === updatedRole.id ? updatedRole : role))
        );
        setSelectedPermissions(
          new Set(updatedRole.permissions.map((permission) => permission.action))
        );
      }
      setPermissions(nextPermissions);
      setSuccess('Permissions updated successfully');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Unexpected error updating permissions');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="permissions-page">
      <header className="section-header">
        <div>
          <h2>Roles & Permissions</h2>
          <p className="muted">
            Assign permissions to roles to control access across the platform.
          </p>
        </div>
      </header>

      {error ? <div className="alert alert--error">{error}</div> : null}
      {success ? <div className="alert alert--success">{success}</div> : null}

      <div className="permissions-grid">
        <aside className="permissions-roles">
          <h3>Roles</h3>
          <ul>
            {roles.map((role) => {
              const isActive = role.id === selectedRoleId;
              return (
                <li key={role.id} className={isActive ? 'active' : ''}>
                  <button
                    type="button"
                    onClick={() => setSelectedRoleId(role.id)}
                    className="role-button"
                  >
                    <span className="role-name">{role.name}</span>
                    {role.description ? (
                      <span className="role-description">{role.description}</span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <section className="permissions-detail">
          {isLoading ? (
            <div className="card card--shadow">Loading…</div>
          ) : null}

          {!isLoading && !selectedRole ? (
            <div className="card card--shadow">
              <p>Select a role to view and edit its permissions.</p>
            </div>
          ) : null}

          {!isLoading && selectedRole ? (
            <div className="card card--shadow">
              <header className="permissions-detail__header">
                <div>
                  <h3>{selectedRole.name}</h3>
                  {selectedRole.description ? (
                    <p className="muted">{selectedRole.description}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSave}
                  disabled={!hasChanges || isSaving}
                >
                  {isSaving ? 'Saving…' : 'Save changes'}
                </button>
              </header>

              <div className="permissions-list">
                {Object.entries(permissionsByScope).map(([scope, scopePermissions]) => (
                  <div key={scope} className="permissions-group">
                    <h4>{scope === 'admin' ? 'Admin' : scope === 'api' ? 'API' : scope}</h4>
                    <ul>
                      {scopePermissions.map((permission) => {
                        const isChecked = selectedPermissions.has(permission.action);
                        return (
                          <li key={permission.id}>
                            <label className="permission-item">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => togglePermission(permission.action)}
                              />
                              <div>
                                <span className="permission-action">{permission.action}</span>
                                {permission.description ? (
                                  <span className="permission-description">
                                    {permission.description}
                                  </span>
                                ) : null}
                              </div>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
};
