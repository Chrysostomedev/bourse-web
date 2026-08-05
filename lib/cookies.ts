export const cookieFunctions = {
  get: (name: string) => {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  },
  set: (name: string, value: string, days: number = 7) => {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
  },
  delete: (name: string) => {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
  },
  getUserRole: () => {
    if (typeof document === 'undefined') return 'ADMIN';
    const value = `; ${document.cookie}`;
    const parts = value.split('; role=');
    if (parts.length === 2) return parts.pop()?.split(';').shift() || 'ADMIN';
    return 'ADMIN';
  },
};
