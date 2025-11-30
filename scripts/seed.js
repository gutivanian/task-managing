require('dotenv').config(); // Tambahkan ini di baris pertama

const postgres = require('postgres');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function seedDatabase() {
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
    console.log('Creating demo user...');
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    const users = await sql`
      INSERT INTO users (email, password_hash, name)
      VALUES ('admin@example.com', ${passwordHash}, 'Admin User')
      ON CONFLICT (email) DO UPDATE SET password_hash = ${passwordHash}
      RETURNING id
    `;
    const userId = users[0].id;
    console.log(`✅ User created with ID: ${userId}`);

    console.log('Creating sample project...');
    const projects = await sql`
      INSERT INTO projects (user_id, title, description, color)
      VALUES (
        ${userId},
        'Personal Tasks',
        'My personal task management board',
        '#3B82F6'
      )
      RETURNING id
    `;
    const projectId = projects[0].id;
    console.log(`✅ Project created with ID: ${projectId}`);

    console.log('Creating default columns...');
    const defaultColumns = [
      { title: 'Inbox', position: 0, color: '#6B7280', type: 'action' },
      { title: 'To Plan', position: 1, color: '#8B5CF6', type: 'action' },
      { title: 'To Do', position: 2, color: '#3B82F6', type: 'action' },
      { title: 'In Progress', position: 3, color: '#F59E0B', type: 'action' },
      { title: 'Waiting', position: 4, color: '#EC4899', type: 'waiting' },
      { title: 'Done', position: 5, color: '#10B981', type: 'completed' },
      { title: 'Archived', position: 6, color: '#6B7280', type: 'completed' },
    ];

    const columnIds = {};
    for (const col of defaultColumns) {
      const result = await sql`
        INSERT INTO columns (project_id, title, position, color, column_type)
        VALUES (${projectId}, ${col.title}, ${col.position}, ${col.color}, ${col.type})
        RETURNING id
      `;
      columnIds[col.title] = result[0].id;
      console.log(`✅ Column created: ${col.title}`);
    }

    console.log('Creating sample tasks...');
    const sampleTasks = [
      {
        column: 'To Do',
        title: 'Set up project repository',
        description: 'Initialize Git repository and push to remote',
        priority: 'high',
        energy_level: 'medium',
      },
      {
        column: 'To Do',
        title: 'Design database schema',
        description: 'Plan out tables and relationships for the application',
        priority: 'high',
        energy_level: 'high',
      },
      {
        column: 'In Progress',
        title: 'Implement authentication',
        description: 'Set up NextAuth.js with credentials provider',
        priority: 'urgent',
        energy_level: 'high',
      },
      {
        column: 'Waiting',
        title: 'Review PR from team member',
        description: 'Code review needed for the new feature',
        priority: 'medium',
        energy_level: 'low',
      },
      {
        column: 'Done',
        title: 'Create project documentation',
        description: 'Write README with setup instructions',
        priority: 'medium',
        energy_level: 'medium',
      },
    ];

    let position = 0;
    for (const task of sampleTasks) {
      await sql`
        INSERT INTO tasks (
          project_id, column_id, title, description, 
          priority, energy_level, position
        )
        VALUES (
          ${projectId},
          ${columnIds[task.column]},
          ${task.title},
          ${task.description},
          ${task.priority},
          ${task.energy_level},
          ${position++}
        )
      `;
      console.log(`✅ Task created: ${task.title}`);
    }

    console.log('Creating sample tags...');
    const sampleTags = [
      { name: 'Frontend', color: '#3B82F6' },
      { name: 'Backend', color: '#10B981' },
      { name: 'Bug', color: '#EF4444' },
      { name: 'Feature', color: '#8B5CF6' },
      { name: 'Documentation', color: '#F59E0B' },
    ];

    for (const tag of sampleTags) {
      await sql`
        INSERT INTO tags (user_id, name, color)
        VALUES (${userId}, ${tag.name}, ${tag.color})
      `;
      console.log(`✅ Tag created: ${tag.name}`);
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nLogin credentials:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

seedDatabase();