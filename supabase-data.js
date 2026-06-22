function getSupabaseClient() {
  const settings = window.WEDDING_SUPABASE || {};
  const hasCredentials = settings.url && settings.anonKey && window.supabase;

  if (!hasCredentials) return null;
  if (!window.weddingSupabaseClient) {
    window.weddingSupabaseClient = window.supabase.createClient(settings.url, settings.anonKey);
  }

  return window.weddingSupabaseClient;
}

function isSupabaseReady() {
  return Boolean(getSupabaseClient());
}

async function loadRemoteSiteConfig() {
  const client = getSupabaseClient();
  if (!client) return getSiteConfig();

  const { data, error } = await client
    .from("site_settings")
    .select("config")
    .eq("site_id", "main")
    .maybeSingle();

  if (error || !data?.config) {
    return getSiteConfig();
  }

  return mergeConfig(DEFAULT_SITE_CONFIG, data.config);
}

async function saveRemoteSiteConfig(config) {
  const client = getSupabaseClient();
  saveSiteConfig(config);

  if (!client) {
    return { ok: true, remote: false };
  }

  const { error } = await client.from("site_settings").upsert({
    site_id: "main",
    config,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    return { ok: false, remote: true, error };
  }

  return { ok: true, remote: true };
}

async function submitRemoteRsvp(data) {
  const client = getSupabaseClient();
  if (!client) return { ok: false, remote: false };

  const { error } = await client.from("rsvps").insert({
    full_name: data.name,
    attendance: data.attendance,
    adults: Number(data.adults || 0),
    children: Number(data.children || 0),
    email: data.email,
    phone: data.phone,
  });

  return { ok: !error, remote: true, error };
}

async function loadRemoteMessages() {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data, error } = await client
    .from("guest_messages")
    .select("name,message,created_at")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(60);

  if (error) return null;

  return data.map((item) => ({
    name: item.name,
    text: item.message,
    createdAt: item.created_at,
  }));
}

async function submitRemoteMessage(data) {
  const client = getSupabaseClient();
  if (!client) return { ok: false, remote: false };

  const { error } = await client.from("guest_messages").insert({
    name: data.name,
    email: data.email,
    message: data.text,
    is_public: true,
  });

  return { ok: !error, remote: true, error };
}

async function signInEditor(email, password) {
  const client = getSupabaseClient();
  if (!client) return { ok: false, error: new Error("Supabase não configurado.") };

  const { error } = await client.auth.signInWithPassword({ email, password });
  return { ok: !error, error };
}

async function signOutEditor() {
  const client = getSupabaseClient();
  if (!client) return;
  await client.auth.signOut();
}

async function getEditorSession() {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data } = await client.auth.getSession();
  return data.session;
}
