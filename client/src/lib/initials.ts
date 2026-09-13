export interface UserLike {
  name?: string | null;
  email?: string | null;
}

/**
 * Generates 2-letter uppercase user initials based on editorial specifications:
 * - "John Doe" -> "JD"
 * - "Maverick Yadav" -> "MY"
 * - "Maverick" -> "MA" (first two characters if single word)
 * - "john.doe@email.com" -> "JD"
 */
export function getInitials(user?: UserLike | null): string {
  if (!user) return 'ME';

  // 1. Try user's display name
  if (user.name && user.name.trim()) {
    const parts = user.name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const first = parts[0][0];
      const last = parts[parts.length - 1][0];
      return (first + last).toUpperCase();
    }
    const single = parts[0];
    if (single.length >= 2) {
      return single.slice(0, 2).toUpperCase();
    }
    return single.toUpperCase();
  }

  // 2. Fall back to email handle
  if (user.email && user.email.trim()) {
    const handle = user.email.split('@')[0];
    const emailParts = handle.split(/[._-]+/).filter(Boolean);
    if (emailParts.length >= 2) {
      const first = emailParts[0][0];
      const second = emailParts[1][0];
      return (first + second).toUpperCase();
    }
    if (handle.length >= 2) {
      return handle.slice(0, 2).toUpperCase();
    }
    return handle.toUpperCase();
  }

  return 'ME';
}
