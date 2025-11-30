import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Setup SSL configuration
let ssl: any = undefined;

if (process.env.DATABASE_CA_CERT) {
  // Replace literal \n with actual newlines
  const cert = process.env.DATABASE_CA_CERT.replace(/\\n/g, '\n');
  
  ssl = {
    rejectUnauthorized: true,
    ca: cert,
  };
}

// Create a single postgres connection instance
const sql = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
  ssl: ssl,
});

export default sql;