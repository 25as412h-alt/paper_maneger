const stopwords = require('./stopwords');

/**
 * テキストをトークン化（英語）
 * @param {string} text - 入力テキスト
 * @returns {Set<string>} - トークンのセット
 */
function tokenize(text) {
  if (!text || typeof text !== 'string') {
    return new Set();
  }

  // 小文字化
  const lowercased = text.toLowerCase();

  // 英数字以外を空白に置換
  const normalized = lowercased.replace(/[^a-z0-9\s]/g, ' ');

  // 単語に分割
  const words = normalized.split(/\s+/).filter(w => w.length > 0);

  // ストップワード除去 + 3文字以上のみ
  const tokens = new Set(
    words.filter(word => 
      word.length >= 3 && 
      !stopwords.ENGLISH.has(word)
    )
  );

  return tokens;
}

/**
 * 2つのトークンセットから共通トークンを検出
 * @param {Set<string>} tokens1 - トークンセット1
 * @param {Set<string>} tokens2 - トークンセット2
 * @returns {Object} - { commonTokens: Set, score: number }
 */
function findCommonTokens(tokens1, tokens2) {
  const commonTokens = new Set(
    [...tokens1].filter(token => tokens2.has(token))
  );

  return {
    commonTokens,
    score: commonTokens.size
  };
}

/**
 * テキストから重要語を抽出（頻出語ベース）
 * @param {string} text - 入力テキスト
 * @param {number} topN - 上位N個を返す
 * @returns {Array<{word: string, count: number}>}
 */
function extractKeywords(text, topN = 10) {
  const tokens = tokenize(text);
  
  // 単語の出現回数をカウント
  const frequency = {};
  const words = text.toLowerCase().match(/[a-z]{3,}/g) || [];
  
  for (const word of words) {
    if (tokens.has(word)) {
      frequency[word] = (frequency[word] || 0) + 1;
    }
  }

  // 頻度順にソート
  const sorted = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word, count]) => ({ word, count }));

  return sorted;
}

/**
 * 類似度計算（Jaccard係数）
 * @param {Set<string>} tokens1 
 * @param {Set<string>} tokens2 
 * @returns {number} - 0.0 ~ 1.0
 */
function calculateSimilarity(tokens1, tokens2) {
  if (tokens1.size === 0 || tokens2.size === 0) {
    return 0.0;
  }

  const intersection = new Set([...tokens1].filter(t => tokens2.has(t)));
  const union = new Set([...tokens1, ...tokens2]);

  return intersection.size / union.size;
}

module.exports = {
  tokenize,
  findCommonTokens,
  extractKeywords,
  calculateSimilarity
};