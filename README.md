# Social Listening — Social Monitoring Platform (Interactive Prototype)

Interactive prototype for the IS757 course (UX/UI and Customer Experience). A static prototype built with plain HTML, CSS and JavaScript; no build step is required. All data is fictional.

## Scenarios

- **Case 1 (mobile to web):** push notification, alert detail (readable within 10 seconds), single-step escalation, then a deep link to the web dashboard.
- **Case 2 (web):** Mention Feed review queue, AI evidence, sentiment correction in three steps, confirmation with undo.

## Wireframe (`/wireframe`)

A Figma-style canvas that shows the whole UX journey step by step across mobile, the web Mention Feed and the Dashboard. It contains a journey map with an emotion curve, lo-fi wireframes S1–S8 with annotations and prototype arrows, insight and decision stickies, a sitemap and edge states. You can open it from the "Wireframe" button in the prototype's top bar, or link straight to one screen with `wireframe/#S4`.

- Drag to pan, Ctrl/⌘ + scroll to zoom, Shift+1 to fit everything, ← → to step through frames.

## Usage notes

- Use the left and right arrow keys to move between steps. Direct links are available as `#s1` to `#s8`.
- The "Simulated states" menu demonstrates error, no-permission and failure states.
- The interface language is Thai, matching the target users.

## Run locally

Run the server from the project root (not inside `prototype/`), so both pages are served:

```
python3 -m http.server
```

- Prototype: http://localhost:8000/prototype/
- Wireframe: http://localhost:8000/wireframe/

## Deploy to GitHub Pages

1. Push the entire `ux` folder to a repository.
2. In Settings, open Pages, choose "Deploy from a branch", and select the branch and the `/ (root)` folder.
3. Open `https://<user>.github.io/<repo>/`. The root `index.html` redirects to `prototype/`.
