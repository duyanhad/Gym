# Gym

Frontend mobile app built with React Native and Expo. Use Expo Go to preview it on a physical device.

## Requirements

- Node.js LTS
- Expo Go on your iOS or Android device

## Run the app

```sh
npm install
npm start
```

Scan the QR code shown in the terminal using Expo Go. Your phone and development computer should be on the same network.

## Agent skills

Project skills are stored in `.agents/skills/`. The Playwright browser automation skill is in `.agents/skills/playwright-cli/`; add future project skills in the same directory. Shared checklists referenced by those skills live in `.agents/references/`.
Playwright Test is installed as a development dependency for browser-based end-to-end tests. These tests target the web version of the Expo app, not the native app inside Expo Go.

Run tests with `npm run test:e2e`, or open the interactive runner with `npm run test:e2e:ui`. Install Chromium once with `npx playwright install chromium`.

## Project structure

```text
.agents/
├── references/  Shared checklists used by installed skills
└── skills/      Agent skills for this project
src/
├── apis/        API clients and request functions
├── assets/      App-specific images, icons, and fonts
├── components/  Reusable UI components
├── constants/   Shared constants and theme
├── contexts/    React Context providers
├── hooks/       Reusable React hooks
├── layouts/     Shared screen layouts
├── pages/       App screens
├── routes/      React Navigation setup
├── services/    Business logic and integrations
├── store/       Shared application state
├── styles/      Shared styles
└── utils/       Reusable helpers

App.js           Root app component
index.js         Expo entry point
tests/           Playwright end-to-end tests
```

Navigation uses React Navigation Native Stack, which works with Expo Go.
