const STORAGE_KEY = 'verantwortungspoker-terror-state-v2';

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

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function sanitizeLoadedState(loaded) {
  if (!loaded || typeof loaded !== 'object' || !loaded.config) {
    return GameCore.createInitialState();
  }
  const state = loaded;
  GameCore.updateStatuses(state);
  return state;
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

function startNewGame() {
  state = GameCore.createInitialState(draftConfig);
  roundFeedback.textContent = 'Neue Partie gestartet. Die neue Konfiguration ist jetzt aktiv.';
  roundFeedback.className = 'round-feedback tone-safe';
  saveState();
  render();
}

function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  state = GameCore.createInitialState();
  syncDraftConfigFromState();
  roundFeedback.textContent = 'Speicher gelöscht. Eine frische Standardpartie wurde geladen.';
  roundFeedback.className = 'round-feedback tone-safe';
  saveState();
  render();
}

function selectCard(roleId, cardId) {
  if (state.finished) return;
  state.selections[roleId] = cardId;
  saveState();
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

  presetButtons.innerHTML = Object.values(GameCore.TEACHING_PRESETS)
    .map((preset) => {
      const selected = draftConfig.presetId === preset.id && draftConfig.modeId === 'unterricht';
      return `
        <button
          class="preset-btn ${selected ? 'selected' : ''}"
          type="button"
          data-preset="${preset.id}"
        >
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
      label: 'Stadion',
      value: state.statuses.stadiumStatus,
      detail: `${state.resources.evacuation}% geräumt`
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
      return `
        <div class="order-chip">
          <em>${index + 1}</em>
          <span>${role.short}</span>
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

    const cardsMarkup = handCards.map((card) => {
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
    }).join('');

    return `
      <article class="role-card">
        <div class="role-card-header">
          <div>
            <h3><span class="role-accent" style="background:${role.color}"></span>${role.label}</h3>
            <p>${role.subtitle}</p>
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
  render();
}

function render() {
  GameCore.updateStatuses(state);
  renderConfig();
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

let state = sanitizeLoadedState(loadState() || GameCore.createInitialState());
if (localStorage.getItem(STORAGE_KEY)) {
  state.restored = true;
}
let draftConfig = deepClone(state.config);

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

render();
