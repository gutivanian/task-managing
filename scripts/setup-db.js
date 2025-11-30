const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/kanban_db';
  
  console.log('Connecting to database...');
  const sql = postgres(connectionString);

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
