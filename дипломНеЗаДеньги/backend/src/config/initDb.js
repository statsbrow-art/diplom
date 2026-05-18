const pool = require('./db');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
  try {
    const tablesExist = await pool.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users')"
    );

    if (tablesExist.rows[0].exists) {
      console.log('Database tables already exist, skipping initialization');
      return;
    }

    console.log('Initializing database tables...');

    const schemaPath = path.join(__dirname, '..', '..', '..', 'database', 'schema.sql');
    const seedPath = path.join(__dirname, '..', '..', '..', 'database', 'seed.sql');

    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(schema);
      console.log('Schema created successfully');
    } else {
      console.error('schema.sql not found at:', schemaPath);
      return;
    }

    if (fs.existsSync(seedPath)) {
      const seed = fs.readFileSync(seedPath, 'utf8');
      await pool.query(seed);
      console.log('Seed data inserted successfully');
    } else {
      console.log('seed.sql not found, skipping seed data');
    }

    console.log('Database initialization complete');
  } catch (error) {
    console.error('Database initialization error:', error.message);
  }
}

module.exports = initDatabase;
