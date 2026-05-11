const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function initDatabase() {
  const client = await pool.connect();
  try {
    // Check if tables already exist
    const result = await client.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users')"
    );
    
    if (result.rows[0].exists) {
      console.log('Database tables already exist, skipping initialization');
      return;
    }

    console.log('Tables not found, initializing database...');

    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, '..', '..', '..', 'database', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await client.query(schema);
      console.log('Schema created successfully');
    } else {
      console.error('schema.sql not found at:', schemaPath);
      return;
    }

    // Read and execute seed.sql
    const seedPath = path.join(__dirname, '..', '..', '..', 'database', 'seed.sql');
    if (fs.existsSync(seedPath)) {
      const seed = fs.readFileSync(seedPath, 'utf8');
      await client.query(seed);
      console.log('Seed data loaded successfully');
    } else {
      console.log('seed.sql not found, skipping seed data');
    }

    console.log('Database initialization complete!');
  } catch (error) {
    console.error('Database initialization error:', error.message);
  } finally {
    client.release();
  }
}

module.exports = initDatabase;
