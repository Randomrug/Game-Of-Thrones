const SUPABASE_URL = "https://rjpsbssjusygxlarftbq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_MmeVLwqPEloLfruXscEEeg_15Kueu9W";

window.supabaseClient = null;
if (window.supabase && typeof window.supabase.createClient === "function") {
  window.supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );
} else {
  console.error("Supabase JS client not available. Ensure the @supabase/supabase-js CDN script loads before supabase.js.");
}

