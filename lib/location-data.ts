/**
 * Utility to load and manage India location data (states & cities)
 * Data is stored locally in JSON files for offline access
 */

let locationData: any = null;

/**
 * Load location data from JSON files
 */
export async function loadLocationData() {
  if (locationData) return locationData;

  try {
    const response = await fetch('/data/india-location-data.json');
    if (!response.ok) {
      throw new Error('Failed to load location data');
    }
    locationData = await response.json();
    return locationData;
  } catch (error) {
    console.error('Error loading location data:', error);
    // Fallback to hardcoded states if JSON not available
    return getFallbackLocationData();
  }
}

/**
 * Get all Indian states
 */
export async function getIndianStates(): Promise<string[]> {
  const data = await loadLocationData();
  if (data.states) {
    return data.states.map((state: any) => state.name);
  }
  return getFallbackStates();
}

/**
 * Get cities by state
 */
export async function getCitiesByState(stateName: string): Promise<string[]> {
  const data = await loadLocationData();
  if (data.citiesByState && data.citiesByState[stateName]) {
    return data.citiesByState[stateName].map((city: any) => city.name);
  }
  return [];
}

/**
 * Fallback states if API data not available
 */
function getFallbackStates(): string[] {
  return [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    // Union Territories
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry",
  ];
}

/**
 * Fallback location data
 */
function getFallbackLocationData() {
  return {
    states: getFallbackStates().map((name, index) => ({
      id: index + 1,
      name,
      isoCode: ''
    })),
    citiesByState: {},
    lastUpdated: new Date().toISOString(),
    source: 'Hardcoded fallback'
  };
}
