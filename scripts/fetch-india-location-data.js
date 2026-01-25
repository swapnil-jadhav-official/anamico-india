import fs from 'fs';
import path from 'path';

/**
 * Fetch India location data (states & cities)
 * and store as JSON files for offline usage
 */

// Comprehensive list of Indian states and major cities
const indiaLocationData = {
  "Andhra Pradesh": [
    "Visakhapatnam", "Vijayawada", "Nellore", "Kurnool", "Tirupati",
    "Kakinada", "Rajahmundry", "Nandyal", "Tenali", "Proddatur"
  ],
  "Arunachal Pradesh": [
    "Itanagar", "Naharlagun", "Pasighat", "Tezu", "Ziro",
    "Changlang", "Roing", "Bomdila"
  ],
  "Assam": [
    "Guwahati", "Silchar", "Dibrugarh", "Nagaon", "Tinsukia",
    "Barpeta", "Golaghat", "Jorhat", "Kamrup", "Sonitpur"
  ],
  "Bihar": [
    "Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga",
    "Bihar Sharif", "Saharsa", "Madhubani", "Purnia", "Arrah"
  ],
  "Chhattisgarh": [
    "Raipur", "Bilaspur", "Durg", "Rajnandgaon", "Raigarh",
    "Jagdalpur", "Mandir", "Korba", "Chanda", "Balrampur"
  ],
  "Goa": [
    "Panaji", "Margao", "Vasco da Gama", "Ponda", "Mapusa",
    "Pernem", "Bicholim", "Canacona", "Quepem", "Sattari"
  ],
  "Gujarat": [
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Junagadh",
    "Bhavnagar", "Jamnagar", "Anand", "Gandhinagar", "Morbi"
  ],
  "Haryana": [
    "Faridabad", "Gurgaon", "Hisar", "Rohtak", "Panipat",
    "Ambala", "Karnal", "Yamunanagar", "Sonipat", "Rewari"
  ],
  "Himachal Pradesh": [
    "Shimla", "Mandi", "Solan", "Kangra", "Una",
    "Bilaspur", "Chamba", "Kinnaur", "Lahaul and Spiti", "Rampur"
  ],
  "Jharkhand": [
    "Ranchi", "Jamshedpur", "Dhanbad", "Giridih", "Deoghar",
    "Hazaribag", "Bokaro", "Daltonganj", "Koderma", "Dumka"
  ],
  "Karnataka": [
    "Bangalore", "Mysore", "Mangalore", "Belgaum", "Gulbarga",
    "Davangere", "Bellary", "Tumkur", "Udupi", "Bagalkot"
  ],
  "Kerala": [
    "Kochi", "Thiruvananthapuram", "Kozhikode", "Thrissur", "Kollam",
    "Pathanamthitta", "Idukki", "Ernakulam", "Kannur", "Kasaragod"
  ],
  "Madhya Pradesh": [
    "Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain",
    "Sagar", "Rewa", "Khandwa", "Seoni", "Chhindwara"
  ],
  "Maharashtra": [
    "Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad",
    "Solapur", "Kolhapur", "Amravati", "Buldhana", "Akola"
  ],
  "Manipur": [
    "Imphal", "Ukhrul", "Churachandpur", "Jiribam", "Tamenglong",
    "Bishnupur", "Senapati", "Thoubal", "Kakching", "Chandel"
  ],
  "Meghalaya": [
    "Shillong", "Tura", "Jowai", "Nongstoin", "Baghmara",
    "Williamnagar", "Mairang", "Ranikor", "Cherrapunji", "Nongpoh"
  ],
  "Mizoram": [
    "Aizawl", "Lunglei", "Saiha", "Champhai", "Kolasib",
    "Mamit", "Serchhip", "Lawngtlai", "Khawzawl", "Thenzawl"
  ],
  "Nagaland": [
    "Kohima", "Dimapur", "Nagaon", "Kiphire", "Peren",
    "Tuensang", "Zunheboto", "Wokha", "Longleng", "Mon"
  ],
  "Odisha": [
    "Bhubaneswar", "Cuttack", "Rourkela", "Sambalpur", "Balasore",
    "Berhampur", "Dhenkanal", "Kendrapada", "Mayurbhanj", "Jajpur"
  ],
  "Punjab": [
    "Ludhiana", "Amritsar", "Chandigarh", "Patiala", "Bathinda",
    "Jalandhar", "Hoshiarpur", "Moga", "Sangrur", "Ferozepur"
  ],
  "Rajasthan": [
    "Jaipur", "Jodhpur", "Ajmer", "Kota", "Bikaner",
    "Udaipur", "Bhilwara", "Alwar", "Pali", "Churu"
  ],
  "Sikkim": [
    "Gangtok", "Namchi", "Mangan", "Singtam", "Gyalshing",
    "Pakyong", "Ravangla", "Yuksom", "Legship", "Soreng"
  ],
  "Tamil Nadu": [
    "Chennai", "Coimbatore", "Madurai", "Salem", "Trichy",
    "Tirunelveli", "Erode", "Thanjavur", "Kanchipuram", "Vellore"
  ],
  "Telangana": [
    "Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam",
    "Mahbubnagar", "Adilabad", "Medak", "Nalgonda", "Vikarabad"
  ],
  "Tripura": [
    "Agartala", "Udaipur", "Dharmanagar", "Kailasahar", "Ambassa",
    "Aambassa", "Kamalpur", "Teliamura", "Belonia", "Melaghar"
  ],
  "Uttar Pradesh": [
    "Lucknow", "Kanpur", "Ghaziabad", "Agra", "Meerut",
    "Varanasi", "Visakhapatnam", "Noida", "Jhansi", "Bareilly"
  ],
  "Uttarakhand": [
    "Dehradun", "Haldwani", "Haridwar", "Rudrapur", "Almora",
    "Nainital", "Pithoragarh", "Bageshwar", "Pauri", "Udham Singh Nagar"
  ],
  "West Bengal": [
    "Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri",
    "Darjeeling", "Jalpaiguri", "Cooch Behar", "Malda", "Midnapore"
  ],
  // Union Territories
  "Andaman and Nicobar Islands": [
    "Port Blair", "Car Nicobar", "Campbell Bay", "Diglipur", "Mayabunder"
  ],
  "Chandigarh": [
    "Chandigarh"
  ],
  "Dadra and Nagar Haveli and Daman and Diu": [
    "Silvassa", "Daman", "Diu", "Kilvani", "Satodi"
  ],
  "Delhi": [
    "New Delhi", "Delhi", "South Delhi", "East Delhi", "West Delhi",
    "North Delhi", "Central Delhi", "South East Delhi", "North East Delhi", "North West Delhi"
  ],
  "Jammu and Kashmir": [
    "Srinagar", "Jammu", "Leh", "Anantnag", "Samba",
    "Kathua", "Udhampur", "Pulwama", "Ganderbal", "Bandipora"
  ],
  "Ladakh": [
    "Leh", "Kargil", "Diskit", "Khardung", "Nubra"
  ],
  "Lakshadweep": [
    "Kavaratti", "Agatti", "Minicoy", "Androth", "Kiltan"
  ],
  "Puducherry": [
    "Puducherry", "Yanam", "Karaikal", "Mahe", "Pondicherry"
  ]
};

async function fetchAndStoreLocationData() {
  try {
    console.log('🔄 Preparing India location data...');

    // Create data directory
    const dataDir = path.join(process.cwd(), 'public', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log(`📁 Created directory: ${dataDir}`);
    }

    // Prepare states array
    const statesArray = Object.keys(indiaLocationData).map((name, index) => ({
      id: index + 1,
      name: name,
      isoCode: getStateIsoCode(name),
      countryId: 101
    }));

    // Save states data
    const statesFile = path.join(dataDir, 'indian-states.json');
    fs.writeFileSync(statesFile, JSON.stringify(statesArray, null, 2));
    console.log(`✓ Saved states to ${statesFile}`);

    // Save cities data
    const citiesFile = path.join(dataDir, 'indian-cities.json');
    fs.writeFileSync(citiesFile, JSON.stringify(indiaLocationData, null, 2));
    console.log(`✓ Saved cities to ${citiesFile}`);

    // Save combined data
    const combinedData = {
      states: statesArray,
      citiesByState: indiaLocationData,
      totalStates: statesArray.length,
      totalCities: Object.values(indiaLocationData).reduce((sum, cities) => sum + cities.length, 0),
      lastUpdated: new Date().toISOString(),
      source: 'Local comprehensive database'
    };
    const combinedFile = path.join(dataDir, 'india-location-data.json');
    fs.writeFileSync(combinedFile, JSON.stringify(combinedData, null, 2));
    console.log(`✓ Saved combined data to ${combinedFile}`);

    console.log('\n✅ Location data stored successfully!');
    console.log(`📊 Statistics:`);
    console.log(`   States/UTs: ${statesArray.length}`);
    console.log(`   Total Cities: ${combinedData.totalCities}`);
    console.log(`   Last Updated: ${combinedData.lastUpdated}`);
    console.log(`\n📁 JSON Files created in: public/data/`);
    console.log(`   - indian-states.json`);
    console.log(`   - indian-cities.json`);
    console.log(`   - india-location-data.json`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error storing location data:', error);
    process.exit(1);
  }
}

/**
 * Get ISO code for state
 */
function getStateIsoCode(stateName) {
  const codes = {
    'Andhra Pradesh': 'AP',
    'Arunachal Pradesh': 'AR',
    'Assam': 'AS',
    'Bihar': 'BR',
    'Chhattisgarh': 'CG',
    'Goa': 'GA',
    'Gujarat': 'GJ',
    'Haryana': 'HR',
    'Himachal Pradesh': 'HP',
    'Jharkhand': 'JH',
    'Karnataka': 'KA',
    'Kerala': 'KL',
    'Madhya Pradesh': 'MP',
    'Maharashtra': 'MH',
    'Manipur': 'MN',
    'Meghalaya': 'ML',
    'Mizoram': 'MZ',
    'Nagaland': 'NL',
    'Odisha': 'OR',
    'Punjab': 'PB',
    'Rajasthan': 'RJ',
    'Sikkim': 'SK',
    'Tamil Nadu': 'TN',
    'Telangana': 'TG',
    'Tripura': 'TR',
    'Uttar Pradesh': 'UP',
    'Uttarakhand': 'UT',
    'West Bengal': 'WB',
    'Andaman and Nicobar Islands': 'AN',
    'Chandigarh': 'CH',
    'Dadra and Nagar Haveli and Daman and Diu': 'DD',
    'Delhi': 'DL',
    'Jammu and Kashmir': 'JK',
    'Ladakh': 'LA',
    'Lakshadweep': 'LD',
    'Puducherry': 'PY'
  };
  return codes[stateName] || '';
}

fetchAndStoreLocationData();
