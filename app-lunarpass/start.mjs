#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const CONFIG_FILE = join(ROOT, "app", "config", "supabase.json");
const SERVER_ENTRY = join(ROOT, "app", "server", "index.mjs");

const RE_SUPABASE_URL = /^https:\/\/[a-z]{20}\.supabase\.co$/;
const RE_PUBLISHABLE_KEY = /^sb_publishable_[A-Za-z0-9_-]{10,}$/;

function fail(message) {
  console.error(`Lunar Pass: ${message}`);
  process.exit(1);
}

if (!existsSync(CONFIG_FILE)) {
  fail("app/config/supabase.json não encontrado. Rode `yarn setup` antes de iniciar.");
}
if (!existsSync(SERVER_ENTRY)) {
  fail("app/server/index.mjs não encontrado. Rode `yarn setup --app-only` novamente.");
}

let config;
try {
  config = JSON.parse(readFileSync(CONFIG_FILE, "utf8"));
} catch {
  fail("app/config/supabase.json é inválido. Rode `yarn setup --app-only` novamente.");
}

if (!RE_SUPABASE_URL.test(config?.supabaseUrl ?? "")) {
  fail("supabaseUrl inválida em app/config/supabase.json.");
}
if (!RE_PUBLISHABLE_KEY.test(config?.supabasePublishableKey ?? "")) {
  fail("supabasePublishableKey inválida em app/config/supabase.json.");
}

// O JSON é a fonte persistente. As variáveis existem apenas na memória do
// processo e ficam prontas antes de importar o servidor e seus loaders SSR.
process.env.LUNAR_PASS_SUPABASE_URL = config.supabaseUrl;
process.env.LUNAR_PASS_SUPABASE_PUBLISHABLE_KEY = config.supabasePublishableKey;

await import(pathToFileURL(SERVER_ENTRY).href);
