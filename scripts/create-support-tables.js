import mysql from 'mysql2/promise';

async function createSupportTables() {
  const connection = await mysql.createConnection({
    host: 'srv1552.hstgr.io',
    user: 'u761240159_anamicodb',
    password: 'Anamico@123',
    database: 'u761240159_anamicodb',
  });

  try {
    console.log('Creating supportTicket table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`supportTicket\` (
        \`id\` varchar(255) NOT NULL PRIMARY KEY,
        \`ticketNumber\` varchar(255) NOT NULL UNIQUE,
        \`userId\` varchar(255) DEFAULT NULL,
        \`name\` varchar(255) NOT NULL,
        \`email\` varchar(255) NOT NULL,
        \`phone\` varchar(20) NOT NULL,
        \`subject\` varchar(500) NOT NULL,
        \`message\` text NOT NULL,
        \`category\` varchar(100) DEFAULT NULL,
        \`priority\` varchar(20) NOT NULL DEFAULT 'medium',
        \`status\` varchar(50) NOT NULL DEFAULT 'open',
        \`assignedTo\` varchar(255) DEFAULT NULL,
        \`adminNotes\` text DEFAULT NULL,
        \`resolution\` text DEFAULT NULL,
        \`resolvedAt\` timestamp NULL DEFAULT NULL,
        \`closedAt\` timestamp NULL DEFAULT NULL,
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL,
        FOREIGN KEY (\`assignedTo\`) REFERENCES \`user\`(\`id\`) ON DELETE SET NULL,
        INDEX idx_supportTicket_userId (\`userId\`),
        INDEX idx_supportTicket_status (\`status\`),
        INDEX idx_supportTicket_assignedTo (\`assignedTo\`)
      )
    `);
    console.log('✓ SupportTicket table created');

    console.log('Creating faq table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`faq\` (
        \`id\` varchar(255) NOT NULL PRIMARY KEY,
        \`question\` text NOT NULL,
        \`answer\` text NOT NULL,
        \`category\` varchar(100) DEFAULT NULL,
        \`displayOrder\` int NOT NULL DEFAULT 0,
        \`isActive\` tinyint(1) NOT NULL DEFAULT 1,
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_faq_category (\`category\`),
        INDEX idx_faq_isActive (\`isActive\`)
      )
    `);
    console.log('✓ FAQ table created');

    console.log('Inserting sample FAQs...');
    await connection.execute(`
      INSERT INTO \`faq\` (\`id\`, \`question\`, \`answer\`, \`category\`, \`displayOrder\`, \`isActive\`) VALUES
      ('faq_001', 'How can I track my order status?', 'You can track your order by logging into your account and visiting the ''Orders'' section. Each order has a tracking number that shows real-time updates. You''ll also receive email notifications at every stage of delivery.', 'orders', 1, 1),
      ('faq_002', 'What is your return and refund policy?', 'We offer a 7-day return policy for most products. Items must be unused and in original packaging. Refunds are processed within 5-7 business days after we receive the returned item. For services like RD Service or Digital Signatures, cancellations must be made within 24 hours of purchase.', 'orders', 2, 1),
      ('faq_003', 'How do I raise a support ticket online?', 'You can raise a support ticket by filling out the form on this page. Simply provide your contact details, select a subject, and describe your issue. You''ll receive a ticket ID via email which you can use to track your request status.', 'general', 3, 1),
      ('faq_004', 'How can I contact customer support for assistance?', 'We offer multiple channels for support: Call or WhatsApp us at +91 84343 84343 (available 9 AM - 6 PM, Monday to Saturday), email us at support@anamico.in, or use the live chat feature on our website. For urgent issues, phone support is the fastest option.', 'general', 4, 1),
      ('faq_005', 'What payment methods do you accept?', 'We accept all major payment methods including Credit/Debit Cards (Visa, Mastercard, Amex, RuPay), UPI payments, Net Banking, and popular digital wallets. All payments are processed securely through Razorpay with 256-bit SSL encryption.', 'payments', 5, 1),
      ('faq_006', 'How long does RD Service registration take?', 'RD Service registration typically takes 2-5 business days after payment confirmation. You''ll receive updates via email and SMS. You can check your registration status anytime using the RD Status page with your registration ID.', 'services', 6, 1),
      ('faq_007', 'Do you provide installation support for products?', 'Yes, we provide comprehensive installation support for all our products. Our technical team can guide you through remote installation via phone or screen sharing. For complex setups, we also offer on-site installation services in select locations (charges may apply).', 'technical', 7, 1),
      ('faq_008', 'How do I update my account information?', 'Log in to your account and navigate to the Profile section. Here you can update your personal details, contact information, and manage your addresses. For security reasons, email changes require verification.', 'general', 8, 1)
      ON DUPLICATE KEY UPDATE \`id\` = \`id\`
    `);
    console.log('✓ Sample FAQs inserted');

    // Display counts
    const [ticketCount] = await connection.execute('SELECT COUNT(*) as count FROM \`supportTicket\`');
    const [faqCount] = await connection.execute('SELECT COUNT(*) as count FROM \`faq\`');

    console.log('\n✓ All support tables created successfully!');
    console.log(`  - Support Tickets: ${ticketCount[0].count}`);
    console.log(`  - FAQs: ${faqCount[0].count}`);

    process.exit(0);
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

createSupportTables();
