// This is the entry point Vercel actually runs — it is completely separate
// from src/server.ts, which is what `npm run dev` / Render / Railway use.
//
// Vercel does not run a long-lived process, so there is no good place to
// call connectDB() once "at startup" the way server.ts does. Instead the
// connection is opened lazily on the first request that hits a cold
// function, and reused on every request after that for as long as Vercel
// keeps that function instance warm.
import { createApp } from '../src/app';
import { connectDB } from '../src/config/db';

let connecting: Promise<unknown> | null = null;

function ensureDb() {
  if (!connecting) connecting = connectDB();
  return connecting;
}

// Express apps are directly callable as a (req, res) handler, which is all
// Vercel needs — no extra wrapper required.
const app = createApp({ awaitReady: ensureDb });

export default app;
