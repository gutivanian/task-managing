require('dotenv').config();

const postgres = require('postgres');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createUser() {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL is not set in .env file');
    process.exit(1);
  }

  // Setup SSL
  let ssl = undefined;
  if (process.env.DATABASE_CA_CERT) {
    const cert = process.env.DATABASE_CA_CERT.replace(/\\n/g, '\n');
    ssl = { rejectUnauthorized: true, ca: cert };
  }
  
  const sql = postgres(connectionString, { ssl });

  try {
    console.log('=== Create New User ===\n');
    
    const email = await question('Email: ');
    const name = await question('Name: ');
    const password = await question('Password: ');

    if (!email || !password) {
      console.error('\n❌ Email and password are required!');
      process.exit(1);
    }

    console.log('\n🔐 Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);

    console.log('📝 Creating user...');
    const users = await sql`
      INSERT INTO users (email, password_hash, name)
      VALUES (${email}, ${passwordHash}, ${name || null})
      RETURNING id, email, name
    `;

    console.log('\n✅ User created successfully!');
    console.log('----------------------------');
    console.log('ID:', users[0].id);
    console.log('Email:', users[0].email);
    console.log('Name:', users[0].name || '(no name)');
    console.log('Password:', password);
    console.log('----------------------------\n');

  } catch (error) {
    if (error.code === '23505') {
      console.error('\n❌ Error: Email already exists!');
    } else {
      console.error('\n❌ Error creating user:', error.message);
    }
    process.exit(1);
  } finally {
    await sql.end();
    rl.close();
  }
}

createUser();