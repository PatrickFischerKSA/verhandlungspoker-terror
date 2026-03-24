# Verhandlungspoker: Terror

Ein statisches Webspiel zu Ferdinand von Schirachs *Terror*.

## Inhalt

- 13 Runden mit Zeitleiste von `T - 52` bis `T - 4`
- 6 Rollen: Koch, Führungszentrum, Ministerium, Katastrophenschutz, Nelson, Biegler
- Kartenbasiertes Entscheidungssystem ohne Zufall
- Verantwortungsmatrix für `aktiv`, `unterlassen` und `rechtlich`
- Meta-System mit Anklage- und Verteidigungspunkten
- Lokale Speicherung im Browser per `localStorage`

## Start lokal

Die App ist komplett statisch und kann direkt geöffnet werden:

- `index.html` im Browser öffnen

Oder mit einem einfachen lokalen Server:

```bash
python3 -m http.server 8000
```

Dann im Browser `http://localhost:8000` aufrufen.

## Deployment

Das Repository enthält einen GitHub-Pages-Workflow unter `.github/workflows/pages.yml`.

Nach dem Push auf `main` wird die Seite automatisch als GitHub Pages Site deployed.

## Dateien

- `index.html`: Oberfläche und Struktur
- `styles.css`: Layout und visuelle Gestaltung
- `app.js`: Spielzustand, Kartenlogik, Matrix, Persistenz und Endauswertung
