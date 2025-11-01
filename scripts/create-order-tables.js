import mysql from 'mysql2/promise';

async function createOrderTables() {
  const connection = await mysql.createConnection({
    host: 'srv1552.hstgr.io',
    user: 'u761240159_anamicodb',
    password: 'Anamico@123',
    database: 'u761240159_anamicodb',
  });

  try {
    console.log('Creating order table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`order\` (
        \`id\` varchar(255) NOT NULL PRIMARY KEY,
        \`userId\` varchar(255) NOT NULL,
        \`orderNumber\` varchar(255) NOT NULL UNIQUE,
        \`subtotal\` int NOT NULL,
        \`tax\` int NOT NULL,
        \`total\` int NOT NULL,
        \`status\` varchar(255) NOT NULL DEFAULT 'pending',
        \`paymentStatus\` varchar(255) NOT NULL DEFAULT 'pending',
        \`paymentMethod\` varchar(255),
        \`paymentId\` varchar(255),
        \`paidAmount\` int NOT NULL DEFAULT 0,
        \`adminNotes\` text,
        \`adminApprovedAt\` timestamp,
        \`rejectionReason\` text,
        \`shippingName\` varchar(255) NOT NULL,
        \`shippingEmail\` varchar(255) NOT NULL,
        \`shippingPhone\` varchar(255) NOT NULL,
        \`shippingAddress\` text NOT NULL,
        \`shippingCity\` varchar(255) NOT NULL,
        \`shippingState\` varchar(255) NOT NULL,
        \`shippingPincode\` varchar(255) NOT NULL,
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE,
        INDEX idx_order_userId (\`userId\`),
        INDEX idx_order_status (\`status\`)
      )
    `);
    console.log('✓ Order table created');

    console.log('Creating orderItem table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`orderItem\` (
        \`id\` varchar(255) NOT NULL PRIMARY KEY,
        \`orderId\` varchar(255) NOT NULL,
        \`productId\` varchar(255) NOT NULL,
        \`productName\` varchar(255) NOT NULL,
        \`quantity\` int NOT NULL,
        \`price\` int NOT NULL,
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (\`orderId\`) REFERENCES \`order\`(\`id\`) ON DELETE CASCADE,
        FOREIGN KEY (\`productId\`) REFERENCES \`product\`(\`id\`) ON DELETE RESTRICT,
        INDEX idx_orderItem_orderId (\`orderId\`)
      )
    `);
    console.log('✓ OrderItem table created');

    console.log('✓ All order tables created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

createOrderTables();
