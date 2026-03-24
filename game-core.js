(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  }
  root.GameCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const MAX_LOG_ENTRIES = 36;
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
      note(value) {
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
      note(value) {
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
      note(value) {
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
      note(value) {
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
      note(value) {
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
      note(value) {
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
      pressure: 'Die Frage verschiebt sich von "Ist das real?" zu "Wer übernimmt Verantwortung?"'
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
      pressure: 'Jetzt wächst auch die Verantwortung aus jedem "Noch nicht".'
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

  const REFLECTION_PROMPTS = [
    'Wer trägt in der Frühphase mehr Verantwortung: die Person mit Handlungsmacht oder die Person, die noch auf Sicherheit wartet?',
    'Ab wann wird vorsichtiges Warten zu problematischer Unterlassung?',
    'Welche Rolle gewinnt hier Zeit, und welche verliert bereits moralische Deckung?',
    'Reicht Lagewissen ohne Entscheidung, wenn der Schaden absehbar wächst?',
    'Ändert die Zahl 70 000 das Urteil über dieselbe Handlung oder nur ihren emotionalen Druck?',
    'Was wiegt im Moment schwerer: die Verfassungsgrenze oder die Rettungslogik?',
    'Ist Panikvermeidung eine legitime Form des Schutzes oder eine riskante Entlastungserzählung?',
    'Wer verschiebt in dieser Runde Verantwortung sichtbar nach unten oder nach später?',
    'Wird die Befehlskette klarer oder nur die spätere Zurechenbarkeit?',
    'Wie verändert extremer Zeitdruck euren Maßstab für richtige Entscheidungen?',
    'Welche Maßnahme wirkt noch präventiv, welche nur noch schadensbegrenzend?',
    'Wird Nicht-Handeln jetzt noch als rechtsstaatliche Haltung gelesen oder bereits als Versagen?',
    'Wenn ihr urteilen müsst: Über wen urteilt ihr eigentlich zuerst, über Koch oder über das System?'
  ];

  const SCENARIOS = {
    classic: {
      id: 'classic',
      title: 'Originalfall',
      description: 'Die klassische Zuspitzung aus dem Stück: späte Verdichtung, volle Arena, strenge Verfassungsgrenze.',
      handOffset: 0,
      resourceShift: {
        evacuation: 0,
        infoClarity: 0,
        danger: 0,
        legalRisk: 0,
        publicPressure: 0,
        commandConsensus: 0
      },
      pressureMod: 0,
      earlyReleaseWindow: false
    },
    frueher_alarm: {
      id: 'frueher_alarm',
      title: 'Früher Alarm',
      description: 'Einsatzkräfte und Politik reagieren etwas früher: die Evakuierung startet schneller und die politische Ausnahmedebatte öffnet sich eher.',
      handOffset: 2,
      resourceShift: {
        evacuation: 12,
        infoClarity: 1,
        danger: -1,
        legalRisk: 0,
        publicPressure: 0,
        commandConsensus: 1
      },
      pressureMod: -1,
      earlyReleaseWindow: true
    }
  };

  const MODE_OPTIONS = {
    normal: {
      id: 'normal',
      title: 'Normalmodus',
      description: 'Alle Rollen sind aktiv, die volle Verantwortungskette bleibt sichtbar.'
    },
    unterricht: {
      id: 'unterricht',
      title: 'Unterrichtsmodus',
      description: 'Lehrpersonen können Rollen vorgeben oder deaktivieren und die Diskussion zuspitzen.'
    }
  };

  const TEACHING_PRESETS = {
    full: {
      id: 'full',
      label: 'Vollbesetzung',
      description: 'Alle sechs Rollen bleiben im Spiel.',
      activeRoles: [...ROLE_ORDER]
    },
    operativ: {
      id: 'operativ',
      label: 'Operativer Fokus',
      description: 'Der Streit konzentriert sich auf Luftlage, Politik und Evakuierung.',
      activeRoles: ['katastrophenschutz', 'fuehrungszentrum', 'ministerium', 'koch']
    },
    tribunal: {
      id: 'tribunal',
      label: 'Gerichtsfokus',
      description: 'Die jurische Nachgeschichte rückt in den Vordergrund.',
      activeRoles: ['fuehrungszentrum', 'ministerium', 'koch', 'nelson', 'biegler']
    }
  };

  const SECRET_GOALS = {
    koch: {
      title: 'Stadion schützen, ohne das Rechtsrisiko völlig eskalieren zu lassen.',
      check(state) {
        return (state.ending.savedEstimate >= 50000 || state.ending.type === 'abschuss') && state.resources.legalRisk <= 14;
      }
    },
    fuehrungszentrum: {
      title: 'Ein belastbares Lagebild und eine erkennbare Befehlskette herstellen.',
      check(state) {
        return state.resources.infoClarity >= 7 && state.resources.commandConsensus >= 6;
      }
    },
    ministerium: {
      title: 'Rechtliche Leitplanken sichtbar halten und politische Verantwortung nicht vollständig entziehen.',
      check(state) {
        return state.matrix.ministerium.legal >= 4 && state.resources.legalRisk <= 13;
      }
    },
    katastrophenschutz: {
      title: 'Mindestens eine wirksame Teilräumung sichern und Bodenopfer deutlich reduzieren.',
      check(state) {
        return state.resources.evacuation >= 60;
      }
    },
    nelson: {
      title: 'Die individuelle Würde der Opfer gegen reine Zahlenlogik verteidigen.',
      check(state) {
        const verdict = getVerdict(state);
        return state.meta.prosecution >= 6 && (verdict.label === 'Verurteilung' || verdict.label === 'Gespaltenes Urteil');
      }
    },
    biegler: {
      title: 'Pflichtenkollision und geteilte Verantwortung so stark machen, dass Koch nicht allein trägt.',
      check(state) {
        const verdict = getVerdict(state);
        return state.meta.defense >= 6 && verdict.label !== 'Verurteilung';
      }
    }
  };

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getScenario(config) {
    return SCENARIOS[config.scenarioId] || SCENARIOS.classic;
  }

  function getPhase(roundIndex) {
    if (roundIndex <= 3) return 'early';
    if (roundIndex <= 8) return 'middle';
    return 'late';
  }

  function getActiveRoleIds(stateOrConfig) {
    const source = stateOrConfig.config ? stateOrConfig.config : stateOrConfig;
    return ROLE_ORDER.filter((roleId) => (source.activeRoles || []).includes(roleId));
  }

  function createDefaultConfig() {
    return {
      scenarioId: 'classic',
      modeId: 'normal',
      presetId: 'full',
      activeRoles: [...ROLE_ORDER]
    };
  }

  function applyTeachingPreset(config, presetId) {
    const next = deepClone(config);
    const preset = TEACHING_PRESETS[presetId] || TEACHING_PRESETS.full;
    next.modeId = 'unterricht';
    next.presetId = preset.id;
    next.activeRoles = [...preset.activeRoles];
    return next;
  }

  function createEmptyMatrix() {
    return Object.fromEntries(
      Object.keys(ROLE_META).map((roleId) => [roleId, { active: 0, omitted: 0, legal: 0 }])
    );
  }

  function createBaseResources(config) {
    const scenario = getScenario(config);
    return {
      evacuation: clamp(8 + scenario.resourceShift.evacuation, 0, 100),
      infoClarity: clamp(3 + scenario.resourceShift.infoClarity, 0, 10),
      danger: clamp(5 + scenario.resourceShift.danger, 0, 20),
      legalRisk: clamp(3 + scenario.resourceShift.legalRisk, 0, 20),
      publicPressure: clamp(2 + scenario.resourceShift.publicPressure, 0, 10),
      commandConsensus: clamp(2 + scenario.resourceShift.commandConsensus, 0, 10)
    };
  }

  function initialReflection() {
    return {
      round: 0,
      question: 'Welche Rolle wirkt für euch im Moment am stärksten, obwohl noch kaum etwas entschieden wurde?',
      note: ''
    };
  }

  function createInitialState(configInput) {
    const config = deepClone(configInput || createDefaultConfig());
    const scenario = getScenario(config);
    const state = {
      config,
      roundIndex: 0,
      finished: false,
      restored: false,
      ending: null,
      verdict: null,
      selections: {},
      lastResolution: [],
      history: [],
      resources: createBaseResources(config),
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
      log: [],
      arguments: {
        pro: [],
        con: []
      },
      reflection: initialReflection(),
      reflectionNotes: {},
      secretGoals: Object.fromEntries(
        Object.keys(SECRET_GOALS).map((roleId) => [roleId, SECRET_GOALS[roleId].title])
      ),
      hands: {},
      scenarioTitle: scenario.title
    };

    addLogEntry(
      state,
      `Die Lage beginnt im Szenario "${scenario.title}": LH 2047 weicht vom Kurs ab, das Stadion ist voll, die Verantwortung noch unverteilt.`
    );
    updateStatuses(state);
    buildHands(state);
    return state;
  }

  function addLogEntry(state, text) {
    const minute = ROUNDS[Math.min(state.roundIndex, ROUNDS.length - 1)].minute;
    state.log.unshift({
      round: Math.min(state.roundIndex + 1, ROUNDS.length),
      minute,
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

  function pushUnique(list, entries) {
    entries.forEach((entry) => {
      if (!list.includes(entry)) list.push(entry);
    });
  }

  function applyArgumentEffects(state, card) {
    pushUnique(state.arguments.pro, card.reportPro || []);
    pushUnique(state.arguments.con, card.reportCon || []);
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
      state.statuses.rulesStatus = 'Ausnahmeprüfung politisch geöffnet';
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
    const omissionWeight = Math.round(
      (state.matrix.ministerium.omitted +
        state.matrix.fuehrungszentrum.omitted +
        state.matrix.katastrophenschutz.omitted) * 0.35
    );
    const legalLoad = Math.round(
      (state.matrix.koch.legal + state.matrix.ministerium.legal) * 0.75
    );
    return state.meta.defense + state.meta.rescueImpact + omissionWeight - state.meta.prosecution - legalLoad;
  }

  function getVerdict(state) {
    const omissionTotal = Object.values(state.matrix).reduce((sum, row) => sum + row.omitted, 0);
    const delta = getVerdictDelta(state);

    if (
      state.ending &&
      state.ending.type === 'katastrophe' &&
      omissionTotal >= 10 &&
      state.resources.commandConsensus <= 4
    ) {
      return {
        label: 'Institutionelles Versagen',
        tone: 'danger',
        summary: 'Nicht eine Einzelperson, sondern das gesamte System scheitert sichtbar an Koordination, Deckung und früher Intervention.'
      };
    }
    if (delta >= 5) {
      return {
        label: 'Freispruch',
        tone: 'safe',
        summary: 'Rettungserfolg, Pflichtenkollision und geteilte Verantwortung überwiegen die individuelle Schuldzuweisung.'
      };
    }
    if (delta <= -5) {
      return {
        label: 'Verurteilung',
        tone: 'danger',
        summary: 'Rechtsverletzung, Individualopfer und die Grenze staatlicher Verfügbarkeit von Leben dominieren die Bewertung.'
      };
    }
    return {
      label: 'Gespaltenes Urteil',
      tone: 'legal',
      summary: 'Die Verantwortung bleibt zwischen Rechtsstaat, Rettungslogik und Systemdruck zerrissen.'
    };
  }

  function getCardLibrary() {
    return {
      katastrophenschutz: [
        {
          id: 'partial-evacuation',
          title: 'Teilräumung anstoßen',
          phases: ['early', 'middle'],
          tags: ['Evakuierung +12', 'aktiv'],
          description: 'Sektoren werden nacheinander geöffnet, Durchsagen und Einsatzkräfte lenken erste Besucherströme aus der Arena.',
          reportPro: ['Der Katastrophenschutz schafft früh reale Rettungswege.'],
          reportCon: [],
          effect(state) {
            const bonus = state.config.scenarioId === 'frueher_alarm' ? 4 : 0;
            adjustResource(state, 'evacuation', 12 + bonus);
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
          reportPro: ['Die Arena wird nicht nur symbolisch, sondern operativ geschützt.'],
          reportCon: ['Maximaldruck kann Panik und nachträgliche Kritik verstärken.'],
          effect(state) {
            const bonus = state.config.scenarioId === 'frueher_alarm' ? 4 : 0;
            adjustResource(state, 'evacuation', 20 + bonus);
            adjustResource(state, 'publicPressure', 1);
            adjustResource(state, 'commandConsensus', 1);
            setFlag(state, 'fullAlarm', true);
            state.meta.rescueImpact += 2;
            addResponsibility(state, 'katastrophenschutz', { active: 3 });
            addLogEntry(state, 'Der Katastrophenschutz schaltet auf Vollalarm und priorisiert die Räumung über jede Rücksicht auf Routine.');
          }
        },
        {
          id: 'lock-access',
          title: 'Zugangsachsen sperren',
          phases: ['all'],
          tags: ['Evakuierung +9', 'Gefahr -1'],
          description: 'Straßen, Parkhäuser und Innenringe werden gesperrt, damit der Zustrom stoppt und die Menge schneller abfließen kann.',
          reportPro: ['Die Zahl potenzieller Opfer im Stadionbereich sinkt praktisch.'],
          reportCon: [],
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
          reportPro: [],
          reportCon: ['Panikvermeidung kann zur riskanten Verschleppung von Rettung werden.'],
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
          reportPro: ['Selbst im Scheitern bleibt Schadensbegrenzung eine Form von Verantwortung.'],
          reportCon: [],
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
          reportPro: ['Ein gemeinsames Lagebild reduziert spätere Ausflüchte.'],
          reportCon: [],
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
          reportPro: ['Die Befehlskette macht die verfassungsrechtliche Grenze ausdrücklich sichtbar.'],
          reportCon: ['Ein klarer Negativbefehl kann operative Verantwortung auf spätere Einzelentscheidungen verschieben.'],
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
          reportPro: ['Verantwortung wird nicht heimlich nach unten delegiert.'],
          reportCon: [],
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
          reportPro: ['Jede gewonnene Minute erweitert operative Alternativen.'],
          reportCon: [],
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
          reportPro: ['Dokumentation macht institutionelle Verantwortung später nachweisbar.'],
          reportCon: [],
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
          reportPro: ['Die Verfassungsgrenze wird nicht situativ aufgeweicht.'],
          reportCon: ['Strikte Bindung kann als politisches Wegducken gelesen werden.'],
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
          reportPro: ['Die Politik übernimmt wenigstens einen Teil der Last selbst.'],
          reportCon: ['Schon das Öffnen der Ausnahme logik verschiebt das Recht in ein Grenzdenken.'],
          availability(state) {
            return getPhase(state.roundIndex) === 'late' || getScenario(state.config).earlyReleaseWindow;
          },
          effect(state) {
            adjustResource(state, 'commandConsensus', 1);
            adjustResource(state, 'legalRisk', 1);
            setFlag(state, 'ministryRelease', true);
            addResponsibility(state, 'ministerium', { active: 1, legal: 1 });
            addLogEntry(state, 'Das Ministerium lässt einen übergesetzlichen Notstand prüfen und verschiebt die Lage in ein Ausnahmedenken.');
          }
        },
        {
          id: 'deny-cover',
          title: 'Politische Deckung verweigern',
          phases: ['middle', 'late'],
          tags: ['Druck +1', 'Unterlassen'],
          description: 'Die Verantwortung wird nicht ausdrücklich übernommen, sondern nach unten ins operative System zurückgegeben.',
          reportPro: [],
          reportCon: ['Verweigerte Deckung erhöht das Risiko privatisierter Letztentscheidungen.'],
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
          reportPro: ['Politik arbeitet nicht im Nachhinein, sondern im laufenden Lagebild mit.'],
          reportCon: [],
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
          reportPro: ['Politische Verantwortung bleibt nicht vollständig beim Piloten hängen.'],
          reportCon: ['Die Staatsgewalt öffnet eine gefährliche Logik des Lebensvergleichs.'],
          availability(state) {
            return getPhase(state.roundIndex) === 'late' || getScenario(state.config).earlyReleaseWindow;
          },
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
          reportPro: ['Koch versucht zunächst, nicht vorschnell zu handeln, sondern Lage und Befehl zu klären.'],
          reportCon: [],
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
          description: 'Koch versucht, die entführte Maschine mit letzten militärischen Standardsignalen zum Kurswechsel zu bewegen.',
          reportPro: ['Vor der Letztentscheidung nutzt Koch mildere Mittel.'],
          reportCon: [],
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
          description: 'Er fragt die Befehlskette erneut und ausdrücklich nach politischer oder rechtlicher Deckung ab.',
          reportPro: ['Koch handelt nicht heimlich, sondern fordert Deckung an.'],
          reportCon: [],
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
          reportPro: ['Gewonnene Zeit kann tausende Menschen schützen.'],
          reportCon: ['Zeitgewinn erhöht zugleich das Risiko einer letzten, einsamen Entscheidung.'],
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
          reportPro: ['Koch hält die Rechtsgrenze ein und verweigert den Lebensvergleich.'],
          reportCon: ['Nicht-Schießen kann zum aktiven Zulassen einer größeren Katastrophe werden.'],
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
          reportPro: ['Der Abschuss verhindert die Tötung der Stadionmenge.'],
          reportCon: ['Der Staat tötet 164 unschuldige Menschen an Bord aktiv.'],
          availability(state) {
            return state.resources.danger >= 8 || state.roundIndex >= 9;
          },
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
          reportPro: [],
          reportCon: ['Die Passagiere dürfen nicht zu bloßen Zahlen im Rettungskalkül werden.'],
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
          reportPro: [],
          reportCon: ['Nicht nur die letzte Handlung, auch frühere Unterlassungen sind zurechenbar.'],
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
          reportPro: [],
          reportCon: ['Eine diffuse Befehlskette entlastet nicht, sondern verteilt Schuld.'],
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
          reportPro: [],
          reportCon: ['Die Opferzahl darf nicht die Individualität der Getöteten überdecken.'],
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
          reportPro: [],
          reportCon: ['Gerade in der Extremsituation muss der Rechtsstaat lesbar bleiben.'],
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
          reportPro: ['Der Notstand spricht gegen eine einfache Täterlogik.'],
          reportCon: [],
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
          reportPro: ['Pflichtenkollision erschwert die Vorstellung klarer Einzelschuld.'],
          reportCon: [],
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
          reportPro: ['Urteile aus sicherer Nachzeit unterschätzen den Echtzeitdruck der Situation.'],
          reportCon: [],
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
          reportPro: ['Verantwortung liegt im System und nicht nur in der letzten Hand am Abzug.'],
          reportCon: [],
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
          reportPro: ['Gerettete Menschen dürfen im Urteil nicht unsichtbar werden.'],
          reportCon: [],
          effect(state) {
            state.meta.defense += 2;
            state.meta.rescueImpact += 1;
            addResponsibility(state, 'biegler', { active: 1 });
            addLogEntry(state, 'Biegler rückt die geretteten Leben gegen die reine Schuldlogik in Stellung.');
          }
        }
      ]
    };
  }

  const CARD_LIBRARY = getCardLibrary();

  function getCardsForRole(roleId) {
    return CARD_LIBRARY[roleId] || [];
  }

  function getAvailableCardsForRole(state, roleId) {
    const phase = getPhase(state.roundIndex);
    return getCardsForRole(roleId).filter((card) => {
      const phaseMatch = card.phases.includes('all') || card.phases.includes(phase);
      const availabilityMatch = typeof card.availability === 'function' ? card.availability(state) : true;
      return phaseMatch && availabilityMatch;
    });
  }

  function buildDeterministicHand(cards, count, offset) {
    if (cards.length <= count) return cards;
    const chosen = [];
    const used = new Set();
    let pointer = offset % cards.length;
    while (chosen.length < count) {
      const card = cards[pointer];
      if (!used.has(card.id)) {
        chosen.push(card);
        used.add(card.id);
      }
      pointer = (pointer + 1) % cards.length;
    }
    return chosen;
  }

  function buildHands(state) {
    const scenario = getScenario(state.config);
    const handSize = state.config.modeId === 'unterricht' ? 2 : 3;
    state.hands = {};

    getActiveRoleIds(state).forEach((roleId) => {
      const available = getAvailableCardsForRole(state, roleId);
      const roleOffset =
        ROLE_ORDER.indexOf(roleId) * 2 +
        state.roundIndex * 2 +
        scenario.handOffset;
      state.hands[roleId] = buildDeterministicHand(available, handSize, roleOffset).map((card) => card.id);
    });
  }

  function getHandCardsForRole(state, roleId) {
    const ids = state.hands[roleId] || [];
    return ids
      .map((cardId) => getCardsForRole(roleId).find((card) => card.id === cardId))
      .filter(Boolean);
  }

  function getMissingSelections(state) {
    return getActiveRoleIds(state).filter((roleId) => !state.selections[roleId]);
  }

  function saveReflectionNote(state, note) {
    const key = state.reflection.round || 0;
    state.reflection.note = note;
    state.reflectionNotes[key] = note;
  }

  function applyRoundPressure(state) {
    const scenario = getScenario(state.config);
    const round = state.roundIndex;
    const phase = getPhase(round);
    const phaseDanger = phase === 'early' ? 1 : phase === 'middle' ? 2 : 3;
    adjustResource(state, 'danger', Math.max(0, phaseDanger + scenario.pressureMod));

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
      planeVictims: PLANE_PASSENGERS,
      stadiumCasualties,
      evacuatedPeople: Math.round(TOTAL_STADIUM_CAPACITY * (evac / 100)),
      savedEstimate:
        ending.type === 'abschuss' ? TOTAL_STADIUM_CAPACITY : TOTAL_STADIUM_CAPACITY - stadiumCasualties
    };

    if (ending.type === 'abschuss') {
      addResponsibility(state, 'koch', { legal: state.flags.ministryRelease ? 1 : 2 });
      state.meta.prosecution += state.flags.ministryRelease ? 1 : 2;
    }

    state.finished = true;
    state.verdict = getVerdict(state);
    updateStatuses(state);
  }

  function recordReflection(state, roundResolved) {
    state.reflection = {
      round: roundResolved + 1,
      question: REFLECTION_PROMPTS[roundResolved] || REFLECTION_PROMPTS[REFLECTION_PROMPTS.length - 1],
      note: state.reflectionNotes[roundResolved + 1] || ''
    };
  }

  function resolveRound(state) {
    if (state.finished) {
      return { ok: false, error: 'Die Partie ist bereits abgeschlossen.' };
    }

    const missing = getMissingSelections(state);
    if (missing.length > 0) {
      return { ok: false, error: missing };
    }

    const activeRoles = getActiveRoleIds(state);
    const resolutionLines = [];
    const historySelections = [];

    activeRoles.forEach((roleId) => {
      const selectedId = state.selections[roleId];
      const card = getHandCardsForRole(state, roleId).find((entry) => entry.id === selectedId);
      if (!card) return;
      card.effect(state);
      applyArgumentEffects(state, card);
      resolutionLines.push(`${ROLE_META[roleId].short}: ${card.title}`);
      historySelections.push({
        roleId,
        role: ROLE_META[roleId].short,
        cardId: card.id,
        cardTitle: card.title
      });
    });

    state.lastResolution = resolutionLines;
    addLogEntry(
      state,
      `Runde ${state.roundIndex + 1} wird in fester Reihenfolge aufgelöst: ${resolutionLines.join(' | ')}.`
    );

    const roundResolved = state.roundIndex;
    state.history.push({
      round: roundResolved + 1,
      minute: ROUNDS[roundResolved].minute,
      title: ROUNDS[roundResolved].title,
      selections: historySelections,
      reflectionQuestion: REFLECTION_PROMPTS[roundResolved]
    });

    applyRoundPressure(state);
    recordReflection(state, roundResolved);

    if (state.flags.shotByKoch || state.roundIndex >= ROUNDS.length - 1) {
      concludeGame(state);
      return {
        ok: true,
        finished: true,
        resolution: resolutionLines
      };
    }

    state.roundIndex += 1;
    state.selections = {};
    buildHands(state);
    updateStatuses(state);

    return {
      ok: true,
      finished: false,
      resolution: resolutionLines
    };
  }

  function getGoalStatuses(state) {
    return Object.keys(SECRET_GOALS).map((roleId) => ({
      roleId,
      title: SECRET_GOALS[roleId].title,
      active: getActiveRoleIds(state).includes(roleId),
      achieved: getActiveRoleIds(state).includes(roleId) ? SECRET_GOALS[roleId].check(state) : false
    }));
  }

  function buildArgumentTable(state) {
    const pro = [...state.arguments.pro];
    const con = [...state.arguments.con];

    if (state.ending.type === 'abschuss') {
      pushUnique(pro, ['Der Abschuss verhindert die Tötung der Stadionmenge.']);
      pushUnique(con, ['164 unschuldige Menschen an Bord werden aktiv getötet.']);
    }
    if (state.ending.type === 'katastrophe') {
      pushUnique(con, ['Die Katastrophe zeigt, dass das System zu spät oder zu zersplittert gehandelt hat.']);
    }
    if (state.verdict && state.verdict.label === 'Institutionelles Versagen') {
      pushUnique(con, ['Die Verantwortung liegt sichtbar nicht nur bei einer Person, sondern bei einer versagenden Kette.']);
    }
    if (state.verdict && state.verdict.label === 'Freispruch') {
      pushUnique(pro, ['Rettungserfolg, Pflichtenkollision und geteilte Verantwortung sprechen gegen einfache Täterschaft.']);
    }

    return {
      pro: pro.slice(0, 8),
      con: con.slice(0, 8)
    };
  }

  function buildReport(state) {
    const goals = getGoalStatuses(state)
      .filter((entry) => entry.active)
      .map((entry) => `- ${ROLE_META[entry.roleId].short}: ${entry.achieved ? 'erreicht' : 'nicht erreicht'} – ${entry.title}`)
      .join('\n');

    const matrix = ROLE_ORDER.map((roleId) => {
      const row = state.matrix[roleId];
      return `- ${ROLE_META[roleId].short}: aktiv ${row.active}, unterlassen ${row.omitted}, rechtlich ${row.legal}`;
    }).join('\n');

    const history = state.history
      .map((entry) => {
        const selectionText = entry.selections.map((item) => `${item.role}: ${item.cardTitle}`).join(' | ');
        const note = state.reflectionNotes[entry.round] ? `\n  Reflexionsnotiz: ${state.reflectionNotes[entry.round]}` : '';
        return `Runde ${entry.round} (T - ${entry.minute}): ${entry.title}\n  Auswahl: ${selectionText}\n  Reflexionsfrage: ${entry.reflectionQuestion}${note}`;
      })
      .join('\n\n');

    const argumentsTable = buildArgumentTable(state);
    const proText = argumentsTable.pro.map((entry) => `- ${entry}`).join('\n');
    const conText = argumentsTable.con.map((entry) => `- ${entry}`).join('\n');

    return [
      'VERHANDLUNGSPOKER: TERROR',
      '',
      `Szenario: ${getScenario(state.config).title}`,
      `Modus: ${MODE_OPTIONS[state.config.modeId].title}`,
      `Aktive Rollen: ${getActiveRoleIds(state).map((roleId) => ROLE_META[roleId].short).join(', ')}`,
      '',
      `Lageausgang: ${state.ending.title}`,
      `Urteil: ${state.verdict.label}`,
      `${state.verdict.summary}`,
      '',
      `Tote an Bord: ${state.ending.planeVictims}`,
      `Tote im Stadionbereich: ${state.ending.stadiumCasualties}`,
      `Evakuierte Menschen: ${state.ending.evacuatedPeople}`,
      `Gerettete Menschen (Schätzwert): ${state.ending.savedEstimate}`,
      '',
      'GEHEIME ZIELE',
      goals,
      '',
      'VERANTWORTUNGSMATRIX',
      matrix,
      '',
      'PROTOKOLL',
      history,
      '',
      'PRO-ARGUMENTE',
      proText,
      '',
      'CONTRA-ARGUMENTE',
      conText
    ].join('\n');
  }

  return {
    MAX_LOG_ENTRIES,
    TOTAL_STADIUM_CAPACITY,
    PLANE_PASSENGERS,
    ROLE_ORDER,
    ROLE_META,
    RESOURCE_CONFIG,
    ROUNDS,
    SCENARIOS,
    MODE_OPTIONS,
    TEACHING_PRESETS,
    SECRET_GOALS,
    createDefaultConfig,
    applyTeachingPreset,
    createInitialState,
    getActiveRoleIds,
    getCardsForRole,
    getAvailableCardsForRole,
    getHandCardsForRole,
    getMissingSelections,
    saveReflectionNote,
    resolveRound,
    getVerdict,
    getGoalStatuses,
    buildArgumentTable,
    buildReport,
    updateStatuses
  };
});
