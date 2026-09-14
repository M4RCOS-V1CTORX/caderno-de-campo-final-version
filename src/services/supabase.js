import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  "https://tfblpxlntcmavlkivmqn.supabase.co";

const supabaseKey =
  "sb_publishable_4vTiEaUlYlCr7VMKVVKtvg_vweM8jby";

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);