# jacobross.com deployment

Static deployment for jacobross.com.

The `/middleschool/` page is encrypted in the browser with AES-256-GCM. The public repository contains only the encrypted payload, not the source family plan or its password.

To update it while keeping the same password:

```sh
MIDDLE_SCHOOL_PASSWORD='stored-password' node tools/encrypt-page.mjs path/to/plan.html middleschool/payload.json
```

Never commit the source plan or password. GitHub Pages publishes the `main` branch root.
