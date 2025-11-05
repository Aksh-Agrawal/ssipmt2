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

**Note on Port Conflicts:** By default, both `docs` and `web-platform` are configured to run on port 3001. This will cause a port conflict if you try to run both at the same time. To resolve this, you can run one of them on a different port by using the `--port` flag.

**admin-web (Port 3000):**
```bash
npm run dev --workspace=admin-web
```

**docs (Port 3001):**
```bash
npm run dev --workspace=docs
```

**web-platform (Port 3001):**
To run `web-platform` on a different port (e.g., 3002) to avoid conflicts with `docs`:

```bash
npm run dev --workspace=web-platform -- --port 3002
```

Or you can modify the `dev` script in `apps/web-platform/package.json` to use a different port by default.