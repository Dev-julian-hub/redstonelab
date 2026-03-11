/*
 * ╔══════════════════════════════════════════════════════════════╗
 * ║               SUPABASE SETUP — ANLEITUNG                    ║
 * ╠══════════════════════════════════════════════════════════════╣
 * ║                                                              ║
 * ║  1. SUPABASE PROJEKT ERSTELLEN                               ║
 * ║     → https://supabase.com → New Project                     ║
 * ║                                                              ║
 * ║  2. TABELLEN ERSTELLEN (SQL Editor):                         ║
 * ║                                                              ║
 * ║     CREATE TABLE builds (                                    ║
 * ║       id            UUID DEFAULT gen_random_uuid() PRIMARY KEY, ║
 * ║       name          TEXT NOT NULL,                           ║
 * ║       description   TEXT,                                    ║
 * ║       thumbnail_url  TEXT,                                   ║
 * ║       thumbnail_path TEXT,                                   ║
 * ║       created_at    TIMESTAMPTZ DEFAULT NOW()                ║
 * ║     );                                                       ║
 * ║                                                              ║
 * ║     CREATE TABLE build_images (                              ║
 * ║       id          UUID DEFAULT gen_random_uuid() PRIMARY KEY, ║
 * ║       build_id    UUID REFERENCES builds(id) ON DELETE CASCADE, ║
 * ║       url         TEXT NOT NULL,                             ║
 * ║       path        TEXT NOT NULL,                             ║
 * ║       order_index INTEGER NOT NULL DEFAULT 0,                ║
 * ║       created_at  TIMESTAMPTZ DEFAULT NOW()                  ║
 * ║     );                                                       ║
 * ║                                                              ║
 * ║  3. ROW LEVEL SECURITY + POLICIES:                           ║
 * ║                                                              ║
 * ║     ALTER TABLE builds ENABLE ROW LEVEL SECURITY;            ║
 * ║     CREATE POLICY "Public read" ON builds                    ║
 * ║       FOR SELECT USING (true);                               ║
 * ║     CREATE POLICY "Authenticated write" ON builds            ║
 * ║       FOR ALL USING (auth.role() = 'authenticated');         ║
 * ║                                                              ║
 * ║     ALTER TABLE build_images ENABLE ROW LEVEL SECURITY;      ║
 * ║     CREATE POLICY "Public read" ON build_images              ║
 * ║       FOR SELECT USING (true);                               ║
 * ║     CREATE POLICY "Authenticated write" ON build_images      ║
 * ║       FOR ALL USING (auth.role() = 'authenticated');         ║
 * ║                                                              ║
 * ║  4. STORAGE BUCKET ERSTELLEN:                                ║
 * ║     → Storage → New Bucket → Name: "builds" → Public: JA    ║
 * ║     → Storage Policies hinzufügen:                           ║
 * ║       - SELECT: für alle (public)                            ║
 * ║       - INSERT/UPDATE/DELETE: nur authenticated              ║
 * ║                                                              ║
 * ║  5. ADMIN USER ERSTELLEN:                                    ║
 * ║     → Authentication → Users → Add User                     ║
 * ║     → Deine E-Mail + Passwort eingeben                       ║
 * ║                                                              ║
 * ║  6. ENV VARIABLEN SETZEN:                                    ║
 * ║     → .env.example → .env.local kopieren                     ║
 * ║     → Project Settings → API → URL + anon key eintragen     ║
 * ║     → Für Netlify: Site Settings → Env Variables             ║
 * ║                                                              ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Redstonelab] Supabase env vars fehlen!\n' +
    'Erstelle eine .env.local Datei basierend auf .env.example'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
