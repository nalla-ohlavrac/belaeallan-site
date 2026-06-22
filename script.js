let siteConfig = getSiteConfig();

function setText(selector, value) {
  const element = document.querySelector(selector);
  if (element) element.textContent = value;
}

function setHtmlFromLines(selector, value) {
  const element = document.querySelector(selector);
  if (!element) return;

  element.innerHTML = "";
  String(value || "")
    .split("\n")
    .forEach((line, index) => {
      if (index > 0) element.append(document.createElement("br"));
      element.append(document.createTextNode(line));
    });
}

function setImage(selector, src, alt) {
  const image = document.querySelector(selector);
  if (!image || !src) return;

  image.src = src;
  if (alt) image.alt = alt;
}

function setLink(selector, href, label) {
  const link = document.querySelector(selector);
  if (!link) return;

  link.href = href || "#";
  if (label) link.textContent = label;
}

function setLabelByFieldName(fieldName, value) {
  const field = document.querySelector(`[name="${fieldName}"]`);
  const label = field?.closest("label");
  if (!label) return;

  [...label.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
      node.textContent = `\n                ${value}\n                `;
    }
  });
}

function setLabelByRadioValue(value, labelText) {
  const field = document.querySelector(`input[type="radio"][value="${value}"]`);
  const label = field?.closest("label");
  if (!label) return;

  [...label.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
      node.textContent = `\n                ${labelText}\n              `;
    }
  });
}

function applyColors(config) {
  const colorMap = {
    "--paper": config.colors.paper,
    "--paper-warm": config.colors.paperWarm,
    "--ink": config.colors.ink,
    "--sage-dark": config.colors.sageDark,
    "--clay": config.colors.clay,
    "--tile-blue": config.colors.tileBlue,
    "--tile-blue-dark": config.colors.tileBlueDark,
    "--tile-cream": config.colors.tileCream,
  };

  Object.entries(colorMap).forEach(([property, value]) => {
    document.documentElement.style.setProperty(property, value);
  });

  document.body.dataset.frameStyle = config.frameStyle;
}

function applySiteConfig(config) {
  document.title = config.pageTitle;
  document.querySelector('meta[name="description"]')?.setAttribute("content", config.metaDescription);

  setText(".topbar a[href='#historia']", config.navHistoria);
  setText(".topbar a[href='#local']", config.navLocal);
  setText(".topbar a[href='#presenca']", config.navPresenca);
  setText(".topbar a[href='#recados']", config.navRecados);
  setText(".hero__content .eyebrow", config.inviteText);
  setText("#couple-name", config.coupleName);
  setText(".date-line", config.dateText);
  setText(".place-line", config.placeText);
  setText(".countdown-band .eyebrow", config.countdownEyebrow);
  setText("#countdown-title", config.countdownTitle);
  setText("#historia h2", config.historyTitle);
  setHtmlFromLines("#historia p", config.historyBody);
  setText("#local h2", config.locationTitle);
  setHtmlFromLines("#local p", config.locationBody);
  setLink("#local .button", config.locationUrl, config.locationButton);
  setText("#dress-code h2", config.dressTitle);
  setHtmlFromLines("#dress-code p", config.dressBody);
  setText("#presentes h2", config.giftsTitle);
  setHtmlFromLines("#presentes p", config.giftsBody);
  setLink("#presentes .button", config.giftsUrl, config.giftsButton);
  setText("#presenca h2", config.rsvpTitle);
  setLabelByFieldName("name", config.rsvpNameLabel);
  setText("#rsvp-form legend", config.rsvpAttendanceLabel);
  setLabelByRadioValue("Sim", config.rsvpYesLabel);
  setLabelByRadioValue("Não", config.rsvpNoLabel);
  setLabelByFieldName("adults", config.rsvpAdultsLabel);
  setLabelByFieldName("children", config.rsvpChildrenLabel);
  setLabelByFieldName("email", config.rsvpEmailLabel);
  setLabelByFieldName("phone", config.rsvpPhoneLabel);
  setText("#rsvp-form .button", config.rsvpButton);
  setText("#recados h2", config.messagesTitle);
  setLabelByFieldName("messageName", config.messageNameLabel);
  setLabelByFieldName("messageEmail", config.messageEmailLabel);
  setLabelByFieldName("messageText", config.messageTextLabel);
  setText("#message-form .button", config.messageButton);
  setText(".footer p", config.footerText);

  document.querySelector("input[name='adults']")?.setAttribute("max", config.adultMax);
  document.querySelector("input[name='children']")?.setAttribute("max", config.childrenMax);

  setImage(".hero__art img", config.images.hero, "");
  setImage(".photo-strip:not(.photo-strip--closing) figure:nth-child(1) img", config.images.top1, "Foto do casal");
  setImage(".photo-strip:not(.photo-strip--closing) figure:nth-child(2) img", config.images.top2, "Foto do casal");
  setImage(".photo-strip:not(.photo-strip--closing) figure:nth-child(3) img", config.images.top3, "Foto do casal");
  setImage(".venue-art img", config.images.venue, "Imagem do local");
  setImage(".photo-strip--closing figure:nth-child(1) img", config.images.bottom1, "Foto do casal");
  setImage(".photo-strip--closing figure:nth-child(2) img", config.images.bottom2, "Foto do casal");
  setImage(".photo-strip--closing figure:nth-child(3) img", config.images.bottom3, "Foto do casal");
  applyColors(config);
}

async function initSite() {
  siteConfig = await loadRemoteSiteConfig();
  applySiteConfig(siteConfig);

  const weddingDate = new Date(siteConfig.eventDate);

  const countdownFields = {
    days: document.querySelector("#days"),
    hours: document.querySelector("#hours"),
    minutes: document.querySelector("#minutes"),
    seconds: document.querySelector("#seconds"),
  };

  function updateCountdown() {
    const now = new Date();
    const distance = Math.max(0, weddingDate - now);

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((distance / (1000 * 60)) % 60);
    const seconds = Math.floor((distance / 1000) % 60);

    countdownFields.days.textContent = days;
    countdownFields.hours.textContent = String(hours).padStart(2, "0");
    countdownFields.minutes.textContent = String(minutes).padStart(2, "0");
    countdownFields.seconds.textContent = String(seconds).padStart(2, "0");
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  const rsvpForm = document.querySelector("#rsvp-form");
  const rsvpMessage = document.querySelector("#rsvp-message");

  rsvpForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const data = Object.fromEntries(new FormData(rsvpForm).entries());
    const remoteResult = await submitRemoteRsvp(data);

    if (!remoteResult.ok) {
      const responses = JSON.parse(localStorage.getItem("wedding-rsvps") || "[]");
      responses.push({
        ...data,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem("wedding-rsvps", JSON.stringify(responses));
    }

    rsvpForm.reset();
    rsvpForm.elements.adults.value = Math.min(1, Number(siteConfig.adultMax));
    rsvpForm.elements.children.value = 0;
    rsvpMessage.textContent = siteConfig.rsvpSuccess;
  });

  const messageForm = document.querySelector("#message-form");
  const messageWall = document.querySelector("#message-wall");

  async function getMessages() {
    const remoteMessages = await loadRemoteMessages();
    if (remoteMessages) return remoteMessages;
    return JSON.parse(localStorage.getItem("wedding-messages") || "[]");
  }

  function saveMessages(messages) {
    localStorage.setItem("wedding-messages", JSON.stringify(messages));
  }

  async function renderMessages() {
    const messages = await getMessages();
    messageWall.innerHTML = "";

    if (!messages.length) {
      const empty = document.createElement("article");
      const title = document.createElement("h3");
      const text = document.createElement("p");

      empty.className = "message-card";
      title.textContent = siteConfig.emptyMessageTitle;
      text.textContent = siteConfig.emptyMessageBody;
      empty.append(title, text);
      messageWall.append(empty);
      return;
    }

    messages.forEach((message) => {
      const card = document.createElement("article");
      const title = document.createElement("h3");
      const text = document.createElement("p");

      card.className = "message-card";
      title.textContent = message.name;
      text.textContent = message.text;

      card.append(title, text);
      messageWall.append(card);
    });
  }

  messageForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(messageForm);
    const message = {
      name: formData.get("messageName"),
      email: formData.get("messageEmail"),
      text: formData.get("messageText"),
      createdAt: new Date().toISOString(),
    };
    const remoteResult = await submitRemoteMessage(message);

    if (!remoteResult.ok) {
      const messages = JSON.parse(localStorage.getItem("wedding-messages") || "[]");
      messages.unshift(message);
      saveMessages(messages);
    }

    messageForm.reset();
    renderMessages();
  });

  renderMessages();
}

initSite();
