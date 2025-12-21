// ============================================
// MemoEditor.jsx - メモ編集モーダル
// ============================================
import React, { useState } from 'react';
import { Modal, Button } from '../common/Button';
import MarkdownRenderer from '../common/MarkdownRenderer';

function MemoEditor({ paperId, memo = null, onClose, onSave }) {
  const [content, setContent] = useState(memo?.content || '');
  const [pageNumber, setPageNumber] = useState(memo?.page_number || '');
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleSave = async () => {
    try {
      setSaving(true);

      const memoData = {
        paper_id: paperId,
        content,
        page_number: pageNumber ? parseInt(pageNumber) : null
      };

      if (memo) {
        await window.electronAPI.memos.update(memo.id, memoData);
      } else {
        await window.electronAPI.memos.create(memoData);
      }

      onSave();
    } catch (error) {
      console.error('Failed to save memo:', error);
      alert('メモの保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={memo ? 'メモを編集' : '新しいメモ'}
    >
      <div className="space-y-4">
        {/* ページ番号 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ページ番号（任意）
          </label>
          <input
            type="number"
            value={pageNumber}
            onChange={(e) => setPageNumber(e.target.value)}
            placeholder="例: 5"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* メモ内容 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              メモ内容 <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showPreview ? '編集' : 'プレビュー'}
            </button>
          </div>

          {showPreview ? (
            <div className="border border-gray-300 rounded-lg p-4 min-h-[240px] bg-gray-50">
              <MarkdownRenderer content={content} />
            </div>
          ) : (
            <>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Markdown形式で入力できます"
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Markdown記法をサポートしています（見出し、リスト、コードブロックなど）
              </p>
            </>
          )}
        </div>

        {/* アクションボタン */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={saving}
            className="flex-1"
          >
            キャンセル
          </Button>
          <Button
            onClick={handleSave}
            disabled={!content.trim() || saving}
            className="flex-1"
          >
            {saving ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ============================================
// MemoCard.jsx - メモカード
// ============================================
import MarkdownRenderer from '../common/MarkdownRenderer';

function MemoCard({ memo, onEdit, onDelete }) {
  const [showRelated, setShowRelated] = useState(false);
  const [relatedMemos, setRelatedMemos] = useState([]);
  const [showFullContent, setShowFullContent] = useState(false);

  const loadRelatedMemos = async () => {
    if (showRelated) {
      setShowRelated(false);
      return;
    }

    try {
      const related = await window.electronAPI.memos.getRelated(memo.id, 5);
      setRelatedMemos(related);
      setShowRelated(true);
    } catch (error) {
      console.error('Failed to load related memos:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('このメモを削除してもよろしいですか？')) return;

    try {
      await window.electronAPI.memos.delete(memo.id);
      onDelete();
    } catch (error) {
      console.error('Failed to delete memo:', error);
      alert('メモの削除に失敗しました');
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      {/* ヘッダー */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {memo.page_number && (
            <span className="text-xs text-gray-600 font-medium">
              📄 p.{memo.page_number}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(memo)}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            ✏️
          </button>
          <button
            onClick={handleDelete}
            className="text-gray-400 hover:text-red-600 text-sm"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* 内容 */}
      <div className="mb-3">
        {showFullContent ? (
          <div className="text-sm">
            <MarkdownRenderer content={memo.content} />
          </div>
        ) : (
          <div className="text-sm text-gray-700 whitespace-pre-wrap">
            {memo.content.length > 200
              ? memo.content.substring(0, 200) + '...'
              : memo.content}
          </div>
        )}
        {memo.content.length > 200 && (
          <button
            onClick={() => setShowFullContent(!showFullContent)}
            className="text-xs text-blue-600 hover:text-blue-700 mt-2"
          >
            {showFullContent ? '折りたたむ' : 'もっと見る'}
          </button>
        )}
      </div>

      {/* フッター */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{new Date(memo.created_at).toLocaleDateString('ja-JP')}</span>
        <button
          onClick={loadRelatedMemos}
          className="text-blue-600 hover:text-blue-700"
        >
          {showRelated ? '関連を隠す' : '🔗 関連メモを表示'}
        </button>
      </div>

      {/* 関連メモ */}
      {showRelated && relatedMemos.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-700 mb-2">
            🔗 関連メモ ({relatedMemos.length}件)
          </p>
          <div className="space-y-2">
            {relatedMemos.map(related => (
              <div key={related.id} className="p-2 bg-gray-50 rounded text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">
                    {related.paper_title}
                  </span>
                  <span className="text-gray-500">
                    共通: {related.score}語
                  </span>
                </div>
                <p className="text-gray-600 truncate">
                  {related.content.substring(0, 80)}...
                </p>
                <p className="text-gray-500 mt-1">
                  {related.common_terms}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// MemoList.jsx - メモリスト
// ============================================
function MemoList({ memos, onMemoDeleted }) {
  const [editingMemo, setEditingMemo] = useState(null);

  if (memos.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        まだメモがありません
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {memos.map(memo => (
          <MemoCard
            key={memo.id}
            memo={memo}
            onEdit={setEditingMemo}
            onDelete={onMemoDeleted}
          />
        ))}
      </div>

      {/* 編集モーダル */}
      {editingMemo && (
        <MemoEditor
          paperId={editingMemo.paper_id}
          memo={editingMemo}
          onClose={() => setEditingMemo(null)}
          onSave={() => {
            setEditingMemo(null);
            onMemoDeleted(); // リロード
          }}
        />
      )}
    </>
  );
}

export { MemoEditor, MemoCard, MemoList };