// Removed Supabase import

function generateSessionId(): string {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = crypto.randomUUID().split('-')[0];
  return `${datePart}-${randomPart}`;
}

function getSessionId(): string {
  const storageKey = 'movieme_session_id';
  const today = new Date().toISOString().slice(0, 10);
  
  const stored = localStorage.getItem(storageKey);
  if (stored) {
    const [date, id] = stored.split('|');
    if (date === today) {
      return id;
    }
  }

  const newSessionId = generateSessionId();
  localStorage.setItem(storageKey, `${today}|${newSessionId}`);
  return newSessionId;
}

export async function logUserActivity(
  action: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    // Mock user for activity logging
    const user = { id: 'dev-user-1' };
    if (!user) return;

    const sessionId = getSessionId();

    await supabase
      .from('user_activity_log')
      .insert([
        {
          user_id: user.id,
          action,
          metadata,
          session_id: sessionId
        }
      ]);
  } catch (err) {
    console.error('Error logging user activity:', err);
  }
}