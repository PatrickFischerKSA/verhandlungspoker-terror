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

const RESOURCE_KEYS = [
  'evacuation',
  'infoClarity',
  'danger',
  'legalRisk',
  'publicPressure',
  'commandConsensus'
];

const FLAG_KEYS = [
  'noFireOrder',
  'ministryRelease',
  'fullAlarm',
  'warningShots',
  'shotByKoch',
  'documentationSecured'
];

const ROLE_SHORT_CODES = {
  katastrophenschutz: 'KS',
  fuehrungszentrum: 'FZ',
  ministerium: 'MI',
  koch: 'KO',
  nelson: 'NE',
  biegler: 'BI'
};

const ROLE_CODE_TO_ID = Object.fromEntries(
  Object.entries(ROLE_SHORT_CODES).map(([roleId, code]) => [code, roleId])
);

const ROLE_ASSIGNMENTS = {
  katastrophenschutz: {
    slot: 'Person 1',
    duty: 'organisiert Räumung und Schutz im Stadionumfeld'
  },
  fuehrungszentrum: {
    slot: 'Person 2',
    duty: 'koordiniert Luftlage, Befehle und Informationsfluss'
  },
  ministerium: {
    slot: 'Person 3',
    duty: 'vertritt Recht, politische Deckung und Staatsverantwortung'
  },
  koch: {
    slot: 'Person 4',
    duty: 'muss als Pilot im Jet die letzte operative Entscheidung tragen'
  },
  nelson: {
    slot: 'Person 5',
    duty: 'sammelt Argumente der Anklage gegen rechtswidriges Handeln'
  },
  biegler: {
    slot: 'Person 6',
    duty: 'sammelt Argumente der Verteidigung für Zeitdruck und Pflichtenkollision'
  }
};

const ROLE_VOTE_WEIGHTS = {
  katastrophenschutz: {
    weight: 2,
    reason: 'kennt die praktische Evakuierungs- und Paniklage im Stadion'
  },
  fuehrungszentrum: {
    weight: 3,
    reason: 'koordiniert Luftlage, Befehle und den gesamten Informationsfluss'
  },
  ministerium: {
    weight: 3,
    reason: 'trägt die rechtlich-politische Gesamtverantwortung des Staates'
  },
  koch: {
    weight: 2,
    reason: 'trägt im Jet die letzte operative Last der Entscheidung'
  },
  nelson: {
    weight: 1,
    reason: 'prüft die spätere Anklageperspektive gegen rechtswidriges Handeln'
  },
  biegler: {
    weight: 1,
    reason: 'prüft die spätere Verteidigungsperspektive unter Zeitdruck'
  }
};

const TOTAL_VOTE_WEIGHT = ROLE_ORDER.reduce((sum, roleId) => sum + ROLE_VOTE_WEIGHTS[roleId].weight, 0);

const EXTRAORDINARY_EMERGENCY_EXPLAINER = 'Mit dem übergesetzlichen Notstand ist hier keine normale Vorschrift gemeint. Gemeint ist die Behauptung: Eigentlich ist ein Abschuss mit Unschuldigen an Bord rechtlich nicht erlaubt, aber in einer extremen Terrorlage könnte die Regierung trotzdem handeln und das später als Ausnahme rechtfertigen.';

const POLITICAL_CLIMATES = {
  falkenstein: {
    id: 'falkenstein',
    label: 'Bundesregierung Falkenstein',
    coalition: 'konservativ-sicherheitsorientierte Koalition',
    short: 'Diese Regierung ist bereit, im Extremfall über Ausnahmelogik nachzudenken.',
    note: 'Die Regierung Falkenstein sagt öffentlich: Der Staat muss im Terrorfall handlungsfähig bleiben, auch wenn die Rechtslage an ihre Grenze kommt.',
    studentMeaning: 'Für eure Runde heißt das: Das Ministerium sucht eher nach Handlungsspielraum als nach einem strikten Verbot.',
    ministryLine: 'Das Ministerium fragt schneller, ob eine Ausnahme politisch gedeckt werden kann.',
    recognizesEmergency: true,
    activationChance: 0.75
  },
  grundlinie: {
    id: 'grundlinie',
    label: 'Bundesregierung Grundlinie',
    coalition: 'sozialdemokratisch-rechtsstaatliche Koalition',
    short: 'Diese Regierung lehnt den übergesetzlichen Notstand klar ab.',
    note: 'Die Regierung Grundlinie sagt öffentlich: Auch im Extremfall darf der Staat die Verfassungsgrenze nicht politisch aufweichen.',
    studentMeaning: 'Für eure Runde heißt das: Das Ministerium wird eher verbieten, bremsen und auf die Menschenwürde verweisen.',
    ministryLine: 'Das Ministerium hält die Grenze und verweigert politische Ausnahmefreigaben.',
    recognizesEmergency: false,
    activationChance: 0
  },
  brueckenkurs: {
    id: 'brueckenkurs',
    label: 'Bundesregierung Brückenkurs',
    coalition: 'große Koalition mit offenem Streit',
    short: 'Diese Regierung ist innerlich gespalten und in der Notstandsfrage uneinig.',
    note: 'Die Regierung Brückenkurs streitet öffentlich: Ein Teil will Härte und Handlungsspielraum, ein anderer Teil will die Verfassungsgrenze strikt halten.',
    studentMeaning: 'Für eure Runde heißt das: Das Ministerium schwankt, Vetos werden wahrscheinlicher und politische Deckung bleibt unsicher.',
    ministryLine: 'Das Ministerium sendet gemischte Signale und sucht eher Absicherung als klare Führung.',
    recognizesEmergency: true,
    activationChance: 0.4
  },
  sicherungsbund: {
    id: 'sicherungsbund',
    label: 'Bundesregierung Sicherungsbund',
    coalition: 'national-konservative Sicherheitskoalition',
    short: 'Diese Regierung stellt Schutz und Durchgriffsfähigkeit klar vor Zurückhaltung.',
    note: 'Die Regierung Sicherungsbund sagt öffentlich: Wenn ein Massenmord droht, darf die Exekutive nicht an langsamen Rechtsdebatten scheitern.',
    studentMeaning: 'Für eure Runde heißt das: Das Ministerium ist besonders offen für Freigaben und harte Linien.',
    ministryLine: 'Das Ministerium will schnell entscheiden und erwartet Gehorsam in der Befehlskette.',
    recognizesEmergency: true,
    activationChance: 0.9
  },
  verfassungshof: {
    id: 'verfassungshof',
    label: 'Bundesregierung Verfassungshof',
    coalition: 'links-grün-sozialliberale Koalition',
    short: 'Diese Regierung stellt Menschenwürde und Verfassungsbindung absolut in den Vordergrund.',
    note: 'Die Regierung Verfassungshof sagt öffentlich: Auch in der Terrorlage darf der Staat nicht behaupten, jetzt gälten einfach andere Regeln.',
    studentMeaning: 'Für eure Runde heißt das: Das Ministerium wird Ausnahmelogik besonders scharf zurückweisen.',
    ministryLine: 'Das Ministerium argumentiert mit Grundgesetz, Menschenwürde und dem Verbot, Leben gegen Leben aufzurechnen.',
    recognizesEmergency: false,
    activationChance: 0
  }
};

const LEGACY_POLITICAL_CLIMATE_IDS = {
  strict: 'grundlinie',
  emergency: 'falkenstein'
};

const EMERGENCY_TRIGGER_CARD_IDS = new Set([
  'emergency-review',
  'exceptional-release',
  'overlegal-necessity',
  'shoot'
]);

const EMERGENCY_TRIGGER_MEASURE_IDS = new Set([
  'r6-notstand-szenario',
  'r10-freigabe-erzwingen'
]);

const COVER_SIGNAL_CARD_IDS = new Set([
  'emergency-review',
  'exceptional-release',
  'request-release',
  'overlegal-necessity'
]);

const EXTERNAL_DECISION_TEMPLATES = {
  court: [
    {
      id: 'court-human-dignity-veto',
      institution: 'Bundesverfassungsgericht',
      title: 'Eilvermerk zur Menschenwürdegrenze',
      summary: 'Im Lagezentrum liegt ein juristischer Vermerk mit Verweis auf die Karlsruher Linie vor: Unschuldige Menschen an Bord dürfen nicht zum Mittel für die Rettung anderer gemacht werden.',
      ruleText: 'Wenn eure Runde jetzt auf Ausnahmefreigabe oder Abschuss hinausläuft, sperrt dieser Vermerk den Ausnahmeweg in dieser Runde.',
      effectType: 'block_exception_clause'
    },
    {
      id: 'court-defense-gap',
      institution: 'Bundesverfassungsgericht',
      title: 'Lagehinweis zur offenen Verteidigungsfallfrage',
      summary: 'Im juristischen Lagebild wird festgehalten: Die äußerste Verteidigungsfrage ist nicht in jedem Punkt abschließend geklärt. Ein schmaler argumentativer Spalt bleibt offen.',
      ruleText: 'Wenn eure Runde auf Ausnahmefreigabe hinausläuft, wächst dadurch leicht die Chance, dass die politische Notstandsklausel greift.',
      effectType: 'boost_exception_clause',
      chanceModifier: 0.15
    },
    {
      id: 'court-state-restraint',
      institution: 'Bundesverfassungsgericht',
      title: 'Karlsruher Mahnung zur staatlichen Selbstbegrenzung',
      summary: 'Aus der verfassungsrechtlichen Linie wird klar signalisiert: Gerade in der Krise muss sichtbar bleiben, wer Verantwortung übernimmt und wo die Grenze gezogen wird.',
      ruleText: 'Wenn ihr auf eine Ausnahme setzt, braucht ihr in dieser Runde eine erkennbare politische Deckung. Ohne sie bleibt der Weg gesperrt.',
      effectType: 'require_cover_for_exception'
    }
  ],
  minister: [
    {
      id: 'minister-population-priority',
      institution: 'Verteidigungsminister',
      title: 'Eilweisung: Schutz der Bevölkerung priorisieren',
      summary: 'Aus dem Ministerbüro geht die Linie ein, dass der Schutz der Menschen im Stadion jetzt höchste Priorität hat und die Handlungsfähigkeit nicht im Abstimmungsstau verloren gehen darf.',
      ruleText: 'Wenn eure Runde auf Ausnahmefreigabe hinausläuft, steigt dadurch die Chance, dass die Notstandsklausel politisch wirksam wird.',
      effectType: 'boost_exception_clause',
      chanceModifier: 0.2
    },
    {
      id: 'minister-no-private-shot',
      institution: 'Verteidigungsminister',
      title: 'Eilweisung: Kein Alleingang im Cockpit',
      summary: 'Aus dem Ministerium kommt die Ansage, dass kein Pilot die äußerste Gewaltentscheidung ohne klare politische Deckung allein schultern soll.',
      ruleText: 'Wenn eure Runde auf Ausnahmefreigabe oder Abschuss hinausläuft, braucht ihr in dieser Runde sichtbar politische Deckung. Fehlt sie, stoppt diese Weisung den Weg.',
      effectType: 'require_cover_for_exception'
    },
    {
      id: 'minister-written-chain',
      institution: 'Verteidigungsminister',
      title: 'Eilweisung: Vor Extremschritt klare Befehlskette',
      summary: 'Der Minister lässt ausrichten, dass ein äußerster Eingriff nur dann weitergedacht werden darf, wenn die Freigabe- und Befehlslinie erkennbar geschlossen ist.',
      ruleText: 'Wenn eure Runde auf eine Ausnahme zusteuert, braucht ihr eine erkennbare Freigabelogik. Sonst stoppt diese Weisung den Weg.',
      effectType: 'require_cover_for_exception'
    }
  ]
};

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

const ROUND_GUIDES = [
  {
    situation: 'Ein Passagierflugzeug weicht vom Kurs ab. Der Funkkontakt ist brüchig. Noch weiß niemand sicher, ob ein technischer Defekt, eine Entführung oder ein Kommunikationsproblem vorliegt.',
    decisionNeed: 'Ihr müsst entscheiden, ob in dieser frühen Phase vor allem Informationen gesammelt werden sollen oder ob schon jetzt erste sichtbare Schutzmaßnahmen nötig sind.',
    discussion: 'Prüft, ob die Lage schon nach akuter Bedrohung aussieht oder ob das System zuerst Zeit und Informationen gewinnen sollte.',
    question: 'Soll in dieser frühen Phase bereits sichtbar gehandelt werden oder ist vorsichtiges Prüfen noch verantwortbarer?',
    prompts: [
      'Welche Rolle kann jetzt real Zeit gewinnen?',
      'Wer würde durch vorschnelles Handeln eher neue Unklarheit erzeugen?',
      'Welche erste Karte ist für die Gruppe am besten zu begründen?'
    ],
    notePrompt: 'Schreibt in ein bis zwei Sätzen, warum eure Gruppe in der Frühphase eher aktiv handelt oder eher abwartet.'
  },
  {
    situation: 'Die Alarmrotte ist gestartet. Das Stadion ist voll. Das Flugzeug bleibt auffällig, aber die Gesamtlage ist noch nicht vollständig geklärt.',
    decisionNeed: 'Ihr müsst entscheiden, welche Rolle jetzt als Erste ein klares Signal setzt: beobachten, warnen, koordinieren oder schon Schutzmaßnahmen einleiten.',
    discussion: 'Die Alarmrotte ist gestartet, aber das Gesamtbild ist noch unscharf. Diskutiert, wie viel Entschlossenheit schon nötig ist.',
    question: 'Welche Rolle sollte jetzt das erste deutlich sichtbare Signal setzen: Führung, Katastrophenschutz, Ministerium oder Koch?',
    prompts: [
      'Wo bringt eine Karte jetzt den größten Zeitgewinn?',
      'Wer braucht zuerst mehr Informationen?',
      'Welche Karte verhindert spätere Unterlassung am ehesten?'
    ],
    notePrompt: 'Notiert, welche Rolle in eurer Gruppe den ersten klaren Impuls setzen muss und warum.'
  },
  {
    situation: 'Die Maschine reagiert nicht auf Standardkommunikation und nicht auf Abdrängmanöver. Damit wird aus einer Auffälligkeit eine reale Bedrohung.',
    decisionNeed: 'Ihr müsst entscheiden, ob weiter vor allem Klarheit gewonnen werden soll oder ob mehrere Rollen sofort parallel handeln müssen.',
    discussion: 'Aus Unsicherheit wird eine ernsthafte Bedrohung. Jetzt zeigt sich, ob das System noch koordiniert oder schon zu spät reagiert.',
    question: 'Ist jetzt Informationsverdichtung wichtiger als Evakuierung oder muss schon parallel gehandelt werden?',
    prompts: [
      'Welche Rolle darf jetzt nicht mehr nur beobachten?',
      'Wo wird weiteres Zögern besonders riskant?',
      'Welche Karte macht Verantwortung sichtbar, auch wenn sie noch nicht alles löst?'
    ],
    notePrompt: 'Haltet fest, welche Priorität ihr in dieser Runde setzt: Klarheit gewinnen oder Menschen schon jetzt in Bewegung bringen.'
  },
  {
    situation: 'Warnsignale zeigen keine Wirkung. Flugbahn und Stadion rücken näher zusammen. Es reicht nicht mehr, nur festzustellen, dass die Lage schlimm ist.',
    decisionNeed: 'Ihr müsst entscheiden, wer jetzt offen Verantwortung übernimmt, statt sie nur weiterzureichen.',
    discussion: 'Die Warnungen bleiben wirkungslos. Diskutiert, wer nun Verantwortung übernehmen muss, statt sie weiterzureichen.',
    question: 'Wer muss in dieser Runde Verantwortung klar benennen: operative Führung, Politik oder der Pilot selbst?',
    prompts: [
      'Welche Rolle darf Verantwortung nicht länger delegieren?',
      'Welche Karte würde die Lage entschlossener machen?',
      'Wo droht schon jetzt juristische Mitverantwortung durch Nicht-Handeln?'
    ],
    notePrompt: 'Schreibt auf, welche Instanz aus eurer Sicht jetzt offen Verantwortung übernehmen muss.'
  },
  {
    situation: 'Die Drohung gilt nun als belastbar: Das entführte Flugzeug könnte in ein voll besetztes Stadion gelenkt werden. Zehntausende Menschen sind bedroht.',
    decisionNeed: 'Ihr müsst entscheiden, ob ihr jetzt vor allem Leben im Stadion schützen, rechtliche Grenzen markieren oder noch Zeit gewinnen wollt.',
    discussion: 'Die Drohung gilt als belastbar. Die Gruppe muss jetzt klären, ob sie vor allem retten, rechtlich begrenzen oder Zeit gewinnen will.',
    question: 'Verändert die Zahl der bedrohten Menschen eure Entscheidung, obwohl das Recht gleich bleibt?',
    prompts: [
      'Welche Karte schützt jetzt konkret Menschen im Stadion?',
      'Welche Karte markiert bewusst eine rechtliche Grenze?',
      'Wer verschärft die Lage, wenn die Rolle zu passiv bleibt?'
    ],
    notePrompt: 'Formuliert eure Kernabwägung: mehr Menschen retten oder rechtliche Grenze strikt halten?'
  },
  {
    situation: 'Die rechtliche Kernfrage steht offen im Raum: Unschuldige Menschen an Bord dürfen nicht einfach gegen Unschuldige im Stadion aufgerechnet werden.',
    decisionNeed: 'Ihr müsst entscheiden, ob ihr die Rechtsgrenze strikt haltet oder ob einzelne Rollen bereits eine Ausnahmelogik vorbereiten.',
    discussion: 'Jetzt steht die Verfassungsgrenze offen im Raum. Diskutiert, wie Recht und Rettungslogik aufeinanderprallen.',
    question: 'Soll eine Rolle die Rechtsgrenze klar verteidigen oder ist schon jetzt eine Ausnahmelogik denkbar?',
    prompts: [
      'Welche Karte schützt die Rechtsstaatlichkeit am stärksten?',
      'Welche Karte öffnet ein gefährliches Ausnahmedenken?',
      'Wie verändert diese Runde den Blick auf Koch?'
    ],
    notePrompt: 'Schreibt eure Gruppenposition zur Verfassungsgrenze dieser Runde in einem klaren Satz auf.'
  },
  {
    situation: 'Die Evakuierung beginnt, aber sie läuft zu langsam. Menschenmassen, Wege und Zeitdruck machen jede praktische Rettung schwierig.',
    decisionNeed: 'Ihr müsst entscheiden, welche Rolle jetzt konkret Menschen aus dem Gefahrenbereich bringt und wer nur noch flankieren oder absichern kann.',
    discussion: 'Die Räumung beginnt, aber sie ist langsam und unübersichtlich. Jetzt geht es um reale Rettung unter Zeitdruck.',
    question: 'Ist jetzt praktische Evakuierung wichtiger als juristische Absicherung oder braucht es beides parallel?',
    prompts: [
      'Welche Karte erhöht die reale Chance, Menschen aus der Arena zu bringen?',
      'Welche Rolle muss jetzt sichtbar operativ handeln?',
      'Wo droht Panik, wenn zu hart oder zu spät reagiert wird?'
    ],
    notePrompt: 'Notiert, wie eure Gruppe Evakuierung und Ordnung in dieser Runde gewichtet.'
  },
  {
    situation: 'Die Befehlskette wird dichter, aber nicht klarer. Jeder wartet auf Deckung, Freigabe oder ein ausdrückliches Verbot.',
    decisionNeed: 'Ihr müsst entscheiden, wer jetzt eine eindeutige Linie festlegt und wer Verantwortung nicht länger nach oben oder unten verschieben darf.',
    discussion: 'Die Befehlskette wird enger, aber nicht klarer. Diskutiert, ob jetzt eher Deckung, Verbot oder Freigabe gebraucht wird.',
    question: 'Ist eine unklare Befehlskette jetzt schon selbst eine Form von Verantwortungslosigkeit?',
    prompts: [
      'Welche Rolle muss jetzt eine eindeutige Linie formulieren?',
      'Welche Karte dokumentiert Verantwortung statt sie zu verwischen?',
      'Wo verschiebt das System Last unfair auf Einzelne?'
    ],
    notePrompt: 'Schreibt auf, ob das Problem dieser Runde eher fehlende Befehle oder falsche Befehle sind.'
  },
  {
    situation: 'Das Flugzeug nähert sich München. Es bleibt kaum noch Zeit, um Entscheidungen zurückzunehmen oder langsam zu koordinieren.',
    decisionNeed: 'Ihr müsst entscheiden, ob jetzt noch auf letzte Abstimmung gesetzt wird oder ob einzelne Rollen schon im Modus des letzten Handelns sind.',
    discussion: 'Der Zielanflug verdichtet sich. Jetzt werden „Noch nicht“-Entscheidungen fast genauso folgenreich wie offene Eingriffe.',
    question: 'Ist es noch verantwortbar, eine letzte Klarstellung abzuwarten, oder ist das bereits zu spät?',
    prompts: [
      'Welche offene Rolle trägt jetzt das größte Unterlassungsrisiko?',
      'Welche Karte schafft noch ein realistisches Handlungsfenster?',
      'Welche Entscheidung wäre zwar sauber, aber praktisch zu langsam?'
    ],
    notePrompt: 'Haltet fest, ob eure Gruppe jetzt noch auf Abstimmung setzt oder in den Modus des letzten Handelns kippt.'
  },
  {
    situation: 'Die Zeit läuft fast ab. Ab jetzt stehen Freigabe, Verbot und eigenmächtige Entscheidung direkt gegeneinander.',
    decisionNeed: 'Ihr müsst entscheiden, welche Option trotz hoher moralischer und juristischer Kosten noch am ehesten tragbar ist.',
    discussion: 'Die Optionen widersprechen sich direkt. Diskutiert, welche Handlung ihr jetzt trotz hoher Kosten noch vertreten könnt.',
    question: 'Welche Entscheidung könnt ihr in dieser Runde noch begründen, obwohl fast jede Option moralisch beschädigt ist?',
    prompts: [
      'Welche Karte passt am besten zur eigenen Verantwortung der Rolle?',
      'Wer braucht jetzt ausdrücklich politische oder rechtliche Deckung?',
      'Welche Entscheidung würdet ihr vor Gericht am ehesten verteidigen?'
    ],
    notePrompt: 'Schreibt die Entscheidung auf, die eure Gruppe in dieser Runde noch am ehesten verantworten kann.'
  },
  {
    situation: 'Die Räumung stockt, während die verbleibende Zeit zusammenschmilzt. Gute Entscheidungen können jetzt oft nur noch Schaden begrenzen, nicht mehr alles retten.',
    decisionNeed: 'Ihr müsst entscheiden, welche Rolle jetzt real noch Leben retten kann und welche nur noch die Folgen kleiner machen kann.',
    discussion: 'Die Räumung steht unter massivem Zeitdruck. Jetzt müsst ihr bewerten, ob Schadensbegrenzung oder letzte Intervention Vorrang hat.',
    question: 'Welche Rolle kann jetzt real noch Leben retten und welche nur noch Verantwortung dokumentieren?',
    prompts: [
      'Welche Karte bringt jetzt noch spürbaren Nutzen?',
      'Welche Rolle kann den Schaden nur noch begrenzen statt verhindern?',
      'Wo muss die Gruppe akzeptieren, dass keine saubere Lösung mehr existiert?'
    ],
    notePrompt: 'Notiert eure Begründung dafür, welche Rolle in dieser Runde noch tatsächlich retten kann.'
  },
  {
    situation: 'Die Schlussphase ist erreicht. Wenn jetzt nicht gehandelt wird, wird Untätigkeit selbst zur folgenreichen Entscheidung.',
    decisionNeed: 'Ihr müsst entscheiden, ob Nicht-Handeln in dieser Zuspitzung noch vertretbar ist oder ob es bereits aktiv zur Katastrophe beiträgt.',
    discussion: 'Die Schlussphase ist erreicht. Jetzt geht es um die letzte vertretbare Grenzziehung zwischen Eingreifen und Unterlassen.',
    question: 'Ist Untätigkeit jetzt noch Neutralität oder bereits ein aktiver Beitrag zur Katastrophe?',
    prompts: [
      'Welche offene Rolle trägt jetzt die schärfste Verantwortung?',
      'Welche Karte ist in dieser Zuspitzung noch glaubwürdig?',
      'Welche jurische Folge nehmt ihr mit eurer Wahl bewusst in Kauf?'
    ],
    notePrompt: 'Formuliert, ob ihr Untätigkeit in dieser Runde noch als vertretbar ansehen würdet.'
  },
  {
    situation: 'Die letzte Minute läuft. Jetzt kann nichts mehr vorbereitet werden. Jede Rolle legt offen, wofür sie im Extremfall steht.',
    decisionNeed: 'Ihr müsst entscheiden, welche letzte Kartenkombination eure Position am ehrlichsten ausdrückt und welche Folgen ihr bewusst in Kauf nehmt.',
    discussion: 'Die letzte Minute zwingt zu einer Endentscheidung. Jetzt müsst ihr nicht mehr vorbereiten, sondern euer Systembild offenlegen.',
    question: 'Welche letzte Entscheidung beschreibt am ehrlichsten, wofür euer System im Extremfall steht?',
    prompts: [
      'Welche Karte ist eure endgültige Position?',
      'Welche Folgen nehmt ihr bewusst an Bord, im Stadion oder vor Gericht in Kauf?',
      'Was wird nach dieser Runde die stärkste Anklage oder Verteidigung sein?'
    ],
    notePrompt: 'Haltet eure Schlussbegründung fest: Warum ist diese letzte Kartenkombination für eure Gruppe verantwortbar?'
  }
];

const ROUND_ARGUMENT_LENSES = [
  {
    trolley: 'Noch ist das kein reines Trolleyproblem, weil mehrere Auswege offen sind. Ihr steht noch nicht nur vor der Frage „eine Gruppe oder viele“, sondern auch vor der Frage, ob bessere Alternativen rechtzeitig aufgebaut werden können.',
    koch: 'Aus Kochs späterer Sicht müsste jetzt vor allem verhindert werden, dass die Letztentscheidung zu früh auf den Piloten rutscht. Solange noch Zeit ist, sollen Führung und Politik klare Verantwortung übernehmen.',
    nelson: 'Nelson würde hier schon auf Unterlassung schauen: Wer in der Frühphase zu wenig vorbereitet, verengt später die Möglichkeiten und trägt Mitverantwortung für die Zuspitzung.',
    judge: 'Die richterliche Leitfrage dieser Runde lautet: Welche legalen und schonenden Alternativen sind jetzt noch offen, bevor überhaupt an aktives Töten gedacht wird?'
  },
  {
    trolley: 'Die Lage beginnt sich in Richtung Trolleyproblem zu bewegen, ist aber noch breiter. Es geht weiterhin darum, ob das System Zeit gewinnt oder Zeit verliert.',
    koch: 'Koch würde betonen, dass er im Jet nicht allein entscheiden darf, solange der Staat am Boden noch reale Schutzmaßnahmen einleiten kann.',
    nelson: 'Nelson würde fragen, ob die Arena jetzt endlich vorbereitet wird oder ob die Menge später als Argument dafür herhalten soll, dass keine andere Wahl blieb.',
    judge: 'Die richterliche Leitfrage lautet: Hätte der Staat in dieser Runde noch Bodenalternativen stärken können, statt spätere Extrementscheidungen vorzubereiten?'
  },
  {
    trolley: 'Jetzt nähert sich der Fall dem Trolleyproblem an, weil die Optionen weniger werden. Trotzdem bleibt der Unterschied: Hier geht es um staatliches Handeln gegen Unschuldige, nicht nur um eine technische Weiche.',
    koch: 'Koch würde jetzt mehr Klarheit verlangen: Wenn der Staat weiter zögert, wächst die Chance, dass am Ende nur noch die letzte Gewaltoption übrig bleibt.',
    nelson: 'Nelson würde betonen, dass fehlende Kommunikation und fehlende Evakuierung nicht neutral sind. Sie produzieren die spätere Zwangslage mit.',
    judge: 'Die richterliche Leitfrage lautet: Wer hat diese Lage so weit verengt, dass sie wie ein Trolleyproblem aussieht?'
  },
  {
    trolley: 'Das Kernproblem verschiebt sich: Nicht nur die Weiche zählt, sondern auch, wer sie überhaupt stellen darf. In einem Rechtsstaat ist die Zuständigkeit selbst Teil der Moralfrage.',
    koch: 'Koch würde sagen, dass er ohne klare politische Linie nicht zum heimlichen Ersatzgesetzgeber im Cockpit werden darf.',
    nelson: 'Nelson würde fragen, ob Verantwortung bewusst nach unten geschoben wird, damit am Ende eine Einzelperson den politischen Konflikt tragen muss.',
    judge: 'Die richterliche Leitfrage lautet: Handelt hier noch der Staat als geordnetes System oder rutscht die Verantwortung schon in eine gefährliche Leerstelle?'
  },
  {
    trolley: 'Jetzt steht die nackte Zahlenfrage im Raum: 164 Menschen an Bord und 70 000 im Stadion. Genau an diesem Punkt wird das Trolleyproblem für die Klasse greifbar.',
    koch: 'Koch würde später sagen, dass er nicht abstrakt rechnet, sondern eine konkret drohende Massentötung vor Augen hat und sich diesem Bild nicht entziehen kann.',
    nelson: 'Nelson würde widersprechen: Auch 164 Passagiere bleiben einzelne unschuldige Menschen und dürfen nicht einfach zu einer kleineren Zahl gemacht werden.',
    judge: 'Die richterliche Leitfrage lautet: Darf eine große Opferzahl die Grenze verschieben oder bleibt die Würde jedes einzelnen Menschen gleich unantastbar?'
  },
  {
    trolley: 'Hier wird der Unterschied zum klassischen Trolleyproblem besonders deutlich. Beim Stück geht es nicht nur um Folgen, sondern um die Frage, ob der Staat Unschuldige absichtlich töten darf.',
    koch: 'Koch würde anführen, dass er in einer Extremlage vielleicht zwischen zwei Übeln stand und nicht zwischen Gut und Böse.',
    nelson: 'Nelson würde genau jetzt das Verbot „Leben gegen Leben“ stark machen: Ein Rechtsstaat darf Menschen nicht instrumentalisieren, selbst wenn andere dadurch gerettet werden könnten.',
    judge: 'Die richterliche Leitfrage lautet: Ist eine moralisch nachvollziehbare Rettungslogik schon eine rechtlich zulässige Staatslogik?'
  },
  {
    trolley: 'Das Trolleyproblem bleibt scharf, aber der Boden rückt wieder nach vorn. Je mehr Menschen ihr wirklich evakuiert, desto weniger darf die Extremoption behaupten, sie sei alternativlos.',
    koch: 'Koch würde darauf verweisen, dass jede Minute echter Räumung den Druck auf die letzte Luftentscheidung verändert.',
    nelson: 'Nelson würde prüfen, ob die Rettung am Boden ehrlich versucht wird oder ob sie nur symbolisch bleibt, während innerlich schon auf Gewalt umgestellt wird.',
    judge: 'Die richterliche Leitfrage lautet: Welche realen Leben konnten am Boden noch geschützt werden, ohne dass der Staat selbst zum Täter wird?'
  },
  {
    trolley: 'Die Weichenfrage ist jetzt auch eine Befehlsfrage. Wer keinen klaren Kurs vorgibt, lässt zu, dass die moralische Last immer weiter auf Einzelne rutscht.',
    koch: 'Koch würde sagen, dass er eine klare Freigabe oder ein klares Verbot braucht und nicht ein politisch bequemes Schweigen.',
    nelson: 'Nelson würde genau dieses Schweigen angreifen: Ein diffuser Staat darf später nicht so tun, als sei nur der letzte Täter oder Nichttäter wichtig.',
    judge: 'Die richterliche Leitfrage lautet: Ist die unklare Befehlskette jetzt schon selbst ein Unrecht?'
  },
  {
    trolley: 'Jetzt wird das Trolleyproblem fast unmittelbar: aktiv wenige töten, um viele zu retten, oder nicht eingreifen und die Kollision riskieren. Trotzdem bleibt der Staat hier Akteur mit Verfassung, nicht nur jemand an einer Weiche.',
    koch: 'Koch würde jetzt besonders stark betonen, dass im Cockpit keine philosophische Übung, sondern eine konkrete Katastrophe sichtbar wird.',
    nelson: 'Nelson würde antworten, dass gerade in dieser Härte das Verfassungsrecht gilt, weil der Staat sonst im Ausnahmegefühl seine Grenze verliert.',
    judge: 'Die richterliche Leitfrage lautet: Wird die Lage wirklich alternativlos oder wird Alternativlosigkeit nur behauptet?'
  },
  {
    trolley: 'Die Lage ist fast maximal verdichtet. Die Frage kippt von „Was wäre klug?“ zu „Welche Grenze darf selbst im Extremfall nicht überschritten werden?“',
    koch: 'Koch würde geltend machen, dass er unter Sekundenlogik entscheidet und dass nachträgliche Ruhe nicht fair auf eine Extremsituation übertragen werden darf.',
    nelson: 'Nelson würde einwenden, dass Zeitdruck keine Lizenz ist, unschuldige Menschen absichtlich zu töten.',
    judge: 'Die richterliche Leitfrage lautet: Entschuldigt der Zeitdruck eine Handlung, die außerhalb des Normalrechts liegt?'
  },
  {
    trolley: 'Das klassische Trolleybild trägt jetzt nur noch teilweise, weil auch Schadensbegrenzung zählt. Vielleicht geht es nicht mehr um „alles oder nichts“, sondern um die letzte noch mögliche Verringerung des Schadens.',
    koch: 'Koch würde fragen, ob sein Eingriff jetzt noch rettet oder nur eine andere Form von Tragödie erzeugt.',
    nelson: 'Nelson würde darauf hinweisen, dass auch in verzweifelten Lagen der Unterschied zwischen Rettenwollen und Töten-Dürfen bestehen bleibt.',
    judge: 'Die richterliche Leitfrage lautet: Welche Handlung hat jetzt noch einen realen Rettungsgehalt und welche nur noch symbolische Härte?'
  },
  {
    trolley: 'In dieser Phase ist auch Nicht-Handeln keine neutrale Weiche mehr. Gerade das verbindet das Stück mit dem Trolleyproblem und unterscheidet es zugleich von ihm.',
    koch: 'Koch würde sagen, dass Unterlassen jetzt ebenfalls eine aktive Verantwortung erzeugt, weil der Einschlag nicht mehr abstrakt, sondern absehbar ist.',
    nelson: 'Nelson würde dagegenhalten, dass Unterlassen und aktives Töten nicht einfach moralisch gleichgesetzt werden dürfen.',
    judge: 'Die richterliche Leitfrage lautet: Wann wird Unterlassen zur Schuld und wann bleibt es das Festhalten an einer rechtlichen Grenze?'
  },
  {
    trolley: 'In der Schlussminute steht das Trolleyproblem am schärfsten vor euch: wenige aktiv töten oder viele sterben lassen. Das Stück verschärft diese Denkfigur aber durch Staat, Verfassung und Würde.',
    koch: 'Koch würde seine spätere Entscheidung als Versuch beschreiben, eine konkret drohende Massentötung zu verhindern und nicht als kalte Zahlenrechnung.',
    nelson: 'Nelson würde am Ende daran erinnern, dass ein Staat sich gerade in der Extremminute daran messen lässt, ob er Unschuldige zum Mittel macht.',
    judge: 'Die richterliche Leitfrage lautet: Wollt ihr am Ende einen Staat denken, der im Extremfall rettet um jeden Preis, oder einen Staat, der auch dann an seiner Grenze festhält?'
  }
];

const ROUND_TEACHER_BRIEFINGS = [
  {
    happened: 'LH 2047 verlässt den vorgesehenen Kurs. Im Cockpit meldet sich niemand klar. Für die Menschen im Stadion ist davon noch nichts sichtbar, aber in der Luftüberwachung fällt sofort auf: Dieses Flugzeug passt nicht mehr in den normalen Linienverkehr.',
    known: 'Sicher ist: Der Kurs stimmt nicht, der Funkkontakt ist brüchig und das Flugzeug reagiert nicht normal auf Standardanfragen. Sicher ist noch nicht, ob ein technischer Defekt, ein Irrtum oder bereits eine Entführung vorliegt.',
    unclear: 'Unklar ist vor allem, warum die Maschine den Kurs verlässt, wer im Cockpit die Kontrolle hat und ob das Flugzeug überhaupt in Richtung Stadion fliegen soll.',
    risk: 'Wenn jetzt nur beobachtet wird, geht wertvolle Vorbereitungszeit verloren. Wenn zu früh Alarm ausgelöst wird, kann aber auch unnötige Panik oder Fehlsteuerung entstehen.',
    conflict: 'Soll das System zuerst möglichst viele Fakten sammeln oder jetzt schon Schutzmaßnahmen vorbereiten, obwohl die Lage noch nicht vollständig bestätigt ist?',
    decisionTask: 'Ihr müsst entscheiden, ob eure Gruppe in dieser ersten Runde eher auf vorsichtige Klärung, frühe Vorbereitung oder sofortige Alarmierung setzt.',
    paths: [
      'Erst klären: Luftlage, Funkverkehr und Radardaten so genau wie möglich sammeln, bevor nach außen sichtbar gehandelt wird.',
      'Früh absichern: Stadion, Polizei und Katastrophenschutz still vorbereiten, ohne schon einen offenen Massenalarm auszulösen.',
      'Früh warnen: Schon jetzt operative Schutzmaßnahmen starten, damit bei einer echten Bedrohung keine Minute verloren geht.'
    ],
    firstSpeaker: 'Führungszentrum spricht zuerst, weil dort als Erstes geklärt werden muss, wie sicher die Luftlage überhaupt ist.'
  },
  {
    happened: 'Die Alarmrotte ist in der Luft. Im Stadion sitzen weiterhin Tausende Menschen dicht beieinander. Das verdächtige Flugzeug bleibt auffällig, aber noch ist die Gefahrenlage nicht in jedem Punkt bewiesen.',
    known: 'Sicher ist: Das Stadion ist voll, das Flugzeug verhält sich nicht normal und militärische Stellen reagieren bereits. Die Lage ist also ernst genug, um nicht mehr nur intern zuzuschauen.',
    unclear: 'Unklar ist, ob das Flugzeug wirklich auf das Stadion zuläuft oder ob der Kurs noch geändert werden kann. Auch unklar ist, wie viel Zeit für eine geordnete Räumung überhaupt bleibt.',
    risk: 'Wenn jetzt niemand das Stadion vorbereitet, könnte später jede Evakuierung zu spät kommen. Wenn man jetzt offen eingreift, kann man jedoch ein ganzes Großereignis ohne sichere Fakten ins Chaos stürzen.',
    conflict: 'Soll schon jetzt ein deutliches Schutzsignal gesetzt werden oder ist die Lage noch zu unsicher für sichtbare Eingriffe im Stadion?',
    decisionTask: 'Ihr müsst entscheiden, ob ihr in dieser Runde das Stadion schon vorbereitet, eher intern koordiniert oder die Lage noch zurückhaltend behandelt.',
    paths: [
      'Koordination stärken: Alle Informationen, Zuständigkeiten und Befehle zentral bündeln, bevor draußen gehandelt wird.',
      'Schutz vorbereiten: Stadionleitung, Rettungskräfte und Polizei vorsichtig in Bereitschaft versetzen.',
      'Zurückhalten: Noch keine sichtbare Außenreaktion starten, um Fehlalarm und Verwirrung zu vermeiden.'
    ],
    firstSpeaker: 'Katastrophenschutz spricht zuerst, weil jetzt die Frage drängt, ob das Stadion schon vorbereitet werden muss.'
  },
  {
    happened: 'Das Flugzeug reagiert weder auf Standardkommunikation noch auf Abdrängmanöver. Was anfangs noch wie eine Störung wirkte, bekommt jetzt den Charakter einer echten Bedrohung.',
    known: 'Sicher ist: Das Cockpit liefert keine brauchbare Antwort, die Maschine bleibt auf problematischem Kurs und die Luftwaffe kann sie nicht einfach freundlich zurück auf Linie bringen.',
    unclear: 'Unklar ist weiterhin, ob das Ziel wirklich das Stadion ist, ob im Cockpit noch jemand handlungsfähig ist und ob durch weitere Kontaktversuche noch Zeit gewonnen werden kann.',
    risk: 'Wenn jetzt weiter nur auf vollständige Sicherheit gewartet wird, verengt sich das Zeitfenster. Wenn mehrere Stellen parallel losschicken, drohen aber widersprüchliche Befehle und unkoordinierte Maßnahmen.',
    conflict: 'Reicht Beobachtung noch aus oder müssen jetzt mehrere Rollen gleichzeitig handeln, obwohl das Gesamtbild noch Lücken hat?',
    decisionTask: 'Ihr müsst entscheiden, ob ihr weiter vor allem auf Lageklärung setzt oder ob Führung, Stadionschutz und politische Verantwortung jetzt parallel anlaufen.',
    paths: [
      'Informationsdruck erhöhen: Mehr Radardaten, mehr Funkversuche, mehr Klärung, bevor operative Schritte wachsen.',
      'Parallel handeln: Lageklärung läuft weiter, aber Evakuierung und Führungsentscheidungen beginnen gleichzeitig.',
      'Rechtsgrenze betonen: Keine operative Eskalation, solange Ziel und Rechtsgrundlage nicht belastbar genug sind.'
    ],
    firstSpeaker: 'Führungszentrum spricht zuerst, weil jetzt entschieden werden muss, ob Beobachtung noch reicht oder sofort parallel gehandelt werden muss.'
  },
  {
    happened: 'Warnsignale bleiben ohne Wirkung. Die Verbindung zwischen dem entführten Flugzeug und dem voll besetzten Stadion wird jetzt viel direkter gedacht. Der Fall ist nicht mehr nur eine technische Luftlage, sondern eine politische und moralische Krisensituation.',
    known: 'Sicher ist: Die Gefahr reagiert nicht auf Warnung. Reine Beobachtung löst nichts mehr. Jemand muss jetzt offen sagen, welche Linie gelten soll.',
    unclear: 'Unklar ist, wer diese Linie verbindlich festlegt. Wartet die operative Ebene auf Politik? Wartet die Politik auf neue Fakten? Oder läuft alles am Ende auf die Eigenverantwortung von Koch zu?',
    risk: 'Wenn weiter niemand die Richtung vorgibt, wächst eine gefährliche Leerstelle in der Befehlskette. Wenn aber vorschnell eine harte Linie gesetzt wird, kann sie später rechtlich und moralisch nicht mehr eingefangen werden.',
    conflict: 'Wer muss jetzt sichtbar Verantwortung übernehmen: die operative Führung, das Ministerium oder im Extremfall später der Pilot selbst?',
    decisionTask: 'Ihr müsst festlegen, von welcher Ebene in dieser Runde eine klare Linie ausgehen soll.',
    paths: [
      'Politische Linie fordern: Das Ministerium soll sich offen positionieren und Verantwortung nicht nach unten weiterreichen.',
      'Operative Linie setzen: Das Führungszentrum legt fest, was jetzt praktisch gilt und welche Schritte laufen.',
      'Eigenverantwortung vorbereiten: Koch fordert letzte Klarheit ein und bereitet sich innerlich darauf vor, notfalls selbst zu entscheiden.'
    ],
    firstSpeaker: 'Ministerium spricht zuerst, weil jetzt sichtbar wird, ob politische Verantwortung übernommen oder weiter nach unten verschoben wird.'
  },
  {
    happened: 'Die Drohung gilt nun als belastbar: Das entführte Flugzeug könnte in das voll besetzte Stadion gelenkt werden. Der mögliche Einschlag ist nicht mehr nur ein theoretisches Szenario.',
    known: 'Sicher ist: Zehntausende Menschen im Stadion sind real bedroht. Gleichzeitig sitzen unschuldige Menschen im Flugzeug, deren Leben nicht einfach als kleinere Zahl behandelt werden darf.',
    unclear: 'Unklar ist, ob eine vollständige Evakuierung noch rechtzeitig gelingen kann und ob sich der Kurs der Maschine vielleicht doch noch ändert.',
    risk: 'Wenn ihr jetzt zu langsam räumt, geraten die Menschen im Stadion in höchste Gefahr. Wenn ihr gedanklich schon auf Abschusslogik umstellt, geraten die Menschen an Bord aus dem Blick.',
    conflict: 'Gewichtet ihr in dieser Runde stärker den Schutz der Menschen im Stadion oder die unantastbare Grenze gegenüber den Menschen an Bord?',
    decisionTask: 'Ihr müsst entscheiden, ob der Schwerpunkt jetzt auf schneller Räumung, strikter Rechtsgrenze oder weiterem Zeitgewinn liegt.',
    paths: [
      'Stadion schützen: Evakuierung, Rettung und Ordnung im Stadion jetzt maximal beschleunigen.',
      'Rechtsgrenze markieren: Kein Schritt in Richtung Abschusslogik, solange Unschuldige an Bord sind.',
      'Zeit gewinnen: Noch Informationen, Sekunden und Handlungsspielraum herausholen, bevor ihr euch festlegt.'
    ],
    firstSpeaker: 'Katastrophenschutz spricht zuerst, weil jetzt konkret entschieden werden muss, ob Menschen im Stadion sofort in Bewegung gebracht werden.'
  },
  {
    happened: 'Die verfassungsrechtliche Grenze steht offen im Raum: Unschuldige Menschen an Bord dürfen nicht einfach gegen Unschuldige im Stadion aufgerechnet werden. Aus der Einsatzfrage wird jetzt ausdrücklich eine Grundsatzfrage des Rechtsstaats.',
    known: 'Sicher ist: Ein Abschuss wäre rechtlich extrem problematisch, selbst wenn dadurch sehr viele Menschen im Stadion gerettet würden. Das Grundgesetz schützt Menschenwürde und Leben nicht nach Kopfzahl.',
    unclear: 'Unklar ist, ob eure Gruppe diese Grenze absolut versteht oder ob sie im Extremfall mit einem übergesetzlichen Notstand argumentieren will.',
    risk: 'Wenn ihr die Rechtsgrenze aufweicht, verschiebt ihr den ganzen Fall in ein gefährliches Ausnahme-Denken. Wenn ihr sie streng haltet, nehmt ihr möglicherweise sehr viele Tote im Stadion in Kauf.',
    conflict: 'Haltet ihr die Rechtsgrenze strikt ein oder öffnet ihr gedanklich schon jetzt eine Ausnahme für den Extremfall?',
    decisionTask: 'Ihr müsst entscheiden, ob eure Gruppe in dieser Runde klar sagt: Abschuss bleibt tabu, oder ob ihr zumindest über eine Ausnahme nachdenkt.',
    paths: [
      'Grenze halten: Abschuss bleibt ausgeschlossen, auch unter massivem Druck.',
      'Ausnahme prüfen: Ein übergesetzlicher Notstand wird als mögliche Sonderlage mitgedacht.',
      'Verantwortung verteilen: Die rechtliche Last wird nicht nur bei Koch gesehen, sondern in der ganzen Befehlskette.'
    ],
    firstSpeaker: 'Ministerium spricht zuerst, weil diese Runde vor allem eine rechtliche und politische Grenzfrage ist.'
  },
  {
    happened: 'Die Evakuierung beginnt, aber sie stockt. Menschenmengen bewegen sich langsam, Wege verengen sich, Durchsagen wirken nicht überall gleich. Auf dem Papier klingt Räumung einfach, in der Realität kostet sie kostbare Minuten.',
    known: 'Sicher ist: Das Stadion ist noch lange nicht leer. Jede verlorene Minute erhöht die Gefahr für Menschen am Boden.',
    unclear: 'Unklar ist, wie geordnet die Räumung weiterläuft und ob zusätzliche Alarmierung eher hilft oder Panik erzeugt.',
    risk: 'Wenn ihr jetzt nicht entschlossen räumt, bleiben zu viele Menschen im Gefahrenraum. Wenn ihr zu hart alarmiert, könnte eine Massenpanik selbst Verletzte und Tote verursachen.',
    conflict: 'Soll jetzt alles auf praktische Räumung gesetzt werden oder müssen Recht, Kommunikation und Führung bewusst parallel mitlaufen?',
    decisionTask: 'Ihr müsst entscheiden, ob ihr maximale Räumung, kontrollierte Räumung oder eher Schadensbegrenzung priorisiert.',
    paths: [
      'Maximal räumen: Alles der schnellen Evakuierung unterordnen, auch auf Kosten perfekter Ordnung.',
      'Kontrolliert räumen: Zügig handeln, aber Panik und Gegendrücken bewusst vermeiden.',
      'Absichern statt räumen: Eher Wege, medizinische Hilfe und Schadensbegrenzung organisieren.'
    ],
    firstSpeaker: 'Katastrophenschutz spricht zuerst, weil hier die praktische Rettung im Stadionzentrum steht.'
  },
  {
    happened: 'Die Befehlskette wird dichter, aber nicht klarer. Politik, Führung und Cockpit sprechen über Verantwortung, aber niemand sagt in einem Satz: Das ist jetzt der gültige Kurs.',
    known: 'Sicher ist: Verantwortung wandert von oben nach unten und wieder zurück. Gerade diese Unklarheit wird selbst zum Problem.',
    unclear: 'Unklar ist, ob diese Unschärfe aus Vorsicht entsteht oder aus Angst, später verantwortlich gemacht zu werden.',
    risk: 'Wenn die Befehlskette unklar bleibt, muss am Ende vielleicht die letzte Person im Cockpit die ganze Last tragen. Wenn jetzt jemand eine Linie setzt, übernimmt diese Stelle aber offen Schuld und Verantwortung.',
    conflict: 'Ist eine unklare Befehlskette inzwischen selbst schon ein Versagen oder noch verständliche Vorsicht?',
    decisionTask: 'Ihr müsst entscheiden, ob in dieser Runde endlich eine eindeutige Linie gesetzt, Verantwortung dokumentiert oder weiter vorsichtig vertagt wird.',
    paths: [
      'Klare Befehle: Eine Stelle sagt jetzt offen, was gilt und wer handelt.',
      'Dokumentation: Verantwortung wird bewusst schriftlich und argumentativ sichtbar gemacht.',
      'Deckung verweigern: Rollen bleiben vorsichtig, sichern sich ab und schieben weiter.'
    ],
    firstSpeaker: 'Führungszentrum spricht zuerst, weil hier entschieden werden muss, ob endlich eine eindeutige Linie gesetzt wird.'
  },
  {
    happened: 'Das Flugzeug nähert sich München. Jetzt geht es nicht mehr um einen frühen Krisenbeginn, sondern um die letzten echten Handlungsminuten. Langsame Abstimmung wird selbst zum Risiko.',
    known: 'Sicher ist: Jede weitere Minute verkleinert die Möglichkeit, Entscheidungen zurückzunehmen oder nachzubessern.',
    unclear: 'Unklar ist nur noch wenig. Die eigentliche Unsicherheit liegt jetzt weniger in den Fakten als in der Frage, wer die Konsequenz tragen will.',
    risk: 'Wenn weiter auf letzte Klarheit gewartet wird, kippt die Situation womöglich in totale Handlungsunfähigkeit. Wenn jetzt hart entschieden wird, gibt es kaum noch Korrekturmöglichkeiten.',
    conflict: 'Ist Warten auf letzte Klarheit jetzt noch verantwortbar oder ist es bereits ein zu spätes Nicht-Handeln?',
    decisionTask: 'Ihr müsst entscheiden, ob eure Gruppe in dieser Runde noch abstimmt, sofort schützt oder Koch innerlich auf eine Eigenentscheidung zulaufen lässt.',
    paths: [
      'Letzte Abstimmung: Noch einmal Freigabe oder Verbot einholen, obwohl Zeit verloren geht.',
      'Sofort schützen: Alles auf Rettung und Schutz im Stadion richten.',
      'Letzte Eigenverantwortung vorbereiten: Koch rückt ins Zentrum und denkt die Entscheidung bis zum Ende.'
    ],
    firstSpeaker: 'Koch spricht zuerst, weil die Zeitlage jetzt unmittelbar auf seine spätere Entscheidung zuläuft.'
  },
  {
    happened: 'Die Zeit läuft fast ab. Freigabe, Verbot und eigenmächtige Entscheidung stehen jetzt frontal gegeneinander. Niemand kann mehr behaupten, es gebe noch eine saubere oder folgenlose Lösung.',
    known: 'Sicher ist: Jede Option kostet Menschenleben, Rechtssicherheit oder politische Integrität. Ihr wägt jetzt keine gute gegen eine schlechte Lösung ab, sondern drei beschädigte Wege gegeneinander.',
    unclear: 'Unklar ist nur noch, welchen Schaden eure Gruppe bereit ist zu tragen und wie sie diesen Schaden später begründen will.',
    risk: 'Wenn ihr das Verbot haltet, kann das Stadion sterben. Wenn ihr einen Abschuss freigebt oder duldet, überschreitet ihr eine massive Rechtsgrenze. Wenn Koch allein handelt, konzentriert sich die Last auf eine Person.',
    conflict: 'Welche dieser beschädigten Optionen ist in euren Augen noch am ehesten vertretbar?',
    decisionTask: 'Ihr müsst entscheiden, ob ihr das Verbot haltet, eine Freigabe sucht oder die Möglichkeit einer Eigenentscheidung offen mitdenkt.',
    paths: [
      'Verbot halten: Nicht schießen, obwohl die Gefahr für das Stadion extrem ist.',
      'Freigabe suchen: Politische oder rechtliche Deckung für einen Eingriff erzwingen.',
      'Eigenentscheidung denken: Koch handelt notfalls gegen die bestehende Linie.'
    ],
    firstSpeaker: 'Koch spricht zuerst, weil in dieser Runde seine Rolle operativ am stärksten unter Druck steht.'
  },
  {
    happened: 'Die Räumung stockt weiter, während die verbleibende Zeit zusammenschmilzt. Gute Entscheidungen können jetzt oft nur noch Schaden mindern, nicht mehr die ganze Gefahr auflösen.',
    known: 'Sicher ist: Nicht mehr alles ist rettbar. Ein Teil der Verantwortung verschiebt sich jetzt von idealer Rettung zu realistischer Schadensbegrenzung.',
    unclear: 'Unklar ist, wo überhaupt noch wirksames Handeln möglich ist: am Boden, in der Luft oder nur noch in der Vorbereitung auf die Folgen.',
    risk: 'Wenn alle weiter so tun, als gäbe es noch eine perfekte Lösung, wird echte Schadensbegrenzung zu spät begonnen. Wenn ihr zu früh aufgebt, verschenkt ihr vielleicht doch noch rettbare Leben.',
    conflict: 'Wer kann jetzt real noch Leben retten und wer kann nur noch Folgen begrenzen?',
    decisionTask: 'Ihr müsst festlegen, ob ihr auf letzte Rettung, letzte Intervention oder bewusste Schadensbegrenzung setzt.',
    paths: [
      'Letzte Rettung: Noch möglichst viele Menschen aus dem Stadion bringen.',
      'Letzte Intervention: In der Luft eingreifen bleibt als Option denkbar.',
      'Schadensbegrenzung: Medizinische, organisatorische und kommunikative Folgen abfedern.'
    ],
    firstSpeaker: 'Katastrophenschutz spricht zuerst, weil nun die praktische Frage drängt, ob am Boden noch wirksam gerettet werden kann.'
  },
  {
    happened: 'Die Schlussphase ist erreicht. Wenn jetzt nicht gehandelt wird, wird Unterlassen selbst zur aktiven Entscheidung. Genau darin liegt jetzt der moralische Druck dieser Runde.',
    known: 'Sicher ist: Neutralität gibt es kaum noch. Auch wer nichts tut, trägt Verantwortung für das, was gleich geschieht.',
    unclear: 'Unklar ist nur noch, ob eure Gruppe Untätigkeit als rechtlich notwendige Grenze oder als vermeidbares Wegsehen versteht.',
    risk: 'Wenn ihr euch hinter Nicht-Handeln versteckt, kann das zu einer Katastrophe ohne Gegenwehr führen. Wenn ihr jetzt noch aktiv eingreift, müsst ihr diesen Eingriff vollständig verantworten.',
    conflict: 'Ist Untätigkeit jetzt noch vertretbar oder bereits ein aktiver Beitrag zur Katastrophe?',
    decisionTask: 'Ihr müsst offen festhalten, ob Nicht-Handeln in dieser Runde für euch Schutz einer Grenze oder schuldhaftes Unterlassen bedeutet.',
    paths: [
      'Noch eingreifen: Eine letzte aktive Karte legen und Verantwortung übernehmen.',
      'Nicht eingreifen: Eine rechtliche oder moralische Grenze ausdrücklich halten.',
      'Verantwortung benennen: Klar machen, wer welches Risiko bewusst trägt.'
    ],
    firstSpeaker: 'Nelson spricht zuerst, weil jetzt die Frage nach Unterlassen und Verantwortung besonders scharf wird.'
  },
  {
    happened: 'Die letzte Minute läuft. Vorbereiten ist vorbei. Jetzt legt jede Rolle offen, wofür sie im Extremfall steht und welche Form von Verantwortung sie am Ende tragen will.',
    known: 'Sicher ist: Nach dieser Runde geht es nicht mehr um Vorbereitung, sondern um die endgültige Haltung eurer Gruppe und um deren Folgen im Urteil.',
    unclear: 'Unklar ist nur noch, welche Begründung eure Gruppe für ihren letzten Schritt tragen kann: Rettung, Rechtsgrenze oder verteilte Verantwortung.',
    risk: 'Eine letzte Rettungslogik kann rechtlich kollabieren. Eine letzte Rechtslogik kann moralisch unerträglich wirken. Eine verteilte Verantwortung kann ehrlich sein, aber auch wie Ausweichen aussehen.',
    conflict: 'Welche letzte Kartenkombination beschreibt eure Haltung im Extremfall am ehrlichsten?',
    decisionTask: 'Ihr müsst eure Schlussposition festlegen: Was soll eure Gruppe in der Endauswertung über Verantwortung, Rettung und Recht sagen?',
    paths: [
      'Rettung priorisieren: Möglichst viele Menschen im Stadion schützen, auch unter schwerem Rechtsdruck.',
      'Rechtsgrenze priorisieren: Kein Schritt über die verfassungsrechtliche Grenze.',
      'Verantwortung verteilen: Die Last bewusst auf mehrere Rollen und Ebenen sichtbar machen.'
    ],
    firstSpeaker: 'Biegler spricht zuerst, weil jetzt besonders deutlich wird, wie eure Gruppe die Schlussentscheidung später rechtfertigen will.'
  }
];

const ROUND_CONCRETE_FACTS = [
  [
    { label: 'Fluglage', value: 'LH 2047 fliegt 11 Grad südlicher als geplant, Flughöhe stabil bei rund 9 400 m.' },
    { label: 'Entfernung', value: 'Noch etwa 110 km bis zum Münchner Stadionraum.' },
    { label: 'Stadion', value: '70 000 Menschen im Stadion, Spielbeginn läuft, niemand ahnt die Luftlage.' },
    { label: 'Rechtslage', value: 'Kein Eingriff in Richtung Abschuss zulässig; es geht nur um Beobachtung, Alarmierung und Vorbereitung.' }
  ],
  [
    { label: 'Fluglage', value: 'Alarmrotte hat Sichtkontakt, das Ziel reagiert aber nicht eindeutig.' },
    { label: 'Entfernung', value: 'Noch etwa 95 km bis zum Stadionraum.' },
    { label: 'Stadion', value: 'Arena voll besetzt, Ordner und Rettungskräfte noch im Normalbetrieb.' },
    { label: 'Zeitfenster', value: 'Eine geordnete Vorwarnung ist noch möglich, aber jede Minute verkürzt die Evakuierungsreserve.' }
  ],
  [
    { label: 'Fluglage', value: 'Keine Antwort auf Funk, kein Abdrängen, Kurs bleibt auffällig stabil.' },
    { label: 'Entfernung', value: 'Noch etwa 82 km bis zum Stadionraum.' },
    { label: 'Stadion', value: 'Menschen sitzen dicht, Ausgänge sind nicht auf Räumung vorbereitet.' },
    { label: 'Befehlskette', value: 'Luftlage wird ernster, aber ein durchgehender Handlungsplan fehlt noch.' }
  ],
  [
    { label: 'Fluglage', value: 'Warnsignale bleiben folgenlos, der Korridor zur Arena wirkt plausibel.' },
    { label: 'Entfernung', value: 'Noch etwa 68 km bis zum Stadionraum.' },
    { label: 'Stadion', value: 'Keine sichtbare Räumung, Zuschauer nehmen die Lage weiter als normales Spiel wahr.' },
    { label: 'Politik', value: 'Es braucht jetzt eine erkennbare Linie: schützen, begrenzen oder weiter klären.' }
  ],
  [
    { label: 'Fluglage', value: 'Die Drohung gilt als belastbar: Das Flugzeug könnte direkt ins Stadion gelenkt werden.' },
    { label: 'Menschen', value: '164 Menschen an Bord stehen 70 000 Menschen im Stadion gegenüber.' },
    { label: 'Evakuierung', value: 'Erst wenige vorbereitende Maßnahmen, keine wirksame Massenräumung.' },
    { label: 'Rechtsfrage', value: 'Die Zahl der Bedrohten steigt drastisch, die verfassungsrechtliche Grenze bleibt aber bestehen.' }
  ],
  [
    { label: 'Fluglage', value: 'Die Luftlage bleibt bedrohlich, ein Einschlagsszenario ist nicht mehr fern.' },
    { label: 'Rechtslage', value: 'Unschuldige Menschen an Bord dürfen nicht einfach gegen Unschuldige am Boden verrechnet werden.' },
    { label: 'Politik', value: 'Jede Form von Freigabe, Duldung oder Schweigen bekommt jetzt Verfassungsgewicht.' },
    { label: 'Klassenfrage', value: 'Die Gruppe muss jetzt sichtbar sagen, ob sie die Rechtsgrenze absolut hält.' }
  ],
  [
    { label: 'Fluglage', value: 'Die Bedrohung bleibt bestehen, während parallel am Boden erst langsam reagiert wird.' },
    { label: 'Evakuierung', value: 'Rund 18 % des Stadions sind bisher aus dem Gefahrenraum bewegt.' },
    { label: 'Bodenlage', value: 'Treppen, Gänge und Engstellen bremsen jede schnelle Räumung.' },
    { label: 'Risiko', value: 'Zu späte Räumung tötet, zu harte Räumung kann Panik und Stürze auslösen.' }
  ],
  [
    { label: 'Fluglage', value: 'Der Anflugkorridor verdichtet sich, operative Rückfragen kosten jetzt sofort Zeit.' },
    { label: 'Befehlskette', value: 'Politik, Führung und Cockpit schieben Verantwortung sichtbar hin und her.' },
    { label: 'Evakuierung', value: 'Rund 31 % des Stadions sind geräumt, die große Masse steht noch im Innenraum.' },
    { label: 'Klassenfrage', value: 'Jetzt entscheidet sich, ob das System klare Befehle geben kann oder an Deckung erstickt.' }
  ],
  [
    { label: 'Fluglage', value: 'Das Flugzeug nähert sich München, der Zielraum ist in wenigen Minuten erreichbar.' },
    { label: 'Entfernung', value: 'Noch etwa 35 km bis zum Stadionraum.' },
    { label: 'Evakuierung', value: 'Rund 44 % des Stadions sind geräumt, mehr als die Hälfte ist noch gefährdet.' },
    { label: 'Druck', value: 'Jede letzte Abstimmung muss sich jetzt daran messen lassen, ob sie überhaupt noch rechtzeitig kommt.' }
  ],
  [
    { label: 'Fluglage', value: 'Die letzten Kommunikationsversuche laufen, aber ein verlässliches Umschwenken ist nicht erkennbar.' },
    { label: 'Entfernung', value: 'Noch etwa 24 km bis zum Stadionraum.' },
    { label: 'Evakuierung', value: 'Rund 53 % geräumt; ein großer Rest ist weiter im Gefahrenkorridor.' },
    { label: 'Konflikt', value: 'Freigabe, Verbot und Eigenentscheidung liegen jetzt offen auf dem Tisch.' }
  ],
  [
    { label: 'Fluglage', value: 'Die Maschine hält den gefährlichen Kurs, Luftzeit und Bodenzeit kollidieren fast ohne Reserve.' },
    { label: 'Entfernung', value: 'Noch etwa 15 km bis zum Stadionraum.' },
    { label: 'Evakuierung', value: 'Rund 61 % geräumt; viele Menschen stecken noch in Rängen, Treppen und Engstellen.' },
    { label: 'Medizinische Lage', value: 'Selbst ein guter Beschluss kann jetzt oft nur noch Schäden begrenzen, nicht mehr alles verhindern.' }
  ],
  [
    { label: 'Fluglage', value: 'Der Anflug auf die Arena ist stabil, jede Restminute zählt doppelt.' },
    { label: 'Entfernung', value: 'Noch etwa 8 km bis zum Stadionraum.' },
    { label: 'Evakuierung', value: 'Rund 69 % geräumt; Tausende Menschen befinden sich noch im Gefahrenbereich.' },
    { label: 'Moralischer Druck', value: 'Auch Nicht-Handeln wirkt jetzt wie eine aktive Entscheidung mit absehbaren Folgen.' }
  ],
  [
    { label: 'Fluglage', value: 'Die Schlussminute läuft, operative Vorbereitung ist vorbei.' },
    { label: 'Entfernung', value: 'Noch etwa 4 km bis zum Stadionraum.' },
    { label: 'Evakuierung', value: 'Rund 74 % geräumt; ein großer Rest ist trotz aller Maßnahmen noch nicht draußen.' },
    { label: 'Urteilslogik', value: 'Jeder letzte Beschluss beschreibt jetzt offen, wofür dieses System im Extremfall steht.' }
  ]
];

const ROUND_SHARED_MEASURES = [
  [
    {
      id: 'r1-radar-bridge',
      title: 'Luftlage-Zelle sofort hochfahren',
      summary: 'Eine kleine Sonderzelle bündelt Radar, Funk und Lagebild in Echtzeit.',
      impact: 'Mehr Informationsklarheit, aber die sichtbare Schutzreaktion nach außen bleibt noch schwach.',
      effect(state) {
        adjustResource(state, 'infoClarity', 2);
        adjustResource(state, 'commandConsensus', 1);
        addLogEntry(state, 'Gemeinsamer Beschluss: Eine Luftlage-Zelle bündelt Radar, Funk und erste Meldungen in Echtzeit.');
      }
    },
    {
      id: 'r1-stadium-quiet-prep',
      title: 'Stadion im Hintergrund vorbereiten',
      summary: 'Ordner, Sanität und Einsatzleitung werden intern in erhöhte Bereitschaft versetzt.',
      impact: 'Etwas Evakuierungsvorsprung, aber auch mehr Druck auf Führung und Stadionlogik.',
      effect(state) {
        adjustResource(state, 'evacuation', 6);
        adjustResource(state, 'publicPressure', 1);
        addLogEntry(state, 'Gemeinsamer Beschluss: Das Stadion wird still vorbereitet, ohne schon offen Alarm zu schlagen.');
      }
    },
    {
      id: 'r1-funk-priority',
      title: 'Alle Kommunikationskanäle priorisieren',
      summary: 'Funk, Tower und militärische Kommunikation bekommen Vorrang vor allen Nebenlagen.',
      impact: 'Mehr Klarheit, aber weniger operative Bodenwirkung in dieser Runde.',
      effect(state) {
        adjustResource(state, 'infoClarity', 1);
        adjustResource(state, 'danger', -1);
        addLogEntry(state, 'Gemeinsamer Beschluss: Alle verfügbaren Kommunikationskanäle werden auf LH 2047 konzentriert.');
      }
    }
  ],
  [
    {
      id: 'r2-ordner-vorwarnung',
      title: 'Ordner und Rettungskräfte vorwarnen',
      summary: 'Die Arena bleibt offiziell ruhig, aber alle Einsatzkräfte am Boden wechseln in Alarmbereitschaft.',
      impact: 'Der Boden reagiert schneller, zugleich steigt das Risiko einer spürbaren Unruhe.',
      effect(state) {
        adjustResource(state, 'evacuation', 7);
        adjustResource(state, 'publicPressure', 1);
        addLogEntry(state, 'Gemeinsamer Beschluss: Ordner, Sanität und Polizei im Stadionumfeld werden vorgewarnt.');
      }
    },
    {
      id: 'r2-fuehrungslinie',
      title: 'Eine Führungsstelle spricht für alle',
      summary: 'Alle Meldungen laufen über eine einzige Lageführung, um Widersprüche zu vermeiden.',
      impact: 'Mehr Befehlsklarheit, aber etwas weniger spontane Reaktion am Boden.',
      effect(state) {
        adjustResource(state, 'commandConsensus', 2);
        adjustResource(state, 'infoClarity', 1);
        addLogEntry(state, 'Gemeinsamer Beschluss: Eine Führungsstelle spricht ab jetzt verbindlich für die Lage.');
      }
    },
    {
      id: 'r2-still-hold',
      title: 'Noch kein sichtbarer Alarm',
      summary: 'Die Gruppe entscheidet sich bewusst gegen sichtbare Stadionmaßnahmen in dieser Runde.',
      impact: 'Weniger Unruhe, aber auch weniger Evakuierungsvorsprung.',
      effect(state) {
        adjustResource(state, 'publicPressure', -1);
        adjustResource(state, 'danger', 1);
        addLogEntry(state, 'Gemeinsamer Beschluss: Noch kein sichtbarer Alarm im Stadion, um Fehlreaktionen zu vermeiden.');
      }
    }
  ],
  [
    {
      id: 'r3-parallel-briefing',
      title: 'Parallelbriefing für Luft und Boden',
      summary: 'Luftlage und Stadionschutz werden jetzt gleichzeitig instruiert.',
      impact: 'Mehr Evakuierung und Klarheit, aber auch mehr Entscheidungsdruck.',
      effect(state) {
        adjustResource(state, 'infoClarity', 1);
        adjustResource(state, 'evacuation', 5);
        adjustResource(state, 'publicPressure', 1);
        addLogEntry(state, 'Gemeinsamer Beschluss: Luftlage und Bodenschutz werden parallel gebrieft.');
      }
    },
    {
      id: 'r3-ministerium-live',
      title: 'Ministerium sofort in die Live-Lage holen',
      summary: 'Die politische Ebene bekommt jetzt denselben Takt wie die operative Führung.',
      impact: 'Mehr Befehlsklarheit, aber mehr jurisch-politische Sichtbarkeit.',
      effect(state) {
        adjustResource(state, 'commandConsensus', 2);
        adjustResource(state, 'legalRisk', 1);
        addLogEntry(state, 'Gemeinsamer Beschluss: Das Ministerium wird in die laufende Live-Lage eingebunden.');
      }
    },
    {
      id: 'r3-evacuation-ready',
      title: 'Evakuierungsrouten offenhalten',
      summary: 'Das Stadion wird auf schnelle Teilräumung vorbereitet, auch ohne offenen Massenalarm.',
      impact: 'Mehr Evakuierungsvorsprung, aber höheres Panikrisiko später.',
      effect(state) {
        adjustResource(state, 'evacuation', 8);
        adjustResource(state, 'danger', -1);
        addLogEntry(state, 'Gemeinsamer Beschluss: Flucht- und Räumungswege werden vorsorglich offengehalten.');
      }
    }
  ],
  [
    {
      id: 'r4-politik-position',
      title: 'Politische Linie erzwingen',
      summary: 'Das Ministerium muss jetzt offen sagen, welche Grenze oder Freigabe gilt.',
      impact: 'Mehr Klarheit in der Befehlskette, aber höheres Rechtsrisiko.',
      effect(state) {
        adjustResource(state, 'commandConsensus', 2);
        adjustResource(state, 'legalRisk', 2);
        addLogEntry(state, 'Gemeinsamer Beschluss: Das Ministerium wird gezwungen, offen Position zu beziehen.');
      }
    },
    {
      id: 'r4-stadium-soft-evac',
      title: 'Weiche Stadionräumung beginnen',
      summary: 'Der Boden beginnt mit einer vorsichtigen, begründeten Teilräumung ohne Massenpanik zu provozieren.',
      impact: 'Mehr Evakuierung, aber auch spürbar höherer öffentlicher Druck.',
      effect(state) {
        adjustResource(state, 'evacuation', 9);
        adjustResource(state, 'publicPressure', 1);
        addLogEntry(state, 'Gemeinsamer Beschluss: Eine weiche Teilräumung des Stadions wird gestartet.');
      }
    },
    {
      id: 'r4-cockpit-last-contact',
      title: 'Letzten Kontaktversuch priorisieren',
      summary: 'Alle Hoffnungen liegen noch einmal auf einem letzten Cockpitkontakt.',
      impact: 'Etwas mehr Informationsklarheit, aber weniger Bodenvorbereitung.',
      effect(state) {
        adjustResource(state, 'infoClarity', 2);
        adjustResource(state, 'danger', -1);
        addLogEntry(state, 'Gemeinsamer Beschluss: Ein letzter maximaler Kontaktversuch zum Cockpit erhält Priorität.');
      }
    }
  ],
  [
    {
      id: 'r5-nordringe-raeumen',
      title: 'Nord- und Oberränge zuerst räumen',
      summary: 'Die am schwersten zu leerenden Bereiche bekommen sofort Priorität.',
      impact: 'Mehr reale Rettungschance, aber auch mehr Unruhe im Stadion.',
      effect(state) {
        adjustResource(state, 'evacuation', 10);
        adjustResource(state, 'publicPressure', 1);
        addLogEntry(state, 'Gemeinsamer Beschluss: Zuerst werden die langsamsten Stadionbereiche priorisiert geräumt.');
      }
    },
    {
      id: 'r5-rechtslinie-offen',
      title: 'Rechtsgrenze öffentlich intern markieren',
      summary: 'Alle Führungsebenen halten schriftlich fest, dass es keine freie Aufrechnung von Leben gibt.',
      impact: 'Weniger jurische Unschärfe, aber geringere operative Beweglichkeit.',
      effect(state) {
        adjustResource(state, 'legalRisk', -1);
        adjustResource(state, 'commandConsensus', 1);
        addLogEntry(state, 'Gemeinsamer Beschluss: Die Rechtsgrenze wird intern ausdrücklich markiert und dokumentiert.');
      }
    },
    {
      id: 'r5-letzte-reserve-boden',
      title: 'Letzte Bodenreserve anfordern',
      summary: 'Zusätzliche Sanität, Polizei und Verkehrslenkung werden in den Stadionraum gezogen.',
      impact: 'Etwas mehr Evakuierung und Schadensbegrenzung, aber auch mehr Druck im Gesamtsystem.',
      effect(state) {
        adjustResource(state, 'evacuation', 6);
        adjustResource(state, 'commandConsensus', 1);
        addLogEntry(state, 'Gemeinsamer Beschluss: Zusätzliche Bodenreserve wird in den Stadionraum gezogen.');
      }
    }
  ],
  [
    {
      id: 'r6-rechtsgutachten-kurz',
      title: 'Kurz-Gutachten zur Verfassungsgrenze',
      summary: 'Die Gruppe erzwingt eine knappe, klare juristische Lageeinschätzung für alle Rollen.',
      impact: 'Mehr Rechtsklarheit, aber höherer Zeitdruck.',
      effect(state) {
        adjustResource(state, 'legalRisk', -1);
        adjustResource(state, 'danger', 1);
        addLogEntry(state, 'Gemeinsamer Beschluss: Eine kurze juristische Lageeinschätzung wird für alle Rollen festgehalten.');
      }
    },
    {
      id: 'r6-politische-deckung-stop',
      title: 'Keine verdeckte politische Deckung',
      summary: 'Die Gruppe verbietet jede informelle Abschussdeckung ohne offenes Bekenntnis.',
      impact: 'Weniger rechtliche Verwischung, aber geringere operative Flexibilität.',
      effect(state) {
        adjustResource(state, 'legalRisk', -2);
        adjustResource(state, 'commandConsensus', -1);
        addLogEntry(state, 'Gemeinsamer Beschluss: Verdeckte politische Deckung wird ausdrücklich ausgeschlossen.');
      }
    },
    {
      id: 'r6-notstand-szenario',
      title: 'Notstandsszenario durchdenken',
      summary: 'Die Gruppe lässt offen prüfen, welche Ausnahmebegründung im Extremfall behauptet würde.',
      impact: 'Mehr Befehlsklarheit im Ernstfall, aber höheres Rechtsrisiko.',
      effect(state) {
        adjustResource(state, 'commandConsensus', 1);
        adjustResource(state, 'legalRisk', 2);
        addLogEntry(state, 'Gemeinsamer Beschluss: Ein mögliches Notstandsszenario wird offen mitgedacht.');
      }
    }
  ],
  [
    {
      id: 'r7-ausgaenge-max',
      title: 'Alle Ausgänge kompromisslos öffnen',
      summary: 'Evakuierung hat Vorrang vor perfekter Ordnung.',
      impact: 'Viel mehr Evakuierung, aber spürbar mehr Panikrisiko.',
      effect(state) {
        adjustResource(state, 'evacuation', 12);
        adjustResource(state, 'publicPressure', 2);
        addLogEntry(state, 'Gemeinsamer Beschluss: Alle Ausgänge werden kompromisslos für die Räumung geöffnet.');
      }
    },
    {
      id: 'r7-blockweise-raeumen',
      title: 'Blockweise Räumung beibehalten',
      summary: 'Die Gruppe setzt auf Ordnung statt maximale Geschwindigkeit.',
      impact: 'Weniger Sprung bei der Evakuierung, aber bessere Steuerbarkeit.',
      effect(state) {
        adjustResource(state, 'evacuation', 7);
        adjustResource(state, 'commandConsensus', 1);
        addLogEntry(state, 'Gemeinsamer Beschluss: Die Räumung bleibt blockweise und geordnet.');
      }
    },
    {
      id: 'r7-medizin-vorziehen',
      title: 'Medizinische Korridore vorziehen',
      summary: 'Die Gruppe bereitet Verletztenversorgung und Druckpunkte im Umfeld sichtbar vor.',
      impact: 'Mehr Schadensbegrenzung und etwas bessere Ordnung.',
      effect(state) {
        adjustResource(state, 'commandConsensus', 1);
        adjustResource(state, 'publicPressure', 1);
        addLogEntry(state, 'Gemeinsamer Beschluss: Medizinische Korridore und Sammelpunkte werden vorgezogen.');
      }
    }
  ],
  [
    {
      id: 'r8-befehl-schriftlich',
      title: 'Jede Linie schriftlich festhalten',
      summary: 'Die Gruppe will keine mündliche Unschärfe mehr in der Befehlskette.',
      impact: 'Mehr Verantwortungsklarheit, aber mehr Zeit- und Rechtsdruck.',
      effect(state) {
        adjustResource(state, 'commandConsensus', 2);
        adjustResource(state, 'legalRisk', 1);
        addLogEntry(state, 'Gemeinsamer Beschluss: Entscheidungswege werden ab jetzt schriftlich festgehalten.');
      }
    },
    {
      id: 'r8-jetzt-klare-linie',
      title: 'Eine Stelle legt die Linie fest',
      summary: 'Die Gruppe erzwingt einen eindeutigen Geltungsbefehl.',
      impact: 'Mehr Befehlsklarheit, aber weniger politisches Ausweichen.',
      effect(state) {
        adjustResource(state, 'commandConsensus', 3);
        adjustResource(state, 'publicPressure', 1);
        addLogEntry(state, 'Gemeinsamer Beschluss: Eine Stelle legt die operative Linie verbindlich fest.');
      }
    },
    {
      id: 'r8-rueckfrage-offen',
      title: 'Rückfragefenster offen lassen',
      summary: 'Die Gruppe gibt der Deckungssuche noch einmal Raum.',
      impact: 'Etwas weniger Druck, aber mehr Gefahr durch Verzögerung.',
      effect(state) {
        adjustResource(state, 'danger', 1);
        adjustResource(state, 'publicPressure', -1);
        addLogEntry(state, 'Gemeinsamer Beschluss: Ein letztes Rückfragefenster für Freigabe oder Verbot bleibt offen.');
      }
    }
  ],
  [
    {
      id: 'r9-letzte-koordination',
      title: 'Letzte Koordinationsminute erzwingen',
      summary: 'Alle Rollen stimmen sich noch einmal ab, obwohl die Zeit fast weg ist.',
      impact: 'Etwas mehr Befehlsklarheit, aber Verlust an Restzeit.',
      effect(state) {
        adjustResource(state, 'commandConsensus', 2);
        adjustResource(state, 'danger', 1);
        addLogEntry(state, 'Gemeinsamer Beschluss: Eine letzte Koordinationsminute wird erzwungen.');
      }
    },
    {
      id: 'r9-stadion-voll-auf',
      title: 'Stadion auf maximale Räumung stellen',
      summary: 'Alle verbleibenden Kräfte gehen auf schnellstmögliche Räumung.',
      impact: 'Großer Evakuierungsschub, aber mehr Unruhe und Druck.',
      effect(state) {
        adjustResource(state, 'evacuation', 11);
        adjustResource(state, 'publicPressure', 2);
        addLogEntry(state, 'Gemeinsamer Beschluss: Der Stadionraum wird auf maximale Räumung gestellt.');
      }
    },
    {
      id: 'r9-pilot-last-frame',
      title: 'Koch bekommt letzte Lageformel',
      summary: 'Der Pilot erhält eine komprimierte, ehrliche Lageformel statt vager Rückfragen.',
      impact: 'Mehr operative Klarheit im Cockpit, aber auch mehr Last auf Koch.',
      effect(state) {
        adjustResource(state, 'infoClarity', 1);
        adjustResource(state, 'commandConsensus', 1);
        addLogEntry(state, 'Gemeinsamer Beschluss: Koch erhält eine letzte komprimierte Lageformel ohne Beschönigung.');
      }
    }
  ],
  [
    {
      id: 'r10-freigabe-erzwingen',
      title: 'Klare Freigabe oder klares Verbot verlangen',
      summary: 'Die Gruppe erlaubt keine schweigende Grauzone mehr.',
      impact: 'Mehr Befehlsklarheit, aber deutlich mehr jurische Schärfe.',
      effect(state) {
        adjustResource(state, 'commandConsensus', 2);
        adjustResource(state, 'legalRisk', 2);
        addLogEntry(state, 'Gemeinsamer Beschluss: Eine klare Freigabe oder ein klares Verbot wird eingefordert.');
      }
    },
    {
      id: 'r10-schadensbild-boden',
      title: 'Bodenfolgen offen mitdenken',
      summary: 'Die Gruppe lässt die möglichen Opfer im Stadion konkret beziffern und in die Lage einfließen.',
      impact: 'Mehr Rettungsfokus, aber mehr moralischen Druck auf alle Rollen.',
      effect(state) {
        adjustResource(state, 'danger', -1);
        adjustResource(state, 'publicPressure', 1);
        addLogEntry(state, 'Gemeinsamer Beschluss: Das mögliche Schadensbild am Boden wird offen in die Entscheidung eingeblendet.');
      }
    },
    {
      id: 'r10-kein-schutzmantel',
      title: 'Keine nachträgliche Deckung versprechen',
      summary: 'Niemand bekommt vorab die Zusicherung, später geschützt zu werden.',
      impact: 'Weniger Verwischung, aber höhere Unsicherheit im Handeln.',
      effect(state) {
        adjustResource(state, 'legalRisk', -1);
        adjustResource(state, 'commandConsensus', -1);
        addLogEntry(state, 'Gemeinsamer Beschluss: Es wird keine nachträgliche Deckung für Grenzüberschreitungen versprochen.');
      }
    }
  ],
  [
    {
      id: 'r11-medizin-schadensbegrenzung',
      title: 'Schadensbegrenzung am Boden vorziehen',
      summary: 'Sanität, Zufahrten und Sammelpunkte werden auf Massenanfall vorbereitet.',
      impact: 'Mehr Ordnung und geringere Folgeopfer, aber keine Wunder mehr bei der Evakuierung.',
      effect(state) {
        adjustResource(state, 'commandConsensus', 1);
        adjustResource(state, 'evacuation', 4);
        addLogEntry(state, 'Gemeinsamer Beschluss: Medizinische und logistische Schadensbegrenzung wird vorgezogen.');
      }
    },
    {
      id: 'r11-letzte-luftoption',
      title: 'Letzte Luftoption offenhalten',
      summary: 'Die Gruppe hält die letzte Eingriffsoption in der Luft bewusst offen.',
      impact: 'Mehr operative Beweglichkeit, aber mehr Rechtsrisiko.',
      effect(state) {
        adjustResource(state, 'danger', -1);
        adjustResource(state, 'legalRisk', 2);
        addLogEntry(state, 'Gemeinsamer Beschluss: Die letzte Luftoption wird bewusst offengehalten.');
      }
    },
    {
      id: 'r11-tribuenen-sperren',
      title: 'Resttribünen hart sperren',
      summary: 'Alle noch offenen Publikumswege werden kompromisslos auf Räumung gedrückt.',
      impact: 'Mehr Evakuierung, aber spürbare Hektik und Druck.',
      effect(state) {
        adjustResource(state, 'evacuation', 9);
        adjustResource(state, 'publicPressure', 1);
        addLogEntry(state, 'Gemeinsamer Beschluss: Die letzten offenen Tribünenbereiche werden hart auf Räumung gedrückt.');
      }
    }
  ],
  [
    {
      id: 'r12-unterlassen-benennen',
      title: 'Unterlassen ausdrücklich benennen',
      summary: 'Die Gruppe hält fest, welche Folgen Nicht-Handeln jetzt haben würde.',
      impact: 'Mehr Klarheit über Verantwortung, aber mehr moralischer Druck.',
      effect(state) {
        adjustResource(state, 'commandConsensus', 1);
        adjustResource(state, 'publicPressure', 1);
        addLogEntry(state, 'Gemeinsamer Beschluss: Die Folgen des Unterlassens werden offen benannt und dokumentiert.');
      }
    },
    {
      id: 'r12-letzte-bodenwelle',
      title: 'Letzte Bodenwelle auslösen',
      summary: 'Die Gruppe setzt auf einen letzten Evakuierungsschub trotz Unruhe.',
      impact: 'Mehr Räumung, aber höheres Chaosrisiko.',
      effect(state) {
        adjustResource(state, 'evacuation', 8);
        adjustResource(state, 'publicPressure', 2);
        addLogEntry(state, 'Gemeinsamer Beschluss: Eine letzte Bodenwelle zur Räumung wird ausgelöst.');
      }
    },
    {
      id: 'r12-klare-grenze',
      title: 'Letzte Grenze klar ziehen',
      summary: 'Die Gruppe entscheidet sich bewusst dafür, eine Grenze nicht mehr zu überschreiten.',
      impact: 'Weniger Rechtsrisiko, aber mehr Gefahr aus dem verbleibenden Zeitverlust.',
      effect(state) {
        adjustResource(state, 'legalRisk', -2);
        adjustResource(state, 'danger', 1);
        addLogEntry(state, 'Gemeinsamer Beschluss: Eine letzte rechtliche oder moralische Grenze wird ausdrücklich gezogen.');
      }
    }
  ],
  [
    {
      id: 'r13-schlussbegruendung',
      title: 'Schlussbegründung vorziehen',
      summary: 'Die Gruppe legt offen fest, wie sie ihre Endhaltung später rechtfertigen will.',
      impact: 'Mehr argumentative Klarheit, aber keine zusätzliche Zeit mehr.',
      effect(state) {
        state.meta.prosecution += 1;
        state.meta.defense += 1;
        addLogEntry(state, 'Gemeinsamer Beschluss: Die Schlussbegründung der Gruppe wird noch vor der Endkarte offengelegt.');
      }
    },
    {
      id: 'r13-rettung-radikal',
      title: 'Rettungslogik radikal priorisieren',
      summary: 'Die Gruppe erklärt offen, dass jetzt maximaler Bodenschutz das Leitprinzip ist.',
      impact: 'Mehr Rettungsfokus, aber deutlich höherer Rechtsdruck.',
      effect(state) {
        state.meta.rescueImpact += 1;
        adjustResource(state, 'legalRisk', 2);
        addLogEntry(state, 'Gemeinsamer Beschluss: Die Gruppe priorisiert in der Schlussminute radikal den Bodenschutz.');
      }
    },
    {
      id: 'r13-grenze-radikal',
      title: 'Rechtsgrenze radikal priorisieren',
      summary: 'Die Gruppe erklärt offen, dass keine letzte Rettungslogik die Grenze sprengen darf.',
      impact: 'Weniger Rechtsrisiko, aber härtere Last auf dem Unterlassen.',
      effect(state) {
        adjustResource(state, 'legalRisk', -2);
        addResponsibility(state, 'ministerium', { omitted: 1, legal: 1 });
        addLogEntry(state, 'Gemeinsamer Beschluss: Die Gruppe priorisiert in der Schlussminute radikal die Rechtsgrenze.');
      }
    }
  ]
];

const ROUND_VETO_RULES = [
  [
    { roleId: 'fuehrungszentrum', reason: 'darf den Mehrheitsweg in dieser Runde operativ prüfen, weil die Luftlage noch sehr unsicher ist.' },
    { roleId: 'katastrophenschutz', reason: 'darf warnen oder bremsen, wenn der Weg am Boden zu früh Chaos auslösen würde.' }
  ],
  [
    { roleId: 'fuehrungszentrum', reason: 'muss prüfen, ob der Mehrheitsweg zur aktuellen Luftlage überhaupt passt.' },
    { roleId: 'katastrophenschutz', reason: 'darf bremsen, wenn der Weg im Stadion zu früh Panik erzeugen könnte.' }
  ],
  [
    { roleId: 'fuehrungszentrum', reason: 'muss entscheiden, ob der Weg operativ tragfähig oder zu spät ist.' },
    { roleId: 'ministerium', reason: 'darf jetzt stärker mitreden, weil aus Beobachtung bereits Staatsverantwortung wird.' }
  ],
  [
    { roleId: 'ministerium', reason: 'darf blockieren, wenn der Mehrheitsweg politisch oder rechtlich nicht offen getragen wird.' },
    { roleId: 'fuehrungszentrum', reason: 'muss freigeben, ob der Weg überhaupt praktisch umgesetzt werden kann.' }
  ],
  [
    { roleId: 'ministerium', reason: 'trägt jetzt die stärkste rechtlich-politische Sonderverantwortung.' },
    { roleId: 'katastrophenschutz', reason: 'darf widersprechen, wenn der Weg die Menschen im Stadion real nicht schützt.' }
  ],
  [
    { roleId: 'ministerium', reason: 'hat jetzt ein echtes Sonderrecht, weil die Rechtsgrenze selbst Thema der Runde ist.' },
    { roleId: 'fuehrungszentrum', reason: 'muss sagen, ob der Weg mehr Klarheit oder nur neue Unordnung schafft.' }
  ],
  [
    { roleId: 'katastrophenschutz', reason: 'hat Sonderrecht, weil die praktische Räumung jetzt über Leben und Tod mitentscheidet.' },
    { roleId: 'fuehrungszentrum', reason: 'darf blockieren, wenn der Weg operativ zu unkoordiniert wäre.' }
  ],
  [
    { roleId: 'fuehrungszentrum', reason: 'muss die Befehlskette jetzt verbindlich prüfen.' },
    { roleId: 'ministerium', reason: 'darf verlangen, dass Verantwortung nicht heimlich nach unten verschoben wird.' }
  ],
  [
    { roleId: 'koch', reason: 'bekommt jetzt ein echtes Sonderrecht, weil die operative Letztlast spürbar auf ihm liegt.' },
    { roleId: 'ministerium', reason: 'muss sagen, ob der Weg offen gedeckt, nur bedingt getragen oder blockiert wird.' }
  ],
  [
    { roleId: 'koch', reason: 'darf blockieren, wenn der Mehrheitsweg seine Rolle in eine unklare Letztentscheidung zwingt.' },
    { roleId: 'ministerium', reason: 'hat Sonderrecht, weil Freigabe oder Verbot jetzt nicht mehr versteckt bleiben dürfen.' }
  ],
  [
    { roleId: 'katastrophenschutz', reason: 'muss jetzt prüfen, ob der Weg am Boden noch wirklich Leben retten kann.' },
    { roleId: 'koch', reason: 'darf widersprechen, wenn der Weg in der Luft praktisch nicht mehr tragfähig ist.' }
  ],
  [
    { roleId: 'ministerium', reason: 'muss jetzt offen sagen, ob eine Grenze gehalten oder überschritten werden soll.' },
    { roleId: 'koch', reason: 'trägt die operative Letztlast und bekommt deshalb ein echtes Vetorecht.' }
  ],
  [
    { roleId: 'ministerium', reason: 'hat in der Schlussminute das stärkste Sonderrecht für die rechtliche Gesamtlinie.' },
    { roleId: 'koch', reason: 'darf den letzten Mehrheitsweg blockieren, wenn er ihn operativ nicht mehr verantworten kann.' }
  ]
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

function pickPoliticalClimateId() {
  const ids = Object.keys(POLITICAL_CLIMATES);
  return ids[Math.floor(Math.random() * ids.length)];
}

function normalizePoliticalClimateId(inputId) {
  const normalizedId = LEGACY_POLITICAL_CLIMATE_IDS[inputId] || inputId;
  return POLITICAL_CLIMATES[normalizedId] ? normalizedId : 'grundlinie';
}

function createSessionId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function chooseRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function createEmptyPlayerNames() {
  return Object.fromEntries(ROLE_ORDER.map((roleId) => [roleId, '']));
}

function createEmptyRoleModes() {
  return Object.fromEntries(ROLE_ORDER.map((roleId) => [roleId, 'player']));
}

function normalizeCompanionRoles(input) {
  return Object.fromEntries(
    ROLE_ORDER.map((roleId) => [roleId, false])
  );
}

function createInitialState() {
  return {
    sessionId: createSessionId(),
    roundIndex: 0,
    finished: false,
    restored: false,
    ending: null,
    setupComplete: false,
    playMode: 'desktop',
    politicalClimateId: pickPoliticalClimateId(),
    playerNames: createEmptyPlayerNames(),
    roleModes: createEmptyRoleModes(),
    companionRoles: normalizeCompanionRoles(),
    notesByRound: {},
    votesByRound: {},
    measuresByRound: {},
    vetoesByRound: {},
    emergencyClauseChecksByRound: {},
    externalDecisionsByRound: {},
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
      communicationStatus: 'Funkkontakt brüchig',
      governmentStatus: ''
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

function hydrateState(input) {
  const initial = createInitialState();
  if (!input || typeof input !== 'object') return initial;

  return {
    ...initial,
    ...input,
    sessionId: typeof input.sessionId === 'string' ? input.sessionId : initial.sessionId,
    setupComplete: Boolean(input.setupComplete),
    playMode: input.playMode === 'hybrid' ? 'hybrid' : 'desktop',
    politicalClimateId: normalizePoliticalClimateId(input.politicalClimateId),
    playerNames: {
      ...initial.playerNames,
      ...((input.playerNames && typeof input.playerNames === 'object') ? input.playerNames : {})
    },
    roleModes: {
      ...initial.roleModes,
      ...((input.roleModes && typeof input.roleModes === 'object') ? input.roleModes : {})
    },
    companionRoles: normalizeCompanionRoles(input.companionRoles),
    notesByRound: input.notesByRound && typeof input.notesByRound === 'object' ? input.notesByRound : {},
    votesByRound: input.votesByRound && typeof input.votesByRound === 'object' ? input.votesByRound : {},
    measuresByRound: input.measuresByRound && typeof input.measuresByRound === 'object' ? input.measuresByRound : {},
    vetoesByRound: input.vetoesByRound && typeof input.vetoesByRound === 'object' ? input.vetoesByRound : {},
    emergencyClauseChecksByRound: input.emergencyClauseChecksByRound && typeof input.emergencyClauseChecksByRound === 'object'
      ? input.emergencyClauseChecksByRound
      : {},
    externalDecisionsByRound: input.externalDecisionsByRound && typeof input.externalDecisionsByRound === 'object'
      ? input.externalDecisionsByRound
      : {},
    selections: input.selections && typeof input.selections === 'object' ? input.selections : {},
    lastResolution: Array.isArray(input.lastResolution) ? input.lastResolution : [],
    resources: {
      ...initial.resources,
      ...(input.resources || {})
    },
    flags: {
      ...initial.flags,
      ...(input.flags || {})
    },
    statuses: {
      ...initial.statuses,
      ...(input.statuses || {})
    },
    meta: {
      ...initial.meta,
      ...(input.meta || {})
    },
    matrix: Object.fromEntries(
      Object.keys(ROLE_META).map((roleId) => [
        roleId,
        {
          ...initial.matrix[roleId],
          ...((input.matrix && input.matrix[roleId]) || {})
        }
      ])
    ),
    log: Array.isArray(input.log) && input.log.length ? input.log : initial.log
  };
}

function encodePayload(data) {
  const json = JSON.stringify(data);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodePayload(raw) {
  if (!raw) return null;
  try {
    const normalized = raw.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '==='.slice((normalized.length + 3) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

function getBaseAppUrl() {
  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  return url;
}

function buildCompanionInvite(roleId, phoneMode = '1') {
  return {
    v: 1,
    s: state.sessionId,
    r: state.roundIndex,
    o: roleId,
    pm: String(phoneMode),
    pl: getRolePlayerLabel(roleId),
    sm: getSelectedSharedMeasureId(),
    pc: state.politicalClimateId,
    ed: ensureRoundExternalDecision(),
    vw: ROLE_VOTE_WEIGHTS[roleId].weight,
    vr: ROLE_VOTE_WEIGHTS[roleId].reason,
    rs: RESOURCE_KEYS.map((key) => state.resources[key]),
    f: FLAG_KEYS.map((key) => (state.flags[key] ? 1 : 0))
  };
}

function buildInviteUrl(roleId, phoneMode = '1') {
  const url = getBaseAppUrl();
  url.searchParams.set('phone', String(phoneMode));
  url.searchParams.set('payload', encodePayload(buildCompanionInvite(roleId, phoneMode)));
  return url.toString();
}

function buildCompanionSnapshot(invite) {
  const snapshot = createInitialState();
  snapshot.roundIndex = clamp(invite.r || 0, 0, ROUNDS.length - 1);
  RESOURCE_KEYS.forEach((key, index) => {
    const value = invite.rs && typeof invite.rs[index] === 'number'
      ? invite.rs[index]
      : snapshot.resources[key];
    snapshot.resources[key] = value;
  });
  FLAG_KEYS.forEach((key, index) => {
    snapshot.flags[key] = Boolean(invite.f && invite.f[index]);
  });
  snapshot.phoneMode = invite.pm || '1';
  snapshot.phonePlayerLabel = invite.pl || '';
  snapshot.selectedMeasureId = invite.sm || '';
  snapshot.politicalClimateId = normalizePoliticalClimateId(invite.pc || snapshot.politicalClimateId);
  snapshot.currentExternalDecision = invite.ed || null;
  snapshot.phoneVoteWeight = typeof invite.vw === 'number' ? invite.vw : 1;
  snapshot.phoneVoteWeightReason = invite.vr || '';
  updateStatuses(snapshot);
  return snapshot;
}

function buildQrMarkup(value) {
  if (typeof qrcode !== 'function') return '';
  try {
    const qr = qrcode(0, 'M');
    qr.addData(value);
    qr.make();
    return qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
  } catch {
    return '';
  }
}

function buildAnswerCode(sessionId, roundIndex, roleId, cardIndex) {
  const roundNumber = String(roundIndex + 1).padStart(2, '0');
  return `${sessionId}-${roundNumber}-${ROLE_SHORT_CODES[roleId]}-${cardIndex + 1}`;
}

function buildDetailedAnswerPackage(invite, payload) {
  return `VP2-${encodePayload({
    v: 2,
    s: invite.s,
    r: invite.r,
    o: invite.o,
    vc: payload.voteChoiceIndex,
    vr: payload.voteReason,
    cid: payload.cardId
  })}`;
}

function parseAnswerCode(rawCode) {
  const normalized = String(rawCode || '')
    .toUpperCase()
    .trim()
    .replace(/\s+/g, '');
  const match = normalized.match(/^([A-Z0-9]{4,8})-(\d{2})-([A-Z]{2})-(\d{1,2})$/);
  if (!match) return null;

  const [, sessionId, roundNumber, roleCode, cardNumber] = match;
  const roleId = ROLE_CODE_TO_ID[roleCode];
  if (!roleId) return null;

  return {
    sessionId,
    roleId,
    roundIndex: Number(roundNumber) - 1,
    cardIndex: Number(cardNumber) - 1
  };
}

function parseDetailedAnswerPackage(rawValue) {
  const normalized = String(rawValue || '').trim();
  if (!normalized.startsWith('VP2-')) return null;
  const payload = decodePayload(normalized.slice(4));
  if (!payload || payload.v !== 2 || !ROLE_META[payload.o]) return null;
  return {
    sessionId: payload.s,
    roundIndex: payload.r,
    roleId: payload.o,
    voteChoiceIndex: Number.isInteger(payload.vc) ? payload.vc : null,
    voteReason: typeof payload.vr === 'string' ? payload.vr : '',
    cardId: typeof payload.cid === 'string' ? payload.cid : ''
  };
}

function copyText(value) {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    return navigator.clipboard.writeText(value);
  }
  return Promise.reject(new Error('Clipboard API nicht verfügbar.'));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getRoundGuide(roundIndex = state.roundIndex) {
  return ROUND_GUIDES[Math.min(roundIndex, ROUND_GUIDES.length - 1)];
}

function getTeacherBriefing(roundIndex = state.roundIndex) {
  return ROUND_TEACHER_BRIEFINGS[Math.min(roundIndex, ROUND_TEACHER_BRIEFINGS.length - 1)];
}

function getRoundArgumentLens(roundIndex = state.roundIndex) {
  return ROUND_ARGUMENT_LENSES[Math.min(roundIndex, ROUND_ARGUMENT_LENSES.length - 1)];
}

function getDramaticCourtPrompt(roundIndex = state.roundIndex) {
  const teaching = getTeacherBriefing(roundIndex);
  const lens = getRoundArgumentLens(roundIndex);
  const leadRoleId = getLeadRoleId(roundIndex);
  const leadRole = ROLE_META[leadRoleId];

  return {
    interruption: `Der Gerichtspräsident unterbricht das Verfahren und sagt sinngemäß: Bevor hier weiter entschieden wird, will das Gericht hören, wie ${leadRole.label} die Lage deutet und ob hier gerade eher Rettungslogik oder Grenzlogik den Ton angibt.`,
    sceneFlow: [
      `${leadRole.label} eröffnet die Runde und nimmt Stellung zur Streitfrage: ${teaching.conflict}`,
      `Danach spricht die Seite von Lars Koch: ${lens.koch}`,
      `Danach folgt Nelsons Gegenangriff: ${lens.nelson}`
    ],
    theoryFocus: `Fragt euch jetzt ausdrücklich: Welche Position argumentiert eher utilitaristisch, also stärker mit dem Retten möglichst vieler Menschen? Welche Position argumentiert eher deontologisch oder rechtsstaatlich, also stärker mit Grenze, Würde und Verbot?`,
    attribution: `Ordnet eure eigenen Voten bewusst zu: Klingt euer Satz eher nach Lars Koch, eher nach Nelson oder eher nach einer richterlichen Abwägung?`,
    classAction: `Erst wenn diese drei Stimmen im Raum waren, geht ihr in die Abstimmung. Eure Stimmabgabe soll also wie der nächste Schritt im Verfahren wirken und nicht wie ein loses Meinungsbild.`
  };
}

function getPoliticalClimate(inputState = state) {
  return POLITICAL_CLIMATES[normalizePoliticalClimateId(inputState.politicalClimateId)] || POLITICAL_CLIMATES.grundlinie;
}

function isPoliticalContextVisible(inputState = state) {
  return Math.min(inputState.roundIndex, ROUNDS.length - 1) >= 4;
}

function getPoliticalDecisionContext(inputState = state) {
  const climate = getPoliticalClimate(inputState);
  return climate.recognizesEmergency
    ? `In dieser Partie ist die Regierung grundsätzlich offen für Ausnahmelogik. Das heißt nicht automatisch, dass ein Abschuss rechtmäßig ist. Es heißt nur: Die politische Spitze könnte versuchen, ihn als Ausnahme zu rechtfertigen.`
    : `In dieser Partie ist die Regierung grundsätzlich gegen Ausnahmelogik. Das heißt: Selbst unter massivem Druck soll die Verfassungsgrenze nicht politisch aufgeweicht werden.`;
}

function getRoundFacts(roundIndex = state.roundIndex) {
  return ROUND_CONCRETE_FACTS[Math.min(roundIndex, ROUND_CONCRETE_FACTS.length - 1)];
}

function getRoundSharedMeasures(roundIndex = state.roundIndex) {
  return ROUND_SHARED_MEASURES[Math.min(roundIndex, ROUND_SHARED_MEASURES.length - 1)];
}

function getRoundVetoRules(roundIndex = state.roundIndex) {
  return ROUND_VETO_RULES[Math.min(roundIndex, ROUND_VETO_RULES.length - 1)];
}

function getRoundNoteKey(roundIndex = state.roundIndex) {
  return String(roundIndex);
}

function setRoundNote(value) {
  state.notesByRound[getRoundNoteKey()] = value;
  saveState(state);
}

function getRoundVoteKey(roundIndex = state.roundIndex) {
  return String(roundIndex);
}

function getRoundMeasureKey(roundIndex = state.roundIndex) {
  return String(roundIndex);
}

function getRoundVetoKey(roundIndex = state.roundIndex) {
  return String(roundIndex);
}

function getRoundEmergencyKey(roundIndex = state.roundIndex) {
  return String(roundIndex);
}

function getRoundExternalDecisionKey(roundIndex = state.roundIndex) {
  return String(roundIndex);
}

function ensureRoundVotes(roundIndex = state.roundIndex) {
  const key = getRoundVoteKey(roundIndex);
  if (!state.votesByRound[key] || typeof state.votesByRound[key] !== 'object') {
    state.votesByRound[key] = {};
  }
  return state.votesByRound[key];
}

function getRoleVote(roleId, roundIndex = state.roundIndex) {
  const votes = state.votesByRound[getRoundVoteKey(roundIndex)];
  if (!votes || typeof votes !== 'object') {
    return { choiceIndex: null, reason: '' };
  }
  const vote = votes[roleId];
  return {
    choiceIndex: Number.isInteger(vote?.choiceIndex) ? vote.choiceIndex : null,
    reason: typeof vote?.reason === 'string' ? vote.reason : ''
  };
}

function setRoleVoteChoice(roleId, choiceIndex) {
  if (!ROLE_META[roleId]) return;
  const previousVote = getRoleVote(roleId);
  if (previousVote.choiceIndex === choiceIndex) return;
  const votes = ensureRoundVotes();
  votes[roleId] = {
    ...previousVote,
    choiceIndex
  };
  resetCurrentRoundAuthority();
  clearCurrentRoundSelections();
  saveState(state);
}

function setRoleVoteReason(roleId, value) {
  if (!ROLE_META[roleId]) return;
  const votes = ensureRoundVotes();
  votes[roleId] = {
    ...getRoleVote(roleId),
    reason: value.trimStart()
  };
  saveState(state);
}

function isVoteReasonValid(reason) {
  return String(reason || '').trim().length >= 10;
}

function getLeadRoleId(roundIndex = state.roundIndex) {
  const text = getTeacherBriefing(roundIndex).firstSpeaker.toLowerCase();
  if (text.includes('führungszentrum')) return 'fuehrungszentrum';
  if (text.includes('katastrophenschutz')) return 'katastrophenschutz';
  if (text.includes('ministerium')) return 'ministerium';
  if (text.includes('koch')) return 'koch';
  if (text.includes('nelson')) return 'nelson';
  if (text.includes('biegler')) return 'biegler';
  return 'fuehrungszentrum';
}

function getRoundVoteOutcome(roundIndex = state.roundIndex) {
  const teaching = getTeacherBriefing(roundIndex);
  const options = teaching.paths.map((path, index) => ({
    index,
    path,
    weight: 0,
    roles: [],
    reasons: []
  }));
  const missingRoles = [];

  ROLE_ORDER.forEach((roleId) => {
    const vote = getRoleVote(roleId, roundIndex);
    if (!Number.isInteger(vote.choiceIndex) || vote.choiceIndex < 0 || vote.choiceIndex >= options.length || !isVoteReasonValid(vote.reason)) {
      missingRoles.push(roleId);
      return;
    }

    const voteWeight = ROLE_VOTE_WEIGHTS[roleId].weight;
    const option = options[vote.choiceIndex];
    option.weight += voteWeight;
    option.roles.push(roleId);
    option.reasons.push({
      roleId,
      reason: vote.reason.trim()
    });
  });

  if (missingRoles.length) {
    return {
      complete: false,
      options,
      missingRoles,
      totalWeight: TOTAL_VOTE_WEIGHT
    };
  }

  const highestWeight = Math.max(...options.map((option) => option.weight));
  const tiedOptions = options.filter((option) => option.weight === highestWeight);
  let winner = tiedOptions[0];
  let tiebreakReason = 'Mehrheit nach Gewichtspunkten';

  if (tiedOptions.length > 1) {
    const leadRoleId = getLeadRoleId(roundIndex);
    const leadVote = getRoleVote(leadRoleId, roundIndex);
    const leadChoice = tiedOptions.find((option) => option.index === leadVote.choiceIndex);
    if (leadChoice) {
      winner = leadChoice;
      tiebreakReason = `Stimmgleichheit: Stichentscheid durch die zuerst sprechende Rolle (${ROLE_META[leadRoleId].label})`;
    } else {
      const highestRoleCount = Math.max(...tiedOptions.map((option) => option.roles.length));
      const roleCountWinner = tiedOptions.find((option) => option.roles.length === highestRoleCount);
      winner = roleCountWinner || tiedOptions[0];
      tiebreakReason = 'Stimmgleichheit: Entscheidung über die größere Zahl beteiligter Rollen';
    }
  }

  return {
    complete: true,
    options,
    missingRoles: [],
    totalWeight: TOTAL_VOTE_WEIGHT,
    winner,
    tiebreakReason
  };
}

function getSelectedSharedMeasureId(roundIndex = state.roundIndex) {
  return state.measuresByRound?.[getRoundMeasureKey(roundIndex)] || '';
}

function getSelectedSharedMeasure(roundIndex = state.roundIndex) {
  const selectedId = getSelectedSharedMeasureId(roundIndex);
  return getRoundSharedMeasures(roundIndex).find((measure) => measure.id === selectedId) || null;
}

function getRoundExternalDecision(roundIndex = state.roundIndex, inputState = state) {
  const key = getRoundExternalDecisionKey(roundIndex);
  if (inputState?.externalDecisionsByRound && Object.prototype.hasOwnProperty.call(inputState.externalDecisionsByRound, key)) {
    return inputState.externalDecisionsByRound[key];
  }
  if (roundIndex === inputState?.roundIndex && Object.prototype.hasOwnProperty.call(inputState || {}, 'currentExternalDecision')) {
    return inputState.currentExternalDecision;
  }
  return null;
}

function ensureRoundExternalDecision(roundIndex = state.roundIndex) {
  const key = getRoundExternalDecisionKey(roundIndex);
  if (Object.prototype.hasOwnProperty.call(state.externalDecisionsByRound, key)) {
    return state.externalDecisionsByRound[key];
  }

  if (roundIndex < 2 || Math.random() < 0.4) {
    state.externalDecisionsByRound[key] = null;
    return null;
  }

  const politicalClimate = getPoliticalClimate();
  const institutionKey = politicalClimate.recognizesEmergency
    ? (Math.random() < 0.58 ? 'minister' : 'court')
    : (Math.random() < 0.65 ? 'court' : 'minister');
  const template = chooseRandom(EXTERNAL_DECISION_TEMPLATES[institutionKey]);
  const surface = Math.random() < 0.34 ? 'both' : 'desktop';

  const decision = {
    ...template,
    surface
  };

  state.externalDecisionsByRound[key] = decision;
  return decision;
}

function shouldShowExternalDecision(decision, surface = 'desktop') {
  if (!decision) return false;
  if (surface === 'desktop') return true;
  return decision.surface === 'both';
}

function getEmergencyClauseCheck(roundIndex = state.roundIndex) {
  return state.emergencyClauseChecksByRound?.[getRoundEmergencyKey(roundIndex)] || null;
}

function shouldTriggerEmergencyClause(roundIndex = state.roundIndex, selections = state.selections) {
  const selectedMeasureId = getSelectedSharedMeasureId(roundIndex);
  const cardTriggered = ROLE_ORDER.some((roleId) => EMERGENCY_TRIGGER_CARD_IDS.has(selections[roleId]));
  const measureTriggered = EMERGENCY_TRIGGER_MEASURE_IDS.has(selectedMeasureId);
  return roundIndex >= 5 && (cardTriggered || measureTriggered);
}

function hasVisiblePoliticalCover(roundIndex = state.roundIndex, selections = state.selections) {
  const measureId = getSelectedSharedMeasureId(roundIndex);
  const cardSignal = ROLE_ORDER.some((roleId) => COVER_SIGNAL_CARD_IDS.has(selections[roleId]));
  const measureSignal = EMERGENCY_TRIGGER_MEASURE_IDS.has(measureId);
  return cardSignal || measureSignal;
}

function getRoundExternalDecisionImpact(roundIndex = state.roundIndex, inputState = state) {
  const decision = getRoundExternalDecision(roundIndex, inputState);
  const exceptionPath = shouldTriggerEmergencyClause(roundIndex, inputState.selections || {});
  const politicalCover = hasVisiblePoliticalCover(roundIndex, inputState.selections || {});

  if (!decision) {
    return {
      event: null,
      exceptionPath,
      allowed: true,
      chanceModifier: 0,
      blockingReason: '',
      conditionText: ''
    };
  }

  if (!exceptionPath) {
    return {
      event: decision,
      exceptionPath: false,
      allowed: true,
      chanceModifier: 0,
      blockingReason: '',
      conditionText: ''
    };
  }

  if (decision.effectType === 'block_exception_clause') {
    return {
      event: decision,
      exceptionPath: true,
      allowed: false,
      chanceModifier: 0,
      blockingReason: `${decision.institution}: ${decision.title}. ${decision.ruleText}`,
      conditionText: ''
    };
  }

  if (decision.effectType === 'require_cover_for_exception' && !politicalCover) {
    return {
      event: decision,
      exceptionPath: true,
      allowed: false,
      chanceModifier: 0,
      blockingReason: `${decision.institution}: ${decision.title}. ${decision.ruleText}`,
      conditionText: 'Für diesen Ausnahmeweg braucht ihr zuerst sichtbar politische Deckung oder eine klar erkennbare Freigabelinie.'
    };
  }

  return {
    event: decision,
    exceptionPath: true,
    allowed: true,
      chanceModifier: decision.effectType === 'boost_exception_clause' ? (decision.chanceModifier || 0) : 0,
      blockingReason: '',
      conditionText: decision.effectType === 'require_cover_for_exception'
      ? 'Die nötige politische Deckung ist in dieser Runde sichtbar vorhanden. Der Weg bleibt deshalb offen.'
      : decision.effectType === 'boost_exception_clause'
      ? `${decision.institution} verschiebt die politische Ausnahmechance dieser Runde leicht zugunsten einer Freigabe.`
      : ''
    };
}

function hasActivatedEmergencyClause(inputState = state) {
  return Object.values(inputState.emergencyClauseChecksByRound || {}).some((entry) => entry?.activated);
}

function resolveEmergencyClauseForRound(roundIndex = state.roundIndex) {
  if (!shouldTriggerEmergencyClause(roundIndex)) {
    return null;
  }

  const existing = getEmergencyClauseCheck(roundIndex);
  if (existing) return existing;

  const climate = getPoliticalClimate();
  const externalImpact = getRoundExternalDecisionImpact(roundIndex);
  let roll = null;
  let activated = false;
  const threshold = clamp(climate.activationChance + externalImpact.chanceModifier, 0, 0.95);

  if (climate.recognizesEmergency) {
    roll = Math.random();
    activated = roll < threshold;
  }

  const result = {
    attempted: true,
    climateId: climate.id,
    activated,
    roll,
    threshold,
    externalDecisionId: externalImpact.event?.id || ''
  };

  state.emergencyClauseChecksByRound[getRoundEmergencyKey(roundIndex)] = result;
  return result;
}

function setSelectedSharedMeasure(measureId) {
  const available = getRoundSharedMeasures();
  if (!available.some((measure) => measure.id === measureId)) return;
  if (getSelectedSharedMeasureId() === measureId) return;
  state.measuresByRound[getRoundMeasureKey()] = measureId;
  resetCurrentRoundAuthority();
  clearCurrentRoundSelections();
  saveState(state);
}

function ensureRoundVetoes(roundIndex = state.roundIndex) {
  const key = getRoundVetoKey(roundIndex);
  if (!state.vetoesByRound[key] || typeof state.vetoesByRound[key] !== 'object') {
    state.vetoesByRound[key] = {};
  }
  return state.vetoesByRound[key];
}

function getRoleVeto(roleId, roundIndex = state.roundIndex) {
  const vetoes = state.vetoesByRound[getRoundVetoKey(roundIndex)];
  if (!vetoes || typeof vetoes !== 'object') {
    return { decision: '', reason: '' };
  }
  const veto = vetoes[roleId];
  return {
    decision: typeof veto?.decision === 'string' ? veto.decision : '',
    reason: typeof veto?.reason === 'string' ? veto.reason : ''
  };
}

function setRoleVetoDecision(roleId, decision) {
  const allowed = ['approve', 'conditional', 'block'];
  if (!ROLE_META[roleId] || !allowed.includes(decision)) return;
  const previousVeto = getRoleVeto(roleId);
  if (previousVeto.decision === decision) return;
  const vetoes = ensureRoundVetoes();
  vetoes[roleId] = {
    ...previousVeto,
    decision
  };
  clearCurrentRoundSelections();
  saveState(state);
}

function setRoleVetoReason(roleId, value) {
  if (!ROLE_META[roleId]) return;
  const previousVeto = getRoleVeto(roleId);
  if (previousVeto.reason === value.trimStart()) return;
  const vetoes = ensureRoundVetoes();
  vetoes[roleId] = {
    ...previousVeto,
    reason: value.trimStart()
  };
  clearCurrentRoundSelections();
  saveState(state);
}

function resetCurrentRoundAuthority(roundIndex = state.roundIndex) {
  delete state.vetoesByRound[getRoundVetoKey(roundIndex)];
}

function clearCurrentRoundSelections() {
  state.selections = {};
}

function getRoundAuthorityOutcome(roundIndex = state.roundIndex) {
  const voteOutcome = getRoundVoteOutcome(roundIndex);
  if (!voteOutcome.complete || !voteOutcome.winner) {
    return {
      ready: false,
      allowed: false,
      pendingVote: true,
      missingRoles: [],
      blockedBy: [],
      conditionalBy: [],
      approvedBy: [],
      winner: voteOutcome.winner || null
    };
  }

  const rules = getRoundVetoRules(roundIndex);
  const missingRoles = [];
  const blockedBy = [];
  const conditionalBy = [];
  const approvedBy = [];

  rules.forEach((rule) => {
    const veto = getRoleVeto(rule.roleId, roundIndex);
    if (!['approve', 'conditional', 'block'].includes(veto.decision)) {
      missingRoles.push(rule.roleId);
      return;
    }
    if (veto.decision !== 'approve' && !isVoteReasonValid(veto.reason)) {
      missingRoles.push(rule.roleId);
      return;
    }
    if (veto.decision === 'block') {
      blockedBy.push({ roleId: rule.roleId, reason: veto.reason.trim() });
    } else if (veto.decision === 'conditional') {
      conditionalBy.push({ roleId: rule.roleId, reason: veto.reason.trim() });
    } else {
      approvedBy.push({ roleId: rule.roleId });
    }
  });

  if (missingRoles.length) {
    return {
      ready: false,
      allowed: false,
      pendingVote: false,
      missingRoles,
      blockedBy,
      conditionalBy,
      approvedBy,
      winner: voteOutcome.winner
    };
  }

  if (blockedBy.length) {
    return {
      ready: true,
      allowed: false,
      status: 'blocked',
      pendingVote: false,
      missingRoles: [],
      blockedBy,
      conditionalBy,
      approvedBy,
      winner: voteOutcome.winner
    };
  }

  return {
    ready: true,
    allowed: true,
    status: conditionalBy.length ? 'conditional' : 'approved',
    pendingVote: false,
    missingRoles: [],
    blockedBy,
    conditionalBy,
    approvedBy,
    winner: voteOutcome.winner
  };
}

function setPlayerName(roleId, value) {
  if (!ROLE_META[roleId]) return;
  state.playerNames[roleId] = value.trimStart();
  saveState(state);
}

function setRoleMode(roleId, value) {
  if (!ROLE_META[roleId]) return;
  state.roleModes[roleId] = value === 'group' ? 'group' : 'player';
  saveState(state);
}

function getPlayerName(roleId) {
  return (state.playerNames[roleId] || '').trim();
}

function getRoleMode(roleId) {
  return state.roleModes[roleId] === 'group' ? 'group' : 'player';
}

function getPlayMode() {
  return state.playMode === 'hybrid' ? 'hybrid' : 'desktop';
}

function setPlayMode(mode) {
  state.playMode = mode === 'hybrid' ? 'hybrid' : 'desktop';
  if (state.playMode === 'desktop') {
    state.companionRoles = normalizeCompanionRoles();
  }
  saveState(state);
}

function getRolePlayerLabel(roleId) {
  return getRoleMode(roleId) === 'group'
    ? 'gemeinsam in der Gruppe'
    : getPlayerName(roleId) || 'Name fehlt noch';
}

function getMissingPlayerNameRoleIds() {
  return ROLE_ORDER.filter((roleId) => getRoleMode(roleId) === 'player' && !getPlayerName(roleId));
}

function canStartGame() {
  return getMissingPlayerNameRoleIds().length === 0;
}

function startGame() {
  if (!canStartGame()) {
    render();
    return;
  }
  state.setupComplete = true;
  gameOverlayOpen = true;
  saveState(state);
  render();
}

function openGameOverlay() {
  if (!state.setupComplete) return;
  gameOverlayOpen = true;
  render();
}

function openCompanionSetup() {
  if (!state.setupComplete) {
    roundFeedback.textContent = 'Startet zuerst die Partie. Danach könnt ihr die Handy-Version direkt aus dem Unterrichtsstart öffnen.';
    roundFeedback.className = 'round-feedback tone-danger';
    render();
    return;
  }
  gameOverlayOpen = true;
  render();
  if (companionSectionAnchor) {
    companionSectionAnchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function scrollToPhoneGuide() {
  if (phoneGuide) {
    phoneGuide.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function openCompanionEntry() {
  if (state.setupComplete && getPlayMode() === 'hybrid') {
    openCompanionSetup();
    return;
  }
  scrollToPhoneGuide();
}

function closeGameOverlay() {
  gameOverlayOpen = false;
  render();
}

function getMissingRoleIds() {
  return ROLE_ORDER.filter((roleId) => !state.selections[roleId]);
}

function getRoundScenarioText(round, guide) {
  return `${guide.situation} ${guide.decisionNeed}`;
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
  const politicalClimate = getPoliticalClimate(state);
  if (state.flags.shotByKoch) {
    state.statuses.planeStatus = 'Abgeschossen um 20.21 Uhr';
  } else if (state.roundIndex >= 9) {
    state.statuses.planeStatus = 'Zielanflug auf das Stadion verdichtet';
  } else if (state.roundIndex >= 4) {
    state.statuses.planeStatus = 'Entführung als belastbare Lage';
  } else {
    state.statuses.planeStatus = 'Entführt, Ziel noch unscharf';
  }

  if (state.flags.ministryRelease && hasActivatedEmergencyClause(state)) {
    state.statuses.rulesStatus = 'Notstandsklausel politisch aktiviert';
  } else if (state.flags.ministryRelease) {
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

  state.statuses.governmentStatus = `${politicalClimate.label} · ${politicalClimate.coalition}`;
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

  const trolley = [
    state.ending.type === 'abschuss'
      ? 'Die Partie endet nun sehr nah am Trolleyproblem: Wenige werden aktiv getötet, um sehr viele zu retten.'
      : 'Die Partie zeigt, dass das Trolleyproblem auch im Unterlassen steckt: Nicht-Handeln kann eine Katastrophe geschehen lassen.',
    'Gleichzeitig bleibt der Unterschied zum Gedankenexperiment zentral: Hier stellt nicht privat jemand eine Weiche, sondern der Staat müsste über das aktive Töten unschuldiger Menschen entscheiden.',
    'Darum geht es nicht nur um Zahlen, sondern auch um Menschenwürde, Verfassung und die Frage, was ein Staat selbst im Extremfall nicht tun darf.'
  ].join(' ');

  const koch = [
    state.ending.type === 'abschuss'
      ? 'In der Logik von Lars Koch würde diese Partie so klingen: Ich habe nicht kalt gerechnet, sondern versucht, eine konkret drohende Massentötung zu verhindern.'
      : 'In der Logik von Lars Koch würde diese Partie so klingen: Der Staat hat mich in eine Lage laufen lassen, in der jede Entscheidung zerstörerisch wurde.',
    'Er würde betonen, dass alle Menschen gleich viel wert sind, dass aber die Gefahr für das Stadion unmittelbar und real vor ihm stand.',
    'Seine Selbstrechtfertigung richtet sich deshalb nicht auf Gesetzestreue, sondern auf Rettung unter extremer Zeitnot.'
  ].join(' ');

  const judgeAcquit = [
    'In einer freisprechenden richterlichen Schlusslogik würde der Gerichtspräsident hervorheben, dass der Angeklagte in einer extremen Pflichtenkollision stand.',
    'Er könnte sagen: Der Staat darf keine einfachen Heldenlösungen verlangen, wenn er selbst die Lage nicht rechtzeitig beherrscht hat.',
    'Ein Freispruch würde dann nicht heißen, dass der Abschuss rechtmäßig oder gut war, sondern dass die individuelle Schuld hinter der Extremlage und der zersplitterten Verantwortung zurücktritt.'
  ].join(' ');

  const judgeConvict = [
    'In einer verurteilenden richterlichen Schlusslogik würde der Gerichtspräsident betonen, dass auch die Extremminute die Verfassungsgrenze nicht aufhebt.',
    'Er könnte sagen: Wer unschuldige Menschen an Bord gezielt tötet, überschreitet eine Grenze, die der Staat gerade in der Krise achten muss.',
    'Eine Verurteilung würde dann nicht bedeuten, dass die Bedrohung klein war, sondern dass der Rechtsstaat sich auch unter maximalem Druck nicht selbst entgrenzen darf.'
  ].join(' ');

  const classroomIntegration = [
    'Die Schlussphase dieses Spiels liest eure Voten deshalb nicht wie ein Arbeitsblatt, sondern wie die letzte Zuspitzung des Verfahrens.',
    'Jetzt lässt sich rückblickend prüfen: Wer argumentierte eher utilitaristisch mit der Rettung möglichst vieler Menschen, wer eher deontologisch mit Menschenwürde, Verbot und Grenze?',
    'Und genau daran knüpft die Endauswertung an: Welche Sätze klangen nach Lars Koch, welche nach Nelson und welche schon nach einer richterlichen Schlussbegründung?'
  ].join(' ');

  return { indictment, defense, trolley, koch, judgeAcquit, judgeConvict, classroomIntegration };
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
    return hydrateState(parsed);
  } catch {
    return null;
  }
}

function resetState() {
  localStorage.removeItem(STORAGE_KEY);
  state = createInitialState();
  gameOverlayOpen = false;
  render();
  saveState(state);
}

function selectCard(roleId, cardId) {
  if (state.finished) return;
  if (!state.setupComplete) {
    roundFeedback.textContent = 'Startet die Partie zuerst oben im Unterrichtsstart-Modus.';
    roundFeedback.className = 'round-feedback tone-danger';
    return;
  }
  const voteOutcome = getRoundVoteOutcome();
  if (!voteOutcome.complete) {
    roundFeedback.textContent = 'Gebt zuerst für alle sechs Rollen das Kurzvotum ab. Erst der automatisch erzeugte Rundenentscheid schaltet die Auswahlkarten frei.';
    roundFeedback.className = 'round-feedback tone-danger';
    return;
  }
  if (!getSelectedSharedMeasure()) {
    roundFeedback.textContent = 'Wählt zuerst den gemeinsamen Krisenbeschluss dieser Runde. Erst danach werden die Auswahlkarten freigeschaltet.';
    roundFeedback.className = 'round-feedback tone-danger';
    return;
  }
  const authorityOutcome = getRoundAuthorityOutcome();
  if (!authorityOutcome.ready) {
    roundFeedback.textContent = 'Kärtchenlegen geht erst weiter, wenn die Rollen mit Sonderrecht den Mehrheitsweg geprüft haben.';
    roundFeedback.className = 'round-feedback tone-danger';
    return;
  }
  if (!authorityOutcome.allowed) {
    roundFeedback.textContent = 'Der Mehrheitsweg ist aktuell blockiert. Solange das Veto steht, bleiben die Auswahlkarten gesperrt.';
    roundFeedback.className = 'round-feedback tone-danger';
    return;
  }
  state.selections[roleId] = cardId;
  saveState(state);
  render();
}

function toggleCompanionRole(roleId, enabled) {
  if (!ROLE_META[roleId]) return;
  state.companionRoles[roleId] = enabled;
  saveState(state);
  render();
}

function applyCompanionAnswer(roleId, rawCode) {
  if (state.finished) return;

  const detailedPackage = parseDetailedAnswerPackage(rawCode);
  if (detailedPackage) {
    if (detailedPackage.sessionId !== state.sessionId) {
      roundFeedback.textContent = 'Das Rollenpaket gehört zu einer anderen Partie.';
      roundFeedback.className = 'round-feedback tone-danger';
      return;
    }

    if (detailedPackage.roundIndex !== state.roundIndex) {
      roundFeedback.textContent = 'Das Rollenpaket gehört nicht zur aktuellen Runde. Für jede Runde braucht es einen frischen QR-Code.';
      roundFeedback.className = 'round-feedback tone-danger';
      return;
    }

    if (detailedPackage.roleId !== roleId) {
      roundFeedback.textContent = `Das Rollenpaket gehört zu ${ROLE_META[detailedPackage.roleId].label}, nicht zu ${ROLE_META[roleId].label}.`;
      roundFeedback.className = 'round-feedback tone-danger';
      return;
    }

    if (!Number.isInteger(detailedPackage.voteChoiceIndex) || detailedPackage.voteChoiceIndex < 0 || detailedPackage.voteChoiceIndex > 2) {
      roundFeedback.textContent = 'Im Rollenpaket fehlt eine gültige Abstimmungsentscheidung.';
      roundFeedback.className = 'round-feedback tone-danger';
      return;
    }

    if (!isVoteReasonValid(detailedPackage.voteReason)) {
      roundFeedback.textContent = 'Im Rollenpaket fehlt ein aussagekräftiges Kurzvotum dieser Rolle.';
      roundFeedback.className = 'round-feedback tone-danger';
      return;
    }

    const availableCards = getAvailableCards(roleId, state);
    const selectedCard = availableCards.find((card) => card.id === detailedPackage.cardId)
      || CARD_LIBRARY[roleId].find((card) => card.id === detailedPackage.cardId);
    if (!selectedCard) {
      roundFeedback.textContent = 'Die Kartenwahl aus dem Rollenpaket passt nicht mehr zur aktuellen Kartenhand dieser Rolle.';
      roundFeedback.className = 'round-feedback tone-danger';
      return;
    }

    const votes = ensureRoundVotes();
    votes[roleId] = {
      choiceIndex: detailedPackage.voteChoiceIndex,
      reason: detailedPackage.voteReason.trim()
    };
    state.selections[roleId] = selectedCard.id;
    roundFeedback.textContent = `Handy-Paket übernommen: ${ROLE_META[roleId].label} stimmt für Weg ${detailedPackage.voteChoiceIndex + 1} und legt „${selectedCard.title}“.`;
    roundFeedback.className = 'round-feedback tone-safe';
    saveState(state);
    render();
    return;
  }

  const parsed = parseAnswerCode(rawCode);
  if (!parsed) {
    roundFeedback.textContent = 'Der Antwortcode ist nicht lesbar. Nutzt entweder den kurzen Karten-Code oder das ausführliche Rollenpaket direkt unverändert.';
    roundFeedback.className = 'round-feedback tone-danger';
    return;
  }

  if (parsed.sessionId !== state.sessionId) {
    roundFeedback.textContent = 'Der Antwortcode gehört zu einer anderen Partie.';
    roundFeedback.className = 'round-feedback tone-danger';
    return;
  }

  if (parsed.roundIndex !== state.roundIndex) {
    roundFeedback.textContent = 'Der Antwortcode gehört nicht zur aktuellen Runde. Für jede Runde braucht es einen frischen QR-Code.';
    roundFeedback.className = 'round-feedback tone-danger';
    return;
  }

  if (parsed.roleId !== roleId) {
    roundFeedback.textContent = `Der Antwortcode gehört zu ${ROLE_META[parsed.roleId].label}, nicht zu ${ROLE_META[roleId].label}.`;
    roundFeedback.className = 'round-feedback tone-danger';
    return;
  }

  const availableCards = getAvailableCards(roleId, state);
  const selectedCard = availableCards[parsed.cardIndex];
  if (!selectedCard) {
    roundFeedback.textContent = 'Die Handy-Auswahl passt nicht mehr zur aktuellen Kartenhand dieser Rolle.';
    roundFeedback.className = 'round-feedback tone-danger';
    return;
  }

  state.selections[roleId] = selectedCard.id;
  roundFeedback.textContent = `Handy-Auswahl übernommen: ${ROLE_META[roleId].label} legt „${selectedCard.title}“.`;
  roundFeedback.className = 'round-feedback tone-safe';
  saveState(state);
  render();
}

function resolveRound() {
  if (state.finished) return;

  if (!state.setupComplete) {
    roundFeedback.textContent = 'Die Partie wurde noch nicht gestartet. Richtet zuerst oben die Rollen ein und drückt dann „Spiel starten“.';
    roundFeedback.className = 'round-feedback tone-danger';
    return;
  }

  const selectedMeasure = getSelectedSharedMeasure();
  if (!selectedMeasure) {
    roundFeedback.textContent = 'Vor der Auswertung fehlt noch der gemeinsame Krisenbeschluss dieser Runde.';
    roundFeedback.className = 'round-feedback tone-danger';
    return;
  }

  const authorityOutcome = getRoundAuthorityOutcome();
  if (!authorityOutcome.ready) {
    roundFeedback.textContent = 'Vor der Auswertung müssen die Rollen mit Sonderrecht den Mehrheitsweg noch prüfen.';
    roundFeedback.className = 'round-feedback tone-danger';
    return;
  }
  if (!authorityOutcome.allowed) {
    roundFeedback.textContent = 'Vor der Auswertung muss zuerst das blockierende Veto aufgehoben oder die Abstimmung geändert werden.';
    roundFeedback.className = 'round-feedback tone-danger';
    return;
  }

  const missingRoles = ROLE_ORDER.filter((roleId) => !state.selections[roleId]);
  if (missingRoles.length > 0) {
    const names = missingRoles.map((roleId) => ROLE_META[roleId].short).join(', ');
    roundFeedback.textContent = `Vor „7. Runde auswerten“ fehlen noch Karten für: ${names}.`;
    roundFeedback.className = 'round-feedback tone-danger';
    return;
  }

  const externalImpact = getRoundExternalDecisionImpact();
  if (!externalImpact.allowed) {
    roundFeedback.textContent = `Ein externer Richtungsentscheid blockiert diese Runde: ${externalImpact.blockingReason}`;
    roundFeedback.className = 'round-feedback tone-danger';
    return;
  }

  const resolutionLines = [];
  const emergencyClauseResult = resolveEmergencyClauseForRound();
  if (externalImpact.event && externalImpact.exceptionPath) {
    resolutionLines.push(`${externalImpact.event.institution}: ${externalImpact.event.title}`);
  }

  selectedMeasure.effect(state);
  resolutionLines.push(`Gemeinsamer Krisenbeschluss: ${selectedMeasure.title}`);
  resolutionLines.push(
    authorityOutcome.status === 'conditional'
      ? 'Sonderrechte: Mehrheitsweg nur unter Bedingungen freigegeben'
      : 'Sonderrechte: Mehrheitsweg freigegeben'
  );

  if (authorityOutcome.status === 'conditional') {
    adjustResource(state, 'legalRisk', 1);
    adjustResource(state, 'commandConsensus', 1);
    authorityOutcome.conditionalBy.forEach((entry) => {
      addLogEntry(state, `${ROLE_META[entry.roleId].label} gibt den Mehrheitsweg nur unter Bedingungen frei: ${entry.reason}`);
    });
  }

  for (const roleId of ROLE_ORDER) {
    const selectedId = state.selections[roleId];
    const cards = getAvailableCards(roleId, state);
    const card = cards.find((entry) => entry.id === selectedId) || CARD_LIBRARY[roleId].find((entry) => entry.id === selectedId);
    if (!card) continue;
    card.effect(state);
    resolutionLines.push(`${ROLE_META[roleId].short}: ${card.title}`);
  }

  if (emergencyClauseResult) {
    const climate = POLITICAL_CLIMATES[emergencyClauseResult.climateId] || getPoliticalClimate();
    if (emergencyClauseResult.activated) {
      setFlag(state, 'ministryRelease', true);
      adjustResource(state, 'commandConsensus', 1);
      resolutionLines.push(`Notstandsklausel: ${climate.label} lässt die Ausnahme politisch greifen`);
      addLogEntry(
        state,
        `${climate.label} lässt den übergesetzlichen Notstand in dieser Runde politisch greifen. Zufallswurf ${Math.round((emergencyClauseResult.roll || 0) * 100)} gegen Schwelle ${Math.round(emergencyClauseResult.threshold * 100)}.`
      );
    } else {
      setFlag(state, 'ministryRelease', false);
      adjustResource(state, 'legalRisk', 1);
      resolutionLines.push(`Notstandsklausel: ${climate.label} lässt die Ausnahme nicht greifen`);
      addLogEntry(
        state,
        climate.recognizesEmergency
          ? `${climate.label} erkennt den übergesetzlichen Notstand zwar grundsätzlich an, aber in dieser Runde greift die Klausel politisch nicht. Zufallswurf ${Math.round((emergencyClauseResult.roll || 0) * 100)} gegen Schwelle ${Math.round(emergencyClauseResult.threshold * 100)}.`
          : `${climate.label} lehnt den übergesetzlichen Notstand politisch ab. Deshalb greift die Klausel in dieser Runde nicht.`
      );
    }
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
  roundFeedback.textContent = `Die Runde wurde ausgewertet. Lest jetzt die neue Lage, besprecht die neue Leitfrage und wählt dann erneut sechs Karten.`;
  roundFeedback.className = 'round-feedback tone-safe';
  saveState(state);
  render();
}

function renderStatusStrip() {
  const round = ROUNDS[Math.min(state.roundIndex, ROUNDS.length - 1)];
  const politicalClimate = getPoliticalClimate();
  const politicalVisible = isPoliticalContextVisible();
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
      label: politicalVisible ? 'Regierung' : 'Politik',
      value: politicalVisible ? politicalClimate.label.replace('Bundesregierung ', '') : 'noch offen',
      detail: politicalVisible ? politicalClimate.short : 'wird erst im Verlauf sichtbar'
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
  const teaching = getTeacherBriefing();
  const facts = getRoundFacts();
  const politicalClimate = getPoliticalClimate();
  const politicalVisible = isPoliticalContextVisible();
  const emergencyCheck = getEmergencyClauseCheck();
  const externalDecision = ensureRoundExternalDecision();
  const externalImpact = getRoundExternalDecisionImpact();
  const resolutionSummary = state.lastResolution.length
    ? `<div class="briefing-pod"><strong>Was in der letzten Runde entschieden wurde</strong><span>${state.lastResolution.join(' | ')}</span></div>`
    : '';

  briefingCard.innerHTML = `
    <div class="briefing-frame">
      <div class="timeline-chip">Lagefenster der Runde</div>
      <div class="timeline-chip">T - ${round.minute} Minuten</div>
      <h3>${round.title}</h3>
      <p>${teaching.happened}</p>
      <div class="briefing-fact-grid">
        ${facts.map((fact) => `
          <article class="briefing-fact-card">
            <strong>${fact.label}</strong>
            <span>${fact.value}</span>
          </article>
        `).join('')}
      </div>
      <div class="briefing-grid">
        <div class="briefing-pod">
          <strong>Was ist passiert?</strong>
          <span>${teaching.happened}</span>
        </div>
        <div class="briefing-pod">
          <strong>Was wissen wir sicher?</strong>
          <span>${teaching.known}</span>
        </div>
        <div class="briefing-pod">
          <strong>Was ist noch unklar?</strong>
          <span>${teaching.unclear}</span>
        </div>
        <div class="briefing-pod">
          <strong>Was droht, wenn ihr jetzt nicht klar handelt?</strong>
          <span>${teaching.risk}</span>
        </div>
        <div class="briefing-pod">
          <strong>Was ist die Streitfrage?</strong>
          <span>${teaching.conflict}</span>
        </div>
        <div class="briefing-pod">
          <strong>Worüber müsst ihr am Ende dieser Runde abstimmen?</strong>
          <span>${teaching.decisionTask}</span>
        </div>
        <div class="briefing-pod">
          <strong>Welche Rolle muss zuerst sprechen?</strong>
          <span>${teaching.firstSpeaker}</span>
        </div>
        ${politicalVisible ? `
          <div class="briefing-pod">
            <strong>Welche fiktive Bundesregierung regiert in dieser Partie?</strong>
            <span>${politicalClimate.label} - ${politicalClimate.coalition}. ${politicalClimate.note}</span>
          </div>
          <div class="briefing-pod">
            <strong>Was ist mit dem übergesetzlichen Notstand gemeint?</strong>
            <span>${EXTRAORDINARY_EMERGENCY_EXPLAINER}</span>
          </div>
          <div class="briefing-pod">
            <strong>Was bedeutet diese Regierungslinie für eure Entscheidungen?</strong>
            <span>${politicalClimate.studentMeaning} ${getPoliticalDecisionContext()}</span>
          </div>
          <div class="briefing-pod">
            <strong>Was heißt das konkret für das Ministerium?</strong>
            <span>${politicalClimate.ministryLine} ${politicalClimate.recognizesEmergency
              ? `Wenn eure Gruppe später wirklich auf Ausnahmefreigabe oder Abschuss zusteuert, prüft die App einmal per Zufall, ob diese Regierung die Klausel in genau dieser Runde politisch wirksam werden lässt (${Math.round(politicalClimate.activationChance * 100)} % Chance).`
              : 'Auch wenn einzelne Rollen später auf Ausnahmefreigabe drängen, bleibt diese Regierung politisch bei der Verfassungsgrenze.'}</span>
          </div>
        ` : `
          <div class="briefing-pod">
            <strong>Wie ist die politische Rückendeckung gerade?</strong>
            <span>Das bleibt am Anfang bewusst noch im Hintergrund. In den ersten Runden arbeitet ihr nur mit Lage, Zeitdruck, Verantwortung und Befehlskette. Erst später wird sichtbar, welche Regierungslinie das Ministerium tatsächlich trägt.</span>
          </div>
        `}
        ${externalDecision ? `
          <div class="briefing-pod">
            <strong>Neue Einspielung ins Lagezentrum</strong>
            <span>${externalDecision.institution}: ${externalDecision.title}. ${externalDecision.summary} ${externalDecision.ruleText}</span>
          </div>
        ` : ''}
        ${externalDecision ? `
          <div class="briefing-pod">
            <strong>Was bedeutet diese Einspielung jetzt konkret?</strong>
            <span>${externalImpact.exceptionPath
              ? externalImpact.allowed
                ? (externalImpact.conditionText || 'Diese Einspielung lenkt eure Runde, blockiert sie aber aktuell nicht.')
                : externalImpact.blockingReason
              : 'Diese Einspielung liegt jetzt im Lagezentrum. Sie wird erst dann scharf, wenn eure Gruppe wirklich in eine Ausnahme- oder Abschusslogik hineingeht.'}</span>
          </div>
        ` : ''}
        ${emergencyCheck ? `
          <div class="briefing-pod">
            <strong>Letzter Klausel-Check</strong>
            <span>${emergencyCheck.activated
              ? 'In dieser Runde ist die Notstandsklausel politisch wirksam geworden.'
              : 'In dieser Runde ist die Notstandsklausel politisch nicht wirksam geworden.'}</span>
          </div>
        ` : ''}
        ${resolutionSummary}
      </div>
      <div class="briefing-options">
        <strong>Welche drei Wege stehen euch offen?</strong>
        <div class="briefing-action-grid">
          ${teaching.paths.map((path, index) => `
            <article class="briefing-action-card">
              <strong>Weg ${index + 1}</strong>
              <span>${path}</span>
            </article>
          `).join('')}
        </div>
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

function renderRoleAssignmentPanel() {
  roleAssignmentPanel.innerHTML = ROLE_ORDER.map((roleId) => {
    const role = ROLE_META[roleId];
    const assignment = ROLE_ASSIGNMENTS[roleId];
    const playerName = state.playerNames[roleId] || '';
    const roleMode = getRoleMode(roleId);
    return `
      <article class="assignment-card">
        <span class="assignment-slot">${assignment.slot}</span>
        <h3><span class="role-accent" style="background:${role.color}"></span>${role.label}</h3>
        <p>${role.subtitle}</p>
        <p>${assignment.duty}</p>
        <label class="assignment-label" for="roleMode-${roleId}">Wie wird diese Rolle gespielt?</label>
        <select
          id="roleMode-${roleId}"
          class="assignment-select"
          data-role-mode="${roleId}"
        >
          <option value="player" ${roleMode === 'player' ? 'selected' : ''}>Eine Person spielt diese Rolle</option>
          <option value="group" ${roleMode === 'group' ? 'selected' : ''}>Diese Rolle wird gemeinsam in der Gruppe gespielt</option>
        </select>
        <label class="assignment-label" for="playerName-${roleId}">Name der spielenden Person</label>
        <input
          id="playerName-${roleId}"
          class="assignment-input"
          type="text"
          data-player-name="${roleId}"
          placeholder="${roleMode === 'group' ? 'Diese Rolle wird gemeinsam gespielt' : `${assignment.slot} trägt hier den Namen ein`}"
          ${roleMode === 'group' ? 'disabled' : ''}
          value="${escapeHtml(playerName)}"
        />
      </article>
    `;
  }).join('');

  roleAssignmentPanel.querySelectorAll('[data-role-mode]').forEach((input) => {
    input.addEventListener('change', () => {
      setRoleMode(input.dataset.roleMode, input.value);
      render();
    });
  });

  roleAssignmentPanel.querySelectorAll('[data-player-name]').forEach((input) => {
    input.addEventListener('input', () => {
      setPlayerName(input.dataset.playerName, input.value);
    });
    input.addEventListener('change', () => {
      render();
    });
    input.addEventListener('blur', () => {
      render();
    });
  });
}

function renderSetupPanel() {
  const missingPlayerNames = getMissingPlayerNameRoleIds();
  const ready = canStartGame();
  const playMode = getPlayMode();
  const hybridSelected = playMode === 'hybrid';
  const setupStatusText = state.setupComplete
    ? hybridSelected
      ? `Die Partie läuft bereits in Runde ${state.roundIndex + 1}. Ihr habt „Desktop + Handys“ gewählt. Öffnet jetzt entweder das Spielfenster oder springt mit „Handy-Version starten“ direkt in den QR-Bereich.`
      : `Die Partie läuft bereits in Runde ${state.roundIndex + 1}. Ihr habt „Nur auf diesem Bildschirm“ gewählt. Öffnet jetzt das Spielfenster und spielt dort ohne Handys weiter.`
    : ready
    ? hybridSelected
      ? 'Alles ist eingerichtet. Drückt jetzt „Spiel starten“. Direkt danach erscheint hier auch der Knopf „Handy-Version starten“ für den QR-Bereich.'
      : 'Alles ist eingerichtet. Ihr könnt jetzt mit Runde 1 starten und komplett auf diesem Bildschirm spielen.'
    : `Noch unvollständig: ${missingPlayerNames.map((roleId) => ROLE_ASSIGNMENTS[roleId].slot).join(', ')} brauchen noch einen Namen oder den Modus „gemeinsam in der Gruppe“.`;

  setupPanel.innerHTML = `
    <article class="setup-card">
      <h3>0. Spielmodus ganz am Anfang klären</h3>
      <p>
        Entscheidet zuerst gemeinsam, <strong>wie</strong> ihr spielen wollt. So ist von Beginn an klar,
        ob alles nur am Desktop läuft oder ob einzelne Rollen zusätzlich auf Handys arbeiten.
      </p>
      <div class="mode-choice-grid">
        <button
          class="mode-choice-btn ${!hybridSelected ? 'selected' : ''}"
          type="button"
          data-play-mode="desktop"
        >
          <strong>Nur auf diesem Bildschirm</strong>
          <span>Empfohlen für einen klaren Klassenstart: Alle lesen, diskutieren, stimmen und wählen die Karten direkt im Spielfenster am Desktop.</span>
          <em>Dann braucht ihr später keinen QR-Code und keinen Handy-Knopf.</em>
        </button>
        <button
          class="mode-choice-btn ${hybridSelected ? 'selected' : ''}"
          type="button"
          data-play-mode="hybrid"
        >
          <strong>Desktop + Handys</strong>
          <span>Der Desktop steuert die Runde. Ausgewählte Rollen arbeiten zusätzlich auf einzelnen Handys und scannen dafür später QR-Codes.</span>
          <em>Wichtig: Der QR-Bereich startet erst nach „Spiel starten“ mit dem Knopf „Handy-Version starten“.</em>
        </button>
      </div>
      <p class="small-note">
        ${hybridSelected
          ? state.setupComplete
            ? 'Der Handy-Weg ist aktiviert. Der Knopf „Handy-Version starten“ steht jetzt direkt unten im Unterrichtsstart bereit.'
            : 'Der Handy-Weg ist vorgemerkt. Nach „Spiel starten“ erscheint hier der echte Knopf „Handy-Version starten“.'
          : 'Die Partie ist aktuell auf einen stabilen Desktop-Ablauf ohne Handys eingestellt.'}
      </p>
      <div class="button-row">
        <button id="previewCompanionBtn" class="ghost-btn" type="button">Handy-Weg jetzt ansehen</button>
      </div>
    </article>
    <article class="setup-card">
      <h3>Unterrichtsstart</h3>
      <p>
        Richtet zuerst alle Rollen ein. Eine Rolle kann entweder von einer einzelnen Person
        gespielt oder gemeinsam in der Gruppe übernommen werden. Erst danach startet ihr
        die Partie bewusst mit dem Button.
      </p>
      <div class="setup-summary">
        ${ROLE_ORDER.map((roleId) => `
          <span class="setup-pill">
            ${ROLE_ASSIGNMENTS[roleId].slot}: ${getRolePlayerLabel(roleId)}
          </span>
        `).join('')}
      </div>
      <p class="small-note">
        ${setupStatusText}
      </p>
      <div class="button-row">
        ${state.setupComplete
          ? `
            <button id="openGameBtn" class="primary-btn" type="button">Spielfenster öffnen</button>
            ${hybridSelected
              ? '<button id="startCompanionBtn" class="ghost-btn" type="button">Handy-Version starten</button>'
              : ''}
          `
          : `
            <button id="startGameBtn" class="primary-btn" type="button" ${ready ? '' : 'disabled'}>Spiel starten</button>
            ${hybridSelected
              ? '<button class="ghost-btn" type="button" disabled>Handy-Version startet nach Spielstart</button>'
              : ''}
          `}
      </div>
    </article>
    <article class="setup-card">
      <h3>Politische Lage entwickelt sich erst im Spiel</h3>
      <p>
        Die konkrete Regierungslinie wird am Anfang <strong>noch nicht offen verraten</strong>.
        In den ersten Runden arbeitet ihr erst mit Lage, Zeitdruck, Verantwortung und
        Befehlskette. Erst im Verlauf wird sichtbar, welche politische Rückendeckung oder
        Begrenzung tatsächlich über eurer Runde liegt.
      </p>
      <p class="small-note">
        So nimmt euch die App die Spannung nicht schon vor Runde 1 weg. Der genaue politische
        Rahmen taucht erst später im Spielfenster auf und wirkt dann in Vetos,
        Ministeriumslinie und Ausnahmefragen hinein.
      </p>
    </article>
  `;

  const startButton = document.querySelector('#startGameBtn');
  if (startButton) {
    startButton.addEventListener('click', startGame);
  }
  const openButton = document.querySelector('#openGameBtn');
  if (openButton) {
    openButton.addEventListener('click', openGameOverlay);
  }
  const companionButton = document.querySelector('#startCompanionBtn');
  if (companionButton) {
    companionButton.addEventListener('click', openCompanionSetup);
  }
  const previewCompanionButton = document.querySelector('#previewCompanionBtn');
  if (previewCompanionButton) {
    previewCompanionButton.addEventListener('click', scrollToPhoneGuide);
  }
  setupPanel.querySelectorAll('[data-play-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      setPlayMode(button.dataset.playMode);
      render();
    });
  });
}

function renderCurrentTaskPanel() {
  const missingPlayerNames = getMissingPlayerNameRoleIds();
  const namesReady = missingPlayerNames.length === 0;
  const missingRoles = getMissingRoleIds();
  const voteOutcome = getRoundVoteOutcome();
  const selectedMeasure = getSelectedSharedMeasure();
  const authorityOutcome = getRoundAuthorityOutcome();
  const politicalClimate = getPoliticalClimate();
  const politicalVisible = isPoliticalContextVisible();
  const externalDecision = ensureRoundExternalDecision();
  const externalImpact = getRoundExternalDecisionImpact();
  const missingVoteText = voteOutcome.missingRoles.map((roleId) => ROLE_META[roleId].short).join(', ');
  const missingAuthorityText = authorityOutcome.missingRoles.map((roleId) => ROLE_META[roleId].short).join(', ');
  const readyToResolve = state.setupComplete && voteOutcome.complete && selectedMeasure && authorityOutcome.allowed && missingRoles.length === 0;
  const guide = getRoundGuide();
  const round = ROUNDS[Math.min(state.roundIndex, ROUNDS.length - 1)];
  const courtPrompt = getDramaticCourtPrompt();
  const playMode = getPlayMode();
  const nextRolesText = missingRoles.length
    ? missingRoles.map((roleId) => ROLE_META[roleId].short).join(', ')
    : 'Alle Rollen haben eine Karte.';
  const missingPlayerText = missingPlayerNames.map((roleId) => ROLE_ASSIGNMENTS[roleId].slot).join(', ');

  const steps = [
    {
      label: 'Startmodus abschließen',
      detail: state.setupComplete
        ? playMode === 'hybrid'
          ? 'Die Rollen sind eingerichtet und die Partie wurde gestartet. Wenn ihr mit Handys arbeitet, klickt im Unterrichtsstart jetzt auf „Handy-Version starten“ und springt direkt in den QR-Bereich.'
          : 'Die Rollen sind eingerichtet und die Partie wurde gestartet. Die Klasse spielt stabil nur auf diesem Bildschirm weiter.'
        : namesReady
        ? playMode === 'hybrid'
          ? 'Alle Rollen sind eingerichtet. Drückt oben jetzt „Spiel starten“. Direkt danach könnt ihr dort auf „Handy-Version starten“ klicken.'
          : 'Alle Rollen sind eingerichtet. Drückt oben jetzt „Spiel starten“ und arbeitet dann nur im Spielfenster weiter.'
        : `Richtet erst alle Rollen ein. Es fehlen noch Namen bei: ${missingPlayerText}. Rollen können alternativ auf „gemeinsam in der Gruppe“ gestellt werden. Klärt außerdem oben zuerst, ob ihr nur am Desktop oder auch mit Handys spielen wollt.`,
      status: state.setupComplete ? 'done' : 'active'
    },
    {
      label: 'Lagefenster lesen',
      detail: 'Lest zuerst oben „1. Lageüberblick“ und direkt darunter „2. Lagefenster“, damit alle dieselbe Ausgangslage im Blick haben.',
      status: state.setupComplete ? 'done' : 'pending'
    },
    {
      label: 'Diskutieren',
      detail: !state.setupComplete
        ? 'Die Abstimmung wird erst freigeschaltet, wenn die Partie gestartet wurde.'
        : voteOutcome.complete
        ? 'Alle Rollen haben ihr Kurzvotum abgegeben. Der gewichtete Rundenentscheid wurde daraus erzeugt.'
        : `Im Abschnitt „4. Diskussion und Abstimmung“ gibt jetzt jede Rolle ein Kurzvotum ab: Weg wählen und Begründung schreiben. Es fehlen noch: ${missingVoteText}.`,
      status: !state.setupComplete ? 'pending' : voteOutcome.complete ? 'done' : 'active'
    },
    {
      label: 'Gemeinsamen Krisenbeschluss wählen',
      detail: !state.setupComplete
        ? 'Die Zusatzbeschlüsse werden erst freigeschaltet, wenn die Partie gestartet wurde.'
        : !voteOutcome.complete
        ? 'Der gemeinsame Krisenbeschluss folgt erst nach der gewichteten Abstimmung.'
        : selectedMeasure
        ? `Gewählt ist bereits: ${selectedMeasure.title}.`
        : 'Wählt jetzt einen der drei konkreten Krisenbeschlüsse dieser Runde. Dieser Beschluss verändert die Lage zusätzlich und gibt der Klasse mehr Mitbestimmung.',
      status: !state.setupComplete || !voteOutcome.complete ? 'pending' : selectedMeasure ? 'done' : 'active'
    },
    {
      label: 'Prüf- und Vetorechte klären',
      detail: !state.setupComplete
        ? 'Die Sonderrechte werden erst freigeschaltet, wenn die Partie gestartet wurde.'
        : !voteOutcome.complete
        ? 'Erst nach der Rollenabstimmung kann der Mehrheitsweg geprüft werden.'
        : !selectedMeasure
        ? 'Erst nach dem gemeinsamen Krisenbeschluss geht es zu den Sonderrechten.'
        : !authorityOutcome.ready
        ? `In Schritt 5 fehlen noch Entscheidungen bei: ${missingAuthorityText}. Diese Rollen müssen den Mehrheitsweg freigeben, nur unter Bedingungen zulassen oder blockieren.`
        : authorityOutcome.allowed
        ? authorityOutcome.status === 'conditional'
          ? 'Der Mehrheitsweg ist freigegeben, aber nur unter Bedingungen. Lest die Bedingungen genau.'
          : 'Der Mehrheitsweg wurde freigegeben. Die Rollen dürfen jetzt ihre Auswahlkarten legen.'
        : 'Der Mehrheitsweg ist blockiert. Die Gruppe muss die Abstimmung oder das Veto ändern, bevor es weitergeht.',
      status: !state.setupComplete || !voteOutcome.complete || !selectedMeasure ? 'pending' : authorityOutcome.allowed ? 'done' : authorityOutcome.ready ? 'active' : 'active'
    },
    {
      label: 'Auswahlkarten in den Rollenfeldern anklicken',
      detail: !state.setupComplete
        ? 'Die Auswahlkarten bleiben gesperrt, bis die Partie oben im Unterrichtsstart-Modus gestartet wurde.'
        : !voteOutcome.complete
        ? 'Die Auswahlkarten bleiben gesperrt, bis alle sechs Kurzvoten abgegeben wurden und der Rundenentscheid automatisch erzeugt ist.'
        : !selectedMeasure
        ? 'Die Auswahlkarten bleiben gesperrt, bis zusätzlich ein gemeinsamer Krisenbeschluss ausgewählt wurde.'
        : !authorityOutcome.ready
        ? 'Die Auswahlkarten bleiben gesperrt, bis die Rollen mit Sonderrecht den Mehrheitsweg geprüft haben.'
        : !authorityOutcome.allowed
        ? 'Die Auswahlkarten bleiben gesperrt, weil der Mehrheitsweg aktuell blockiert ist.'
        : missingRoles.length
        ? `Es fehlen noch Auswahlkarten für: ${nextRolesText}. Geht zu „6. Auswahlkarten pro Rolle anklicken“. Dort seht ihr sechs große Rollenfelder. In jedem offenen Rollenfeld klickt ihr genau eine rechteckige Auswahlkarte mit Titel und Kurzbeschreibung an.`
        : 'Alle sechs Rollen haben unten im Abschnitt „6. Auswahlkarten pro Rolle anklicken“ bereits genau eine Auswahlkarte.',
      status: !state.setupComplete || !voteOutcome.complete || !selectedMeasure || !authorityOutcome.allowed ? 'pending' : readyToResolve ? 'done' : 'active'
    },
    {
      label: 'Button drücken',
      detail: !state.setupComplete
        ? 'Auch die Auswertung bleibt gesperrt, bis die Partie gestartet wurde.'
        : !voteOutcome.complete
        ? 'Auch die Auswertung bleibt gesperrt, bis die sechs Kurzvoten abgegeben und die Auswahlkarten gewählt wurden.'
        : !selectedMeasure
        ? 'Auch die Auswertung bleibt gesperrt, bis ein gemeinsamer Krisenbeschluss ausgewählt wurde.'
        : !authorityOutcome.ready
        ? 'Auch die Auswertung bleibt gesperrt, bis die Sonderrechte entschieden sind.'
        : !authorityOutcome.allowed
        ? 'Auch die Auswertung bleibt gesperrt, weil der Mehrheitsweg aktuell blockiert ist.'
        : readyToResolve
        ? 'Drückt jetzt „7. Runde auswerten“. Lest danach rechts Protokoll, Matrix und Meta-System.'
        : 'Diesen Button drückt ihr erst, wenn wirklich alle Rollen eine Karte haben.',
      status: !state.setupComplete || !voteOutcome.complete || !selectedMeasure || !authorityOutcome.allowed ? 'pending' : readyToResolve ? 'active' : 'pending'
    }
  ];

  currentTaskPanel.innerHTML = `
    <article class="scenario-card">
      <h3>Konkrete Situation in Runde ${state.roundIndex + 1}</h3>
      <p>${getRoundScenarioText(round, guide)}</p>
      <div class="scenario-pill-row">
        <span class="scenario-pill">T - ${round.minute} Minuten</span>
        <span class="scenario-pill">${state.statuses.stadiumStatus}</span>
        <span class="scenario-pill">${state.statuses.rulesStatus}</span>
        <span class="scenario-pill">${politicalVisible ? politicalClimate.label.replace('Bundesregierung ', '') : 'Politische Rückendeckung noch offen'}</span>
      </div>
    </article>
    <p class="task-intro">
      Nächste Aktion in Runde ${state.roundIndex + 1}: ${!state.setupComplete
        ? namesReady
          ? 'Die Rollen sind eingerichtet. Drückt jetzt oben „Spiel starten“.'
          : `Richtet zuerst die fehlenden Rollen ein: ${missingPlayerText}.`
        : !voteOutcome.complete
        ? `Gebt jetzt die fehlenden Kurzvoten ab für ${missingVoteText}.`
        : !selectedMeasure
        ? 'Wählt jetzt den gemeinsamen Krisenbeschluss für diese Runde.'
        : !authorityOutcome.ready
        ? `Kläre jetzt die Sonderrechte bei ${missingAuthorityText}.`
        : !authorityOutcome.allowed
        ? 'Der Mehrheitsweg ist blockiert. Ändert jetzt die Abstimmung oder das Veto.'
        : readyToResolve
        ? 'Die Entscheidungen sind vollständig. Ihr könnt jetzt auswerten.'
        : `Diskutiert kurz und klickt danach die fehlenden Auswahlkarten für ${nextRolesText} an.`}
    </p>
    <ol class="task-steps">
      ${steps.map((step, index) => `
        <li class="task-step ${step.status}">
          <span class="task-step-index">${index + 1}</span>
          <div>
            <strong>${step.label}</strong>
            <span>${step.detail}</span>
          </div>
        </li>
      `).join('')}
    </ol>
    <p class="guide-note">
      Konkreter Arbeitsauftrag: Alle sechs Personen schauen auf dieselbe Situation. Danach stimmt jede Rolle in „4. Diskussion und Abstimmung“ auf einen der drei Wege ab und schreibt ein kurzes Votum. Danach wählt die Klasse zusätzlich einen gemeinsamen Krisenbeschluss mit Folgen für die Lage. In Schritt 5 prüfen einzelne Rollen mit Sonderrecht den Mehrheitsweg. Erst wenn der Weg freigegeben ist, geht ihr zu „6. Auswahlkarten pro Rolle anklicken“.
    </p>
    <p class="guide-note">
      Dramaturgischer Ablauf dieser Runde: ${courtPrompt.interruption} Erst danach eröffnet ${ROLE_META[getLeadRoleId()].label} die Aussprache, dann klingt die Koch-Perspektive an, dann Nelsons Gegenposition. Eure Abstimmung ist also Teil der Verhandlung und nicht nur eine isolierte Klassenaufgabe.
    </p>
    <p class="guide-note">
      ${politicalVisible
        ? `Politische Zusatzregel dieses Spiels: In dieser Partie regiert <strong>${politicalClimate.label}</strong>. ${getPoliticalDecisionContext()} ${politicalClimate.recognizesEmergency
          ? `Falls eure Karten später wirklich auf Ausnahmefreigabe oder Abschuss hinauslaufen, entscheidet die App einmal per Zufall, ob diese Regierung die Klausel politisch wirksam werden lässt (${Math.round(politicalClimate.activationChance * 100)} % Chance).`
          : 'Falls eure Karten später auf Ausnahmefreigabe oder Abschuss hinauslaufen, wird diese Klausel politisch nicht wirksam.'}`
        : 'Politische Rückendeckung: In dieser frühen Phase ist noch nicht offen sichtbar, welche Regierungslinie hinter dem Ministerium steht. Spielt die Runde zunächst unter dieser Unsicherheit.'}
    </p>
    ${externalDecision ? `
      <p class="guide-note">
        Neue Einspielung in dieser Runde: <strong>${externalDecision.institution}</strong> meldet sich mit <strong>${externalDecision.title}</strong>. ${externalDecision.summary} ${externalImpact.exceptionPath && !externalImpact.allowed
          ? `Wichtig gerade jetzt: ${externalImpact.blockingReason}`
          : externalDecision.ruleText}
      </p>
    ` : ''}
  `;
}

function renderDiscussionPanel() {
  const guide = getRoundGuide();
  const teaching = getTeacherBriefing();
  const lens = getRoundArgumentLens();
  const courtPrompt = getDramaticCourtPrompt();
  const voteOutcome = getRoundVoteOutcome();
  const winner = voteOutcome.winner;
  const missingVoteText = voteOutcome.missingRoles.map((roleId) => ROLE_META[roleId].short).join(', ');
  const measures = getRoundSharedMeasures();
  const selectedMeasure = getSelectedSharedMeasure();
  const politicalClimate = getPoliticalClimate();
  const politicalVisible = isPoliticalContextVisible();

  discussionPanel.innerHTML = `
    <article class="prompt-card">
      <h3>Was ist passiert?</h3>
      <p>${teaching.happened}</p>
    </article>

    <article class="prompt-card">
      <h3>Was müsst ihr jetzt gemeinsam klären?</h3>
      <div class="briefing-stack">
        <div class="briefing-line">
          <strong>Was wissen wir sicher?</strong>
          <span>${teaching.known}</span>
        </div>
        <div class="briefing-line">
          <strong>Was ist noch unklar?</strong>
          <span>${teaching.unclear}</span>
        </div>
        <div class="briefing-line">
          <strong>Was droht, wenn ihr nicht klar handelt?</strong>
          <span>${teaching.risk}</span>
        </div>
      </div>
    </article>

    <div class="question-box">
      <strong>Was ist die Streitfrage?</strong>
      <p>${teaching.conflict}</p>
    </div>

    <article class="prompt-card">
      <h3>Worüber müsst ihr am Ende abstimmen?</h3>
      <p>${teaching.decisionTask}</p>
      <p><strong>Erste Wortmeldung:</strong> ${teaching.firstSpeaker}</p>
      <div class="briefing-action-grid">
        ${teaching.paths.map((path, index) => `
          <article class="briefing-action-card">
            <strong>Weg ${index + 1}</strong>
            <span>${path}</span>
          </article>
        `).join('')}
      </div>
    </article>

    <article class="prompt-card">
      <h3>So wird in dieser Runde entschieden</h3>
      <p>Es gibt zuerst eine offene Abstimmung über die drei Wege aus dem Lagefenster. Jede Rolle wählt genau einen Weg und schreibt ein kurzes Votum von mindestens einem Satz.</p>
      <p>Nicht alle Stimmen zählen gleich stark. Das ist bewusst so, weil einige Rollen in dieser Lage mehr operative oder rechtlich-politische Verantwortung tragen als andere. Die Gewichtung ist transparent und für jede Runde gleich:</p>
      <div class="decision-grid">
        ${ROLE_ORDER.map((roleId) => `
          <article class="decision-card">
            <strong>${ROLE_ASSIGNMENTS[roleId].slot}: ${ROLE_META[roleId].label} · Gewicht ${ROLE_VOTE_WEIGHTS[roleId].weight}</strong>
            <span>${getRolePlayerLabel(roleId)}</span>
            <span>${ROLE_VOTE_WEIGHTS[roleId].reason}</span>
          </article>
        `).join('')}
      </div>
      <p class="small-note">Bei Stimmgleichheit entscheidet transparent die Rolle, die in dieser Runde zuerst sprechen muss.</p>
      ${politicalVisible
        ? `
          <p class="small-note">Regierungskontext dieser Partie: <strong>${politicalClimate.label}</strong>. ${politicalClimate.studentMeaning}</p>
          <p class="small-note"><strong>Übergesetzlicher Notstand</strong> heißt hier: nicht „das Gesetz erlaubt es“, sondern „eine Regierung behauptet im Extremfall eine Ausnahme, obwohl die Rechtslage eigentlich blockiert ist“.</p>
          <p class="small-note">Politische Zusatzlage: ${politicalClimate.recognizesEmergency
            ? `Diese Regierung ist für solche Ausnahmelogik grundsätzlich offen. Wenn eure Entscheidung später wirklich eine Ausnahmefreigabe oder einen Abschuss tragen soll, prüft die App einmal zufällig, ob diese Klausel in dieser Runde politisch wirksam wird (${Math.round(politicalClimate.activationChance * 100)} % Chance).`
            : 'Diese Regierung lehnt solche Ausnahmelogik ab. Wenn eure Entscheidung später auf Ausnahmefreigabe oder Abschuss zielt, scheitert diese politische Klausel.'}</p>
        `
        : `
          <p class="small-note">Der genaue politische Rahmen bleibt in den ersten Runden noch verdeckt. Diskutiert zunächst nur aus eurer Rolle heraus: Was ist jetzt verantwortbar, obwohl die Rückendeckung von oben noch unklar ist?</p>
        `}
    </article>

    <article class="prompt-card">
      <h3>Gewichtete Abstimmung dieser Runde</h3>
      <div class="vote-grid">
        ${ROLE_ORDER.map((roleId) => {
          const vote = getRoleVote(roleId);
          const voteLabel = ROLE_VOTE_WEIGHTS[roleId];
          return `
            <article class="vote-card">
              <div class="vote-card-head">
                <div>
                  <strong>${ROLE_ASSIGNMENTS[roleId].slot}: ${ROLE_META[roleId].label}</strong>
                  <span>${getRolePlayerLabel(roleId)}</span>
                </div>
                <span class="vote-weight-badge">Gewicht ${voteLabel.weight}</span>
              </div>
              <p class="vote-card-note">Warum diese Stimme mehr oder weniger zählt: ${voteLabel.reason}.</p>
              <div class="vote-choice-row">
                ${teaching.paths.map((path, index) => `
                  <button
                    class="vote-choice-btn ${vote.choiceIndex === index ? 'selected' : ''}"
                    type="button"
                    data-vote-choice-role="${roleId}"
                    data-vote-choice-index="${index}"
                  >
                    <strong>Weg ${index + 1}</strong>
                    <span>${path}</span>
                  </button>
                `).join('')}
              </div>
              <label class="vote-label" for="voteReason-${roleId}">Kurzes Votum dieser Rolle</label>
              <textarea
                id="voteReason-${roleId}"
                class="vote-reason-field"
                data-vote-reason="${roleId}"
                placeholder="Schreibt hier in einem kurzen Satz, warum diese Rolle für ihren Weg stimmt."
              >${escapeHtml(vote.reason)}</textarea>
            </article>
          `;
        }).join('')}
      </div>
    </article>

    <article class="prompt-card">
      <h3>Automatisch erzeugter Rundenentscheid</h3>
      ${voteOutcome.complete ? `
        <div class="vote-result-card is-ready">
          <p><strong>Entscheid:</strong> Weg ${winner.index + 1} gewinnt mit ${winner.weight} von ${voteOutcome.totalWeight} Gewichtspunkten.</p>
          <p><strong>Gewonnene Linie:</strong> ${winner.path}</p>
          <p><strong>Entscheidregel:</strong> ${voteOutcome.tiebreakReason}</p>
        </div>
      ` : `
        <div class="vote-result-card">
          <p><strong>Noch kein Entscheid:</strong> Es fehlen noch vollständige Kurzvoten für ${missingVoteText}.</p>
          <p>Erst wenn alle sechs Rollen einen Weg gewählt und ein kurzes Votum geschrieben haben, erzeugt die App den Rundenentscheid automatisch.</p>
        </div>
      `}
      <div class="vote-tally-grid">
        ${voteOutcome.options.map((option) => `
          <article class="vote-tally-card ${voteOutcome.complete && winner.index === option.index ? 'winner' : ''}">
            <strong>Weg ${option.index + 1}</strong>
            <span>${option.path}</span>
            <span>${option.weight} / ${voteOutcome.totalWeight} Gewichtspunkte</span>
            <span>${option.roles.length ? option.roles.map((roleId) => ROLE_META[roleId].short).join(', ') : 'noch keine Stimmen'}</span>
          </article>
        `).join('')}
      </div>
      ${voteOutcome.complete ? `
        <div class="vote-reason-list">
          ${winner.reasons.map((entry) => `
            <article class="vote-reason-card">
              <strong>${ROLE_META[entry.roleId].label}</strong>
              <span>${entry.reason}</span>
            </article>
          `).join('')}
        </div>
      ` : ''}
    </article>

    <article class="prompt-card">
      <h3>Zusätzlicher Krisenbeschluss der Klasse</h3>
      <p>Damit die Klasse noch mehr mitbestimmt, wählt ihr pro Runde zusätzlich einen gemeinsamen Krisenbeschluss. Er gilt für alle Rollen gemeinsam und verändert die Lage sichtbar, bevor die einzelnen Auswahlkarten gespielt werden.</p>
      <div class="measure-grid">
        ${measures.map((measure) => `
          <button
            class="measure-btn ${selectedMeasure?.id === measure.id ? 'selected' : ''}"
            type="button"
            data-measure-id="${measure.id}"
            ${voteOutcome.complete ? '' : 'disabled'}
          >
            <strong>${measure.title}</strong>
            <span>${measure.summary}</span>
            <em>Folge: ${measure.impact}</em>
          </button>
        `).join('')}
      </div>
      <div class="measure-result-card ${selectedMeasure ? 'is-ready' : ''}">
        ${selectedMeasure
          ? `<p><strong>Gewählter Krisenbeschluss:</strong> ${selectedMeasure.title}</p><p>${selectedMeasure.summary}</p><p><strong>Konkrete Folge für die Lage:</strong> ${selectedMeasure.impact}</p>`
          : voteOutcome.complete
          ? '<p><strong>Noch offen:</strong> Die Abstimmung ist fertig, aber der gemeinsame Krisenbeschluss wurde noch nicht ausgewählt.</p>'
          : '<p><strong>Noch gesperrt:</strong> Der Krisenbeschluss wird erst freigeschaltet, nachdem die gewichtete Abstimmung abgeschlossen ist.</p>'}
      </div>
    </article>

    <article class="prompt-card">
      <h3>Darauf sollt ihr bei der Diskussion achten</h3>
      <ol class="discussion-list">
        ${guide.prompts.map((prompt) => `<li>${prompt}</li>`).join('')}
      </ol>
    </article>

    <article class="prompt-card">
      <h3>Denkhilfen Aus Dem Drama</h3>
      <div class="briefing-stack">
        <div class="briefing-line">
          <strong>Trolleyproblem</strong>
          <span>${lens.trolley}</span>
        </div>
        <div class="briefing-line">
          <strong>Was würde Lars Koch später sagen?</strong>
          <span>${lens.koch}</span>
        </div>
        <div class="briefing-line">
          <strong>Was würde Staatsanwältin Nelson entgegnen?</strong>
          <span>${lens.nelson}</span>
        </div>
        <div class="briefing-line">
          <strong>Welche richterliche Leitfrage steckt dahinter?</strong>
          <span>${lens.judge}</span>
        </div>
      </div>
      <p class="small-note">Diese Kästen sind keine wörtlichen Zitate, sondern didaktische Annäherungen an die Denkfiguren des Stücks.</p>
    </article>

    <article class="prompt-card">
      <h3>So läuft die Verhandlung in dieser Runde weiter</h3>
      <div class="briefing-stack">
        <div class="briefing-line">
          <strong>Zwischenruf des Gerichtspräsidenten</strong>
          <span>${courtPrompt.interruption}</span>
        </div>
        <div class="briefing-line">
          <strong>Szenischer Ablauf jetzt</strong>
          <span>${courtPrompt.sceneFlow.join(' ')}</span>
        </div>
        <div class="briefing-line">
          <strong>Theoriefrage im Verfahren</strong>
          <span>${courtPrompt.theoryFocus} Wenn ihr diese Unterscheidung vor der Runde noch einmal kurz ansehen wollt, öffnet hier das vorbereitende Video: <a href="https://www.dropbox.com/scl/fi/0q2zm7rgr03b7l9bz133z/STRASSENBAHN-das-philosophische-Gedankenexperiment-filosofix.mp4?rlkey=oh1qz7n1nhgq0kcuu8jpgipt2&st=ud6qhs4q&dl=0" target="_blank" rel="noreferrer noopener">Straßenbahn - das philosophische Gedankenexperiment</a>.</span>
        </div>
        <div class="briefing-line">
          <strong>Stimmen zuordnen</strong>
          <span>${courtPrompt.attribution}</span>
        </div>
        <div class="briefing-line">
          <strong>Was ihr dann konkret tut</strong>
          <span>${courtPrompt.classAction}</span>
        </div>
      </div>
      <p class="small-note">Damit arbeitet ihr nicht neben dem Stück, sondern mitten in seiner Verfahrenslogik: Richterfrage, Koch-Linie, Nelson-Linie, dann euer Votum.</p>
    </article>
  `;

  discussionPanel.querySelectorAll('[data-vote-choice-role]').forEach((button) => {
    button.addEventListener('click', () => {
      setRoleVoteChoice(button.dataset.voteChoiceRole, Number(button.dataset.voteChoiceIndex));
      render();
    });
  });

  discussionPanel.querySelectorAll('[data-vote-reason]').forEach((field) => {
    field.addEventListener('input', () => {
      setRoleVoteReason(field.dataset.voteReason, field.value);
    });
    field.addEventListener('blur', () => {
      render();
    });
  });

  discussionPanel.querySelectorAll('[data-measure-id]').forEach((button) => {
    button.addEventListener('click', () => {
      setSelectedSharedMeasure(button.dataset.measureId);
      render();
    });
  });
}

function renderAuthorityPanel() {
  const voteOutcome = getRoundVoteOutcome();
  const authorityOutcome = getRoundAuthorityOutcome();
  const rules = getRoundVetoRules();
  const winner = voteOutcome.winner;
  const politicalClimate = getPoliticalClimate();
  const politicalVisible = isPoliticalContextVisible();
  const emergencyCheck = getEmergencyClauseCheck();
  const externalDecision = ensureRoundExternalDecision();
  const externalImpact = getRoundExternalDecisionImpact();

  if (!voteOutcome.complete || !winner) {
    authorityPanel.innerHTML = `
      <article class="prompt-card">
        <h3>Erst kommt die Abstimmung</h3>
        <p>Die Prüf- und Vetorechte werden erst freigeschaltet, wenn in Schritt 4 alle sechs Rollen abgestimmt haben und der Mehrheitsweg feststeht.</p>
      </article>
    `;
    return;
  }

  authorityPanel.innerHTML = `
    <article class="prompt-card">
      <h3>Was bedeutet diese Ebene?</h3>
      <p>Jetzt kommt ein echter Rollenkonflikt: Die Gruppe hat schon einen Mehrheitsweg gewählt, aber einzelne Rollen mit Sonderrecht dürfen prüfen, ob dieser Weg freigegeben, nur unter Bedingungen erlaubt oder blockiert wird.</p>
      <p><strong>Aktueller Mehrheitsweg:</strong> Weg ${winner.index + 1} - ${winner.path}</p>
      <p class="small-note">Für 15-Jährige ganz einfach gesagt: Das ist ein zweites Schloss nach der Abstimmung. Erst gewinnt ein Weg. Danach sagen die Rollen mit Sonderrecht offen: „Ja, dieser Weg darf weitergehen“, „Ja, aber nur wenn ...“ oder „Nein, so geht es nicht weiter“.</p>
      <p class="small-note"><strong>Freigeben</strong> heißt: Der Weg darf gespielt werden. <strong>Nur unter Bedingung</strong> heißt: Der Weg darf nur weiterlaufen, wenn die Bedingung offen genannt wird. <strong>Blockieren</strong> heißt: Der Weg ist gestoppt, bis die Gruppe die Abstimmung oder das Veto ändert.</p>
      ${politicalVisible
        ? `
          <p class="small-note"><strong>${politicalClimate.label}</strong> bestimmt den politischen Rahmen dieser Prüfung. ${politicalClimate.ministryLine}</p>
          <p class="small-note"><strong>Übergesetzlicher Notstand</strong> bedeutet hier nicht: „Das ist legal.“ Es bedeutet nur: Eine Regierung könnte versuchen, eine extreme Ausnahme politisch zu rechtfertigen.</p>
          <p class="small-note">Politische Zusatzregel: ${politicalClimate.recognizesEmergency
            ? `Wenn eure Entscheidungen in dieser oder einer späteren Runde wirklich auf Ausnahmefreigabe oder Abschuss hinauslaufen, würfelt die App genau einmal, ob diese Regierung die Notstandsklausel politisch wirksam werden lässt (${Math.round(politicalClimate.activationChance * 100)} % Chance).`
            : 'Diese Regierung lehnt die Notstandsklausel ab. Auch wenn einzelne Rollen später darauf hoffen, wird sie politisch nicht wirksam.'}</p>
        `
        : `
          <p class="small-note">Die genaue Regierungslinie ist in dieser frühen Phase noch nicht offen sichtbar. Prüft den Mehrheitsweg deshalb zunächst nur danach, was eure Rolle jetzt praktisch, rechtlich und moralisch verantworten kann.</p>
        `}
      ${emergencyCheck ? `<p class="small-note"><strong>Letzter Klausel-Check:</strong> ${emergencyCheck.activated ? 'Die Klausel wurde politisch wirksam.' : 'Die Klausel wurde politisch nicht wirksam.'}</p>` : ''}
    </article>

    ${externalDecision ? `
      <article class="prompt-card">
        <h3>Neue Einspielung In Die Verhandlung</h3>
        <p><strong>${externalDecision.institution}:</strong> ${externalDecision.title}</p>
        <p>${externalDecision.summary}</p>
        <p><strong>Konkrete Folge für die Verhandlung:</strong> ${externalDecision.ruleText}</p>
        <p>${externalImpact.exceptionPath
          ? externalImpact.allowed
            ? (externalImpact.conditionText || 'Diese Einspielung lenkt die Runde, blockiert sie aber aktuell nicht.')
            : externalImpact.blockingReason
          : 'Diese Einspielung bleibt zunächst Hintergrundrahmen. Sie greift erst, wenn eure Entscheidungen wirklich in eine Ausnahme- oder Abschusslogik hineingehen.'}</p>
      </article>
    ` : ''}

    <div class="authority-grid">
      ${rules.map((rule) => {
        const role = ROLE_META[rule.roleId];
        const veto = getRoleVeto(rule.roleId);
        return `
          <article class="authority-card">
            <div class="authority-card-head">
              <div>
                <strong>${ROLE_ASSIGNMENTS[rule.roleId].slot}: ${role.label}</strong>
                <span>${getRolePlayerLabel(rule.roleId)}</span>
              </div>
              <span class="vote-weight-badge">Sonderrecht</span>
            </div>
            <p class="authority-note">Warum diese Rolle jetzt ein Sonderrecht hat: ${rule.reason}</p>
            <div class="authority-choice-row">
              <button
                class="authority-choice-btn ${veto.decision === 'approve' ? 'selected' : ''}"
                type="button"
                data-veto-role="${rule.roleId}"
                data-veto-decision="approve"
              >Freigeben</button>
              <button
                class="authority-choice-btn ${veto.decision === 'conditional' ? 'selected' : ''}"
                type="button"
                data-veto-role="${rule.roleId}"
                data-veto-decision="conditional"
              >Nur unter Bedingung</button>
              <button
                class="authority-choice-btn ${veto.decision === 'block' ? 'selected is-block' : ''}"
                type="button"
                data-veto-role="${rule.roleId}"
                data-veto-decision="block"
              >Blockieren</button>
            </div>
            <label class="vote-label" for="vetoReason-${rule.roleId}">
              ${veto.decision === 'approve'
                ? 'Optional: kurze Begründung'
                : 'Pflicht: erkläre die Bedingung oder das Veto in einem klaren Satz'}
            </label>
            <textarea
              id="vetoReason-${rule.roleId}"
              class="vote-reason-field"
              data-veto-reason="${rule.roleId}"
              placeholder="${veto.decision === 'approve'
                ? 'Optional: Warum gibt diese Rolle den Mehrheitsweg frei?'
                : 'Beispiel: Ich blockiere, weil dieser Weg rechtlich nicht offen getragen wird.'}"
            >${escapeHtml(veto.reason)}</textarea>
          </article>
        `;
      }).join('')}
    </div>

    <article class="prompt-card">
      <h3>Automatisch erzeugte Prüfung</h3>
      ${!authorityOutcome.ready ? `
        <div class="authority-result-card">
          <p><strong>Noch offen:</strong> Nicht alle Rollen mit Sonderrecht haben ihre Entscheidung vollständig abgegeben.</p>
          <p>Erst danach ist klar, ob der Mehrheitsweg freigegeben, nur unter Bedingungen erlaubt oder blockiert ist.</p>
        </div>
      ` : authorityOutcome.allowed ? `
        <div class="authority-result-card is-ready">
          <p><strong>Ergebnis:</strong> Der Mehrheitsweg ist ${authorityOutcome.status === 'conditional' ? 'nur unter Bedingungen freigegeben' : 'freigegeben'}.</p>
          ${authorityOutcome.conditionalBy.length ? `
            <div class="vote-reason-list">
              ${authorityOutcome.conditionalBy.map((entry) => `
                <article class="vote-reason-card">
                  <strong>${ROLE_META[entry.roleId].label}</strong>
                  <span>${entry.reason}</span>
                </article>
              `).join('')}
            </div>
          ` : '<p>Es gibt keine Zusatzbedingungen. Die Rollen dürfen jetzt ihre Auswahlkarten legen.</p>'}
        </div>
      ` : `
        <div class="authority-result-card is-blocked">
          <p><strong>Ergebnis:</strong> Der Mehrheitsweg ist aktuell blockiert.</p>
          <div class="vote-reason-list">
            ${authorityOutcome.blockedBy.map((entry) => `
              <article class="vote-reason-card">
                <strong>${ROLE_META[entry.roleId].label}</strong>
                <span>${entry.reason}</span>
              </article>
            `).join('')}
          </div>
          <p>Solange dieses Veto steht, bleibt die Kartenphase gesperrt. Die Gruppe muss also entweder ihre Abstimmung ändern oder das Veto neu setzen.</p>
        </div>
      `}
    </article>
  `;

  authorityPanel.querySelectorAll('[data-veto-role]').forEach((button) => {
    button.addEventListener('click', () => {
      setRoleVetoDecision(button.dataset.vetoRole, button.dataset.vetoDecision);
      render();
    });
  });

  authorityPanel.querySelectorAll('[data-veto-reason]').forEach((field) => {
    field.addEventListener('input', () => {
      setRoleVetoReason(field.dataset.vetoReason, field.value);
    });
    field.addEventListener('blur', () => {
      render();
    });
  });
}

function renderSelectionSummary() {
  selectionSummary.innerHTML = ROLE_ORDER.map((roleId) => {
    const role = ROLE_META[roleId];
    const playerName = getPlayerName(roleId);
    const selectedCardId = state.selections[roleId];
    const availableCards = getAvailableCards(roleId, state);
    const selectedCard = availableCards.find((card) => card.id === selectedCardId)
      || CARD_LIBRARY[roleId].find((card) => card.id === selectedCardId);

    return `
      <span class="selection-chip ${selectedCard ? 'done' : 'pending'} ${!selectedCard ? 'desktop-only' : ''}">
        ${role.short} · ${getRolePlayerLabel(roleId)} · ${selectedCard ? selectedCard.title : 'noch keine Karte gewählt'}
      </span>
    `;
  }).join('');
}

function renderRoles() {
  const namesReady = getMissingPlayerNameRoleIds().length === 0;
  const voteOutcome = getRoundVoteOutcome();
  const selectedMeasure = getSelectedSharedMeasure();
  const authorityOutcome = getRoundAuthorityOutcome();
  rolesGrid.innerHTML = Object.keys(ROLE_META).map((roleId) => {
    const role = ROLE_META[roleId];
    const assignment = ROLE_ASSIGNMENTS[roleId];
    const playerName = getPlayerName(roleId);
    const row = state.matrix[roleId];
    const availableCards = getAvailableCards(roleId, state);
    const selectedCardId = state.selections[roleId];
    const selectedCard = availableCards.find((card) => card.id === selectedCardId)
      || CARD_LIBRARY[roleId].find((card) => card.id === selectedCardId);

    if (state.companionRoles[roleId]) {
      return `
        <article class="role-card">
          <div class="role-card-header">
            <div>
              <p class="mini-label">${assignment.slot}</p>
              <h3><span class="role-accent" style="background:${role.color}"></span>${role.label}</h3>
              <p>${role.subtitle}</p>
              <p class="small-note">${getRolePlayerLabel(roleId)}</p>
            </div>
            <div class="role-scoreline">
              <span class="score-badge">aktiv ${row.active}</span>
              <span class="score-badge">unterlassen ${row.omitted}</span>
              <span class="score-badge">rechtlich ${row.legal}</span>
            </div>
        </div>
        <p class="role-goal">${role.goal}</p>
        <p class="small-note">Entscheidung dieser Person in dieser Runde: Welche Karte passt jetzt am besten zur Lage?</p>
        <div class="guide-note">
            Diese Rolle wird in dieser Runde über ein Handy gespielt. Scannt den QR-Code im Seitenbereich,
            arbeitet dort die Rollenansicht ab und übernehmt anschließend den Antwortcode oder das Rollenpaket auf dem Desktop. Die Prüf- und Vetorechte aus Schritt 5 bleiben trotzdem sichtbar und verlässlich am Desktop.
          </div>
          <div class="choice-tags">
            <span class="tag">${availableCards.length} Karten in dieser Runde</span>
            <span class="tag">${selectedCard ? `Auswahl: ${selectedCard.title}` : 'Noch keine Auswahl übernommen'}</span>
          </div>
        </article>
      `;
    }

    const cardsMarkup = availableCards.map((card) => {
      const selected = selectedCardId === card.id;
      return `
        <button
          class="choice-btn ${selected ? 'selected' : ''}"
          type="button"
          data-role="${roleId}"
          data-card="${card.id}"
          ${namesReady && voteOutcome.complete && selectedMeasure && authorityOutcome.allowed ? '' : 'disabled'}
          style="${selected ? `background:${role.soft};border-color:${role.color};` : ''}"
        >
          <span class="choice-kicker">Auswahlkarte für ${role.short}</span>
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
            <p class="mini-label">${assignment.slot}</p>
            <h3><span class="role-accent" style="background:${role.color}"></span>${role.label}</h3>
            <p>${role.subtitle}</p>
            <p class="small-note">${getRolePlayerLabel(roleId)}</p>
          </div>
          <div class="role-scoreline">
            <span class="score-badge">aktiv ${row.active}</span>
            <span class="score-badge">unterlassen ${row.omitted}</span>
            <span class="score-badge">rechtlich ${row.legal}</span>
          </div>
        </div>
        <p class="role-goal">${role.goal}</p>
        <p class="small-note">${!namesReady
          ? 'Diese Rollenkarte wird erst freigeschaltet, wenn oben alle sechs Namen eingetragen sind.'
          : !voteOutcome.complete
          ? 'Diese Auswahlkarten werden erst freigeschaltet, wenn in Schritt 4 alle sechs Rollen ihren Weg gewählt und ihr Kurzvotum geschrieben haben.'
          : !selectedMeasure
          ? 'Diese Auswahlkarten werden erst freigeschaltet, wenn die Klasse zusätzlich einen gemeinsamen Krisenbeschluss gewählt hat.'
          : !authorityOutcome.ready
          ? 'Diese Auswahlkarten bleiben noch gesperrt. Geht zuerst zu Schritt 5: Dort müssen die Rollen mit Sonderrecht den Mehrheitsweg freigeben, nur unter Bedingungen zulassen oder blockieren.'
          : !authorityOutcome.allowed
          ? 'Diese Auswahlkarten bleiben gesperrt, weil der Mehrheitsweg aktuell blockiert ist. Erst wenn die Gruppe das Veto oder die Abstimmung ändert, darf hier wieder geklickt werden.'
          : `Unter diesem Rollenfeld liegen die anklickbaren Auswahlkarten für ${role.label}. ${getRolePlayerLabel(roleId)} klickt jetzt genau eine rechteckige Auswahlkarte an, um den erzeugten Rundenentscheid für diese Rolle umzusetzen.`}</p>
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

function renderReferencePanel() {
  const lens = getRoundArgumentLens();
  const courtPrompt = getDramaticCourtPrompt();
  const externalDecision = ensureRoundExternalDecision();
  const externalImpact = getRoundExternalDecisionImpact();
  referencePanel.innerHTML = `
    <article class="prompt-card">
      <h3>Trolleyproblem</h3>
      <p>${lens.trolley}</p>
    </article>
    <article class="prompt-card">
      <h3>Lars Koch</h3>
      <p>${lens.koch}</p>
    </article>
    <article class="prompt-card">
      <h3>Staatsanwältin Nelson</h3>
      <p>${lens.nelson}</p>
    </article>
    <article class="prompt-card">
      <h3>Richterliche Leitfrage</h3>
      <p>${lens.judge}</p>
      <p class="small-note">Didaktische Paraphrase in der Logik des Stücks, nicht als wörtliches Zitat.</p>
    </article>
    <article class="prompt-card">
      <h3>Verfahrensauftrag Der Runde</h3>
      <p>${courtPrompt.theoryFocus}</p>
      <p>${courtPrompt.attribution}</p>
      <p>${courtPrompt.classAction}</p>
      <p class="small-note">Vorbereitender Link zur Theoriefrage: <a href="https://www.dropbox.com/scl/fi/0q2zm7rgr03b7l9bz133z/STRASSENBAHN-das-philosophische-Gedankenexperiment-filosofix.mp4?rlkey=oh1qz7n1nhgq0kcuu8jpgipt2&st=ud6qhs4q&dl=0" target="_blank" rel="noreferrer noopener">Straßenbahn - das philosophische Gedankenexperiment</a></p>
    </article>
    ${externalDecision ? `
      <article class="prompt-card">
        <h3>Neue Lageeinspielung</h3>
        <p><strong>${externalDecision.institution}</strong> setzt mit <strong>${externalDecision.title}</strong> einen neuen Rahmen.</p>
        <p>${externalDecision.summary}</p>
        <p>${externalDecision.ruleText}</p>
        <p>${externalImpact.exceptionPath
          ? externalImpact.allowed
            ? (externalImpact.conditionText || 'Diese Einspielung wirkt gerade eher richtungsweisend als blockierend.')
            : externalImpact.blockingReason
          : 'Noch ist diese Einspielung nur ein Hintergrundsignal. Sie wird erst scharf, wenn eure Gruppe wirklich auf Ausnahme oder Abschuss zusteuert.'}</p>
      </article>
    ` : ''}
  `;
}

function renderLog() {
  logList.innerHTML = state.log.map((entry) => `
    <li><span class="log-round">Runde ${entry.round}, T - ${entry.minute}:</span> ${entry.text}</li>
  `).join('');
}

function renderCompanionModePicker() {
  companionModePicker.innerHTML = ROLE_ORDER.map((roleId) => `
    <label class="toggle-pill">
      <input
        class="toggle-input"
        type="checkbox"
        data-role-toggle="${roleId}"
        ${state.companionRoles[roleId] ? 'checked' : ''}
      />
      <span>${ROLE_META[roleId].short} per Handy</span>
    </label>
  `).join('');

  companionModePicker.querySelectorAll('[data-role-toggle]').forEach((input) => {
    input.addEventListener('change', () => {
      toggleCompanionRole(input.dataset.roleToggle, input.checked);
    });
  });
}

function renderCompanionPanel() {
  const activeRoles = ROLE_ORDER.filter((roleId) => state.companionRoles[roleId]);

  if (!activeRoles.length) {
    companionPanel.innerHTML = `
      <p class="companion-empty">
        ${getPlayMode() === 'hybrid'
          ? 'Ihr seid jetzt im Handy-Bereich. Setzt zuerst oben Häkchen bei den Rollen, die per Handy spielen sollen. Danach scannt jede dieser Personen den QR-Code ihrer Rolle.'
          : 'Aktuell ist keine Rolle für den Handy-Modus aktiviert. Die Partie läuft damit komplett und eindeutig auf dem Desktop: eine Karte pro Rolle, dann „Runde auswerten“. Wenn ihr doch mit Handys arbeiten wollt, stellt das ganz oben im Unterrichtsstart auf „Desktop + Handys“ um.'}
      </p>
    `;
    return;
  }

  companionPanel.innerHTML = activeRoles.map((roleId) => {
    const role = ROLE_META[roleId];
    const quickInviteUrl = buildInviteUrl(roleId, '1');
    const detailedInviteUrl = buildInviteUrl(roleId, '2');
    const quickQrMarkup = buildQrMarkup(quickInviteUrl);
    const detailedQrMarkup = buildQrMarkup(detailedInviteUrl);
    const selectedCardId = state.selections[roleId];
    const selectedCard = getAvailableCards(roleId, state).find((card) => card.id === selectedCardId)
      || CARD_LIBRARY[roleId].find((card) => card.id === selectedCardId);
    const roleVote = getRoleVote(roleId);
    const round = ROUNDS[Math.min(state.roundIndex, ROUNDS.length - 1)];

    return `
      <article class="companion-card">
        <div class="companion-card-head">
          <div>
            <h3>${role.label}</h3>
            <p>Runde ${state.roundIndex + 1}, T - ${round.minute} Minuten. Beide QR-Codes gelten nur für diese Runde.</p>
          </div>
          <span class="companion-status">${selectedCard ? 'Rollenpaket oder Auswahl liegt vor' : 'Warte auf Handy'}</span>
        </div>

        <div class="companion-body">
          <div class="companion-mode-grid">
            <div class="companion-qr mode-detailed">
              <strong>Handy-Modus 2 · Ausführlich und stabil</strong>
              <div class="qr-image">${detailedQrMarkup || '<p class="small-note">QR-Code konnte lokal nicht erzeugt werden.</p>'}</div>
              <p class="small-note">Empfohlen: Das Handy sieht die ausführliche Rollenansicht, stimmt über den Weg ab, schreibt ein Kurzvotum und wählt die Rollenkarte. Danach entsteht ein vollständiges Rollenpaket zum Einfügen.</p>
              <button class="copy-btn" type="button" data-copy-url="${roleId}" data-copy-mode="2">QR-Link Modus 2 kopieren</button>
            </div>

            <div class="companion-qr">
              <strong>Handy-Modus 1 · Nur Kartenwahl</strong>
              <div class="qr-image">${quickQrMarkup || '<p class="small-note">QR-Code konnte lokal nicht erzeugt werden.</p>'}</div>
              <p class="small-note">Fallback: Das Handy sieht nur diese Rolle und erzeugt danach einen kurzen Karten-Code.</p>
              <button class="copy-btn" type="button" data-copy-url="${roleId}" data-copy-mode="1">QR-Link Modus 1 kopieren</button>
            </div>
          </div>

          <div class="companion-controls">
            <div class="choice-tags">
              <span class="tag">Sitzung ${state.sessionId}</span>
              <span class="tag">${role.short}</span>
              <span class="tag">${Number.isInteger(roleVote.choiceIndex) ? `Stimme: Weg ${roleVote.choiceIndex + 1}` : 'Noch kein Votum'}</span>
              <span class="tag">${selectedCard ? `Gewählt: ${selectedCard.title}` : 'Noch keine Auswahl'}</span>
            </div>
            <textarea
              class="code-field"
              id="answer-${roleId}"
              placeholder="Hier entweder den kurzen Karten-Code oder das ausführliche Rollenpaket aus dem Handy einfügen."
            ></textarea>
            <div class="code-row">
              <button class="primary-btn" type="button" data-apply-answer="${roleId}">Antwort übernehmen</button>
            </div>
            <p class="small-note">Im ausführlichen Modus 2 übernimmt die App mit einem einzigen Paket die Abstimmung der Rolle, das Kurzvotum und die Kartenwahl.</p>
          </div>
        </div>
      </article>
    `;
  }).join('');

  companionPanel.querySelectorAll('[data-copy-url]').forEach((button) => {
    button.addEventListener('click', () => {
      copyText(buildInviteUrl(button.dataset.copyUrl, button.dataset.copyMode || '1'))
        .then(() => {
          roundFeedback.textContent = `Der Rollenlink für ${ROLE_META[button.dataset.copyUrl].label} im Handy-Modus ${button.dataset.copyMode || '1'} wurde in die Zwischenablage kopiert.`;
          roundFeedback.className = 'round-feedback tone-safe';
        })
        .catch(() => {
          roundFeedback.textContent = 'Der Link konnte nicht automatisch kopiert werden. Der QR-Code funktioniert weiterhin direkt.';
          roundFeedback.className = 'round-feedback tone-danger';
        });
    });
  });

  companionPanel.querySelectorAll('[data-apply-answer]').forEach((button) => {
    button.addEventListener('click', () => {
      const roleId = button.dataset.applyAnswer;
      const field = document.querySelector(`#answer-${roleId}`);
      applyCompanionAnswer(roleId, field ? field.value : '');
    });
  });
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
    { label: 'Juristische Tendenz', value: verdict }
  ].map((item) => `
    <article class="ending-stat">
      <span>${item.label}</span>
      <strong>${item.value}</strong>
    </article>
  `).join('');

  indictmentText.textContent = closing.indictment;
  defenseText.textContent = closing.defense;
  trolleyText.textContent = closing.trolley;
  kochText.textContent = closing.koch;
  judgeAcquitText.textContent = closing.judgeAcquit;
  judgeConvictText.textContent = closing.judgeConvict;
  classroomIntegrationText.textContent = closing.classroomIntegration;
  endScreen.classList.remove('hidden');
}

function renderRestoreBanner() {
  restoredBanner.classList.toggle('hidden', !state.restored);
}

function getPhoneInviteFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const phoneMode = params.get('phone');
  if (!['1', '2'].includes(phoneMode)) return null;

  const payload = decodePayload(params.get('payload'));
  if (!payload || !ROLE_META[payload.o] || typeof payload.r !== 'number') return { invalid: true };
  return {
    ...payload,
    pm: phoneMode
  };
}

function getPhoneDraftKey(invite) {
  return `${invite.s}:${invite.r}:${invite.o}:${invite.pm || '1'}`;
}

function ensurePhoneDraft(invite) {
  const nextKey = getPhoneDraftKey(invite);
  if (phoneDraftState.key === nextKey) return;
  phoneDraftState = {
    key: nextKey,
    simpleSelectedIndex: null,
    voteChoiceIndex: null,
    voteReason: '',
    cardId: ''
  };
}

function renderDetailedPhoneActionPanel(invite, snapshot, role, availableCards) {
  const selectedCard = availableCards.find((card) => card.id === phoneDraftState.cardId) || null;
  const hasVoteChoice = Number.isInteger(phoneDraftState.voteChoiceIndex) && phoneDraftState.voteChoiceIndex >= 0;
  const hasReason = isVoteReasonValid(phoneDraftState.voteReason);
  const ready = hasVoteChoice && hasReason && selectedCard;
  const packageCode = ready
    ? buildDetailedAnswerPackage(invite, {
      voteChoiceIndex: phoneDraftState.voteChoiceIndex,
      voteReason: phoneDraftState.voteReason.trim(),
      cardId: selectedCard.id
    })
    : '';

  phoneActionPanel.innerHTML = ready
    ? `
      <div class="panel-head compact">
        <h2>Rollenpaket für den Desktop</h2>
        <p>Dieses Paket übernimmt auf dem Desktop die Abstimmung dieser Rolle, das Kurzvotum und die Kartenwahl in einem Schritt.</p>
      </div>
      <div class="phone-package-box">${escapeHtml(packageCode)}</div>
      <div class="phone-package-summary">
        <strong>${role.label}</strong>
        <span>Stimme: Weg ${phoneDraftState.voteChoiceIndex + 1}</span>
        <span>Karte: ${selectedCard.title}</span>
      </div>
      <div class="button-row">
        <button id="copyPhonePackageBtn" class="primary-btn" type="button">Rollenpaket kopieren</button>
      </div>
    `
    : `
      <div class="panel-head compact">
        <h2>Noch nicht vollständig</h2>
        <p>Für das ausführliche Rollenpaket braucht ihr drei Dinge: einen gewählten Weg, ein kurzes Votum und eine Rollenkarte.</p>
      </div>
      <div class="phone-checklist">
        <span class="${hasVoteChoice ? 'ready' : ''}">Weg ${hasVoteChoice ? 'gewählt' : 'fehlt noch'}</span>
        <span class="${hasReason ? 'ready' : ''}">Kurzvotum ${hasReason ? 'vollständig' : 'fehlt noch'}</span>
        <span class="${selectedCard ? 'ready' : ''}">Rollenkarte ${selectedCard ? 'gewählt' : 'fehlt noch'}</span>
      </div>
      <p class="phone-summary">Diese Ansicht bleibt komplett stabil ohne Live-Verbindung. Wenn sich die Runde ändert, scannt ihr einfach den frischen QR-Code erneut.</p>
    `;

  const copyButton = document.querySelector('#copyPhonePackageBtn');
  if (copyButton && packageCode) {
    copyButton.addEventListener('click', () => {
      copyText(packageCode)
        .then(() => {
          copyButton.textContent = 'Rollenpaket kopiert';
        })
        .catch(() => {
          copyButton.textContent = 'Bitte manuell kopieren';
        });
    });
  }
}

function renderDetailedPhoneScreen(invite) {
  ensurePhoneDraft(invite);
  const role = ROLE_META[invite.o];
  const snapshot = buildCompanionSnapshot(invite);
  const round = ROUNDS[Math.min(snapshot.roundIndex, ROUNDS.length - 1)];
  const guide = getRoundGuide(snapshot.roundIndex);
  const teaching = getTeacherBriefing(snapshot.roundIndex);
  const facts = getRoundFacts(snapshot.roundIndex);
  const measures = getRoundSharedMeasures(snapshot.roundIndex);
  const availableCards = getAvailableCards(invite.o, snapshot);
  const selectedCard = availableCards.find((card) => card.id === phoneDraftState.cardId) || null;
  const selectedMeasure = measures.find((measure) => measure.id === snapshot.selectedMeasureId) || null;
  const politicalClimate = getPoliticalClimate(snapshot);
  const politicalVisible = isPoliticalContextVisible(snapshot);
  const externalDecision = getRoundExternalDecision(snapshot.roundIndex, snapshot);

  desktopApp.classList.add('hidden');
  phoneApp.classList.remove('hidden');
  phoneLead.textContent = `Du spielst ${role.label} in Runde ${snapshot.roundIndex + 1} im ausführlichen Handy-Modus. Diese Ansicht zeigt dir dieselbe Lage wie am Desktop, aber nur für deine Rolle.`;

  phoneStatusPanel.innerHTML = `
    <div class="panel-head compact">
      <h2>Rollenstatus</h2>
      <p>Das ist die ausführliche, stabile Handy-Variante ohne Live-Synchronisierung.</p>
    </div>
    <div class="phone-status-grid">
      <article class="phone-status-card">
        <span>Rolle</span>
        <strong>${role.label}</strong>
      </article>
      <article class="phone-status-card">
        <span>Spielende Person</span>
        <strong>${snapshot.phonePlayerLabel || 'nicht hinterlegt'}</strong>
      </article>
      <article class="phone-status-card">
        <span>Zeitleiste</span>
        <strong>Runde ${snapshot.roundIndex + 1} · T - ${round.minute}</strong>
      </article>
      <article class="phone-status-card">
        <span>Stimmgewicht</span>
        <strong>${snapshot.phoneVoteWeight} Punkte</strong>
      </article>
      <article class="phone-status-card">
        <span>${politicalVisible ? 'Regierungslinie' : 'Politische Lage'}</span>
        <strong>${politicalVisible ? politicalClimate.label : 'noch nicht offengelegt'}</strong>
      </article>
    </div>
  `;

  phoneRolePanel.innerHTML = `
    <div class="panel-head">
      <h2>${round.title}</h2>
      <p>${teaching.happened}</p>
    </div>

    <div class="briefing-fact-grid">
      ${facts.map((fact) => `
        <article class="briefing-fact-card">
          <strong>${fact.label}</strong>
          <span>${fact.value}</span>
        </article>
      `).join('')}
    </div>

    <article class="prompt-card">
      <h3>Deine Rolle in dieser Runde</h3>
      <p>${role.goal}</p>
      <p><strong>Warum deine Stimme ${snapshot.phoneVoteWeight} Punkte zählt:</strong> ${snapshot.phoneVoteWeightReason}</p>
      <p><strong>Leitfrage:</strong> ${teaching.conflict}</p>
      <p><strong>Was am Ende entschieden werden soll:</strong> ${teaching.decisionTask}</p>
      ${politicalVisible
        ? `
          <p><strong>Regierungskontext:</strong> ${politicalClimate.label} - ${politicalClimate.coalition}. ${politicalClimate.studentMeaning}</p>
          <p><strong>Was meint „übergesetzlicher Notstand“?</strong> ${EXTRAORDINARY_EMERGENCY_EXPLAINER}</p>
          <p><strong>Politische Zusatzlage:</strong> ${politicalClimate.recognizesEmergency
            ? `Diese Regierung ist für solche Ausnahmelogik grundsätzlich offen. Falls eure Runde später wirklich auf Ausnahmefreigabe oder Abschuss hinausläuft, prüft die App einmal zufällig, ob diese Klausel politisch wirksam wird (${Math.round(politicalClimate.activationChance * 100)} % Chance).`
            : 'Diese Regierung lehnt den übergesetzlichen Notstand ab. Falls eure Runde später auf Ausnahmefreigabe oder Abschuss hinausläuft, greift diese Klausel politisch nicht.'}</p>
        `
        : `
          <p><strong>Politische Lage:</strong> Die genaue Regierungslinie ist in dieser frühen Runde noch nicht freigegeben. Entscheide zuerst nur aus deiner Rolle heraus, was jetzt verantwortbar ist.</p>
        `}
    </article>

    <article class="prompt-card">
      <h3>Die drei Wege dieser Runde</h3>
      <div class="briefing-action-grid">
        ${teaching.paths.map((path, index) => `
          <button
            class="vote-choice-btn ${phoneDraftState.voteChoiceIndex === index ? 'selected' : ''}"
            type="button"
            data-phone-vote-choice="${index}"
          >
            <strong>Weg ${index + 1}</strong>
            <span>${path}</span>
          </button>
        `).join('')}
      </div>
    </article>

    ${shouldShowExternalDecision(externalDecision, 'phone') ? `
      <article class="prompt-card">
        <h3>Neue Einspielung</h3>
        <p><strong>${externalDecision.institution}:</strong> ${externalDecision.title}</p>
        <p>${externalDecision.summary}</p>
        <p><strong>Wirkung für diese Runde:</strong> ${externalDecision.ruleText}</p>
      </article>
    ` : ''}

    <article class="prompt-card">
      <h3>Dein kurzes Votum</h3>
      <p>Schreibe in einem klaren Satz, warum deine Rolle genau diesen Weg unterstützt. Dieses Votum wird zusammen mit deiner Stimme in das Rollenpaket übernommen.</p>
      <textarea
        id="phoneVoteReason"
        class="vote-reason-field"
        placeholder="Beispiel: Ich stimme für Weg 2, weil meine Rolle jetzt vor allem Zeit für eine echte Stadionräumung gewinnen muss."
      >${escapeHtml(phoneDraftState.voteReason)}</textarea>
    </article>

    <article class="prompt-card">
      <h3>Gemeinsamer Krisenbeschluss der Klasse</h3>
      <p>Dieser Beschluss wird von der Gesamtgruppe auf dem Desktop gewählt. Du siehst hier aber dieselben Optionen, damit deine Rolle die Lage vollständig versteht.</p>
      <div class="measure-grid">
        ${measures.map((measure) => `
          <article class="measure-btn ${selectedMeasure?.id === measure.id ? 'selected' : ''}">
            <strong>${measure.title}</strong>
            <span>${measure.summary}</span>
            <em>Folge: ${measure.impact}</em>
          </article>
        `).join('')}
      </div>
      <div class="measure-result-card ${selectedMeasure ? 'is-ready' : ''}">
        ${selectedMeasure
          ? `<p><strong>Bereits gewählt am Desktop:</strong> ${selectedMeasure.title}</p><p>${selectedMeasure.summary}</p>`
          : '<p><strong>Noch nicht gewählt:</strong> Der gemeinsame Krisenbeschluss wird später mit der ganzen Klasse auf dem Desktop festgelegt.</p>'}
      </div>
    </article>

    <article class="prompt-card">
      <h3>Deine Rollenkarte</h3>
      <p>Wähle jetzt die konkrete Auswahlkarte, mit der deine Rolle den Rundenentscheid praktisch umsetzt.</p>
      <div class="phone-choice-grid">
        ${availableCards.map((card) => `
          <button
            class="choice-btn ${selectedCard?.id === card.id ? 'selected' : ''}"
            type="button"
            data-phone-detailed-card="${card.id}"
            style="${selectedCard?.id === card.id ? `background:${role.soft};border-color:${role.color};` : ''}"
          >
            <span class="choice-kicker">Auswahlkarte für ${role.short}</span>
            <h4>${card.title}</h4>
            <p>${card.description}</p>
            <div class="choice-tags">
              ${card.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}
            </div>
          </button>
        `).join('')}
      </div>
    </article>

    <article class="prompt-card">
      <h3>Darauf soll deine Rolle achten</h3>
      <ol class="discussion-list">
        ${guide.prompts.map((prompt) => `<li>${prompt}</li>`).join('')}
      </ol>
    </article>
  `;

  renderDetailedPhoneActionPanel(invite, snapshot, role, availableCards);

  phoneRolePanel.querySelectorAll('[data-phone-vote-choice]').forEach((button) => {
    button.addEventListener('click', () => {
      phoneDraftState.voteChoiceIndex = Number(button.dataset.phoneVoteChoice);
      renderDetailedPhoneScreen(invite);
    });
  });

  const voteReasonField = document.querySelector('#phoneVoteReason');
  if (voteReasonField) {
    voteReasonField.addEventListener('input', () => {
      phoneDraftState.voteReason = voteReasonField.value;
      renderDetailedPhoneActionPanel(invite, snapshot, role, availableCards);
    });
  }

  phoneRolePanel.querySelectorAll('[data-phone-detailed-card]').forEach((button) => {
    button.addEventListener('click', () => {
      phoneDraftState.cardId = button.dataset.phoneDetailedCard;
      renderDetailedPhoneScreen(invite);
    });
  });
}

function renderPhoneScreen(invite, selectedIndex = null) {
  ensurePhoneDraft(invite);
  const role = ROLE_META[invite.o];
  const snapshot = buildCompanionSnapshot(invite);
  const round = ROUNDS[Math.min(snapshot.roundIndex, ROUNDS.length - 1)];
  if (selectedIndex !== null) {
    phoneDraftState.simpleSelectedIndex = selectedIndex;
  }
  const availableCards = getAvailableCards(invite.o, snapshot);
  const selectedCard = phoneDraftState.simpleSelectedIndex !== null ? availableCards[phoneDraftState.simpleSelectedIndex] : null;
  const answerCode = selectedCard
    ? buildAnswerCode(invite.s, snapshot.roundIndex, invite.o, phoneDraftState.simpleSelectedIndex)
    : '';

  desktopApp.classList.add('hidden');
  phoneApp.classList.remove('hidden');
  phoneLead.textContent = `Du spielst ${role.label} in Runde ${snapshot.roundIndex + 1}. Es gibt keine Live-Verbindung: erst Karte wählen, dann den Antwortcode auf dem Desktop eintragen.`;

  phoneStatusPanel.innerHTML = `
    <div class="panel-head compact">
      <h2>Rundenstatus</h2>
      <p>Diese Ansicht ist absichtlich schmal: nur Rolle, Lage und Kartenhand der aktuellen Runde.</p>
    </div>
    <div class="phone-status-grid">
      <article class="phone-status-card">
        <span>Rolle</span>
        <strong>${role.label}</strong>
      </article>
      <article class="phone-status-card">
        <span>Zeitleiste</span>
        <strong>Runde ${snapshot.roundIndex + 1} · T - ${round.minute}</strong>
      </article>
      <article class="phone-status-card">
        <span>Gefahr</span>
        <strong>${snapshot.resources.danger} / 20</strong>
      </article>
      <article class="phone-status-card">
        <span>Evakuierung</span>
        <strong>${snapshot.resources.evacuation}%</strong>
      </article>
    </div>
  `;

  phoneRolePanel.innerHTML = `
    <div class="panel-head">
      <h2>${round.title}</h2>
      <p>${round.summary}</p>
    </div>
    <p class="phone-summary">${role.goal}</p>
    <div class="phone-choice-grid">
      ${availableCards.map((card, index) => `
        <button
          class="choice-btn ${selectedIndex === index ? 'selected' : ''}"
          type="button"
          data-phone-card="${index}"
          style="${selectedIndex === index ? `background:${role.soft};border-color:${role.color};` : ''}"
        >
          <h4>${card.title}</h4>
          <p>${card.description}</p>
          <div class="choice-tags">
            ${card.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}
          </div>
        </button>
      `).join('')}
    </div>
  `;

  phoneActionPanel.innerHTML = selectedCard
    ? `
      <div class="panel-head compact">
        <h2>Antwortcode</h2>
        <p>Gib diesen Code am Desktop bei ${role.label} ein und übernimm ihn dort.</p>
      </div>
      <div class="phone-code">${answerCode}</div>
      <p class="phone-summary">Gewählt: <strong>${selectedCard.title}</strong>. Wenn ihr die Entscheidung ändert, einfach eine andere Karte antippen und den neuen Code benutzen.</p>
      <div class="button-row">
        <button id="copyPhoneCodeBtn" class="primary-btn" type="button">Antwortcode kopieren</button>
      </div>
    `
    : `
      <div class="panel-head compact">
        <h2>So spielst du weiter</h2>
        <p>Wähle eine Karte. Direkt danach erscheint der kurze Antwortcode für den Desktop.</p>
      </div>
      <p class="phone-summary">
        Diese Ansicht braucht keine Verbindung zum Desktop. Wenn die nächste Runde beginnt,
        scannt ihr einfach den neuen QR-Code für dieselbe Rolle erneut.
      </p>
    `;

  phoneRolePanel.querySelectorAll('[data-phone-card]').forEach((button) => {
    button.addEventListener('click', () => {
      renderPhoneScreen(invite, Number(button.dataset.phoneCard));
    });
  });

  const copyButton = document.querySelector('#copyPhoneCodeBtn');
  if (copyButton && answerCode) {
    copyButton.addEventListener('click', () => {
      copyText(answerCode)
        .then(() => {
          copyButton.textContent = 'Code kopiert';
        })
        .catch(() => {
          copyButton.textContent = 'Bitte manuell kopieren';
        });
    });
  }
}

function renderInvalidPhoneScreen() {
  desktopApp.classList.add('hidden');
  phoneApp.classList.remove('hidden');
  phoneLead.textContent = 'Der QR-Code ist ungültig oder veraltet. Bitte scannt den frischen Code direkt von der aktuellen Desktop-Runde erneut.';
  phoneStatusPanel.innerHTML = '';
  phoneRolePanel.innerHTML = `
    <div class="panel-head">
      <h2>QR-Code neu scannen</h2>
      <p>Jede Runde erzeugt frische Rollenlinks. Alte Codes passen nicht mehr zur aktuellen Hand.</p>
    </div>
  `;
  phoneActionPanel.innerHTML = `
    <p class="phone-summary">Geht zur Desktop-Ansicht zurück und scannt dort den aktuellen QR-Code noch einmal.</p>
    <div class="button-row">
      <a class="ghost-link" href="${getBaseAppUrl().toString()}">Zur Desktop-Ansicht</a>
    </div>
  `;
}

function render() {
  if (state.setupComplete && !state.finished) {
    ensureRoundExternalDecision();
  }
  updateStatuses(state);
  renderRestoreBanner();
  renderRoleAssignmentPanel();
  renderSetupPanel();
  renderStatusStrip();
  renderBriefing();
  renderCurrentTaskPanel();
  renderDiscussionPanel();
  renderAuthorityPanel();
  renderResolutionOrder();
  renderSelectionSummary();
  renderRoles();
  renderResources();
  renderMatrix();
  renderMetaSummary();
  renderReferencePanel();
  renderCompanionModePicker();
  renderCompanionPanel();
  renderLog();
  renderEndScreen();

  const missingPlayerNames = getMissingPlayerNameRoleIds();
  const voteOutcome = getRoundVoteOutcome();
  const selectedMeasure = getSelectedSharedMeasure();
  const authorityOutcome = getRoundAuthorityOutcome();
  const externalImpact = getRoundExternalDecisionImpact();
  document.body.classList.toggle('overlay-active', state.setupComplete && gameOverlayOpen);
  gameOverlay.classList.toggle('hidden', !(state.setupComplete && gameOverlayOpen));
  gameOverlay.setAttribute('aria-hidden', state.setupComplete && gameOverlayOpen ? 'false' : 'true');
  resumeGameBtn.classList.toggle('hidden', !state.setupComplete);
  resumeGameBtn.disabled = gameOverlayOpen;
  resumeGameBtn.textContent = gameOverlayOpen ? 'Spielfenster ist geöffnet' : 'Laufende Partie öffnen';
  navOpenGameBtn.disabled = !state.setupComplete;
  navOpenGameBtn.textContent = state.setupComplete ? 'Direkt zur Partie' : 'Partie noch nicht gestartet';
  navCompanionBtn.disabled = false;
  navCompanionBtn.textContent = state.setupComplete && getPlayMode() === 'hybrid'
    ? 'Handy-Version starten'
    : 'Handy-Weg öffnen';
  resolveBtn.disabled = state.finished || !state.setupComplete || !voteOutcome.complete || !selectedMeasure || !authorityOutcome.allowed || !externalImpact.allowed;
  if (state.finished) {
    roundFeedback.textContent = 'Die Partie ist abgeschlossen. Über „Neue Partie“ könnt ihr eine neue Verantwortungsspur legen.';
    roundFeedback.className = 'round-feedback tone-neutral';
  } else if (!state.setupComplete) {
    const names = missingPlayerNames.map((roleId) => `${ROLE_ASSIGNMENTS[roleId].slot} / ${ROLE_META[roleId].short}`).join(', ');
    roundFeedback.textContent = missingPlayerNames.length
      ? `Unterrichtsstart noch nicht abgeschlossen. Diese Rollen brauchen noch einen Namen oder den Modus „gemeinsam in der Gruppe“: ${names}.`
      : 'Unterrichtsstart bereit. Drückt oben „Spiel starten“, um Runde 1 freizuschalten.';
    roundFeedback.className = 'round-feedback tone-danger';
  } else if (!voteOutcome.complete) {
    const names = voteOutcome.missingRoles.map((roleId) => ROLE_META[roleId].short).join(', ');
    roundFeedback.textContent = `Nächster Schritt: Gebt in „4. Diskussion und Abstimmung“ noch vollständige Kurzvoten ab für ${names}. Erst dann erzeugt die App den Rundenentscheid und schaltet die Auswahlkarten frei.`;
    roundFeedback.className = 'round-feedback tone-legal';
  } else if (!selectedMeasure) {
    roundFeedback.textContent = 'Der Rundenentscheid steht fest. Wählt jetzt zusätzlich den gemeinsamen Krisenbeschluss dieser Runde. Erst danach werden die Auswahlkarten freigeschaltet.';
    roundFeedback.className = 'round-feedback tone-legal';
  } else if (!authorityOutcome.ready) {
    const names = authorityOutcome.missingRoles.map((roleId) => ROLE_META[roleId].short).join(', ');
    roundFeedback.textContent = `Der Mehrheitsweg steht und der Krisenbeschluss ist gewählt. Jetzt müssen in Schritt 5 noch die Rollen mit Sonderrecht entscheiden: ${names}. Erst danach werden die Auswahlkarten freigeschaltet.`;
    roundFeedback.className = 'round-feedback tone-legal';
  } else if (!authorityOutcome.allowed) {
    const blockers = authorityOutcome.blockedBy.map((entry) => ROLE_META[entry.roleId].short).join(', ');
    roundFeedback.textContent = `Der Mehrheitsweg ist aktuell blockiert durch: ${blockers}. Ändert jetzt die Abstimmung oder das Veto, bevor ihr zu den Auswahlkarten weitergeht.`;
    roundFeedback.className = 'round-feedback tone-danger';
  } else if (externalImpact.exceptionPath && !externalImpact.allowed) {
    roundFeedback.textContent = `Ein externer Richtungsentscheid stoppt eure aktuelle Linie: ${externalImpact.blockingReason}`;
    roundFeedback.className = 'round-feedback tone-danger';
  } else {
    const missingRoles = getMissingRoleIds();
    if (missingRoles.length) {
      const names = missingRoles.map((roleId) => ROLE_META[roleId].short).join(', ');
      roundFeedback.textContent = `Der Rundenentscheid steht fest: Weg ${voteOutcome.winner.index + 1}. Die Sonderrechte sind geklärt. Wählt jetzt noch eine Auswahlkarte für ${names}. Erst danach drückt ihr „7. Runde auswerten“.`;
      roundFeedback.className = 'round-feedback tone-legal';
    } else {
      roundFeedback.textContent = 'Alle sechs Rollen haben gewählt. Drückt jetzt „7. Runde auswerten“ und lest danach unten Protokoll, Matrix und Meta-System.';
      roundFeedback.className = 'round-feedback tone-safe';
    }
  }
}

const desktopApp = document.querySelector('#desktopApp');
const phoneApp = document.querySelector('#phoneApp');
const phoneLead = document.querySelector('#phoneLead');
const phoneStatusPanel = document.querySelector('#phoneStatusPanel');
const phoneRolePanel = document.querySelector('#phoneRolePanel');
const phoneActionPanel = document.querySelector('#phoneActionPanel');
const phoneGuide = document.querySelector('#phoneGuide');
const roleAssignmentPanel = document.querySelector('#roleAssignmentPanel');
const setupPanel = document.querySelector('#setupPanel');
const gameOverlay = document.querySelector('#gameOverlay');
const gameSection = document.querySelector('#gameSection');
const statusStrip = document.querySelector('#statusStrip');
const briefingCard = document.querySelector('#briefingCard');
const currentTaskPanel = document.querySelector('#currentTaskPanel');
const discussionPanel = document.querySelector('#discussionPanel');
const authorityPanel = document.querySelector('#authorityPanel');
const resolutionOrder = document.querySelector('#resolutionOrder');
const selectionSummary = document.querySelector('#selectionSummary');
const roundFeedback = document.querySelector('#roundFeedback');
const rolesGrid = document.querySelector('#rolesGrid');
const resourceMeters = document.querySelector('#resourceMeters');
const matrixTable = document.querySelector('#matrixTable');
const metaSummary = document.querySelector('#metaSummary');
const referencePanel = document.querySelector('#referencePanel');
const companionModePicker = document.querySelector('#companionModePicker');
const companionPanel = document.querySelector('#companionPanel');
const companionSectionAnchor = document.querySelector('#companionSectionAnchor');
const logList = document.querySelector('#logList');
const endScreen = document.querySelector('#endScreen');
const endingHeadline = document.querySelector('#endingHeadline');
const endingStats = document.querySelector('#endingStats');
const indictmentText = document.querySelector('#indictmentText');
const defenseText = document.querySelector('#defenseText');
const trolleyText = document.querySelector('#trolleyText');
const kochText = document.querySelector('#kochText');
const judgeAcquitText = document.querySelector('#judgeAcquitText');
const judgeConvictText = document.querySelector('#judgeConvictText');
const classroomIntegrationText = document.querySelector('#classroomIntegrationText');
const restoredBanner = document.querySelector('#restoredBanner');
const newGameBtn = document.querySelector('#newGameBtn');
const resumeGameBtn = document.querySelector('#resumeGameBtn');
const navOpenGameBtn = document.querySelector('#navOpenGameBtn');
const navCompanionBtn = document.querySelector('#navCompanionBtn');
const resetBtn = document.querySelector('#resetBtn');
const resolveBtn = document.querySelector('#resolveBtn');
const closeGameBtn = document.querySelector('#closeGameBtn');
const gameOverlayBackdrop = document.querySelector('.game-overlay-backdrop');

let state = loadState() || createInitialState();
let gameOverlayOpen = state.setupComplete;
let phoneDraftState = {
  key: '',
  simpleSelectedIndex: null,
  voteChoiceIndex: null,
  voteReason: '',
  cardId: ''
};
if (localStorage.getItem(STORAGE_KEY)) {
  state.restored = true;
}
updateStatuses(state);

newGameBtn.addEventListener('click', () => {
  state = createInitialState();
  gameOverlayOpen = false;
  roundFeedback.textContent = 'Neue Partie vorbereitet. Richtet jetzt oben im Unterrichtsstart-Modus die Rollen ein und drückt danach „Spiel starten“.';
  roundFeedback.className = 'round-feedback tone-safe';
  saveState(state);
  render();
});

resumeGameBtn.addEventListener('click', openGameOverlay);
navOpenGameBtn.addEventListener('click', openGameOverlay);
navCompanionBtn.addEventListener('click', openCompanionEntry);
closeGameBtn.addEventListener('click', closeGameOverlay);
gameOverlayBackdrop.addEventListener('click', closeGameOverlay);
resetBtn.addEventListener('click', resetState);
resolveBtn.addEventListener('click', resolveRound);

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && gameOverlayOpen) {
    closeGameOverlay();
  }
});

const phoneInvite = getPhoneInviteFromUrl();

if (phoneInvite && !phoneInvite.invalid) {
  if ((phoneInvite.pm || '1') === '2') {
    renderDetailedPhoneScreen(phoneInvite);
  } else {
    renderPhoneScreen(phoneInvite);
  }
} else if (phoneInvite && phoneInvite.invalid) {
  renderInvalidPhoneScreen();
} else {
  render();
}
