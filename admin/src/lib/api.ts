const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const ADMIN_BASE_URL = import.meta.env.VITE_ADMIN_BASE_URL || '';

const buildUrl = (path: string, isAdmin = false) => {
  const base = isAdmin ? ADMIN_BASE_URL || API_BASE_URL : API_BASE_URL;
  if (!base) {
    return path;
  }
  return `${base.replace(/\/$/, '')}${path}`;
};

export const apiFetch = async (path: string, options: RequestInit = {}) => {
  const response = await fetch(buildUrl(path, false), options);
  return response;
};

export const adminFetch = async (path: string, options: RequestInit = {}) => {
  const url = buildUrl(path, true);
  const response = await fetch(url, options);
  return response;
};
