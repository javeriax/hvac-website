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
 * Connects to MongoDB.
 *
 * `mongodb+srv://` needs a DNS SRV lookup, which Node performs through c-ares
 * rather than the OS resolver. On machines whose only configured nameservers are
 * IPv6 (or behind a resolver that refuses SRV), that lookup fails even though
 * ordinary hostname resolution works. When that happens we retry with the
 * explicit replica-set seed list from MONGODB_URI_FALLBACK.
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
