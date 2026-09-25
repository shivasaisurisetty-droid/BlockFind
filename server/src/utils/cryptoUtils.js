const crypto = require('crypto');

/**
 * Generate SHA-256 hash of any input data object or string
 */
function sha256(data) {
  const content = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Generate Ethereum-like transaction hash (0x + 64 hex chars)
 */
function generateTxHash(payload) {
  const hash = sha256(payload + Date.now() + Math.random().toString());
  return `0x${hash}`;
}

/**
 * Generate realistic Ethereum-like address (0x + 40 hex chars)
 */
function generateEthAddress(identifier) {
  const hash = sha256(identifier || Math.random().toString());
  return `0x${hash.substring(0, 40)}`;
}

/**
 * Calculate Merkle root hash for an array of transactions/records
 */
function calculateMerkleRoot(records = []) {
  if (records.length === 0) return sha256('EMPTY_BLOCK');
  let hashes = records.map(r => sha256(r));
  while (hashes.length > 1) {
    const nextLevel = [];
    for (let i = 0; i < hashes.length; i += 2) {
      if (i + 1 < hashes.length) {
        nextLevel.push(sha256(hashes[i] + hashes[i + 1]));
      } else {
        nextLevel.push(hashes[i]);
      }
    }
    hashes = nextLevel;
  }
  return hashes[0];
}

module.exports = {
  sha256,
  generateTxHash,
  generateEthAddress,
  calculateMerkleRoot
};
