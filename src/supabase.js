// Optional response logging. Uses Supabase's REST API directly (no library needed).
// Only a public anon key is read from env vars; it can only INSERT (see supabase/schema.sql).
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export async function saveResponse(response) {
  if (!url || !key) return; // no database configured: site works normally
  try {
    await fetch(`${url}/rest/v1/date_responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ response }), // nothing else is stored
    });
  } catch { /* never block the experience if saving fails */ }
}
