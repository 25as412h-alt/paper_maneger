const memoRepository = require('../database/repositories/memoRepository');
const { tokenize, findCommonTokens } = require('../utils/tokenizer');

/**
 * 特定のメモに対する関連メモを構築
 * @param {number} memoId - メモID
 */
async function buildMemoRelations(memoId) {
  try {
    // 対象メモを取得
    const targetMemo = memoRepository.findById(memoId);
    if (!targetMemo) {
      console.warn(`Memo ${memoId} not found`);
      return;
    }

    // 対象メモのトークン化
    const targetTokens = tokenize(targetMemo.content);
    if (targetTokens.size === 0) {
      console.log(`Memo ${memoId} has no tokens, skipping relation building`);
      return;
    }

    // 既存の関連を削除
    memoRepository.deleteRelations(memoId);

    // 全メモを取得（対象メモ以外）
    const allMemos = memoRepository.findAllForRelations();
    const relations = [];

    for (const otherMemo of allMemos) {
      if (otherMemo.id === memoId) continue;

      // 他のメモをトークン化
      const otherTokens = tokenize(otherMemo.content);
      if (otherTokens.size === 0) continue;

      // 共通トークンを検出
      const { commonTokens, score } = findCommonTokens(targetTokens, otherTokens);

      // スコアが1以上の場合のみ関連として保存
      if (score > 0) {
        relations.push({
          relatedMemoId: otherMemo.id,
          commonTerms: Array.from(commonTokens).join(', '),
          score
        });
      }
    }

    // スコア降順でソート
    relations.sort((a, b) => b.score - a.score);

    // 上位の関連のみ保存（最大20件）
    const topRelations = relations.slice(0, 20);
    for (const relation of topRelations) {
      memoRepository.saveRelation(
        memoId,
        relation.relatedMemoId,
        relation.commonTerms,
        relation.score
      );
    }

    console.log(`Built ${topRelations.length} relations for memo ${memoId}`);
  } catch (error) {
    console.error('Failed to build memo relations:', error);
    throw error;
  }
}

/**
 * 全メモの関連を再構築
 */
async function rebuildAllMemoRelations() {
  try {
    const allMemos = memoRepository.findAllForRelations();
    console.log(`Rebuilding relations for ${allMemos.length} memos...`);

    let completed = 0;
    for (const memo of allMemos) {
      await buildMemoRelations(memo.id);
      completed++;
      
      if (completed % 10 === 0) {
        console.log(`Progress: ${completed}/${allMemos.length}`);
      }
    }

    console.log('All memo relations rebuilt successfully');
  } catch (error) {
    console.error('Failed to rebuild all memo relations:', error);
    throw error;
  }
}

module.exports = {
  buildMemoRelations,
  rebuildAllMemoRelations
};