import mysql from 'mysql2/promise';

async function createDownloadsTable() {
  const connection = await mysql.createConnection({
    host: 'srv1552.hstgr.io',
    user: 'u761240159_anamicodb',
    password: 'Anamico@123',
    database: 'u761240159_anamicodb',
  });

  try {
    console.log('Creating downloadFile table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`downloadFile\` (
        \`id\` varchar(255) NOT NULL PRIMARY KEY,
        \`title\` varchar(255) NOT NULL,
        \`description\` text DEFAULT NULL,
        \`category\` varchar(100) NOT NULL,
        \`fileName\` varchar(255) NOT NULL,
        \`fileUrl\` varchar(500) NOT NULL,
        \`fileSize\` varchar(50) DEFAULT NULL,
        \`fileType\` varchar(50) DEFAULT NULL,
        \`version\` varchar(100) DEFAULT NULL,
        \`thumbnailUrl\` varchar(500) DEFAULT NULL,
        \`systemRequirements\` text DEFAULT NULL,
        \`downloadCount\` int NOT NULL DEFAULT 0,
        \`tags\` text DEFAULT NULL,
        \`isActive\` tinyint(1) NOT NULL DEFAULT 1,
        \`isFeatured\` tinyint(1) NOT NULL DEFAULT 0,
        \`displayOrder\` int NOT NULL DEFAULT 0,
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_downloadFile_category (\`category\`),
        INDEX idx_downloadFile_isActive (\`isActive\`),
        INDEX idx_downloadFile_isFeatured (\`isFeatured\`)
      )
    `);
    console.log('✓ DownloadFile table created');

    console.log('Inserting sample download files...');
    await connection.execute(`
      INSERT INTO \`downloadFile\`
      (\`id\`, \`title\`, \`description\`, \`category\`, \`fileName\`, \`fileUrl\`, \`fileSize\`, \`fileType\`, \`version\`, \`isActive\`, \`isFeatured\`, \`displayOrder\`)
      VALUES
      ('download_001', 'Morpho MSO 1300 E3 Driver', 'Latest driver for Morpho MSO 1300 E3 biometric device. Compatible with Windows 10 and 11.', 'biometric', 'morpho_mso1300_driver_v2.5.exe', 'https://example.com/downloads/morpho_driver.exe', '15.2 MB', 'EXE', '2.5', 1, 1, 1),
      ('download_002', 'Mantra MFS100 Driver', 'Official driver for Mantra MFS100 fingerprint scanner. Supports all major operating systems.', 'biometric', 'mantra_mfs100_driver_v1.8.zip', 'https://example.com/downloads/mantra_driver.zip', '8.5 MB', 'ZIP', '1.8', 1, 1, 2),
      ('download_003', 'RD Service Setup Guide', 'Complete guide for RD Service registration and device setup. Includes troubleshooting steps.', 'rd_service', 'rd_service_guide.pdf', 'https://example.com/downloads/rd_guide.pdf', '2.3 MB', 'PDF', '1.0', 1, 0, 3),
      ('download_004', 'Startek FM220U Driver', 'Windows driver for Startek FM220U fingerprint device. Includes installation instructions.', 'biometric', 'startek_fm220u_v3.2.exe', 'https://example.com/downloads/startek_driver.exe', '12.8 MB', 'EXE', '3.2', 1, 0, 4),
      ('download_005', 'Aadhaar Enrollment Form', 'Official Aadhaar enrollment form in fillable PDF format. Required for new registrations.', 'forms', 'aadhaar_enrollment_form.pdf', 'https://example.com/downloads/aadhaar_form.pdf', '450 KB', 'PDF', '2.0', 1, 0, 5),
      ('download_006', 'DSC Token Manager Software', 'Digital Signature Certificate token management software. Supports all major token brands.', 'encrypted_token', 'dsc_token_manager_v4.1.zip', 'https://example.com/downloads/dsc_manager.zip', '25.6 MB', 'ZIP', '4.1', 1, 1, 6)
      ON DUPLICATE KEY UPDATE \`id\` = \`id\`
    `);
    console.log('✓ Sample download files inserted');

    // Display counts
    const [fileCount] = await connection.execute('SELECT COUNT(*) as count FROM \`downloadFile\`');

    console.log('\n✓ Downloads table created successfully!');
    console.log(`  - Download Files: ${fileCount[0].count}`);

    process.exit(0);
  } catch (error) {
    console.error('Error creating table:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

createDownloadsTable();
