import mysql from 'mysql2/promise';

async function createPhoneOtpTable() {
  const connection = await mysql.createConnection({
    host: 'srv1552.hstgr.io',
    user: 'u761240159_anamicodb',
    password: 'Anamico@123',
    database: 'u761240159_anamicodb',
  });

  try {
    console.log('Creating phoneOtp table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`phoneOtp\` (
        \`id\` varchar(255) NOT NULL PRIMARY KEY,
        \`phone\` varchar(20) NOT NULL,
        \`otp\` varchar(10) NOT NULL,
        \`expires\` timestamp NOT NULL,
        \`attempts\` int NOT NULL DEFAULT 0,
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_phone (\`phone\`)
      )
    `);
    console.log('✓ phoneOtp table created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating table:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

createPhoneOtpTable();
