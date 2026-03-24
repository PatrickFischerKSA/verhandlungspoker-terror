const STORAGE_KEY = 'verantwortungspoker-terror-state-v1';
const MAX_LOG_ENTRIES = 28;
const TOTAL_STADIUM_CAPACITY = 70000;
const PLANE_PASSENGERS = 164;

const ROLE_ORDER = [
  'katastrophenschutz',
  'fuehrungszentrum',
  'ministerium',
  'koch',
  'nelson',
  'biegler'
];

const ROLE_META = {
  koch: {
    label: 'Lars Koch',
    short: 'Koch',
    subtitle: 'Pilot',
    goal: 'Menschen retten und im Cockpitfenster des letzten Handelns eine Entscheidung treffen.',
    color: '#8f2f2f',
    soft: 'rgba(143, 47, 47, 0.12)'
  },
  fuehrungszentrum: {
    label: 'Führungszentrum',
    short: 'Führung',
    subtitle: 'Koordination',
    goal: 'Luftlage koordinieren, Befehle sichern und Informationsklarheit herstellen.',
    color: '#345f91',
    soft: 'rgba(52, 95, 145, 0.12)'
  },
  ministerium: {
    label: 'Ministerium',
    short: 'Ministerium',
    subtitle: 'Recht und Politik',
    goal: 'Verfassungsbindung, politische Deckung und staatliche Legitimation ausbalancieren.',
    color: '#704e88',
    soft: 'rgba(112, 78, 136, 0.12)'
  },
  katastrophenschutz: {
    label: 'Katastrophenschutz',
    short: 'Katastrophe',
    subtitle: 'Evakuierung',
    goal: 'Menschen aus dem Stadionbereich bringen und den Schaden praktisch minimieren.',
    color: '#2f6f59',
    soft: 'rgba(47, 111, 89, 0.12)'
  },
  nelson: {
    label: 'Nelson',
    short: 'Nelson',
    subtitle: 'Anklage',
    goal: 'Unterlassene Alternativen und Verletzungen der Menschenwürde juristisch sichtbar machen.',
    color: '#8d5e29',
    soft: 'rgba(141, 94, 41, 0.14)'
  },
  biegler: {
    label: 'Biegler',
    short: 'Biegler',
    subtitle: 'Verteidigung',
    goal: 'Zeitdruck, Pflichtenkollision und geteilte Verantwortung für die Verteidigung zuspitzen.',
    color: '#20324d',
    soft: 'rgba(32, 50, 77, 0.14)'
  }
};

const RESOURCE_CONFIG = [
  {
    key: 'evacuation',
    label: 'Evakuierung',
    max: 100,
    color: 'linear-gradient(90deg, #2f6f59, #7cb9a0)',
    note: (value) => {
      if (value >= 85) return 'Das Stadion ist fast geräumt; Bodenopfer lassen sich stark reduzieren.';
      if (value >= 55) return 'Teilräumung läuft, aber viele Menschen befinden sich noch im Gefahrenraum.';
      return 'Die Menge ist noch dicht; operative Verzögerungen wirken jetzt unmittelbar tödlich.';
    }
  },
  {
    key: 'infoClarity',
    label: 'Informationsklarheit',
    max: 10,
    color: 'linear-gradient(90deg, #425f8f, #9fb6dc)',
    note: (value) => {
      if (value >= 7) return 'Die Lage ist verdichtet; Entscheidungen können begründeter getroffen werden.';
      if (value >= 4) return 'Ein Teilbild liegt vor, aber Widersprüche bleiben bestehen.';
      return 'Die Lage ist lückenhaft; Gerüchte und Unsicherheit verstärken die Gefahr.';
    }
  },
  {
    key: 'danger',
    label: 'Gefahr',
    max: 20,
    color: 'linear-gradient(90deg, #a63c3c, #d77a6b)',
    note: (value) => {
      if (value >= 14) return 'Der Zielanflug verdichtet sich; ein letzter Eingriff steht unmittelbar an.';
      if (value >= 8) return 'Die Bedrohung ist hoch und drängt alle Rollen in Reaktionsmodus.';
      return 'Es gibt noch ein schmales Zeitfenster für koordinierte Alternativen.';
    }
  },
  {
    key: 'legalRisk',
    label: 'Rechtsrisiko',
    max: 20,
    color: 'linear-gradient(90deg, #704e88, #b494cb)',
    note: (value) => {
      if (value >= 14) return 'Die Entscheidungslage ist juristisch hoch belastet und kaum noch sauber abzusichern.';
      if (value >= 8) return 'Rechtliche Konflikte prägen bereits jede weitere operative Karte.';
      return 'Noch gibt es Spielraum, Verantwortung juristisch zu begrenzen oder umzuverteilen.';
    }
  },
  {
    key: 'publicPressure',
    label: 'Öffentlicher Druck',
    max: 10,
    color: 'linear-gradient(90deg, #8d5e29, #c39a64)',
    note: (value) => {
      if (value >= 7) return 'Politik und Verfahren stehen unter maximalem Beobachtungsdruck.';
      if (value >= 4) return 'Die politische Rechenschaftslast wächst sichtbar mit.';
      return 'Der kommunikative Druck bleibt im Hintergrund.';
    }
  },
  {
    key: 'commandConsensus',
    label: 'Befehlsklarheit',
    max: 10,
    color: 'linear-gradient(90deg, #1d2d44, #647c9c)',
    note: (value) => {
      if (value >= 7) return 'Die Rollen sprechen erkennbar in einer belastbaren Befehlskette.';
      if (value >= 4) return 'Es gibt Teilabsprachen, aber noch keine stabile Linie.';
      return 'Befehl, Verantwortung und Deckung driften auseinander.';
    }
  }
];

const ROUNDS = [
  {
    minute: 52,
    title: 'Radarabweichung',
    summary: 'LH 2047 verlässt den geplanten Kurs. Funkkontakt ist lückenhaft, das Ziel der Abweichung noch unklar.',
    focus: 'Frühphase: Wer gewinnt Zeit und wer wartet auf Bestätigung?',
    pressure: 'Der Fall wirkt noch wie eine Störung. Gerade deshalb prägt Unterlassung früh die Verantwortung.'
  },
  {
    minute: 48,
    title: 'Alarmstart',
    summary: 'Die Alarmrotte ist in der Luft. Das Stadion ist ausverkauft, die Lage verdichtet sich aber nur langsam.',
    focus: 'Die Koordination zwischen Luftlage, Stadion und Ministerium muss erst entstehen.',
    pressure: 'Noch ist vieles hypothetisch, doch jede Verzögerung verbraucht Evakuierungszeit.'
  },
  {
    minute: 44,
    title: 'Keine Antwort aus dem Cockpit',
    summary: 'Abdrängen und Standardkommunikation bringen keine Reaktion. Die Maschine folgt weiter ihrem Kurs.',
    focus: 'Das operative Bild kippt von Unklarheit zu akuter Bedrohung.',
    pressure: 'Wer jetzt nur dokumentiert, lässt die Bedrohung zugleich wachsen.'
  },
  {
    minute: 40,
    title: 'Warnung ohne Wirkung',
    summary: 'Warnsignale bleiben folgenlos. Das Stadion und die Flugbahn rücken näher zusammen.',
    focus: 'Zwischen Lagefeststellung und echter Entscheidung klafft noch eine politische Lücke.',
    pressure: 'Die Frage verschiebt sich von „Ist das real?“ zu „Wer übernimmt Verantwortung?“'
  },
  {
    minute: 36,
    title: 'Drohung bestätigt',
    summary: 'Die Drohung, die Maschine in das Stadion zu steuern, gilt als belastbar. 70 000 Menschen sind potenziell betroffen.',
    focus: 'Ab jetzt wird jedes Kartenlegen zur moralisch und juristisch sichtbaren Position.',
    pressure: 'Die Zahl der bedrohten Leben radikalisiert das Denken, aber nicht automatisch das Recht.'
  },
  {
    minute: 32,
    title: 'Verfassungsgrenze',
    summary: 'Im Hintergrund steht die Rechtsprechung: unschuldige Menschen dürfen nicht gegen andere unschuldige Menschen aufgerechnet werden.',
    focus: 'Die Entscheidungslage wird explizit juristisch gerahmt.',
    pressure: 'Operatives und rechtliches Denken beginnen offen auseinanderzulaufen.'
  },
  {
    minute: 28,
    title: 'Teilräumung',
    summary: 'Die ersten Evakuierungsmaßnahmen stoßen auf Massen, Wege und Zeitprobleme.',
    focus: 'Praktisches Retten konkurriert mit Panikvermeidung und Signalwirkung.',
    pressure: 'Wenn das Stadion nicht schneller leerer wird, wächst die Last auf Koch.'
  },
  {
    minute: 24,
    title: 'Befehle und Rückfragen',
    summary: 'Die Befehlskette wird enger, aber nicht klarer. Jede weitere Minute verschiebt die Verantwortungsachsen.',
    focus: 'Wer fordert Deckung an, wer verteilt sie, wer verweigert sie?',
    pressure: 'Die jurische Nachgeschichte formt schon jetzt die operative Gegenwart.'
  },
  {
    minute: 20,
    title: 'Zielanflug verdichtet sich',
    summary: 'Die Maschine nähert sich München. Teilbilder reichen nicht mehr; die nächste Entscheidung ist kaum revidierbar.',
    focus: 'Das Spiel kippt in die Phase des kaum noch reversiblen Handelns.',
    pressure: 'Jetzt wächst auch die Verantwortung aus jedem „Noch nicht“.'
  },
  {
    minute: 16,
    title: 'Letztes Kommunikationsfenster',
    summary: 'Es bleiben nur wenige operative Schritte. Die Frage ist nicht mehr, ob eine Katastrophe droht, sondern wie sie verhindert werden soll.',
    focus: 'Ab hier sind Freigabe, Verbot und Eigenentscheidung direkt kollidierende Optionen.',
    pressure: 'Die Rollen erzeugen jetzt offen entgegengesetzte Handlungsimperative.'
  },
  {
    minute: 12,
    title: 'Stadion unter Zeitdruck',
    summary: 'Die Räumung stockt in der Masse. Jede Verzögerung macht Bodenopfer wahrscheinlicher.',
    focus: 'Katastrophenschutz und operative Luftlage treffen unmittelbar aufeinander.',
    pressure: 'Die Restzeit ist so knapp, dass auch gute Karten nur noch Schaden begrenzen.'
  },
  {
    minute: 8,
    title: 'Endgültige Zuspitzung',
    summary: 'Die Linie zur Arena ist stabil. Ein letzter Befehl oder eine letzte Abweichung können den Verlauf noch verändern.',
    focus: 'Alle Rollen sind jetzt an ihrem ethischen Kern angekommen.',
    pressure: 'Untätigkeit wird kaum noch als neutral wahrgenommen.'
  },
  {
    minute: 4,
    title: 'Entscheidungsfenster',
    summary: 'Die Zeit ist fast abgelaufen. Jede Karte ist jetzt Endspiel, nicht mehr Vorbereitung.',
    focus: 'Die Schlussminute zwingt das System zu seiner eigentlichen Selbstbeschreibung.',
    pressure: 'Nach dieser Runde wird aus der Einsatzlogik eine Urteilslogik.'
  }
];

function getPhase(roundIndex) {
  if (roundIndex <= 3) return 'early';
  if (roundIndex <= 8) return 'middle';
  return 'late';
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function createEmptyMatrix() {
  return Object.fromEntries(
    Object.keys(ROLE_META).map((roleId) => [
      roleId,
      { active: 0, omitted: 0, legal: 0 }
    ])
  );
}

function createInitialState() {
  return {
    roundIndex: 0,
    finished: false,
    restored: false,
    ending: null,
    selections: {},
    lastResolution: [],
    resources: {
      evacuation: 8,
      infoClarity: 3,
      danger: 5,
      legalRisk: 3,
      publicPressure: 2,
      commandConsensus: 2
    },
    flags: {
      noFireOrder: true,
      ministryRelease: false,
      fullAlarm: false,
      warningShots: false,
      shotByKoch: false,
      documentationSecured: false
    },
    statuses: {
      planeStatus: 'Entführt, Ziel noch unscharf',
      rulesStatus: 'Abschuss verfassungsrechtlich blockiert',
      stadiumStatus: 'Arena voll besetzt',
      communicationStatus: 'Funkkontakt brüchig'
    },
    meta: {
      prosecution: 0,
      defense: 0,
      rescueImpact: 0
    },
    matrix: createEmptyMatrix(),
    log: [
      {
        round: 1,
        minute: 52,
        text: 'Die Lage beginnt mit einer Kursabweichung von LH 2047. Noch ist unklar, ob ein technischer Ausfall oder eine Entführung vorliegt.'
      }
    ]
  };
}

function addLogEntry(state, text) {
  state.log.unshift({
    round: Math.min(state.roundIndex + 1, ROUNDS.length),
    minute: ROUNDS[Math.min(state.roundIndex, ROUNDS.length - 1)].minute,
    text
  });
  state.log = state.log.slice(0, MAX_LOG_ENTRIES);
}

function adjustResource(state, key, delta) {
  const config = RESOURCE_CONFIG.find((item) => item.key === key);
  const max = config ? config.max : 100;
  state.resources[key] = clamp(state.resources[key] + delta, 0, max);
}

function addResponsibility(state, roleId, delta) {
  const row = state.matrix[roleId];
  if (!row) return;
  row.active += delta.active || 0;
  row.omitted += delta.omitted || 0;
  row.legal += delta.legal || 0;
}

function setFlag(state, key, value) {
  state.flags[key] = value;
}

function updateStatuses(state) {
  if (state.flags.shotByKoch) {
    state.statuses.planeStatus = 'Abgeschossen um 20.21 Uhr';
  } else if (state.roundIndex >= 9) {
    state.statuses.planeStatus = 'Zielanflug auf das Stadion verdichtet';
  } else if (state.roundIndex >= 4) {
    state.statuses.planeStatus = 'Entführung als belastbare Lage';
  } else {
    state.statuses.planeStatus = 'Entführt, Ziel noch unscharf';
  }

  if (state.flags.ministryRelease) {
    state.statuses.rulesStatus = 'Übergesetzlicher Notstand wird erwogen';
  } else if (state.flags.noFireOrder) {
    state.statuses.rulesStatus = 'Abschuss bleibt untersagt';
  } else {
    state.statuses.rulesStatus = 'Rechtslage offen, aber nicht gedeckt';
  }

  if (state.resources.evacuation >= 85) {
    state.statuses.stadiumStatus = 'Arena fast vollständig geräumt';
  } else if (state.resources.evacuation >= 55) {
    state.statuses.stadiumStatus = 'Teilräumung sichtbar, aber lückenhaft';
  } else {
    state.statuses.stadiumStatus = 'Arena dicht besetzt';
  }

  if (state.resources.infoClarity >= 7) {
    state.statuses.communicationStatus = 'Lagebild weitgehend verdichtet';
  } else if (state.resources.infoClarity >= 4) {
    state.statuses.communicationStatus = 'Widersprüchliche, aber belastbare Signale';
  } else {
    state.statuses.communicationStatus = 'Funkkontakt brüchig';
  }
}

function getVerdictDelta(state) {
  const kochLegalWeight = Math.round(state.matrix.koch.legal * 0.8);
  const omissionWeight =
    Math.round((state.matrix.ministerium.omitted + state.matrix.fuehrungszentrum.omitted) * 0.35);
  return state.meta.defense + state.meta.rescueImpact + omissionWeight - state.meta.prosecution - kochLegalWeight;
}

function getVerdictLabel(state) {
  const delta = getVerdictDelta(state);
  if (delta >= 3) return 'Freispruch tendiert';
  if (delta <= -3) return 'Verurteilung tendiert';
  return 'Urteil offen';
}

function applyRoundPressure(state) {
  const round = state.roundIndex;
  const baseDanger = round <= 3 ? 1 : round <= 8 ? 2 : 3;
  adjustResource(state, 'danger', baseDanger);

  if (round >= 4) adjustResource(state, 'publicPressure', 1);
  if (state.resources.infoClarity <= 2) {
    adjustResource(state, 'danger', 1);
    addLogEntry(state, 'Die lückenhafte Informationslage erhöht die operative Gefahr zusätzlich.');
  }
  if (round >= 6 && state.resources.evacuation < 45) {
    adjustResource(state, 'danger', 1);
    addResponsibility(state, 'katastrophenschutz', { omitted: 1 });
  }
  if (round >= 7 && !state.flags.ministryRelease) {
    addResponsibility(state, 'ministerium', { omitted: 1 });
  }
  if (round >= 8 && state.flags.noFireOrder && !state.flags.shotByKoch) {
    addResponsibility(state, 'fuehrungszentrum', { legal: 1 });
  }

  updateStatuses(state);
}

function concludeGame(state) {
  const evac = state.resources.evacuation;
  const info = state.resources.infoClarity;
  const consensus = state.resources.commandConsensus;
  let ending;

  if (state.flags.shotByKoch) {
    ending = {
      type: 'abschuss',
      title: 'Abschuss',
      summary:
        'Koch schießt die Maschine ab. Die 164 Menschen an Bord sterben, das Stadion wird nicht getroffen. Der Rettungserfolg steht nun in maximaler Spannung zur Rechtsfrage.'
    };
  } else if (evac >= 85 && (info >= 6 || consensus >= 6)) {
    ending = {
      type: 'evakuierung',
      title: 'Evakuierung',
      summary:
        'Das Stadion wird weitgehend geräumt, der Einschlag trifft einen abgesperrten Randbereich. Die Katastrophe wird begrenzt, aber die Frage nach zu spätem oder zu frühem Handeln bleibt offen.'
    };
  } else if (evac >= 55) {
    ending = {
      type: 'mischlage',
      title: 'Mischlage',
      summary:
        'Die Katastrophe wird nicht verhindert, aber abgeschwächt. Teilräumung und späte Maßnahmen retten viele, doch noch immer sterben zahlreiche Menschen im Gefahrenraum.'
    };
  } else {
    ending = {
      type: 'katastrophe',
      title: 'Katastrophe',
      summary:
        'Die Maschine erreicht den Stadionbereich, bevor die Lage ausreichend entschärft wird. Die Verantwortung verteilt sich nun brutal sichtbar auf Befehlskette, Recht, Evakuierung und Nicht-Handeln.'
    };
  }

  const remainingCrowd = Math.round(TOTAL_STADIUM_CAPACITY * (1 - evac / 100));
  let stadiumCasualties = 0;

  if (ending.type === 'evakuierung') {
    stadiumCasualties = Math.round(remainingCrowd * 0.08);
  } else if (ending.type === 'mischlage') {
    stadiumCasualties = Math.round(remainingCrowd * 0.45);
  } else if (ending.type === 'katastrophe') {
    stadiumCasualties = Math.round(remainingCrowd * 0.85);
  }

  state.ending = {
    ...ending,
    planeVictims: state.flags.shotByKoch || ending.type !== 'evakuierung' ? PLANE_PASSENGERS : PLANE_PASSENGERS,
    stadiumCasualties,
    evacuatedPeople: Math.round(TOTAL_STADIUM_CAPACITY * (evac / 100)),
    savedEstimate: ending.type === 'abschuss'
      ? TOTAL_STADIUM_CAPACITY
      : TOTAL_STADIUM_CAPACITY - stadiumCasualties
  };

  if (ending.type === 'abschuss') {
    addResponsibility(state, 'koch', { legal: state.flags.ministryRelease ? 2 : 4 });
    state.meta.prosecution += state.flags.ministryRelease ? 1 : 2;
  }

  updateStatuses(state);
  state.finished = true;
  saveState(state);
}

function generateClosingTexts(state) {
  const matrixEntries = Object.entries(state.matrix)
    .map(([roleId, values]) => ({
      roleId,
      label: ROLE_META[roleId].short,
      total: values.active + values.omitted + values.legal,
      ...values
    }))
    .sort((a, b) => b.total - a.total);

  const primary = matrixEntries[0];
  const secondary = matrixEntries[1];
  const verdict = getVerdictLabel(state);

  const indictment = [
    `${ROLE_META.nelson.label} zeichnet eine Anklage, die mit ${primary.label} beginnt und ${secondary.label} ausdrücklich mitdenkt.`,
    state.ending.type === 'abschuss'
      ? `Der Abschuss tötet ${PLANE_PASSENGERS} unschuldige Menschen an Bord. Gerade deshalb rückt die Frage in den Vordergrund, ob staatliches Handeln Leben gegen Leben verrechnen durfte.`
      : `Die nicht verhinderte Kollision zeigt aus Nelsons Sicht, dass frühe Alternativen zu spät oder gar nicht genutzt wurden. Unterlassung erscheint hier nicht als Neutralität, sondern als zurechenbarer Beitrag.`,
    `Im Protokoll verdichten sich ${state.meta.prosecution} Anklagepunkte; die jurische Tendenz lautet derzeit: ${verdict}.`
  ].join(' ');

  const defense = [
    `${ROLE_META.biegler.label} hält dagegen, dass die Verantwortung im Spiel nie bei einer einzelnen Figur ruht, sondern zwischen Befehlskette, Rechtslage, Evakuierung und Zeitdruck zersplittert.`,
    state.ending.type === 'abschuss'
      ? `Aus Verteidigungssicht steht Koch in einer Pflichtenkollision: Er rettet ein Stadion und überschreitet zugleich eine rechtliche Grenze. Diese Spannung erzeugt ${state.meta.defense} Verteidigungspunkte.`
      : `Aus Verteidigungssicht zeigen die vielen Unterlassungsspuren, dass nicht nur die letzte Handlung, sondern das gesamte System versagt oder gezögert hat. Gerade das schwächt die Idee individueller Alleinschuld.`,
    `Biegler würde deshalb betonen, dass der Fall weniger nach Held oder Täter fragt als nach fragmentierter Verantwortung in extremer Zeitnot.`
  ].join(' ');

  return { indictment, defense };
}

const CARD_LIBRARY = {
  katastrophenschutz: [
    {
      id: 'partial-evacuation',
      title: 'Teilräumung anstoßen',
      phases: ['early', 'middle'],
      tags: ['Evakuierung +12', 'aktiv'],
      description: 'Sektoren werden nacheinander geöffnet, Durchsagen und Einsatzkräfte lenken die ersten Besucherströme aus der Arena.',
      effect(state) {
        adjustResource(state, 'evacuation', 12);
        adjustResource(state, 'publicPressure', 1);
        state.meta.rescueImpact += 1;
        addResponsibility(state, 'katastrophenschutz', { active: 2 });
        addLogEntry(state, 'Der Katastrophenschutz stößt eine sichtbare Teilräumung des Stadionbereichs an.');
      }
    },
    {
      id: 'full-alarm',
      title: 'Vollalarm auslösen',
      phases: ['middle', 'late'],
      tags: ['Evakuierung +20', 'Druck +1'],
      description: 'Alle verfügbaren Kräfte werden gebündelt, Zufahrten umgelenkt und die Arena mit maximaler Dringlichkeit geräumt.',
      effect(state) {
        adjustResource(state, 'evacuation', 20);
        adjustResource(state, 'publicPressure', 1);
        adjustResource(state, 'commandConsensus', 1);
        setFlag(state, 'fullAlarm', true);
        state.meta.rescueImpact += 2;
        addResponsibility(state, 'katastrophenschutz', { active: 3 });
        addLogEntry(state, 'Der Katastrophenschutz schaltet auf Vollalarm und priorisiert die Räumung über jede Rücksicht auf Ruhe und Routine.');
      }
    },
    {
      id: 'lock-access',
      title: 'Zugangsachsen sperren',
      phases: ['all'],
      tags: ['Evakuierung +9', 'Gefahr -1'],
      description: 'Straßen, Parkhäuser und Innenringe werden so gesperrt, dass der Zustrom stoppt und die Menge schneller abfließen kann.',
      effect(state) {
        adjustResource(state, 'evacuation', 9);
        adjustResource(state, 'danger', -1);
        addResponsibility(state, 'katastrophenschutz', { active: 1 });
        addLogEntry(state, 'Zugangsachsen werden gesperrt, damit der Stadionring nicht weiter verdichtet wird.');
      }
    },
    {
      id: 'hold-public',
      title: 'Warnung zurückhalten',
      phases: ['all'],
      tags: ['Öffentlicher Druck -1', 'Unterlassen'],
      description: 'Aus Angst vor Panik werden Informationen nur intern weitergegeben und die Außenwarnung bewusst gedämpft.',
      effect(state) {
        adjustResource(state, 'publicPressure', -1);
        adjustResource(state, 'danger', 1);
        addResponsibility(state, 'katastrophenschutz', { omitted: 2 });
        addLogEntry(state, 'Aus Panikvermeidung wird die Warnung gedämpft; die Menge bleibt länger im Risiko.');
      }
    },
    {
      id: 'triage-prep',
      title: 'Triage vorbereiten',
      phases: ['late'],
      tags: ['Rescue +1', 'aktiv'],
      description: 'Rettungswege, Kliniken und Sichtungsplätze werden für das schlimmste Szenario vorbereitet.',
      effect(state) {
        adjustResource(state, 'commandConsensus', 1);
        state.meta.rescueImpact += 1;
        addResponsibility(state, 'katastrophenschutz', { active: 1, legal: 1 });
        addLogEntry(state, 'Der Katastrophenschutz bereitet die medizinische Schadensbegrenzung für den Ernstfall vor.');
      }
    }
  ],
  fuehrungszentrum: [
    {
      id: 'share-radar',
      title: 'Lagebild verdichten',
      phases: ['all'],
      tags: ['Info +2', 'Konsens +1'],
      description: 'Radar-, Funk- und Einsatzinformationen werden gebündelt, damit alle Rollen mit demselben Bild arbeiten.',
      effect(state) {
        adjustResource(state, 'infoClarity', 2);
        adjustResource(state, 'commandConsensus', 1);
        addResponsibility(state, 'fuehrungszentrum', { active: 2 });
        addLogEntry(state, 'Das Führungszentrum bündelt die Luftlage und schärft damit das gemeinsame Situationsbild.');
      }
    },
    {
      id: 'issue-no-fire',
      title: 'Nicht schießen befehlen',
      phases: ['middle', 'late'],
      tags: ['Rechtsrisiko -1', 'Unterlassen +1'],
      description: 'Die bekannte Rechtslage wird in einen klaren Negativbefehl übersetzt: kein Abschussbefehl.',
      effect(state) {
        adjustResource(state, 'legalRisk', -1);
        adjustResource(state, 'commandConsensus', 1);
        setFlag(state, 'noFireOrder', true);
        addResponsibility(state, 'fuehrungszentrum', { active: 1, omitted: 1, legal: 1 });
        addLogEntry(state, 'Das Führungszentrum erneuert ausdrücklich den Befehl, nicht zu schießen.');
      }
    },
    {
      id: 'press-ministry',
      title: 'Politische Entscheidung erzwingen',
      phases: ['middle', 'late'],
      tags: ['Konsens +2', 'Druck +1'],
      description: 'Die operative Führung legt die Verantwortung offen zurück ins Ministerium und fordert eine politische Linie ein.',
      effect(state) {
        adjustResource(state, 'commandConsensus', 2);
        adjustResource(state, 'publicPressure', 1);
        addResponsibility(state, 'fuehrungszentrum', { active: 2 });
        addLogEntry(state, 'Das Führungszentrum verlangt eine ausdrückliche politische Entscheidung statt stiller Mitverantwortung.');
      }
    },
    {
      id: 'intercept-window',
      title: 'Abdrängen und Warnen',
      phases: ['early', 'middle'],
      tags: ['Gefahr -1', 'Info +1'],
      description: 'Die Luftlage wird aktiv bearbeitet: Sichtkontakt, Warnmanöver und jede noch mögliche Verzögerung werden ausgereizt.',
      effect(state) {
        adjustResource(state, 'danger', -1);
        adjustResource(state, 'infoClarity', 1);
        addResponsibility(state, 'fuehrungszentrum', { active: 1 });
        addLogEntry(state, 'Abdrängen und Warnmanöver verschaffen dem System ein schmales Zusatzfenster.');
      }
    },
    {
      id: 'document-chain',
      title: 'Befehlskette dokumentieren',
      phases: ['all'],
      tags: ['Rechtsrisiko -1', 'rechtlich'],
      description: 'Funksprüche, Ablehnungen und Rückfragen werden so gesichert, dass spätere Verantwortung nicht im Nebel verschwindet.',
      effect(state) {
        adjustResource(state, 'legalRisk', -1);
        adjustResource(state, 'infoClarity', 1);
        setFlag(state, 'documentationSecured', true);
        addResponsibility(state, 'fuehrungszentrum', { legal: 2 });
        addLogEntry(state, 'Das Führungszentrum sichert die Befehlskette und macht spätere Verantwortungszuweisungen nachvollziehbar.');
      }
    }
  ],
  ministerium: [
    {
      id: 'constitutional-binding',
      title: 'Verfassungsgrenze betonen',
      phases: ['all'],
      tags: ['Rechtsrisiko -2', 'Unterlassen +1'],
      description: 'Das Ministerium hält die Unzulässigkeit eines Abschusses fest und verweigert politische Deckung.',
      effect(state) {
        adjustResource(state, 'legalRisk', -2);
        setFlag(state, 'ministryRelease', false);
        setFlag(state, 'noFireOrder', true);
        addResponsibility(state, 'ministerium', { active: 1, omitted: 1, legal: 2 });
        addLogEntry(state, 'Das Ministerium bindet die Lage ausdrücklich an die verfassungsrechtliche Grenze des Abschussverbots.');
      }
    },
    {
      id: 'emergency-review',
      title: 'Notstand prüfen lassen',
      phases: ['middle', 'late'],
      tags: ['Konsens +1', 'Rechtsrisiko +1'],
      description: 'Die politische Spitze öffnet den Raum für eine Ausnahmeprüfung, ohne bereits eine klare Freigabe zu erteilen.',
      effect(state) {
        adjustResource(state, 'commandConsensus', 1);
        adjustResource(state, 'legalRisk', 1);
        setFlag(state, 'ministryRelease', true);
        addResponsibility(state, 'ministerium', { active: 1, legal: 1 });
        addLogEntry(state, 'Das Ministerium lässt einen übergesetzlichen Notstand prüfen und verschiebt damit die Lage aus reinem Verbot in ein Ausnahmedenken.');
      }
    },
    {
      id: 'deny-cover',
      title: 'Politische Deckung verweigern',
      phases: ['middle', 'late'],
      tags: ['Druck +1', 'Unterlassen'],
      description: 'Die Verantwortung wird nicht ausdrücklich übernommen, sondern nach unten in das operative System zurückgegeben.',
      effect(state) {
        adjustResource(state, 'publicPressure', 1);
        adjustResource(state, 'commandConsensus', -1);
        addResponsibility(state, 'ministerium', { omitted: 2, legal: 1 });
        addLogEntry(state, 'Das Ministerium verweigert politische Deckung und lässt die operative Ebene mit dem Konflikt zurück.');
      }
    },
    {
      id: 'crisis-cell',
      title: 'Krisenstab zuschalten',
      phases: ['all'],
      tags: ['Info +1', 'Konsens +1'],
      description: 'Innen-, Verteidigungs- und Sicherheitsseite werden in einen schnellen Abstimmungsrahmen gebracht.',
      effect(state) {
        adjustResource(state, 'infoClarity', 1);
        adjustResource(state, 'commandConsensus', 1);
        addResponsibility(state, 'ministerium', { active: 1, legal: 1 });
        addLogEntry(state, 'Das Ministerium zieht einen Krisenstab zusammen und verkürzt die politische Abstimmung.');
      }
    },
    {
      id: 'exceptional-release',
      title: 'Ausnahmefreigabe signalisieren',
      phases: ['late'],
      tags: ['Konsens +2', 'Rechtsrisiko +2'],
      description: 'Die politische Führung signalisiert, dass ein Abschuss im äußersten Notstand gedeckt werden könnte.',
      effect(state) {
        adjustResource(state, 'commandConsensus', 2);
        adjustResource(state, 'legalRisk', 2);
        setFlag(state, 'ministryRelease', true);
        addResponsibility(state, 'ministerium', { active: 2, legal: 2 });
        addLogEntry(state, 'Das Ministerium signalisiert eine politische Ausnahmefreigabe und übernimmt damit offen Mitverantwortung.');
      }
    }
  ],
  koch: [
    {
      id: 'escort-picture',
      title: 'Lagebild stabilisieren',
      phases: ['all'],
      tags: ['Info +1', 'Konsens +1'],
      description: 'Koch bleibt dicht an der Maschine, bestätigt Kurs und fordert eine eindeutige Befehlslage an.',
      effect(state) {
        adjustResource(state, 'infoClarity', 1);
        adjustResource(state, 'commandConsensus', 1);
        addResponsibility(state, 'koch', { active: 1 });
        addLogEntry(state, 'Koch verdichtet das Lagebild und verlangt eine klare Befehlslage.');
      }
    },
    {
      id: 'warning-shot',
      title: 'Warnschuss und Abdrängen',
      phases: ['middle', 'late'],
      tags: ['Gefahr -1', 'Info +1'],
      description: 'Koch versucht, die entführte Maschine mit den letzten militärischen Standardsignalen zum Kurswechsel zu bewegen.',
      effect(state) {
        adjustResource(state, 'danger', -1);
        adjustResource(state, 'infoClarity', 1);
        setFlag(state, 'warningShots', true);
        addResponsibility(state, 'koch', { active: 2 });
        addLogEntry(state, 'Koch setzt auf Warnschuss und Abdrängen, um ein letztes alternatives Zeitfenster zu öffnen.');
      }
    },
    {
      id: 'request-release',
      title: 'Freigabe erzwingen',
      phases: ['all'],
      tags: ['Konsens +1', 'rechtlich'],
      description: 'Er fragt die Befehlskette erneut und ausdrücklich nach einer politischen beziehungsweise rechtlichen Deckung ab.',
      effect(state) {
        adjustResource(state, 'commandConsensus', 1);
        addResponsibility(state, 'koch', { active: 1, legal: 1 });
        addLogEntry(state, 'Koch fordert erneut eine ausdrückliche Freigabe an und macht damit die Befehlskette sichtbar.');
      }
    },
    {
      id: 'buy-time',
      title: 'Zeit für Evakuierung kaufen',
      phases: ['middle', 'late'],
      tags: ['Evakuierung +8', 'Gefahr +1'],
      description: 'Koch bleibt an der Maschine, um operative Sekunden für das Stadion zu gewinnen, obwohl die Zielnähe weiter steigt.',
      effect(state) {
        adjustResource(state, 'evacuation', 8);
        adjustResource(state, 'danger', 1);
        state.meta.rescueImpact += 1;
        addResponsibility(state, 'koch', { active: 1 });
        addLogEntry(state, 'Koch kauft der Räumung Zeit ab, obwohl damit das Risiko eines zu späten Eingriffs steigt.');
      }
    },
    {
      id: 'hold-fire',
      title: 'Nicht schießen',
      phases: ['all'],
      tags: ['Rechtsrisiko -1', 'Unterlassen +2'],
      description: 'Koch folgt der Negativlinie und schießt trotz Eskalation nicht.',
      effect(state) {
        adjustResource(state, 'legalRisk', -1);
        adjustResource(state, 'danger', 1);
        addResponsibility(state, 'koch', { omitted: 2, legal: 1 });
        addLogEntry(state, 'Koch entscheidet sich, trotz wachsender Gefahr nicht zu schießen.');
      }
    },
    {
      id: 'shoot',
      title: 'Abschuss',
      phases: ['late'],
      tags: ['Spielende', 'Rechtsrisiko massiv'],
      description: 'Koch schießt die Maschine ab, um das Stadion zu schützen. Diese Karte beendet die Partie sofort.',
      when: (state) => state.resources.danger >= 8 || state.roundIndex >= 9,
      effect(state) {
        setFlag(state, 'shotByKoch', true);
        adjustResource(state, 'danger', -8);
        adjustResource(state, 'legalRisk', state.flags.ministryRelease ? 2 : 4);
        state.meta.rescueImpact += 3;
        state.meta.prosecution += state.flags.ministryRelease ? 0 : 1;
        addResponsibility(state, 'koch', { active: 3, legal: state.flags.ministryRelease ? 2 : 4 });
        addLogEntry(state, 'Koch schießt die Maschine ab und verlagert die Auseinandersetzung vollständig in den Raum des Urteils.');
      }
    }
  ],
  nelson: [
    {
      id: 'human-dignity',
      title: 'Menschenwürde markieren',
      phases: ['all'],
      tags: ['Anklage +2', 'rechtlich'],
      description: 'Nelson betont, dass unschuldige Passagiere nicht zur Rettung anderer Menschen instrumentalisiert werden dürfen.',
      effect(state) {
        state.meta.prosecution += 2;
        addResponsibility(state, 'nelson', { legal: 2 });
        if (state.flags.shotByKoch) addResponsibility(state, 'koch', { legal: 1 });
        addLogEntry(state, 'Nelson rückt die Unverfügbarkeit jedes einzelnen Lebens in den Mittelpunkt der Anklage.');
      }
    },
    {
      id: 'omitted-alternatives',
      title: 'Unterlassene Alternativen sammeln',
      phases: ['all'],
      tags: ['Anklage +1', 'Unterlassen sichtbar'],
      description: 'Sie fragt nach verpassten Evakuierungs-, Kommunikations- und Befehlsschritten vor der letzten Sekunde.',
      effect(state) {
        state.meta.prosecution += 1;
        if (state.resources.evacuation < 55) addResponsibility(state, 'katastrophenschutz', { omitted: 1 });
        if (!state.flags.ministryRelease) addResponsibility(state, 'ministerium', { omitted: 1 });
        if (state.resources.commandConsensus < 5) addResponsibility(state, 'fuehrungszentrum', { omitted: 1 });
        addResponsibility(state, 'nelson', { legal: 1 });
        addLogEntry(state, 'Nelson sammelt unterlassene Alternativen und verschiebt den Blick auf die Zeit vor der Schlussminute.');
      }
    },
    {
      id: 'chain-of-command',
      title: 'Befehlskette herausarbeiten',
      phases: ['all'],
      tags: ['Anklage +1', 'rechtlich'],
      description: 'Sie prüft, wer wann wusste, was gesagt wurde und wo Verantwortung bewusst nach unten wanderte.',
      effect(state) {
        state.meta.prosecution += 1;
        addResponsibility(state, 'nelson', { legal: 1 });
        if (state.flags.shotByKoch || state.flags.noFireOrder) addResponsibility(state, 'koch', { legal: 1 });
        addLogEntry(state, 'Nelson fixiert die Befehlskette als jurisches Skelett des Falls.');
      }
    },
    {
      id: 'individual-victims',
      title: 'Opfer individualisieren',
      phases: ['middle', 'late'],
      tags: ['Anklage +2'],
      description: 'Sie verwandelt abstrakte Zahlen zurück in einzelne Männer, Frauen und Kinder an Bord und im Stadion.',
      effect(state) {
        state.meta.prosecution += 2;
        addResponsibility(state, 'nelson', { active: 1, legal: 1 });
        addLogEntry(state, 'Nelson zerlegt die Statistik in individuelle Opfer und verschärft damit die moralische Last jeder Entscheidung.');
      }
    },
    {
      id: 'public-charge',
      title: 'Anklage öffentlich schärfen',
      phases: ['late'],
      tags: ['Anklage +1', 'Druck +1'],
      description: 'Nelson betont, dass der Rechtsstaat gerade in der Extremsituation nicht relativiert werden darf.',
      effect(state) {
        state.meta.prosecution += 1;
        adjustResource(state, 'publicPressure', 1);
        addResponsibility(state, 'nelson', { legal: 1 });
        addLogEntry(state, 'Nelson schärft die öffentliche Anklagelogik und bindet sie ausdrücklich an den Rechtsstaat.');
      }
    }
  ],
  biegler: [
    {
      id: 'overlegal-necessity',
      title: 'Übergesetzlichen Notstand aufrufen',
      phases: ['middle', 'late'],
      tags: ['Verteidigung +2', 'rechtlich'],
      description: 'Biegler argumentiert, dass die Rettung tausender Menschen ein äußerstes Rechtfertigungsszenario eröffnet.',
      effect(state) {
        state.meta.defense += 2;
        if (state.flags.shotByKoch && state.resources.danger >= 10) state.meta.defense += 1;
        addResponsibility(state, 'biegler', { legal: 2 });
        addLogEntry(state, 'Biegler stellt den Fall unter das Zeichen des übergesetzlichen Notstands.');
      }
    },
    {
      id: 'duty-conflict',
      title: 'Pflichtenkollision betonen',
      phases: ['all'],
      tags: ['Verteidigung +1', 'Verantwortung teilen'],
      description: 'Er macht geltend, dass Koch zugleich Soldat, Bürger und Retter war und gerade darin nicht widerspruchsfrei handeln konnte.',
      effect(state) {
        state.meta.defense += 1;
        if (state.flags.noFireOrder) state.meta.defense += 1;
        addResponsibility(state, 'biegler', { legal: 1 });
        addResponsibility(state, 'ministerium', { legal: 1 });
        addLogEntry(state, 'Biegler beschreibt die Lage als Pflichtenkollision statt als einfache Rechtsverletzung.');
      }
    },
    {
      id: 'time-pressure',
      title: 'Zeitdruck als Kernargument',
      phases: ['all'],
      tags: ['Verteidigung +1'],
      description: 'Biegler verschiebt den Blick auf die Sekundenlogik der letzten Phase, in der vollständige Reinheit nicht mehr erreichbar war.',
      effect(state) {
        state.meta.defense += 1;
        if (state.roundIndex >= 8) state.meta.defense += 1;
        addResponsibility(state, 'biegler', { active: 1, legal: 1 });
        addLogEntry(state, 'Biegler bindet die Bewertung an den extremen Zeitdruck statt an nachträgliche Ruhe.');
      }
    },
    {
      id: 'distributed-responsibility',
      title: 'Verantwortung verteilen',
      phases: ['all'],
      tags: ['Verteidigung +1', 'Kette sichtbar'],
      description: 'Nicht nur der letzte Schütze, auch Ministerium, Führung und Evakuierungssystem sollen im Urteil auftauchen.',
      effect(state) {
        state.meta.defense += 1;
        addResponsibility(state, 'ministerium', { legal: 1 });
        addResponsibility(state, 'fuehrungszentrum', { legal: 1 });
        addResponsibility(state, 'biegler', { legal: 1 });
        addLogEntry(state, 'Biegler verteilt Verantwortung bewusst über die Befehlskette hinweg.');
      }
    },
    {
      id: 'saved-lives',
      title: 'Gerettete Leben betonen',
      phases: ['late'],
      tags: ['Verteidigung +2'],
      description: 'Er insistiert darauf, dass juristische Bewertung die geretteten Menschen nicht unsichtbar machen darf.',
      effect(state) {
        state.meta.defense += 2;
        state.meta.rescueImpact += 1;
        addResponsibility(state, 'biegler', { active: 1 });
        addLogEntry(state, 'Biegler rückt die geretteten Leben gegen die reine Schuldlogik in Stellung.');
      }
    }
  ]
};

function getAvailableCards(roleId, state) {
  const phase = getPhase(state.roundIndex);
  return CARD_LIBRARY[roleId].filter((card) => {
    const phaseMatch = card.phases.includes('all') || card.phases.includes(phase);
    const whenMatch = typeof card.when === 'function' ? card.when(state) : true;
    return phaseMatch && whenMatch;
  });
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  state = createInitialState();
  render();
  saveState(state);
}

function selectCard(roleId, cardId) {
  if (state.finished) return;
  state.selections[roleId] = cardId;
  saveState(state);
  render();
}

function resolveRound() {
  if (state.finished) return;

  const missingRoles = ROLE_ORDER.filter((roleId) => !state.selections[roleId]);
  if (missingRoles.length > 0) {
    const names = missingRoles.map((roleId) => ROLE_META[roleId].short).join(', ');
    roundFeedback.textContent = `Vor der Auswertung fehlt noch mindestens eine Karte: ${names}.`;
    roundFeedback.className = 'round-feedback tone-danger';
    return;
  }

  const resolutionLines = [];

  for (const roleId of ROLE_ORDER) {
    const selectedId = state.selections[roleId];
    const cards = getAvailableCards(roleId, state);
    const card = cards.find((entry) => entry.id === selectedId) || CARD_LIBRARY[roleId].find((entry) => entry.id === selectedId);
    if (!card) continue;
    card.effect(state);
    resolutionLines.push(`${ROLE_META[roleId].short}: ${card.title}`);
  }

  state.lastResolution = resolutionLines;
  addLogEntry(state, `Runde ${state.roundIndex + 1} wird aufgelöst in der Reihenfolge: ${resolutionLines.join(' | ')}.`);
  applyRoundPressure(state);

  if (state.flags.shotByKoch) {
    concludeGame(state);
    render();
    return;
  }

  if (state.roundIndex >= ROUNDS.length - 1) {
    concludeGame(state);
    render();
    return;
  }

  state.roundIndex += 1;
  state.selections = {};
  roundFeedback.textContent = `Runde ${state.roundIndex} ausgewertet. Die nächste Lage ist freigeschaltet.`;
  roundFeedback.className = 'round-feedback tone-safe';
  saveState(state);
  render();
}

function renderStatusStrip() {
  const round = ROUNDS[Math.min(state.roundIndex, ROUNDS.length - 1)];
  const statusCards = [
    {
      label: 'Runde',
      value: `${Math.min(state.roundIndex + 1, ROUNDS.length)} / ${ROUNDS.length}`,
      detail: `T - ${round.minute} Minuten`
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
      label: 'Rechtslage',
      value: state.statuses.rulesStatus,
      detail: `${state.resources.legalRisk}/20 Rechtsrisiko`
    },
    {
      label: 'Urteilstendenz',
      value: getVerdictLabel(state),
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
  const round = ROUNDS[Math.min(state.roundIndex, ROUNDS.length - 1)];
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
          <strong>Status</strong>
          <span>${state.statuses.planeStatus}. ${state.statuses.stadiumStatus}.</span>
        </div>
        ${resolutionSummary}
      </div>
    </div>
  `;
}

function renderResolutionOrder() {
  resolutionOrder.innerHTML = ROLE_ORDER.map((roleId, index) => {
    const role = ROLE_META[roleId];
    return `
      <div class="order-chip">
        <em>${index + 1}</em>
        <span>${role.short}</span>
      </div>
    `;
  }).join('');
}

function renderRoles() {
  rolesGrid.innerHTML = Object.keys(ROLE_META).map((roleId) => {
    const role = ROLE_META[roleId];
    const row = state.matrix[roleId];
    const availableCards = getAvailableCards(roleId, state);
    const selectedCardId = state.selections[roleId];

    const cardsMarkup = availableCards.map((card) => {
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
        <div class="card-choice-grid">${cardsMarkup}</div>
      </article>
    `;
  }).join('');

  rolesGrid.querySelectorAll('.choice-btn').forEach((button) => {
    button.addEventListener('click', () => {
      selectCard(button.dataset.role, button.dataset.card);
    });
  });
}

function renderResources() {
  resourceMeters.innerHTML = RESOURCE_CONFIG.map((item) => {
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

  matrixTable.innerHTML = Object.keys(ROLE_META).map((roleId) => {
    const role = ROLE_META[roleId];
    const row = state.matrix[roleId];
    const rows = [
      { key: 'active', label: 'Aktiv', value: row.active, color: role.color },
      { key: 'omitted', label: 'Unterlassen', value: row.omitted, color: '#a35b39' },
      { key: 'legal', label: 'Rechtlich', value: row.legal, color: '#425f8f' }
    ];

    return `
      <article class="matrix-row">
        <header>
          <strong>${role.short}</strong>
          <span class="muted">${role.subtitle}</span>
        </header>
        <div class="matrix-bars">
          ${rows.map((entry) => `
            <div class="matrix-bar">
              <span class="matrix-bar-label">${entry.label}</span>
              <div class="matrix-track">
                <div class="meter-fill" style="width:${(entry.value / maxValue) * 100}%;background:${entry.color}"></div>
              </div>
              <span class="matrix-value">${entry.value}</span>
            </div>
          `).join('')}
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
  logList.innerHTML = state.log.map((entry) => `
    <li><span class="log-round">Runde ${entry.round}, T - ${entry.minute}:</span> ${entry.text}</li>
  `).join('');
}

function renderEndScreen() {
  if (!state.finished || !state.ending) {
    endScreen.classList.add('hidden');
    return;
  }

  const closing = generateClosingTexts(state);
  const verdict = getVerdictLabel(state);

  endingHeadline.innerHTML = `
    <h3>${state.ending.title}</h3>
    <p>${state.ending.summary}</p>
  `;

  endingStats.innerHTML = [
    { label: 'Tote an Bord', value: state.ending.planeVictims },
    { label: 'Tote im Stadionbereich', value: state.ending.stadiumCasualties },
    { label: 'Evakuierte Menschen', value: state.ending.evacuatedPeople.toLocaleString('de-DE') },
    { label: 'Jurische Tendenz', value: verdict }
  ].map((item) => `
    <article class="ending-stat">
      <span>${item.label}</span>
      <strong>${item.value}</strong>
    </article>
  `).join('');

  indictmentText.textContent = closing.indictment;
  defenseText.textContent = closing.defense;
  endScreen.classList.remove('hidden');
}

function renderRestoreBanner() {
  restoredBanner.classList.toggle('hidden', !state.restored);
}

function render() {
  updateStatuses(state);
  renderRestoreBanner();
  renderStatusStrip();
  renderBriefing();
  renderResolutionOrder();
  renderRoles();
  renderResources();
  renderMatrix();
  renderMetaSummary();
  renderLog();
  renderEndScreen();

  if (!state.finished && !roundFeedback.textContent) {
    roundFeedback.textContent = 'Wählt für jede Rolle genau eine Karte und löst dann die Runde aus.';
    roundFeedback.className = 'round-feedback';
  }

  resolveBtn.disabled = state.finished;
  if (state.finished) {
    roundFeedback.textContent = 'Die Partie ist abgeschlossen. Über „Neue Partie“ könnt ihr eine neue Verantwortungsspur legen.';
    roundFeedback.className = 'round-feedback tone-neutral';
  }
}

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
const endingHeadline = document.querySelector('#endingHeadline');
const endingStats = document.querySelector('#endingStats');
const indictmentText = document.querySelector('#indictmentText');
const defenseText = document.querySelector('#defenseText');
const restoredBanner = document.querySelector('#restoredBanner');
const newGameBtn = document.querySelector('#newGameBtn');
const resetBtn = document.querySelector('#resetBtn');
const resolveBtn = document.querySelector('#resolveBtn');

let state = loadState() || createInitialState();
if (localStorage.getItem(STORAGE_KEY)) {
  state.restored = true;
}
updateStatuses(state);

newGameBtn.addEventListener('click', () => {
  state = createInitialState();
  roundFeedback.textContent = 'Neue Partie gestartet. Alle Rollen legen wieder von vorn.';
  roundFeedback.className = 'round-feedback tone-safe';
  saveState(state);
  render();
});

resetBtn.addEventListener('click', resetState);
resolveBtn.addEventListener('click', resolveRound);

render();
