import mysql from 'mysql2/promise';

async function addDiscountColumn() {
  const connection = await mysql.createConnection({
    host: 'srv1552.hstgr.io',
    user: 'u761240159_anamicodb',
    password: 'Anamico@123',
    database: 'u761240159_anamicodb',
  });

  try {
    console.log('Adding discountAmount column to order table...');

    // Check if column already exists
    const [columns] = await connection.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'order' AND COLUMN_NAME = 'discountAmount'`
    );

    if (columns.length > 0) {
      console.log('✓ discountAmount column already exists');
    } else {
      // Add the column after tax column
      await connection.execute(`
        ALTER TABLE \`order\`
        ADD COLUMN \`discountAmount\` int NOT NULL DEFAULT 0
        AFTER \`tax\`
      `);
      console.log('✓ discountAmount column added successfully');
    }

    console.log('✓ Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error adding column:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

addDiscountColumn();
