# My Turborepo Project

This file provides instructions on how to run the different applications in this monorepo.

## Applications

- **admin-web**: The admin web interface.
- **api**: The backend API service.
- **docs**: The documentation site.
- **mobile**: The mobile application.
- **web-platform**: The main web platform.

## Running the Applications

To run each application, navigate to its directory and use the `dev` script.

### Running the API

To run the API service, use the following command from the `my-turborepo` root directory:

```bash
npm run dev --workspace=api
```

Alternatively, you can navigate to `apps/api` and run:

```bash
npm run dev
```

### Running the Mobile App

To run the mobile application, navigate to `apps/mobile` and run one of the following commands:

For Android:

```bash
npm run android
```

For iOS:

```bash
npm run ios
```

### Running the Web Applications

The web applications (`admin-web`, `docs`, and `web-platform`) are all Next.js applications. You can run them using their respective `dev` scripts.

**Port Assignments:**

- **web-platform**: Port 3000
- **api**: Port 3001
- **admin-web**: Port 3002
- **docs**: Port 3003 (if applicable)

See [PORT_ASSIGNMENTS.md](./PORT_ASSIGNMENTS.md) for complete port allocation details.

**admin-web (Port 3002):**

```bash
npm run dev --workspace=admin-web
```

**web-platform (Port 3000):**

```bash
npm run dev --workspace=web-platform
```

**docs (Port 3003):**

```bash
npm run dev --workspace=docs
```
