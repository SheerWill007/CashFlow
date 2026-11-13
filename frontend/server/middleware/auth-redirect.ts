// Cheap redirect based on whether a session cookie exists. The dashboard still checks the
// session with the API and logs out (clearing the cookie) if it has expired.
export default defineEventHandler((event) => {
  const path = event.path.split('?')[0] ?? '/';
  const signedIn = Boolean(getCookie(event, 'sid'));

  if ((path === '/app' || path.startsWith('/app/')) && !signedIn) {
    return sendRedirect(event, `/login?next=${encodeURIComponent(path)}`, 302);
  }
  if ((path === '/login' || path === '/signup') && signedIn) {
    return sendRedirect(event, '/app', 302);
  }
});
