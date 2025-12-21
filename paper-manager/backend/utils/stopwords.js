/**
 * 英語ストップワード
 * 検索・関連付けから除外する一般的な単語
 */
const ENGLISH = new Set([
  // 冠詞
  'the', 'a', 'an',
  
  // be動詞
  'is', 'am', 'are', 'was', 'were', 'be', 'been', 'being',
  
  // 助動詞
  'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing',
  'will', 'would', 'shall', 'should', 'can', 'could', 'may', 'might', 'must',
  
  // 代名詞
  'i', 'you', 'he', 'she', 'it', 'we', 'they',
  'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'her', 'its', 'our', 'their',
  'mine', 'yours', 'hers', 'ours', 'theirs',
  'myself', 'yourself', 'himself', 'herself', 'itself', 'ourselves', 'themselves',
  
  // 疑問詞
  'what', 'which', 'who', 'whom', 'whose', 'where', 'when', 'why', 'how',
  
  // 接続詞
  'and', 'or', 'but', 'nor', 'so', 'for', 'yet',
  'if', 'because', 'as', 'since', 'while', 'although', 'though',
  
  // 前置詞
  'in', 'on', 'at', 'to', 'from', 'by', 'with', 'about', 'into', 'through',
  'during', 'before', 'after', 'above', 'below', 'between', 'under', 'over',
  'of', 'up', 'down', 'out', 'off',
  
  // その他の頻出語
  'this', 'that', 'these', 'those',
  'all', 'some', 'any', 'no', 'not', 'none',
  'more', 'most', 'less', 'least',
  'very', 'too', 'much', 'many', 'few', 'little',
  'such', 'same', 'other', 'another',
  'than', 'then', 'there', 'here',
  'now', 'just', 'also', 'only', 'even',
  'get', 'got', 'make', 'made', 'take', 'taken',
  'go', 'went', 'gone', 'come', 'came',
  'see', 'saw', 'seen', 'know', 'knew', 'known',
  'think', 'thought', 'say', 'said',
  'use', 'used', 'using',
  
  // 論文頻出語（意味が薄い）
  'study', 'paper', 'research', 'result', 'method',
  'approach', 'work', 'show', 'present', 'propose',
  'etc', 'via', 'thus', 'hence', 'therefore'
]);

/**
 * 日本語ストップワード（将来対応用）
 */
const JAPANESE = new Set([
  'の', 'に', 'は', 'を', 'た', 'が', 'で', 'て', 'と', 'し',
  'れ', 'さ', 'ある', 'いる', 'も', 'する', 'から', 'な',
  'こと', 'として', 'い', 'や', 'れる', 'など', 'なっ',
  'ない', 'この', 'ため', 'その', 'あっ', 'よう', 'また',
  'もの', 'という', 'あり', 'まで', 'られ', 'なる', 'へ',
  'か', 'だ', 'これ', 'によって', 'により', 'おり', 'より',
  'による', 'ず', 'なり', 'られる', 'において', 'ば', 'なかっ'
]);

module.exports = {
  ENGLISH,
  JAPANESE
};