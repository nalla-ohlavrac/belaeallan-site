const form = document.querySelector("#site-editor");
const statusBox = document.querySelector("#editor-status");
const supabaseStatus = document.querySelector("#supabase-status");
const imageGrid = document.querySelector("#image-editor-grid");
const EDITOR_ACCESS_KEY = "wedding-editor-access";
const EDITOR_SESSION_KEY = "wedding-editor-unlocked";
const DEFAULT_EDITOR_ACCESS = {
  user: "Marrom",
  password: "123456",
};
let editableConfig = getSiteConfig();

const imageFields = [
  ["hero", "Imagem do topo"],
  ["top1", "Foto superior 1"],
  ["top2", "Foto superior 2"],
  ["top3", "Foto superior 3"],
  ["venue", "Foto do local"],
  ["bottom1", "Foto final 1"],
  ["bottom2", "Foto final 2"],
  ["bottom3", "Foto final 3"],
];

const topLevelFields = [
  "coupleName",
  "inviteText",
  "dateText",
  "placeText",
  "eventDate",
  "pageTitle",
  "metaDescription",
  "navHistoria",
  "navLocal",
  "navPresenca",
  "navRecados",
  "countdownEyebrow",
  "countdownTitle",
  "historyTitle",
  "historyBody",
  "locationTitle",
  "locationBody",
  "locationButton",
  "locationUrl",
  "dressTitle",
  "dressBody",
  "giftsTitle",
  "giftsBody",
  "giftsButton",
  "giftsUrl",
  "footerText",
  "rsvpTitle",
  "rsvpNameLabel",
  "rsvpAttendanceLabel",
  "rsvpYesLabel",
  "rsvpNoLabel",
  "rsvpAdultsLabel",
  "adultMax",
  "rsvpChildrenLabel",
  "childrenMax",
  "rsvpEmailLabel",
  "rsvpPhoneLabel",
  "rsvpButton",
  "rsvpSuccess",
  "messagesTitle",
  "messageNameLabel",
  "messageEmailLabel",
  "messageTextLabel",
  "messageButton",
  "emptyMessageTitle",
  "emptyMessageBody",
  "frameStyle",
];

function showStatus(message) {
  statusBox.textContent = message;
  window.clearTimeout(showStatus.timeout);
  showStatus.timeout = window.setTimeout(() => {
    statusBox.textContent = "";
  }, 4200);
}

function getEditorAccess() {
  const savedAccess = localStorage.getItem(EDITOR_ACCESS_KEY);
  if (!savedAccess) return { ...DEFAULT_EDITOR_ACCESS };

  try {
    return { ...DEFAULT_EDITOR_ACCESS, ...JSON.parse(savedAccess) };
  } catch {
    return { ...DEFAULT_EDITOR_ACCESS };
  }
}

function saveEditorAccess(access) {
  localStorage.setItem(EDITOR_ACCESS_KEY, JSON.stringify(access));
}

function unlockEditor() {
  sessionStorage.setItem(EDITOR_SESSION_KEY, "true");
  document.body.classList.add("is-unlocked");
}

function lockEditor() {
  sessionStorage.removeItem(EDITOR_SESSION_KEY);
  document.body.classList.remove("is-unlocked");
  document.querySelector("#editor-login-password").value = "";
}

function setupEditorLogin() {
  const loginForm = document.querySelector("#editor-login-form");
  const loginStatus = document.querySelector("#editor-login-status");
  const userInput = document.querySelector("#editor-login-user");
  const passwordInput = document.querySelector("#editor-login-password");
  const newUserInput = document.querySelector("#editor-new-user");
  const newPasswordInput = document.querySelector("#editor-new-password");
  const accessStatus = document.querySelector("#editor-access-status");

  const access = getEditorAccess();
  userInput.value = access.user;
  newUserInput.value = access.user;

  if (sessionStorage.getItem(EDITOR_SESSION_KEY) === "true") {
    unlockEditor();
  }

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const currentAccess = getEditorAccess();
    const userMatches = userInput.value.trim() === currentAccess.user;
    const passwordMatches = passwordInput.value === currentAccess.password;

    if (!userMatches || !passwordMatches) {
      loginStatus.textContent = "Login ou senha inválidos.";
      return;
    }

    loginStatus.textContent = "";
    unlockEditor();
  });

  document.querySelector("#save-editor-access").addEventListener("click", () => {
    const nextUser = newUserInput.value.trim();
    const nextPassword = newPasswordInput.value;

    if (!nextUser || !nextPassword) {
      accessStatus.textContent = "Preencha novo login e nova senha.";
      return;
    }

    saveEditorAccess({ user: nextUser, password: nextPassword });
    userInput.value = nextUser;
    newPasswordInput.value = "";
    accessStatus.textContent = "Acesso alterado.";
  });

  document.querySelector("#lock-editor").addEventListener("click", () => {
    lockEditor();
  });
}

function showSupabaseStatus(message) {
  supabaseStatus.textContent = message;
}

async function refreshSupabaseStatus() {
  if (!isSupabaseReady()) {
    showSupabaseStatus("Supabase ainda não configurado. Preencha supabase-config.js antes de publicar.");
    return;
  }

  const session = await getEditorSession();
  showSupabaseStatus(session ? `Conectado como ${session.user.email}.` : "Supabase configurado. Entre para salvar no banco.");
}

function toDateTimeLocal(value) {
  const match = String(value || "").match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);
  return match ? match[1] : "";
}

function fromDateTimeLocal(value) {
  if (!value) return DEFAULT_SITE_CONFIG.eventDate;
  return `${value}:00-03:00`;
}

function fillForm(config) {
  topLevelFields.forEach((name) => {
    const field = form.elements[name];
    if (!field) return;

    if (name === "eventDate") {
      field.value = toDateTimeLocal(config.eventDate);
      return;
    }

    field.value = config[name] ?? "";
  });

  Object.entries(config.colors).forEach(([key, value]) => {
    const field = form.elements[`colors.${key}`];
    if (field) field.value = value;
  });
}

function createImageControls(config) {
  imageGrid.innerHTML = "";

  imageFields.forEach(([key, label]) => {
    const wrapper = document.createElement("label");
    const preview = document.createElement("img");
    const input = document.createElement("input");

    wrapper.className = "image-control";
    wrapper.textContent = label;
    preview.src = config.images[key];
    preview.alt = label;
    input.type = "file";
    input.accept = "image/*";
    input.dataset.imageKey = key;

    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.addEventListener("load", () => {
        editableConfig.images[key] = reader.result;
        preview.src = reader.result;
        showStatus("Imagem carregada. Salve para aplicar no site.");
      });
      reader.readAsDataURL(file);
    });

    wrapper.append(preview, input);
    imageGrid.append(wrapper);
  });
}

function collectForm() {
  const nextConfig = mergeConfig(DEFAULT_SITE_CONFIG, editableConfig);

  topLevelFields.forEach((name) => {
    const field = form.elements[name];
    if (!field) return;

    if (name === "eventDate") {
      nextConfig.eventDate = fromDateTimeLocal(field.value);
      return;
    }

    if (name === "adultMax" || name === "childrenMax") {
      nextConfig[name] = Number(field.value);
      return;
    }

    nextConfig[name] = field.value;
  });

  Object.keys(nextConfig.colors).forEach((key) => {
    const field = form.elements[`colors.${key}`];
    if (field) nextConfig.colors[key] = field.value;
  });

  nextConfig.images = { ...editableConfig.images };
  return nextConfig;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  editableConfig = collectForm();
  const result = await saveRemoteSiteConfig(editableConfig);

  if (result.ok && result.remote) {
    showStatus("Alterações salvas no Supabase. Recarregue o site publicado para ver tudo aplicado.");
    return;
  }

  if (result.ok) {
    showStatus("Alterações salvas localmente. Configure o Supabase para publicar para todos.");
    return;
  }

  showStatus("Não foi possível salvar no Supabase. Confira login e policies.");
});

document.querySelector("#reset-config").addEventListener("click", () => {
  resetSiteConfig();
  editableConfig = getSiteConfig();
  fillForm(editableConfig);
  createImageControls(editableConfig);
  showStatus("Configuração padrão restaurada.");
});

document.querySelector("#export-config").addEventListener("click", () => {
  const file = new Blob([JSON.stringify(collectForm(), null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(file);
  link.download = "site-casamento-config.json";
  link.click();
  URL.revokeObjectURL(link.href);
});

document.querySelector("#admin-login").addEventListener("click", async () => {
  const email = document.querySelector("#admin-email").value;
  const password = document.querySelector("#admin-password").value;
  const result = await signInEditor(email, password);

  if (!result.ok) {
    showSupabaseStatus("Não foi possível entrar. Confira e-mail, senha e configuração do Supabase.");
    return;
  }

  refreshSupabaseStatus();
});

document.querySelector("#admin-logout").addEventListener("click", async () => {
  await signOutEditor();
  refreshSupabaseStatus();
});

document.querySelector("#import-config").addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      editableConfig = mergeConfig(DEFAULT_SITE_CONFIG, JSON.parse(reader.result));
      saveSiteConfig(editableConfig);
      fillForm(editableConfig);
      createImageControls(editableConfig);
      showStatus("Configuração importada e salva.");
    } catch {
      showStatus("Não foi possível importar este arquivo.");
    }
  });
  reader.readAsText(file);
});

async function initEditor() {
  setupEditorLogin();
  editableConfig = await loadRemoteSiteConfig();
  fillForm(editableConfig);
  createImageControls(editableConfig);
  refreshSupabaseStatus();
}

initEditor();
