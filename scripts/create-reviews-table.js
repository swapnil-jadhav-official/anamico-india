const mysql = require('mysql2/promise');

async function createReviewsTable() {
  try {
    const connection = await mysql.createConnection({
      host: 'srv1552.hstgr.io',
      user: 'u761240159_anamicodb',
      password: 'Anamico@123',
      database: 'u761240159_anamicodb',
    });

    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS \`productReview\` (
        \`id\` varchar(255) NOT NULL,
        \`productId\` varchar(255) NOT NULL,
        \`userId\` varchar(255) NOT NULL,
        \`rating\` int NOT NULL,
        \`title\` varchar(255) NOT NULL,
        \`comment\` text,
        \`isApproved\` tinyint NOT NULL DEFAULT 0,
        \`helpfulCount\` int NOT NULL DEFAULT 0,
        \`createdAt\` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
        PRIMARY KEY (\`id\`),
        KEY \`productId\` (\`productId\`),
        KEY \`userId\` (\`userId\`),
        CONSTRAINT \`productReview_ibfk_1\` FOREIGN KEY (\`productId\`) REFERENCES \`product\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`productReview_ibfk_2\` FOREIGN KEY (\`userId\`) REFERENCES \`user\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.execute(createTableSQL);
    console.log('✅ productReview table created successfully!');

    await connection.end();
  } catch (error) {
    console.error('❌ Error creating productReview table:', error.message);
    process.exit(1);
  }
}

createReviewsTable();
