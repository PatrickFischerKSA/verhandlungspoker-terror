const STORAGE_KEY = 'verantwortungspoker-terror-state-v3';
const COMPANION_STORAGE_KEY = 'verantwortungspoker-terror-companion-v1';
const PEER_CONFIG = {};

const hostApp = document.querySelector('#hostApp');
const phoneApp = document.querySelector('#phoneApp');

const statusStrip = document.querySelector('#statusStrip');
const briefingCard = document.querySelector('#briefingCard');
const resolutionOrder = document.querySelector('#resolutionOrder');
const roundFeedback = document.querySelector('#roundFeedback');
const rolesGrid = document.querySelector('#rolesGrid');
const resourceMeters = document.querySelector('#resourceMeters');
const matrixTable = document.querySelector('#matrixTable');
const metaSummary = document.querySelector('#metaSummary');
const logList = document.querySelector('#logList');
const endScreen = document.querySelector('#endScreen');
const verdictBanner = document.querySelector('#verdictBanner');
const endingHeadline = document.querySelector('#endingHeadline');
const endingStats = document.querySelector('#endingStats');
const responsibilityChart = document.querySelector('#responsibilityChart');
const goalSummary = document.querySelector('#goalSummary');
const indictmentText = document.querySelector('#indictmentText');
const defenseText = document.querySelector('#defenseText');
const proList = document.querySelector('#proList');
const conList = document.querySelector('#conList');
const restoredBanner = document.querySelector('#restoredBanner');
const newGameBtn = document.querySelector('#newGameBtn');
const resetBtn = document.querySelector('#resetBtn');
const resolveBtn = document.querySelector('#resolveBtn');
const exportTxtBtn = document.querySelector('#exportTxtBtn');
const exportPdfBtn = document.querySelector('#exportPdfBtn');
const reflectionPrompt = document.querySelector('#reflectionPrompt');
const reflectionNote = document.querySelector('#reflectionNote');
const saveReflectionBtn = document.querySelector('#saveReflectionBtn');
const scenarioSelect = document.querySelector('#scenarioSelect');
const modeSelect = document.querySelector('#modeSelect');
const scenarioDescription = document.querySelector('#scenarioDescription');
const modeDescription = document.querySelector('#modeDescription');
const presetButtons = document.querySelector('#presetButtons');
const roleToggles = document.querySelector('#roleToggles');
const companionToggle = document.querySelector('#companionToggle');
const companionPanel = document.querySelector('#companionPanel');
const companionGrid = document.querySelector('#companionGrid');

const phonePairPanel = document.querySelector('#phonePairPanel');
const phoneGamePanel = document.querySelector('#phoneGamePanel');
const phonePairStatus = document.querySelector('#phonePairStatus');
const phoneAnswerOutput = document.querySelector('#phoneAnswerOutput');
const copyPhoneAnswerBtn = document.querySelector('#copyPhoneAnswerBtn');
const phoneRoleTitle = document.querySelector('#phoneRoleTitle');
const phoneRoundTitle = document.querySelector('#phoneRoundTitle');
const phoneStatusStrip = document.querySelector('#phoneStatusStrip');
const phoneGoalBox = document.querySelector('#phoneGoalBox');
const phoneCards = document.querySelector('#phoneCards');
const phonePublicState = document.querySelector('#phonePublicState');

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadJson(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function sanitizeLoadedState(loaded) {
  if (!loaded || typeof loaded !== 'object' || !loaded.config) {
    return GameCore.createInitialState();
  }
  const nextState = loaded;
  GameCore.updateStatuses(nextState);
  return nextState;
}

function createDefaultCompanionSettings() {
  return {
    enabled: false,
    sessionId: `session-${Math.random().toString(36).slice(2, 10)}`
  };
}

function saveCompanionSettings() {
  localStorage.setItem(COMPANION_STORAGE_KEY, JSON.stringify(companionSettings));
}

function bytesToBase64Url(bytes) {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(base64Url) {
  const normalized = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4 || 4)) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function streamToUint8Array(stream) {
  const response = new Response(stream);
  return new Uint8Array(await response.arrayBuffer());
}

async function encodeSignal(payload) {
  const json = JSON.stringify(payload);
  if ('CompressionStream' in window) {
    const compressed = await streamToUint8Array(
      new Blob([json]).stream().pipeThrough(new CompressionStream('deflate-raw'))
    );
    return `c.${bytesToBase64Url(compressed)}`;
  }
  return `p.${btoa(unescape(encodeURIComponent(json)))}`;
}

async function decodeSignal(token) {
  if (token.startsWith('c.') && 'DecompressionStream' in window) {
    const bytes = base64UrlToBytes(token.slice(2));
    const decompressed = await streamToUint8Array(
      new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
    );
    return JSON.parse(new TextDecoder().decode(decompressed));
  }
  const raw = token.startsWith('p.') ? token.slice(2) : token;
  return JSON.parse(decodeURIComponent(escape(atob(raw))));
}

function waitForIceComplete(peer) {
  if (peer.iceGatheringState === 'complete') {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    function handleChange() {
      if (peer.iceGatheringState === 'complete') {
        peer.removeEventListener('icegatheringstatechange', handleChange);
        resolve();
      }
    }
    peer.addEventListener('icegatheringstatechange', handleChange);
  });
}

function ensureSessionId() {
  if (!companionSettings.sessionId) {
    companionSettings.sessionId = `session-${Math.random().toString(36).slice(2, 10)}`;
    saveCompanionSettings();
  }
}

function makeInviteLink(roleId, offerToken) {
  const url = new URL(window.location.href);
  url.searchParams.set('phone', '1');
  url.searchParams.set('role', roleId);
  url.searchParams.set('signal', offerToken);
  return url.toString();
}

function buildQrImageUrl(text) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=8&format=svg&data=${encodeURIComponent(text)}`;
}

function getPhoneParams() {
  const url = new URL(window.location.href);
  return {
    isPhone: url.searchParams.get('phone') === '1' || Boolean(url.searchParams.get('signal')),
    roleId: url.searchParams.get('role') || '',
    signal: url.searchParams.get('signal') || ''
  };
}

function getScenario() {
  return GameCore.SCENARIOS[draftConfig.scenarioId] || GameCore.SCENARIOS.classic;
}

function getMode() {
  return GameCore.MODE_OPTIONS[draftConfig.modeId] || GameCore.MODE_OPTIONS.normal;
}

function syncDraftConfigFromState() {
  draftConfig = deepClone(state.config);
}

function setDraftMode(modeId) {
  draftConfig.modeId = modeId;
  if (modeId !== 'unterricht') {
    draftConfig.presetId = 'full';
    draftConfig.activeRoles = [...GameCore.ROLE_ORDER];
  }
  renderConfig();
}

function setDraftPreset(presetId) {
  draftConfig = GameCore.applyTeachingPreset(draftConfig, presetId);
  renderConfig();
}

function toggleDraftRole(roleId) {
  const active = new Set(draftConfig.activeRoles);
  if (active.has(roleId)) {
    active.delete(roleId);
  } else {
    active.add(roleId);
  }
  const ordered = GameCore.ROLE_ORDER.filter((id) => active.has(id));
  draftConfig.activeRoles = ordered.length ? ordered : [roleId];
  draftConfig.modeId = 'unterricht';
  renderConfig();
}

function resetAllHostPeerConnections() {
  Object.values(hostConnections).forEach((entry) => {
    if (entry.channel) {
      try {
        entry.channel.close();
      } catch {}
    }
    if (entry.peer) {
      try {
        entry.peer.close();
      } catch {}
    }
  });
  hostConnections = {};
}

function startNewGame() {
  state = GameCore.createInitialState(draftConfig);
  roundFeedback.textContent = 'Neue Partie gestartet. Die neue Konfiguration ist jetzt aktiv.';
  roundFeedback.className = 'round-feedback tone-safe';
  if (!companionSettings.enabled) {
    resetAllHostPeerConnections();
  }
  saveState();
  broadcastStateToPhones();
  render();
}

function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  state = GameCore.createInitialState();
  syncDraftConfigFromState();
  resetAllHostPeerConnections();
  companionSettings = createDefaultCompanionSettings();
  saveCompanionSettings();
  roundFeedback.textContent = 'Speicher gelöscht. Eine frische Standardpartie wurde geladen.';
  roundFeedback.className = 'round-feedback tone-safe';
  saveState();
  render();
}

function isRoleConnected(roleId) {
  const entry = hostConnections[roleId];
  return Boolean(entry && entry.channel && entry.channel.readyState === 'open');
}

function selectCard(roleId, cardId) {
  if (state.finished) return;
  if (companionSettings.enabled && isRoleConnected(roleId)) return;
  state.selections[roleId] = cardId;
  saveState();
  broadcastStateToPhones();
  renderRoles();
}

function renderConfig() {
  const scenarioEntries = Object.values(GameCore.SCENARIOS);
  const modeEntries = Object.values(GameCore.MODE_OPTIONS);

  scenarioSelect.innerHTML = scenarioEntries
    .map(
      (scenario) =>
        `<option value="${scenario.id}" ${scenario.id === draftConfig.scenarioId ? 'selected' : ''}>${scenario.title}</option>`
    )
    .join('');

  modeSelect.innerHTML = modeEntries
    .map(
      (mode) =>
        `<option value="${mode.id}" ${mode.id === draftConfig.modeId ? 'selected' : ''}>${mode.title}</option>`
    )
    .join('');

  scenarioDescription.textContent = getScenario().description;
  modeDescription.textContent = getMode().description;
  companionToggle.checked = companionSettings.enabled;

  presetButtons.innerHTML = Object.values(GameCore.TEACHING_PRESETS)
    .map((preset) => {
      const selected = draftConfig.presetId === preset.id && draftConfig.modeId === 'unterricht';
      return `
        <button class="preset-btn ${selected ? 'selected' : ''}" type="button" data-preset="${preset.id}">
          ${preset.label}
        </button>
      `;
    })
    .join('');

  roleToggles.innerHTML = GameCore.ROLE_ORDER.map((roleId) => {
    const role = GameCore.ROLE_META[roleId];
    const active = draftConfig.activeRoles.includes(roleId);
    return `
      <label class="role-toggle ${active ? 'active' : ''}">
        <input type="checkbox" data-role-toggle="${roleId}" ${active ? 'checked' : ''} />
        <span class="role-toggle-dot" style="background:${role.color}"></span>
        <span>${role.short}</span>
      </label>
    `;
  }).join('');

  scenarioSelect.onchange = () => {
    draftConfig.scenarioId = scenarioSelect.value;
    renderConfig();
  };

  modeSelect.onchange = () => {
    setDraftMode(modeSelect.value);
  };

  companionToggle.onchange = () => {
    companionSettings.enabled = companionToggle.checked;
    ensureSessionId();
    if (!companionSettings.enabled) {
      resetAllHostPeerConnections();
    }
    saveCompanionSettings();
    renderCompanionPanel();
    renderRoles();
  };

  presetButtons.querySelectorAll('[data-preset]').forEach((button) => {
    button.addEventListener('click', () => setDraftPreset(button.dataset.preset));
  });

  roleToggles.querySelectorAll('[data-role-toggle]').forEach((input) => {
    input.addEventListener('change', () => toggleDraftRole(input.dataset.roleToggle));
  });
}

function renderStatusStrip() {
  const round = GameCore.ROUNDS[Math.min(state.roundIndex, GameCore.ROUNDS.length - 1)];
  const verdict = state.finished ? state.verdict : GameCore.getVerdict(state);
  const connectedPhones = GameCore.getActiveRoleIds(state).filter((roleId) => isRoleConnected(roleId)).length;
  const statusCards = [
    {
      label: 'Runde',
      value: `${Math.min(state.roundIndex + 1, GameCore.ROUNDS.length)} / ${GameCore.ROUNDS.length}`,
      detail: `T - ${round.minute} Minuten`
    },
    {
      label: 'Szenario',
      value: GameCore.SCENARIOS[state.config.scenarioId].title,
      detail: GameCore.MODE_OPTIONS[state.config.modeId].title
    },
    {
      label: 'Flugzeug',
      value: state.statuses.planeStatus,
      detail: state.statuses.communicationStatus
    },
    {
      label: 'Handys',
      value: companionSettings.enabled ? `${connectedPhones} verbunden` : 'aus',
      detail: companionSettings.enabled ? 'private Rollenbildschirme' : 'Host-only'
    },
    {
      label: 'Urteilstendenz',
      value: verdict.label,
      detail: `${state.meta.prosecution} Anklage / ${state.meta.defense} Verteidigung`
    }
  ];

  statusStrip.innerHTML = statusCards
    .map(
      (card) => `
        <article class="status-card">
          <span>${card.label}</span>
          <strong>${card.value}</strong>
          <span>${card.detail}</span>
        </article>
      `
    )
    .join('');
}

function renderBriefing() {
  const round = GameCore.ROUNDS[Math.min(state.roundIndex, GameCore.ROUNDS.length - 1)];
  const resolutionSummary = state.lastResolution.length
    ? `<div class="briefing-pod"><strong>Letzte Auflösung</strong><span>${state.lastResolution.join(' | ')}</span></div>`
    : '';

  briefingCard.innerHTML = `
    <div class="briefing-frame">
      <div class="timeline-chip">T - ${round.minute} Minuten</div>
      <h3>${round.title}</h3>
      <p>${round.summary}</p>
      <div class="briefing-grid">
        <div class="briefing-pod">
          <strong>Fokus</strong>
          <span>${round.focus}</span>
        </div>
        <div class="briefing-pod">
          <strong>Drucklinie</strong>
          <span>${round.pressure}</span>
        </div>
        <div class="briefing-pod">
          <strong>Szenarioeffekt</strong>
          <span>${GameCore.SCENARIOS[state.config.scenarioId].description}</span>
        </div>
        ${resolutionSummary}
      </div>
    </div>
  `;
}

function renderResolutionOrder() {
  const activeRoles = GameCore.getActiveRoleIds(state);
  resolutionOrder.innerHTML = activeRoles
    .map((roleId, index) => {
      const role = GameCore.ROLE_META[roleId];
      const connected = companionSettings.enabled && isRoleConnected(roleId);
      return `
        <div class="order-chip">
          <em>${index + 1}</em>
          <span>${role.short}${connected ? ' · Handy' : ''}</span>
        </div>
      `;
    })
    .join('');
}

function renderReflection() {
  reflectionPrompt.innerHTML = `
    <p class="reflection-round">Reflexionsfenster ${state.reflection.round || 'Start'}</p>
    <p>${state.reflection.question}</p>
  `;
  reflectionNote.value = state.reflection.note || '';
}

function renderRoles() {
  const activeRoles = new Set(GameCore.getActiveRoleIds(state));
  rolesGrid.innerHTML = GameCore.ROLE_ORDER.map((roleId) => {
    const role = GameCore.ROLE_META[roleId];
    const row = state.matrix[roleId];
    const active = activeRoles.has(roleId);

    if (!active) {
      return `
        <article class="role-card disabled">
          <div class="role-card-header">
            <div>
              <h3><span class="role-accent" style="background:${role.color}"></span>${role.label}</h3>
              <p>${role.subtitle}</p>
            </div>
          </div>
          <p class="role-goal">Diese Rolle ist im aktuellen Unterrichts-Setup deaktiviert.</p>
        </article>
      `;
    }

    const handCards = GameCore.getHandCardsForRole(state, roleId);
    const selectedCardId = state.selections[roleId];
    const goalStatus = state.finished ? GameCore.getGoalStatuses(state).find((entry) => entry.roleId === roleId) : null;
    const connected = companionSettings.enabled && isRoleConnected(roleId);

    const cardsMarkup = connected
      ? `
        <div class="companion-lock">
          <strong>Privater Handy-Bildschirm aktiv</strong>
          <p>Die Hand dieser Rolle bleibt auf dem gekoppelte Smartphone verborgen.</p>
          <p>Aktuelle Auswahl: ${selectedCardId ? handCards.find((card) => card.id === selectedCardId)?.title || 'gewählt' : 'noch keine'}</p>
        </div>
      `
      : handCards
          .map((card) => {
            const selected = selectedCardId === card.id;
            return `
              <button
                class="choice-btn ${selected ? 'selected' : ''}"
                type="button"
                data-role="${roleId}"
                data-card="${card.id}"
                style="${selected ? `background:${role.soft};border-color:${role.color};` : ''}"
              >
                <h4>${card.title}</h4>
                <p>${card.description}</p>
                <div class="choice-tags">
                  ${card.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}
                </div>
              </button>
            `;
          })
          .join('');

    return `
      <article class="role-card">
        <div class="role-card-header">
          <div>
            <h3><span class="role-accent" style="background:${role.color}"></span>${role.label}</h3>
            <p>${role.subtitle}${connected ? ' · Handy-Modus' : ''}</p>
          </div>
          <div class="role-scoreline">
            <span class="score-badge">aktiv ${row.active}</span>
            <span class="score-badge">unterlassen ${row.omitted}</span>
            <span class="score-badge">rechtlich ${row.legal}</span>
          </div>
        </div>
        <p class="role-goal">${role.goal}</p>
        <details class="secret-goal">
          <summary>Verdecktes Einzelziel anzeigen</summary>
          <p>${state.secretGoals[roleId]}</p>
          ${
            goalStatus
              ? `<p class="goal-status ${goalStatus.achieved ? 'success' : 'failure'}">${goalStatus.achieved ? 'Ziel erreicht' : 'Ziel verfehlt'}</p>`
              : ''
          }
        </details>
        <div class="card-choice-grid">${cardsMarkup}</div>
      </article>
    `;
  }).join('');

  rolesGrid.querySelectorAll('.choice-btn').forEach((button) => {
    button.addEventListener('click', () => selectCard(button.dataset.role, button.dataset.card));
  });
}

function renderResources() {
  resourceMeters.innerHTML = GameCore.RESOURCE_CONFIG.map((item) => {
    const value = state.resources[item.key];
    const percent = Math.round((value / item.max) * 100);
    return `
      <article class="meter-card">
        <div class="meter-head">
          <strong>${item.label}</strong>
          <span>${value} / ${item.max}</span>
        </div>
        <div class="meter-track">
          <div class="meter-fill" style="width:${percent}%;background:${item.color}"></div>
        </div>
        <p class="meter-note">${item.note(value)}</p>
      </article>
    `;
  }).join('');
}

function renderMatrix() {
  const maxValue = Math.max(
    4,
    ...Object.values(state.matrix).flatMap((row) => [row.active, row.omitted, row.legal])
  );

  matrixTable.innerHTML = GameCore.ROLE_ORDER.map((roleId) => {
    const role = GameCore.ROLE_META[roleId];
    const row = state.matrix[roleId];
    const active = GameCore.getActiveRoleIds(state).includes(roleId);
    const rows = [
      { label: 'Aktiv', value: row.active, color: role.color },
      { label: 'Unterlassen', value: row.omitted, color: '#a35b39' },
      { label: 'Rechtlich', value: row.legal, color: '#425f8f' }
    ];

    return `
      <article class="matrix-row ${active ? '' : 'muted-row'}">
        <header>
          <strong>${role.short}</strong>
          <span class="muted">${active ? role.subtitle : 'deaktiviert'}</span>
        </header>
        <div class="matrix-bars">
          ${rows
            .map(
              (entry) => `
            <div class="matrix-bar">
              <span class="matrix-bar-label">${entry.label}</span>
              <div class="matrix-track">
                <div class="meter-fill" style="width:${(entry.value / maxValue) * 100}%;background:${entry.color}"></div>
              </div>
              <span class="matrix-value">${entry.value}</span>
            </div>
          `
            )
            .join('')}
        </div>
      </article>
    `;
  }).join('');
}

function renderMetaSummary() {
  metaSummary.innerHTML = `
    <article class="meta-card">
      <p class="mini-label tone-danger">Nelson</p>
      <strong>${state.meta.prosecution}</strong>
      <p>Anklagepunkte gegen Abschusslogik, unterlassene Alternativen und rechtliche Grenzüberschreitungen.</p>
    </article>
    <article class="meta-card">
      <p class="mini-label tone-legal">Biegler</p>
      <strong>${state.meta.defense}</strong>
      <p>Verteidigungspunkte aus Zeitdruck, Pflichtenkollision und geteilter Verantwortung.</p>
    </article>
  `;
}

function renderLog() {
  logList.innerHTML = state.log
    .map(
      (entry) => `
        <li><span class="log-round">Runde ${entry.round}, T - ${entry.minute}:</span> ${entry.text}</li>
      `
    )
    .join('');
}

function buildChartMarkup() {
  const rows = GameCore.ROLE_ORDER.map((roleId) => ({
    roleId,
    label: GameCore.ROLE_META[roleId].short,
    active: state.matrix[roleId].active,
    omitted: state.matrix[roleId].omitted,
    legal: state.matrix[roleId].legal
  }));
  const max = Math.max(4, ...rows.flatMap((entry) => [entry.active, entry.omitted, entry.legal]));
  const width = 600;
  const height = 260;
  const laneHeight = 32;
  const left = 112;

  const svgRows = rows
    .map((entry, index) => {
      const y = 20 + index * laneHeight;
      const activeWidth = (entry.active / max) * 130;
      const omittedWidth = (entry.omitted / max) * 130;
      const legalWidth = (entry.legal / max) * 130;
      return `
        <text x="0" y="${y + 13}" class="chart-label">${entry.label}</text>
        <rect x="${left}" y="${y}" width="${activeWidth}" height="10" rx="5" fill="${GameCore.ROLE_META[entry.roleId].color}"></rect>
        <rect x="${left}" y="${y + 12}" width="${omittedWidth}" height="10" rx="5" fill="#a35b39"></rect>
        <rect x="${left}" y="${y + 24}" width="${legalWidth}" height="10" rx="5" fill="#425f8f"></rect>
      `;
    })
    .join('');

  return `
    <svg viewBox="0 0 ${width} ${height}" class="responsibility-svg" role="img" aria-label="Verantwortungsdiagramm">
      <style>
        .chart-label { fill: #18202c; font: 700 12px Avenir Next, sans-serif; }
        .chart-legend { fill: #5d6470; font: 600 11px Avenir Next, sans-serif; }
      </style>
      <text x="${left}" y="12" class="chart-legend">Aktiv</text>
      <text x="${left + 150}" y="12" class="chart-legend">Unterlassen</text>
      <text x="${left + 318}" y="12" class="chart-legend">Rechtlich</text>
      ${svgRows}
    </svg>
  `;
}

function generateClosingTexts() {
  const matrixEntries = Object.entries(state.matrix)
    .map(([roleId, values]) => ({
      roleId,
      label: GameCore.ROLE_META[roleId].short,
      total: values.active + values.omitted + values.legal
    }))
    .sort((a, b) => b.total - a.total);

  const primary = matrixEntries[0];
  const secondary = matrixEntries[1];
  const verdict = state.verdict;

  return {
    indictment: [
      `Nelson zeichnet eine Anklage, die mit ${primary.label} beginnt und ${secondary.label} ausdrücklich mitdenkt.`,
      state.ending.type === 'abschuss'
        ? 'Der Abschuss tötet 164 unschuldige Menschen an Bord. Gerade deshalb rückt die Frage in den Vordergrund, ob staatliches Handeln Leben gegen Leben verrechnen durfte.'
        : 'Die nicht verhinderte Kollision zeigt aus Nelsons Sicht, dass frühe Alternativen zu spät oder gar nicht genutzt wurden. Unterlassung erscheint hier nicht als Neutralität, sondern als zurechenbarer Beitrag.',
      `Im Protokoll verdichten sich ${state.meta.prosecution} Anklagepunkte; das resultierende Urteil lautet: ${verdict.label}.`
    ].join(' '),
    defense: [
      'Biegler hält dagegen, dass Verantwortung im Spiel nie bei einer einzelnen Figur ruht, sondern zwischen Befehlskette, Rechtslage, Evakuierung und Zeitdruck zersplittert.',
      state.ending.type === 'abschuss'
        ? `Aus Verteidigungssicht steht Koch in einer Pflichtenkollision: Er rettet ein Stadion und überschreitet zugleich eine rechtliche Grenze. Diese Spannung erzeugt ${state.meta.defense} Verteidigungspunkte.`
        : 'Aus Verteidigungssicht zeigen die vielen Unterlassungsspuren, dass nicht nur die letzte Handlung, sondern das gesamte System versagt oder gezögert hat. Gerade das schwächt die Idee individueller Alleinschuld.',
      'Die Verteidigung beschreibt den Fall deshalb weniger als einfache Tätergeschichte denn als Belastungstest für Staat und Urteilskraft.'
    ].join(' ')
  };
}

function renderEndScreen() {
  if (!state.finished || !state.ending) {
    endScreen.classList.add('hidden');
    return;
  }

  const texts = generateClosingTexts();
  const argumentsTable = GameCore.buildArgumentTable(state);
  const goals = GameCore.getGoalStatuses(state).filter((entry) => entry.active);

  verdictBanner.innerHTML = `
    <div class="verdict-chip ${state.verdict.tone}">
      <strong>${state.verdict.label}</strong>
      <span>${state.verdict.summary}</span>
    </div>
  `;

  endingHeadline.innerHTML = `
    <h3>${state.ending.title}</h3>
    <p>${state.ending.summary}</p>
  `;

  endingStats.innerHTML = [
    { label: 'Tote an Bord', value: state.ending.planeVictims },
    { label: 'Tote im Stadionbereich', value: state.ending.stadiumCasualties },
    { label: 'Evakuierte Menschen', value: state.ending.evacuatedPeople.toLocaleString('de-DE') },
    { label: 'Gerettete Menschen', value: state.ending.savedEstimate.toLocaleString('de-DE') }
  ]
    .map(
      (item) => `
        <article class="ending-stat">
          <span>${item.label}</span>
          <strong>${item.value}</strong>
        </article>
      `
    )
    .join('');

  responsibilityChart.innerHTML = buildChartMarkup();
  goalSummary.innerHTML = goals
    .map(
      (goal) => `
        <div class="goal-pill ${goal.achieved ? 'success' : 'failure'}">
          <strong>${GameCore.ROLE_META[goal.roleId].short}</strong>
          <span>${goal.title}</span>
          <em>${goal.achieved ? 'erreicht' : 'verfehlt'}</em>
        </div>
      `
    )
    .join('');

  indictmentText.textContent = texts.indictment;
  defenseText.textContent = texts.defense;
  proList.innerHTML = argumentsTable.pro.map((entry) => `<li>${entry}</li>`).join('');
  conList.innerHTML = argumentsTable.con.map((entry) => `<li>${entry}</li>`).join('');
  endScreen.classList.remove('hidden');
}

function renderRestoreBanner() {
  restoredBanner.classList.toggle('hidden', !state.restored);
}

function downloadReport() {
  const report = GameCore.buildReport(state);
  const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'verhandlungspoker-terror-bericht.txt';
  link.click();
  URL.revokeObjectURL(url);
}

function printReportPdf() {
  const reportText = GameCore.buildReport(state)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br />');

  const printWindow = window.open('', '_blank', 'width=960,height=720');
  if (!printWindow) return;
  printWindow.document.write(`
    <!doctype html>
    <html lang="de">
    <head>
      <meta charset="utf-8" />
      <title>Bericht – Verantwortungspoker: Terror</title>
      <style>
        body { font-family: Georgia, serif; margin: 32px; color: #18202c; line-height: 1.6; }
        h1 { font-size: 28px; margin-bottom: 18px; }
        .report { white-space: normal; }
      </style>
    </head>
    <body>
      <h1>Verantwortungspoker: Terror – Bericht</h1>
      <div class="report">${reportText}</div>
    </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

function buildPhonePayload(roleId) {
  const role = GameCore.ROLE_META[roleId];
  const handCards = GameCore.getHandCardsForRole(state, roleId).map((card) => ({
    id: card.id,
    title: card.title,
    description: card.description,
    tags: card.tags
  }));
  const round = GameCore.ROUNDS[Math.min(state.roundIndex, GameCore.ROUNDS.length - 1)];
  return {
    type: 'state',
    payload: {
      roleId,
      roleLabel: role.label,
      roleShort: role.short,
      roleSubtitle: role.subtitle,
      roleGoal: state.secretGoals[roleId],
      roundTitle: `${round.title} · T - ${round.minute}`,
      selectedCardId: state.selections[roleId] || '',
      handCards,
      finished: state.finished,
      publicState: {
        planeStatus: state.statuses.planeStatus,
        stadiumStatus: state.statuses.stadiumStatus,
        rulesStatus: state.statuses.rulesStatus,
        communicationStatus: state.statuses.communicationStatus
      },
      prompt: state.reflection.question
    }
  };
}

function broadcastStateToPhones() {
  if (!companionSettings.enabled) return;
  GameCore.getActiveRoleIds(state).forEach((roleId) => {
    const entry = hostConnections[roleId];
    if (entry && entry.channel && entry.channel.readyState === 'open') {
      entry.channel.send(JSON.stringify(buildPhonePayload(roleId)));
    }
  });
}

function handlePhoneMessage(roleId, raw) {
  let message;
  try {
    message = JSON.parse(raw);
  } catch {
    return;
  }

  if (message.type === 'select_card') {
    const handIds = GameCore.getHandCardsForRole(state, roleId).map((card) => card.id);
    if (!handIds.includes(message.cardId)) return;
    state.selections[roleId] = message.cardId;
    saveState();
    render();
    broadcastStateToPhones();
  }
}

function bindHostPeer(roleId, peer, channel) {
  hostConnections[roleId] = hostConnections[roleId] || {};
  hostConnections[roleId].peer = peer;
  hostConnections[roleId].channel = channel;
  hostConnections[roleId].status = 'verbunden';
  channel.addEventListener('open', () => {
    hostConnections[roleId].status = 'verbunden';
    broadcastStateToPhones();
    render();
  });
  channel.addEventListener('close', () => {
    if (hostConnections[roleId]) {
      hostConnections[roleId].status = 'getrennt';
    }
    render();
  });
  channel.addEventListener('message', (event) => handlePhoneMessage(roleId, event.data));
}

async function createOfferForRole(roleId) {
  ensureSessionId();
  if (hostConnections[roleId] && hostConnections[roleId].peer) {
    try {
      hostConnections[roleId].peer.close();
    } catch {}
  }

  const peer = new RTCPeerConnection(PEER_CONFIG);
  const channel = peer.createDataChannel(`terror-${roleId}`);
  bindHostPeer(roleId, peer, channel);
  hostConnections[roleId].status = 'angebot';
  await peer.setLocalDescription(await peer.createOffer());
  await waitForIceComplete(peer);
  const token = await encodeSignal({
    kind: 'offer',
    sessionId: companionSettings.sessionId,
    roleId,
    sdp: peer.localDescription.sdp
  });
  hostConnections[roleId].offerToken = token;
  hostConnections[roleId].inviteLink = makeInviteLink(roleId, token);
  renderCompanionPanel();
}

async function applyAnswerForRole(roleId, answerToken) {
  try {
    const payload = await decodeSignal(answerToken.trim());
    const entry = hostConnections[roleId];
    if (!entry || !entry.peer || payload.kind !== 'answer' || payload.roleId !== roleId) {
      throw new Error('Antwortcode passt nicht zur Rolle.');
    }
    await entry.peer.setRemoteDescription({ type: 'answer', sdp: payload.sdp });
    entry.status = 'verbunden';
    renderCompanionPanel();
  } catch (error) {
    roundFeedback.textContent = `Kopplung fehlgeschlagen: ${error.message}`;
    roundFeedback.className = 'round-feedback tone-danger';
  }
}

function disconnectRole(roleId) {
  const entry = hostConnections[roleId];
  if (!entry) return;
  if (entry.channel) {
    try {
      entry.channel.close();
    } catch {}
  }
  if (entry.peer) {
    try {
      entry.peer.close();
    } catch {}
  }
  delete hostConnections[roleId];
  renderCompanionPanel();
  renderRoles();
}

function renderCompanionPanel() {
  companionPanel.classList.toggle('hidden', !companionSettings.enabled);
  if (!companionSettings.enabled) return;

  const activeRoles = GameCore.getActiveRoleIds(state);
  companionGrid.innerHTML = activeRoles
    .map((roleId) => {
      const role = GameCore.ROLE_META[roleId];
      const entry = hostConnections[roleId] || {};
      return `
        <article class="role-card companion-card">
          <div class="role-card-header">
            <div>
              <h3><span class="role-accent" style="background:${role.color}"></span>${role.label}</h3>
              <p>Status: ${entry.status || 'lokal'}</p>
            </div>
          </div>
          <div class="button-row">
            <button class="ghost-btn" type="button" data-offer-role="${roleId}">Einladungslink erzeugen</button>
            ${entry.peer ? `<button class="ghost-btn" type="button" data-disconnect-role="${roleId}">Trennen</button>` : ''}
          </div>
          <div class="qr-box">
            ${
              entry.inviteLink
                ? `<img src="${buildQrImageUrl(entry.inviteLink)}" alt="QR-Code für ${role.short}" class="qr-image" />`
                : '<p class="config-help qr-empty">Noch kein QR-Code erzeugt.</p>'
            }
          </div>
          <div class="button-row">
            <button class="ghost-btn" type="button" data-copy-link="${roleId}">QR-Link kopieren</button>
          </div>
          <label class="config-label" for="answer-${roleId}">Antwortcode vom Handy</label>
          <textarea id="answer-${roleId}" class="reflection-note small-note" rows="4" placeholder="Antwortcode hier einfügen"></textarea>
          <div class="button-row">
            <button class="primary-btn" type="button" data-apply-answer="${roleId}">Handy koppeln</button>
          </div>
        </article>
      `;
    })
    .join('');

  companionGrid.querySelectorAll('[data-offer-role]').forEach((button) => {
    button.addEventListener('click', () => createOfferForRole(button.dataset.offerRole));
  });
  companionGrid.querySelectorAll('[data-disconnect-role]').forEach((button) => {
    button.addEventListener('click', () => disconnectRole(button.dataset.disconnectRole));
  });
  companionGrid.querySelectorAll('[data-copy-link]').forEach((button) => {
    button.addEventListener('click', async () => {
      const roleId = button.dataset.copyLink;
      const entry = hostConnections[roleId];
      if (!entry || !entry.inviteLink) return;
      await navigator.clipboard.writeText(entry.inviteLink);
      roundFeedback.textContent = `Einladungslink für ${GameCore.ROLE_META[roleId].short} kopiert.`;
      roundFeedback.className = 'round-feedback tone-safe';
    });
  });
  companionGrid.querySelectorAll('[data-apply-answer]').forEach((button) => {
    button.addEventListener('click', () => {
      const roleId = button.dataset.applyAnswer;
      const textarea = document.querySelector(`#answer-${roleId}`);
      applyAnswerForRole(roleId, textarea.value);
    });
  });
}

function render() {
  GameCore.updateStatuses(state);
  renderConfig();
  renderCompanionPanel();
  renderRestoreBanner();
  renderStatusStrip();
  renderBriefing();
  renderResolutionOrder();
  renderReflection();
  renderRoles();
  renderResources();
  renderMatrix();
  renderMetaSummary();
  renderLog();
  renderEndScreen();
  resolveBtn.disabled = state.finished;
}

function resolveRound() {
  const result = GameCore.resolveRound(state);
  if (!result.ok) {
    if (Array.isArray(result.error)) {
      const names = result.error.map((roleId) => GameCore.ROLE_META[roleId].short).join(', ');
      roundFeedback.textContent = `Vor der Auswertung fehlt noch mindestens eine Karte: ${names}.`;
    } else {
      roundFeedback.textContent = result.error;
    }
    roundFeedback.className = 'round-feedback tone-danger';
    return;
  }

  if (result.finished) {
    roundFeedback.textContent = 'Die Partie ist abgeschlossen. Jetzt könnt ihr exportieren, urteilen und die Ziele vergleichen.';
    roundFeedback.className = 'round-feedback tone-neutral';
  } else {
    roundFeedback.textContent = `Runde ${state.roundIndex} ausgewertet. Die nächste Lage ist freigeschaltet.`;
    roundFeedback.className = 'round-feedback tone-safe';
  }

  saveState();
  broadcastStateToPhones();
  render();
}

async function initPhoneMode() {
  hostApp.classList.add('hidden');
  phoneApp.classList.remove('hidden');

  copyPhoneAnswerBtn.addEventListener('click', async () => {
    if (!phoneAnswerOutput.value) return;
    await navigator.clipboard.writeText(phoneAnswerOutput.value);
    phonePairStatus.textContent = 'Antwortcode kopiert. Jetzt am Host einfügen.';
    phonePairStatus.className = 'round-feedback tone-safe';
  });

  const params = getPhoneParams();
  if (!params.signal || !params.roleId) {
    phonePairStatus.textContent = 'Dieser Handy-Bildschirm braucht einen gültigen Einladungslink vom Host.';
    phonePairStatus.className = 'round-feedback tone-danger';
    return;
  }

  try {
    const offer = await decodeSignal(params.signal);
    const peer = new RTCPeerConnection(PEER_CONFIG);
    phonePeerConnection = peer;
    await peer.setRemoteDescription({ type: 'offer', sdp: offer.sdp });
    peer.addEventListener('datachannel', (event) => {
      phoneChannel = event.channel;
      phoneChannel.addEventListener('open', () => {
        phonePairStatus.textContent = 'Verbindung steht. Dein privater Rollenbildschirm ist aktiv.';
        phonePairStatus.className = 'round-feedback tone-safe';
        phonePairPanel.classList.add('hidden');
        phoneGamePanel.classList.remove('hidden');
      });
      phoneChannel.addEventListener('message', (messageEvent) => {
        const message = JSON.parse(messageEvent.data);
        if (message.type === 'state') {
          phoneState = message.payload;
          renderPhoneState();
        }
      });
    });
    await peer.setLocalDescription(await peer.createAnswer());
    await waitForIceComplete(peer);
    const answerToken = await encodeSignal({
      kind: 'answer',
      roleId: params.roleId,
      sessionId: offer.sessionId,
      sdp: peer.localDescription.sdp
    });
    phoneAnswerOutput.value = answerToken;
    phonePairStatus.textContent = 'Antwortcode erzeugt. Bitte am Host einfügen.';
    phonePairStatus.className = 'round-feedback tone-safe';
  } catch (error) {
    phonePairStatus.textContent = `Kopplung fehlgeschlagen: ${error.message}`;
    phonePairStatus.className = 'round-feedback tone-danger';
  }
}

function renderPhoneState() {
  if (!phoneState) return;
  phoneRoleTitle.textContent = `${phoneState.roleLabel} · ${phoneState.roleSubtitle}`;
  phoneRoundTitle.textContent = phoneState.roundTitle;
  phoneGoalBox.innerHTML = `
    <p class="reflection-round">Verdecktes Ziel</p>
    <p>${phoneState.roleGoal}</p>
  `;
  phoneStatusStrip.innerHTML = [
    {
      label: 'Flugzeug',
      value: phoneState.publicState.planeStatus,
      detail: phoneState.publicState.communicationStatus
    },
    {
      label: 'Stadion',
      value: phoneState.publicState.stadiumStatus,
      detail: phoneState.publicState.rulesStatus
    }
  ]
    .map(
      (card) => `
        <article class="status-card">
          <span>${card.label}</span>
          <strong>${card.value}</strong>
          <span>${card.detail}</span>
        </article>
      `
    )
    .join('');

  phoneCards.innerHTML = phoneState.handCards
    .map((card) => {
      const selected = phoneState.selectedCardId === card.id;
      return `
        <button class="choice-btn ${selected ? 'selected' : ''}" type="button" data-phone-card="${card.id}">
          <h4>${card.title}</h4>
          <p>${card.description}</p>
          <div class="choice-tags">${card.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}</div>
        </button>
      `;
    })
    .join('');

  phonePublicState.innerHTML = `
    <div class="briefing-frame">
      <div class="timeline-chip">${phoneState.roundTitle}</div>
      <p>${phoneState.prompt}</p>
    </div>
  `;

  phoneCards.querySelectorAll('[data-phone-card]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!phoneChannel || phoneChannel.readyState !== 'open') return;
      phoneChannel.send(
        JSON.stringify({
          type: 'select_card',
          roleId: phoneState.roleId,
          cardId: button.dataset.phoneCard
        })
      );
    });
  });
}

let state = sanitizeLoadedState(loadJson(STORAGE_KEY) || GameCore.createInitialState());
if (localStorage.getItem(STORAGE_KEY)) {
  state.restored = true;
}
let draftConfig = deepClone(state.config);
let companionSettings = loadJson(COMPANION_STORAGE_KEY) || createDefaultCompanionSettings();
let hostConnections = {};
let phonePeerConnection = null;
let phoneChannel = null;
let phoneState = null;

if (getPhoneParams().isPhone) {
  initPhoneMode();
} else {
  newGameBtn.addEventListener('click', startNewGame);
  resetBtn.addEventListener('click', resetState);
  resolveBtn.addEventListener('click', resolveRound);
  saveReflectionBtn.addEventListener('click', () => {
    GameCore.saveReflectionNote(state, reflectionNote.value.trim());
    saveState();
    roundFeedback.textContent = 'Reflexionsnotiz gespeichert.';
    roundFeedback.className = 'round-feedback tone-safe';
    renderReflection();
  });
  exportTxtBtn.addEventListener('click', downloadReport);
  exportPdfBtn.addEventListener('click', printReportPdf);
  ensureSessionId();
  render();
}
