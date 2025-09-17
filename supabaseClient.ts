import { createClient } from '@supabase/supabase-js';

// IMPORTANT: In a real-world application, you should use environment variables
// to store sensitive information like Supabase credentials, rather than hardcoding them.
// For this environment, we are using the provided values directly.
export const supabaseUrl = 'https://xaaoffmrampluugmrhja.supabase.co';

// The public anon key for the Supabase project.
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhYW9mZm1yYW1wbHV1Z21yaGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2OTMyMzgsImV4cCI6MjA3MzI2OTIzOH0.EQJ6xtBe9Sc_TK-KyiNVAiB8TtBfjXxuiD49kd0N-Ro';

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = "Supabase URL or anonymous key is missing. Check your configuration in supabaseClient.ts.";
  console.error(errorMessage);
  // Visually alert the developer in the UI
  if(document.body) {
    document.body.innerHTML = `<div style="padding: 2rem; font-family: sans-serif; background-color: #fef2f2; color: #991b1b; border: 1px solid #fecaca; border-radius: 0.5rem; margin: 2rem;">
      <h1 style="font-size: 1.5rem; font-weight: bold;">Configuration Error</h1>
      <p>${errorMessage}</p>
    </div>`;
  }
  throw new Error(errorMessage);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);