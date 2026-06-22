const SITE_CONFIG_KEY = "wedding-site-config";

const DEFAULT_SITE_CONFIG = {
  coupleName: "Isabela e Allan",
  inviteText: "Convidam para o seu casamento",
  dateText: "31.10.2026 • 15h30",
  placeText: "Casa da Palma, Rio de Janeiro",
  eventDate: "2026-10-31T15:30:00-03:00",
  pageTitle: "Isabela e Allan | Casamento",
  metaDescription: "Site do casamento de Isabela e Allan, em 31 de outubro de 2026, na Casa da Palma.",
  navHistoria: "História",
  navLocal: "Local",
  navPresenca: "Presença",
  navRecados: "Recados",
  countdownEyebrow: "Falta pouco para o nosso dia",
  countdownTitle: "Contagem regressiva",
  historyTitle: "Nossa história",
  historyBody:
    "Bla bla bla bla. Este espaço pode receber a história de vocês:\ncomo se conheceram, os pequenos rituais que viraram rotina e o caminho bonito que trouxe todo mundo até este convite.",
  locationTitle: "Local",
  locationBody: "Casa da Palma\nRua Almirante Alexandrino, 5955\nCosme Velho, Rio de Janeiro",
  locationButton: "Ver localização",
  locationUrl:
    "https://www.google.com/maps/search/?api=1&query=Casa%20da%20Palma%20Rua%20Almirante%20Alexandrino%205955%20Cosme%20Velho%20Rio%20de%20Janeiro",
  dressTitle: "Dress code",
  dressBody: "Definir texto. Sugestão inicial: traje passeio completo em tons leves e elegantes para uma celebração à tarde.",
  giftsTitle: "Lista de presentes",
  giftsBody:
    "Definir texto. Este espaço pode receber o link da lista de presentes ou uma mensagem sobre contribuições para a nova etapa de vocês.",
  giftsButton: "Lista de presentes",
  giftsUrl: "#presentes",
  rsvpTitle: "Confirme sua presença",
  rsvpNameLabel: "Nome completo",
  rsvpAttendanceLabel: "Você irá ao evento?",
  rsvpYesLabel: "Sim",
  rsvpNoLabel: "Não",
  rsvpAdultsLabel: "Adultos incluindo você",
  rsvpChildrenLabel: "Crianças",
  rsvpEmailLabel: "E-mail",
  rsvpPhoneLabel: "Telefone para contato",
  rsvpButton: "Enviar confirmação",
  rsvpSuccess: "Confirmação recebida. Obrigado pelo carinho!",
  adultMax: 2,
  childrenMax: 2,
  messagesTitle: "Deixe seu recado",
  messageNameLabel: "Nome",
  messageEmailLabel: "E-mail",
  messageTextLabel: "Recado",
  messageButton: "Publicar recado",
  emptyMessageTitle: "Com carinho",
  emptyMessageBody: "Os recados aparecerão aqui.",
  footerText: "Isabela e Allan • 31 de outubro de 2026",
  colors: {
    paper: "#f8f4ec",
    paperWarm: "#efe4d5",
    ink: "#4a4838",
    sageDark: "#647055",
    clay: "#b45f43",
    tileBlue: "#244978",
    tileBlueDark: "#18345d",
    tileCream: "#f2e6d6",
  },
  frameStyle: "none",
  images: {
    hero: "./assets/identidade-casamento.jpeg",
    top1: "./assets/identidade-casamento.jpeg",
    top2: "./assets/identidade-casamento.jpeg",
    top3: "./assets/identidade-casamento.jpeg",
    venue: "./assets/casa-da-palma.jpeg",
    bottom1: "./assets/identidade-casamento.jpeg",
    bottom2: "./assets/identidade-casamento.jpeg",
    bottom3: "./assets/identidade-casamento.jpeg",
  },
};

function getSiteConfig() {
  const savedConfig = localStorage.getItem(SITE_CONFIG_KEY);

  if (!savedConfig) {
    return structuredClone(DEFAULT_SITE_CONFIG);
  }

  try {
    return mergeConfig(DEFAULT_SITE_CONFIG, JSON.parse(savedConfig));
  } catch {
    return structuredClone(DEFAULT_SITE_CONFIG);
  }
}

function saveSiteConfig(config) {
  localStorage.setItem(SITE_CONFIG_KEY, JSON.stringify(mergeConfig(DEFAULT_SITE_CONFIG, config)));
}

function resetSiteConfig() {
  localStorage.removeItem(SITE_CONFIG_KEY);
}

function mergeConfig(base, override) {
  const merged = structuredClone(base);

  Object.entries(override || {}).forEach(([key, value]) => {
    if (value && typeof value === "object" && !Array.isArray(value) && key in merged) {
      merged[key] = { ...merged[key], ...value };
      return;
    }

    merged[key] = value;
  });

  return merged;
}
