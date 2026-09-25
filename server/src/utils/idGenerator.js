const crypto = require('crypto');

const categoryPrefixes = {
  LAPTOP: 'LAP',
  PHONE: 'PHN',
  ELECTRONICS: 'ELE',
  DOCUMENTS: 'DOC',
  KEYS: 'KEY',
  BAG: 'BAG',
  OTHER: 'AST'
};

/**
 * Generate unique Asset ID (e.g. BF-LAP-00128)
 */
function generateAssetId(category = 'OTHER') {
  const prefix = categoryPrefixes[category.toUpperCase()] || 'AST';
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `BF-${prefix}-${randomNum}`;
}

/**
 * Generate Lost Report ID (e.g. LR-2026-00142)
 */
function generateLostReportId() {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `LR-${year}-${randomNum}`;
}

/**
 * Generate Found Report ID (e.g. FR-2026-00185)
 */
function generateFoundReportId() {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `FR-${year}-${randomNum}`;
}

/**
 * Generate Claim ID (e.g. CLM-2026-00311)
 */
function generateClaimId() {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `CLM-${year}-${randomNum}`;
}

module.exports = {
  generateAssetId,
  generateLostReportId,
  generateFoundReportId,
  generateClaimId
};
