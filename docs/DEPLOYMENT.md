# Deployment

Two pieces have to go somewhere: the Next.js frontend and the Express API.

**Frontend → Vercel.** It is a Next.js app, this is exactly what Vercel is for.

**API → Render or Railway,** not Vercel. Vercel runs serverless functions that spin up and down per
request. This API is a long-lived Express server holding an open Mongoose connection, so it does not
fit that model well. You would end up opening a new database connection on every cold start and
burning through Atlas connection limits. Render and Railway both have a free tier that runs a normal
Node process.

You can force the API onto Vercel if you must, but it means restructuring it into
`api/*` serverless handlers. Not worth it here.

---

## Before you start

Rotate every credential. The values used in development were shared during the build.

- MongoDB Atlas: change the database user's password.
- Cloudinary: roll the API secret.
- `JWT_SECRET`: generate a fresh long random string. Changing it signs everyone out, which is fine.

Generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

---

## Step 1 — Deploy the API first

The frontend needs the API's URL, so do this one first.

### Using Render

1. Push the repo to GitHub if you have not already.
2. Go to [render.com](https://render.com), sign in with GitHub, click **New → Web Service**.
3. Pick the `hvac-website` repo.
4. Fill in:

| Field | Value |
| --- | --- |
| Root Directory | `server` |
| Runtime | Node |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |

5. Add the environment variables:

| Key | Value |
| --- | --- |
| `MONGODB_URI` | your Atlas connection string |
| `JWT_SECRET` | the new random string |
| `JWT_EXPIRES_IN` | `7d` |
| `CLIENT_URL` | leave blank for now, you fill it in at step 3 |
| `CLOUDINARY_CLOUD_NAME` | from Cloudinary |
| `CLOUDINARY_API_KEY` | from Cloudinary |
| `CLOUDINARY_API_SECRET` | the new one |
| `NODE_ENV` | `production` |

Do **not** set `PORT`. Render assigns it and the app already reads `process.env.PORT`.
Do **not** set `MONGODB_URI_FALLBACK`. That was only for a local DNS quirk.

6. Deploy. You will get a URL like `https://serviceflow-api.onrender.com`.
7. Check it: open `https://your-api-url/api/health`. You should see JSON with `"service":
   "ServiceFlow API"`.

### Allow Atlas to reach it

In MongoDB Atlas → **Network Access**, add the host's outbound IP. Render does not publish static
IPs on the free tier, so `0.0.0.0/0` is the practical option there. If that bothers you, use a paid
tier with a static outbound IP.

### Seed the production database

From your machine, pointing at the production database:

```bash
MONGODB_URI="your-production-uri" npm --prefix server run seed:reset
```

On Windows PowerShell:

```powershell
$env:MONGODB_URI="your-production-uri"; npm --prefix server run seed:reset
```

This wipes whatever is there. Only do it on a fresh database.

---

## Step 2 — Deploy the frontend to Vercel

### Through the website (easier)

1. Go to [vercel.com/new](https://vercel.com/new) and import the GitHub repo.
2. Set **Root Directory** to `client`. This matters. Vercel will not find the app otherwise.
3. Framework preset should auto-detect as Next.js. Leave the build settings alone.
4. Add one environment variable:

| Key | Value |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | `https://your-api-url/api` |

Include the `/api` on the end. It is part of the base path the client uses.

5. Deploy. You get something like `https://hvac-website.vercel.app`.

### Through the CLI

```bash
npm i -g vercel
```

```bash
vercel login
```

```bash
cd client
```

```bash
vercel --prod
```

Answer the prompts. When it asks about the directory, you are already inside `client`, so accept the
default. Then add the env var:

```bash
vercel env add NEXT_PUBLIC_API_URL production
```

Paste `https://your-api-url/api` when prompted, then redeploy:

```bash
vercel --prod
```

---

## Step 3 — Point the API back at the frontend

Go back to Render and set:

| Key | Value |
| --- | --- |
| `CLIENT_URL` | `https://your-site.vercel.app` |

Then redeploy the API.

This matters because of CORS. `server/src/app.ts` only accepts requests from `CLIENT_URL` plus
localhost. If you skip this, the site loads but every API call fails and you get a wall of CORS
errors in the console.

---

## Step 4 — Check it works

1. Open the Vercel URL. The homepage should load with the thermostat dial.
2. Open the browser console. No CORS errors.
3. Sign in as `admin@arcticair.com` / `ArcticAir#2026`. If you reseeded production, this works.
4. Check the analytics page shows real numbers.
5. Submit a request from `/request-quote` with a photo, to confirm Cloudinary is wired up.
6. Track it from `/track` using the code you get back.

---

## Common problems

**Every API call fails with a CORS error.**
`CLIENT_URL` on the API does not match your Vercel domain exactly. It must include `https://` and no
trailing slash. Vercel preview deployments get their own URLs, so previews will fail CORS unless you
add them too.

**The site loads but all data is empty.**
`NEXT_PUBLIC_API_URL` is wrong or missing the `/api` suffix. Note that `NEXT_PUBLIC_*` variables are
baked in at build time, so you have to redeploy after changing it, not just restart.

**API returns 500 on every database call.**
Atlas is blocking the host's IP. Check Network Access.

**First request after a while takes 30 seconds.**
Render's free tier sleeps idle services. Normal. A paid tier or a keep-alive ping fixes it.

**Photo upload fails.**
Cloudinary keys are wrong, or you rotated the secret without updating the API env var.

---

## What is deployed where

```
Browser
  │
  ├─→ Vercel          Next.js frontend, static pages + client components
  │
  └─→ Render          Express API
        │
        ├─→ MongoDB Atlas      all application data
        └─→ Cloudinary         request photos, job photos, signatures
```
