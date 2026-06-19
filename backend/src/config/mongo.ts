import dns from 'node:dns';
import mongoose from 'mongoose';
import { env } from './env';

const mongoOptions = {
  serverSelectionTimeoutMS: 10000,
};

function isSrvLookupError(error: unknown) {
  return (
    error instanceof Error
    && 'code' in error
    && ['ECONNREFUSED', 'ETIMEOUT', 'ENOTFOUND', 'ESERVFAIL'].includes(String(error.code))
    && 'hostname' in error
    && String(error.hostname).startsWith('_mongodb._tcp.')
  );
}

async function connectWithConfiguredDns() {
  const dnsServers = env.mongoDnsServers
    .split(',')
    .map(server => server.trim())
    .filter(Boolean);

  if (dnsServers.length === 0) {
    throw new Error('MONGODB_DNS_SERVERS must include at least one DNS server');
  }

  dns.setServers(dnsServers);
  await mongoose.connect(env.mongoUri, mongoOptions);
}

export async function connectMongo() {
  if (!env.mongoUri) {
    throw new Error('MONGODB_URI is required');
  }

  try {
    await mongoose.connect(env.mongoUri, mongoOptions);
  } catch (error) {
    if (!env.mongoUri.startsWith('mongodb+srv://') || !isSrvLookupError(error)) {
      throw error;
    }

    console.warn('MongoDB SRV DNS lookup failed with the system resolver. Retrying with configured DNS servers.');
    await connectWithConfiguredDns();
  }

  console.log('Connected to MongoDB');
}
