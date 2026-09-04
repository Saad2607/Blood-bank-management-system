/**
 * Immunohematology Blood Compatibility & Component Calculation Engine
 */

// RBC (Red Blood Cell) compatibility: Who can receive from whom?
// Recipient group -> Array of allowed donor groups
const RBC_COMPATIBILITY = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // Universal Recipient for RBC
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'], // Universal Donor for RBC
};

// Plasma (FFP / Cryoprecipitate) compatibility:
// Recipient group -> Array of allowed plasma donor groups (Inverted compared to RBC)
const PLASMA_COMPATIBILITY = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal Recipient for Plasma
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'], // AB is Universal Donor for Plasma
};

// Component shelf life in days
const COMPONENT_SHELF_LIFE_DAYS = {
  'Whole Blood': 35,
  'Packed Red Blood Cells (PRBC)': 42,
  'Fresh Frozen Plasma (FFP)': 365,
  'Platelet Concentrate': 5,
  'Cryoprecipitate': 365,
};

// Recommended storage temperature ranges
const STORAGE_CONDITIONS = {
  'Whole Blood': { rackPrefix: 'WB-RACK', temp: '2°C to 6°C' },
  'Packed Red Blood Cells (PRBC)': { rackPrefix: 'PRBC-RACK', temp: '2°C to 6°C' },
  'Fresh Frozen Plasma (FFP)': { rackPrefix: 'DEEP-FREEZER', temp: '-18°C or below' },
  'Platelet Concentrate': { rackPrefix: 'AGITATOR-CAB', temp: '20°C to 24°C (Agitated)' },
  'Cryoprecipitate': { rackPrefix: 'CRY-FREEZER', temp: '-18°C or below' },
};

/**
 * Check if a donor blood group is immunologically compatible with a recipient
 * @param {string} recipientGroup
 * @param {string} donorGroup
 * @param {string} componentType
 * @returns {boolean}
 */
const isBloodCompatible = (recipientGroup, donorGroup, componentType = 'Whole Blood') => {
  if (recipientGroup === donorGroup) return true;

  if (componentType === 'Fresh Frozen Plasma (FFP)' || componentType === 'Cryoprecipitate') {
    const allowed = PLASMA_COMPATIBILITY[recipientGroup] || [];
    return allowed.includes(donorGroup);
  }

  // Whole Blood, PRBC, and Platelets default to RBC compatibility rules
  const allowed = RBC_COMPATIBILITY[recipientGroup] || [];
  return allowed.includes(donorGroup);
};

/**
 * Calculate standard expiry date from collection date
 * @param {Date|string} collectionDate
 * @param {string} componentType
 * @returns {Date}
 */
const calculateExpiryDate = (collectionDate, componentType) => {
  const date = new Date(collectionDate || Date.now());
  const days = COMPONENT_SHELF_LIFE_DAYS[componentType] || 42;
  date.setDate(date.getDate() + days);
  return date;
};

/**
 * Generate human-readable unit/record identifiers
 */
const generateId = (prefix = 'PPU') => {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${year}-${random}`;
};

module.exports = {
  RBC_COMPATIBILITY,
  PLASMA_COMPATIBILITY,
  COMPONENT_SHELF_LIFE_DAYS,
  STORAGE_CONDITIONS,
  isBloodCompatible,
  calculateExpiryDate,
  generateId,
};
