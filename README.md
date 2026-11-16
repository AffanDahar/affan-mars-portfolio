# Affan Dahar — Mars Portfolio

An interactive software engineering portfolio with a playable Mars rocket landing. A successful landing reveals the resume, selected contributions, technical toolkit, experience, and contact information.

## Live website

https://affandahar.github.io/affan-mars-portfolio/

## Play

- Steer with **← / →** or **A / D**.
- Hold **Space / ↑ / W** to fire the thrusters and slow your descent.
- Land in the center of the mint landing pad at **4.5 m/s or slower**.
- Touch controls, auto-land, and a direct portfolio shortcut are included.

## Development

This is a buildless static website using HTML, CSS, and JavaScript. Serve the repository root with a local static file server:

```sh
python3 -m http.server 3000
```

Then visit `http://localhost:3000`.

- `index.html`: portfolio structure and resume content.
- `styles.css`: responsive dark theme with coral, mint, and cream accents.
- `game.js`: procedural Canvas artwork, physics, controls, auto-pilot, and landing checks.
- `app.js`: portfolio transitions, project contributions, flight manual, and contact interactions.
- `fonts.css` and `assets/`: locally hosted fonts, favicon, and resume PDF.

No build step, runtime dependencies, external font requests, or API keys are required. Asset links are relative so the website works under the GitHub Pages repository path.

## Deployment

GitHub Pages serves the `main` branch from the repository root. Push updates to `main` to republish automatically. `.nojekyll` keeps the static assets unchanged.

Project visuals are conceptual illustrations of the project context, not screenshots of proprietary applications. Employment details, skills, and education come from Affan's supplied resume.
