# Verhandlungspoker: Terror

Ein statisches Webspiel zu Ferdinand von Schirachs *Terror*.

## Inhalt

- 13 Runden mit Zeitleiste von `T - 52` bis `T - 4`
- 6 Rollen: Koch, Führungszentrum, Ministerium, Katastrophenschutz, Nelson, Biegler
- Kleine, wechselnde Kartenhände pro Runde statt vollständiger Wunschwahl
- Zwei Szenarien: `Originalfall` und `Früher Alarm`
- Unterrichtsmodus mit Rollen-Presets und deaktivierbaren Rollen
- Serverloser Mehrspieler-/Handy-Modus mit Host-Gerät plus privaten Rollenbildschirmen
- Verdeckte Einzelziele pro Rolle
- Reflexionsfragen und Notizfeld nach jeder Runde
- Verantwortungsmatrix für `aktiv`, `unterlassen` und `rechtlich`
- Meta-System mit Anklage- und Verteidigungspunkten
- Differenzierte Urteile: `Freispruch`, `Verurteilung`, `Gespaltenes Urteil`, `Institutionelles Versagen`
- Verantwortungsdiagramm, Pro-/Contra-Auswertung und Berichtsexport
- Lokale Speicherung im Browser per `localStorage`

## Start lokal

Die App ist komplett statisch und kann direkt geöffnet werden:

- `index.html` im Browser öffnen

Oder mit einem einfachen lokalen Server:

```bash
python3 -m http.server 8000
```

Dann im Browser `http://localhost:8000` aufrufen.

## Handy-Modus

Der Companion-Modus funktioniert ohne Backend:

1. Host aktiviert im Browser den `Handy-Modus`.
2. Für eine Rolle wird ein kleiner QR-Code erzeugt.
3. Der QR-Code wird mit dem Smartphone gescannt.
4. Das Handy erzeugt einen Antwortcode.
5. Der Host fügt den Antwortcode ein und koppelt die Rolle.

Hinweis: Die direkte Verbindung funktioniert am zuverlässigsten im selben WLAN. Falls das Scannen einmal nicht klappt, bleibt der QR-Link weiterhin als Kopier-Fallback vorhanden.

## Tests

Die zentrale Spiellogik ist in `game-core.js` gebündelt und kann mit einem kleinen Node-Test geprüft werden:

```bash
node tests/game-core.test.js
```

## Deployment

Das Repository enthält einen GitHub-Pages-Workflow unter `.github/workflows/pages.yml`.

Nach dem Push auf `main` wird die Seite automatisch als GitHub Pages Site deployed.

## Dateien

- `index.html`: Oberfläche und Struktur
- `styles.css`: Layout, Touch-Optimierung und visuelle Gestaltung
- `game-core.js`: Spiellogik, Karten, Urteile, Ziele und Berichtsgenerierung
- `app.js`: Browser-UI, Persistenz, Export, Rendering und Handy-Kopplung
- `assets/`: Favicon und Social-Preview
- `tests/game-core.test.js`: kleine Logiktests für Kernfunktionen
