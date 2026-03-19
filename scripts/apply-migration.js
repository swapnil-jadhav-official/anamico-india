const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function applyMigration() {
  const connection = await mysql.createConnection({
    host: 'srv1552.hstgr.io',
    port: 3306,
    database: 'u761240159_anamicodb',
    user: 'u761240159_anamicodb',
    password: 'Anamico@123',
  });

  try {
    console.log('Applying migration: 0010_add_gst_number_to_order.sql');

    // Read the migration file
    const migrationPath = path.join(__dirname, '../drizzle/migrations/0010_add_gst_number_to_order.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    // Split by semicolon to handle multiple statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 100)}...`);
      await connection.execute(statement);
    }

    console.log('✅ Migration applied successfully!');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('ℹ️  Column already exists. Skipping.');
    } else {
      console.error('❌ Error applying migration:', error.message);
      throw error;
    }
  } finally {
    await connection.end();
  }
}

applyMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
