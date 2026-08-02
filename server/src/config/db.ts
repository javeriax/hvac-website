import mongoose from 'mongoose';
import { env } from './env';

mongoose.set('strictQuery', true);

const isDnsFailure = (err: unknown) => {
  const code = (err as { code?: string })?.code;
  const message = (err as Error)?.message ?? '';
  return (
    code === 'ECONNREFUSED' ||
    code === 'ETIMEOUT' ||
    code === 'ENOTFOUND' ||
    /querySrv|queryTxt/i.test(message)
  );
};

/**
 * Connect to MongoDB.
 *
 * mongodb+srv:// needs a DNS SRV record, and Node resolves those with c-ares
 * instead of the OS resolver. On a machine whose only nameservers are IPv6 that
 * lookup fails even though ordinary hostname lookups work fine. When we see that
 * specific failure we retry with the plain host list in MONGODB_URI_FALLBACK.
 */
export async function connectDB(): Promise<typeof mongoose> {
  try {
    const conn = await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 15000 });
    console.log(`[db] connected → ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    if (!env.mongoUriFallback || !isDnsFailure(err)) throw err;

    console.warn('[db] SRV lookup failed, retrying with the direct seed list');
    const conn = await mongoose.connect(env.mongoUriFallback, { serverSelectionTimeoutMS: 15000 });
    console.log(`[db] connected → ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}
