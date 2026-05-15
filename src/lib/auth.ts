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
