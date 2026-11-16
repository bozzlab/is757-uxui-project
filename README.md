# Signal — Social Monitoring Platform (Interactive Prototype)

IS757 UX/UI and Customer Experience. A static prototype built with plain HTML, CSS and JavaScript; no build step is required. All data is fictional.

## Scenarios

- **Case 1 (mobile to web):** push notification, alert detail (readable within 10 seconds), single-step escalation, then a deep link to the web dashboard.
- **Case 2 (web):** Mention Feed review queue, AI evidence, sentiment correction in three steps, confirmation with undo.

## Usage notes

- Use the left and right arrow keys to move between steps. Direct links are available as `#s1` to `#s8`.
- The "Simulated states" menu demonstrates error, no-permission and failure states.
- The interface language is Thai, matching the target users.

## Run locally

```
cd prototype
python3 -m http.server
```

Open http://localhost:8000.

## Deploy to GitHub Pages

1. Push the entire `ux` folder to a repository.
2. In Settings, open Pages, choose "Deploy from a branch", and select the branch and the `/ (root)` folder.
3. Open `https://<user>.github.io/<repo>/`. The root `index.html` redirects to `prototype/`.
