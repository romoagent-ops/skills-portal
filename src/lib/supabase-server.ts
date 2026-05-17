import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getPublicEnv } from "@/lib/env";

export function getSupabaseServerClient() {
  const { supabaseUrl: publicSupabaseUrl } = getPublicEnv();
  const supabaseUrl = process.env.SUPABASE_URL || publicSupabaseUrl || "https://zmujccdheintdmodwlhq.supabase.co";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
