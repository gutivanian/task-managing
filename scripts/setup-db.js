require('dotenv').config(); // Tambahkan ini di baris pertama

const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL is not set in .env file');
    console.error('Current DATABASE_URL:', connectionString);
    process.exit(1);
  }

  console.log('Connecting to database...');
  
  // Setup SSL if certificate path is provided
  let ssl = undefined;
  
  if (process.env.DATABASE_SSL_CERT_PATH) {
    const certPath = path.resolve(process.env.DATABASE_SSL_CERT_PATH);
    
    if (fs.existsSync(certPath)) {
      ssl = {
        rejectUnauthorized: true,
        ca: fs.readFileSync(certPath).toString(),
      };
      console.log('✅ SSL certificate loaded from:', certPath);
    } else {
      console.warn('⚠️  SSL certificate not found at:', certPath);
    }
  }
  
  const sql = postgres(connectionString, { ssl });

  try {
    console.log('Reading schema file...');
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema...');
    await sql.unsafe(schema);

    console.log('✅ Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

setupDatabase();