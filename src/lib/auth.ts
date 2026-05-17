export const SESSION_COOKIE = 'skills_portal_session';

export function getPortalPassword() {
  return process.env.SKILLS_PORTAL_PASSWORD ?? '';
}

export function getSessionToken() {
  return process.env.SKILLS_PORTAL_SESSION_TOKEN ?? '';
}

export function isAuthConfigured() {
  return Boolean(getPortalPassword() && getSessionToken());
}

export function buildExternalUrl(
  request: Request | { url: string; headers: Headers },
  path: string,
) {
  const current = new URL(request.url);
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const host = forwardedHost || request.headers.get('host') || current.host;
  const protocol = forwardedProto || current.protocol.replace(':', '');

  return new URL(path, `${protocol}://${host}`);
}
