export const LOCATION_MAPPING: Record<string, string> = {
  'भीलवाड़ा': 'Bhilwara',
  'भीलवाड़ा जिला': 'Bhilwara',
  'भीलवाडा': 'Bhilwara',
  'Bhilwada': 'Bhilwara',
  'दिल्ली': 'Delhi',
  'मुंबई': 'Mumbai',
  'जयपुर': 'Jaipur',
  'लखनऊ': 'Lucknow',
  'पटना': 'Patna',
  'इंदौर': 'Indore',
  'भोपाल': 'Bhopal',
  'जोधपुर': 'Jodhpur',
  'कोटा': 'Kota',
  'अजमेर': 'Ajmer',
  'उदयपुर': 'Udaipur',
  'बीकानेर': 'Bikaner',
  'वाराणसी': 'Varanasi',
  'कानपुर': 'Kanpur',
  'आगरा': 'Agra',
  'मेरठ': 'Meerut',
  'गाजियाबाद': 'Ghaziabad',
  'नोएडा': 'Noida',
  'गुरुग्राम': 'Gurgaon',
  'फरीदाबाद': 'Faridabad',
  'चंडीगढ़': 'Chandigarh',
  'अमृतसर': 'Amritsar',
  'लुधियाना': 'Ludhiana',
  'जालंधर': 'Jalandhar',
  'शिमला': 'Shimla',
  'देहरादून': 'Dehradun',
  'हरिद्वार': 'Haridwar',
  'ऋषिकेश': 'Rishikesh',
};

export const normalizeLocation = (name: string): string => {
  if (!name) return '';
  
  // 1. Check direct mapping first (case insensitive)
  const lowerName = name.toLowerCase().trim();
  for (const [hindi, english] of Object.entries(LOCATION_MAPPING)) {
    if (hindi.toLowerCase() === lowerName || english.toLowerCase() === lowerName) {
      return english;
    }
  }

  // 2. Handle common spelling mistakes and variations
  const variations: Record<string, string> = {
    'bhilwada': 'Bhilwara',
    'bhilvara': 'Bhilwara',
    'bilwara': 'Bhilwara',
    'jaipura': 'Jaipur',
    'jodhpurr': 'Jodhpur',
    'delhy': 'Delhi',
    'mumbay': 'Mumbai',
    'puna': 'Pune',
    'banglore': 'Bangalore',
    'bengaluru': 'Bangalore',
  };

  if (variations[lowerName]) return variations[lowerName];

  // 3. Clean up suffixes
  let cleaned = name
    .replace(/ District$/i, '')
    .replace(/ City$/i, '')
    .replace(/ Jila$/i, '')
    .replace(/ जिला$/i, '')
    .replace(/ Sector$/i, '')
    .replace(/ Area$/i, '')
    .replace(/ Ward$/i, '')
    .replace(/ Block$/i, '')
    .replace(/ Tehsil$/i, '')
    .trim();

  // 4. Check mapping again after cleaning
  const lowerCleaned = cleaned.toLowerCase();
  for (const [hindi, english] of Object.entries(LOCATION_MAPPING)) {
    if (hindi.toLowerCase() === lowerCleaned || english.toLowerCase() === lowerCleaned) {
      return english;
    }
  }

  // 5. Final fuzzy check for Bhilwara specifically as requested
  if (lowerCleaned.includes('bhilwad') || lowerCleaned.includes('bhilwar')) {
    return 'Bhilwara';
  }

  return cleaned;
};
