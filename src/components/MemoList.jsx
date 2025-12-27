import React, { useState } from 'react';
import toast from 'react-hot-toast';

function MemoList({ paperId, memos, onMemoCreated }) {
  const [showNewMemo, setShowNewMemo] = useState(false);
  const [newMemoContent, setNewMemoContent] = useState('');
  const [editingMemoId, setEditingMemoId] = useState(null);
  const [editingContent, setEditingContent] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleCreateMemo = async () => {
    if (!newMemoContent.trim()) {
      toast.error('メモ内容を入力してください');
      return;
    }
    
    setLoading(true);
    try {
      await window.api.memos.create(paperId, newMemoContent.trim());
      toast.success('メモを作成しました');
      setNewMemoContent('');
      setShowNewMemo(false);
      onMemoCreated();
    } catch (error) {
      console.error('メモ作成エラー:', error);
      toast.error('メモの作成に失敗しました');
    } finally {
      setLoading(false);
    }
  };
  
  const handleStartEdit = (memo) => {
    setEditingMemoId(memo.id);
    setEditingContent(memo.content);
  };
  
  const handleSaveEdit = async (memoId) => {
    if (!editingContent.trim()) {
      toast.error('メモ内容を入力してください');
      return;
    }
    
    setLoading(true);
    try {
      await window.api.memos.update(memoId, editingContent.trim());
      toast.success('メモを更新しました');
      setEditingMemoId(null);
      onMemoCreated();
    } catch (error) {
      console.error('メモ更新エラー:', error);
      toast.error('メモの更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteMemo = async (memoId) => {
    if (!confirm('このメモを削除しますか?')) {
      return;
    }
    
    try {
      await window.api.memos.delete(memoId);
      toast.success('メモを削除しました');
      onMemoCreated();
    } catch (error) {
      console.error('メモ削除エラー:', error);
      toast.error('メモの削除に失敗しました');
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          📝 メモ ({memos.length}件)
        </h2>
        <button
          onClick={() => setShowNewMemo(!showNewMemo)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          + 新規メモ
        </button>
      </div>
      
      {/* 新規メモフォーム */}
      {showNewMemo && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h3 className="font-medium text-gray-800 mb-2">新規メモ作成</h3>
          <textarea
            value={newMemoContent}
            onChange={(e) => setNewMemoContent(e.target.value)}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            placeholder="メモ内容を入力...

Markdownも使用できます"
          />
          <div className="flex space-x-2">
            <button
              onClick={handleCreateMemo}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-md transition-colors"
            >
              {loading ? '保存中...' : '保存'}
            </button>
            <button
              onClick={() => {
                setShowNewMemo(false);
                setNewMemoContent('');
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}
      
      {/* メモ一覧 */}
      {memos.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-2">まだメモがありません</p>
          <button
            onClick={() => setShowNewMemo(true)}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            最初のメモを作成
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {memos.map((memo) => (
            <div
              key={memo.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              {editingMemoId === memo.id ? (
                // 編集モード
                <div>
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSaveEdit(memo.id)}
                      disabled={loading}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-md text-sm transition-colors"
                    >
                      {loading ? '保存中...' : '保存'}
                    </button>
                    <button
                      onClick={() => setEditingMemoId(null)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50 transition-colors"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                // 表示モード
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-xs text-gray-500">
                      {formatDate(memo.created_at)}
                      {memo.updated_at !== memo.created_at && (
                        <span className="ml-2">(編集済み)</span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStartEdit(memo)}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        ✏️ 編集
                      </button>
                      <button
                        onClick={() => handleDeleteMemo(memo.id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        🗑️ 削除
                      </button>
                    </div>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-gray-700">
                      {memo.content}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MemoList;