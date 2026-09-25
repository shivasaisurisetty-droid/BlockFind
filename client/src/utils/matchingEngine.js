/**
 * Smart Matching Engine (Rule-based heuristic scoring engine)
 * Compares lost item attributes with found items registry.
 * Designed to be modularly replaced with AI/Vector embedding models (e.g. CLIP + Sentence-Transformers on AWS SageMaker).
 */
export function calculateMatchScore(lostItem, foundItem) {
  if (!lostItem || !foundItem) return { score: 0, matchedCriteria: [] };

  let score = 0;
  const matchedCriteria = [];

  // 1. Category Matching (40 points)
  if (lostItem.category && foundItem.category) {
    if (lostItem.category.toUpperCase() === foundItem.category.toUpperCase()) {
      score += 40;
      matchedCriteria.push('Exact Category Match');
    }
  }

  // 2. Keyword & Text Similarity (35 points)
  const lostTokens = tokenize(`${lostItem.itemName || ''} ${lostItem.description || ''}`);
  const foundTokens = tokenize(`${foundItem.itemName || ''} ${foundItem.description || ''}`);

  const commonTokens = lostTokens.filter(t => foundTokens.includes(t) && t.length > 2);
  if (commonTokens.length > 0) {
    const textScore = Math.min(35, commonTokens.length * 10);
    score += textScore;
    matchedCriteria.push(`Keywords matched: "${commonTokens.slice(0, 3).join(', ')}"`);
  }

  // 3. Location Matching (25 points)
  const lostLoc = (lostItem.lastKnownLocation || '').toLowerCase();
  const foundLoc = (foundItem.foundLocation || '').toLowerCase();

  if (lostLoc && foundLoc) {
    const locWords = lostLoc.split(/\s+/).filter(w => w.length > 3);
    const locMatch = locWords.some(w => foundLoc.includes(w));
    if (locMatch || lostLoc === foundLoc) {
      score += 25;
      matchedCriteria.push('Proximity Location Overlap');
    }
  }

  // Cap at 98% (reserving 100% for cryptographic serial match)
  const finalScore = Math.min(98, Math.max(15, score));

  return {
    score: finalScore,
    isHighConfidence: finalScore >= 75,
    matchedCriteria
  };
}

function tokenize(text = '') {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);
}
