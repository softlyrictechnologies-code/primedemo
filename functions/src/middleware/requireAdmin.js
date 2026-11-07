import { HttpsError } from 'firebase-functions/v2/https';

export async function requireAdmin(context) {
  if (!context || !context.auth) {
    throw new HttpsError('unauthenticated', 'Authentication is required.');
  }

  const token = context.auth.token || {};
  const isAdmin = token.admin === true || token.role === 'admin';

  if (!isAdmin) {
    throw new HttpsError(
      'permission-denied',
      'Only authorized administrators can perform this operation.'
    );
  }

  return context.auth;
}
