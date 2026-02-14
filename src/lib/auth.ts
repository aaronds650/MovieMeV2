// Alpha authentication utilities - Neon only

// Get current user ID from localStorage (used by API calls)
export function getCurrentUserId(): string | null {
  const userId = localStorage.getItem('movieme_user_id');
  if (!userId) return null;
  
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(userId) ? userId : null;
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return getCurrentUserId() !== null;
}