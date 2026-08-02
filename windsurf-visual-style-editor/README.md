# Windsurf Visual Style Editor (MVP)

A development-only visual style editor for React + Vite projects.

## What it does
- Adds a `Visual Styles` panel inside Windsurf/VS Code.
- Lets you enter element-pick mode in the browser.
- Shows computed styles for the selected element.
- Changes width, height, padding, margin, colors, radius, border, typography, opacity, display/flex alignment.
- Saves durable CSS rules to `src/visual-editor.generated.css`.
- Hot reload shows changes immediately.

## Architecture
1. Babel plugin injects `data-vse-id`, `data-vse-file`, and `data-vse-line` into JSX DOM elements during development.
2. Browser runtime highlights clicked elements and exchanges JSON messages over WebSocket.
3. Windsurf extension hosts the WebSocket bridge and renders a WebviewView sidebar.
4. The extension writes CSS overrides into the current workspace.

## 1. Install extension dependencies
```bash
cd extension
npm install
npm run compile
```

## 2. Run extension for development
Open the repository root in Windsurf, then run the `Run Visual Style Editor Extension` launch configuration.
A new Extension Development Host window opens.

## 3. Prepare your React + Vite app
Copy `app-runtime` and `babel-plugin` into your app or publish them as local packages.

Install dependencies:
```bash
npm install -D @babel/core
npm install ws
```

In `vite.config.ts` add the Babel transform plugin shown in `example/vite.config.ts`.

In `src/main.tsx`:
```ts
import './visual-editor.generated.css';

if (import.meta.env.DEV) {
  import('./visual-editor-runtime').then(({ startVisualEditor }) => {
    startVisualEditor();
  });
}
```

Copy `app-runtime/src/visual-editor-runtime.ts` to `src/visual-editor-runtime.ts`.

## 4. Use
1. Start the app with `npm run dev`.
2. In Windsurf run `Visual Style Editor: Start Bridge`.
3. Open the `Visual Styles` icon in the Activity Bar.
4. Press `Pick element`.
5. Click an element in your browser.
6. Change a value and press Enter or leave the field.
7. The extension updates `src/visual-editor.generated.css`.

## Security
The bridge binds to 127.0.0.1 only and is intended for development. Do not load the runtime in production.

## Known MVP limitations
- Edits are stored as generated CSS rather than rewritten into Tailwind classes.
- IDs are derived from source location, so major source movement may create a new selector.
- Pseudo states, media breakpoints, CSS variables, and undo history are not included yet.
