// Every /api/* request is forwarded to the NestJS backend, so the browser only ever talks to
// this origin and the session cookie stays first-party.
export default defineEventHandler((event) => {
  const { backendUrl } = useRuntimeConfig(event);
  const target = new URL(event.path, backendUrl).toString();
  const ip = getRequestIP(event, { xForwardedFor: true });
  return proxyRequest(event, target, {
    headers: ip ? { 'x-forwarded-for': ip } : undefined,
  });
});
