// src/components/PaperDetail.jsx - 論文詳細画面
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function PaperDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [memos, setMemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMemo, setEditingMemo] = useState(null);
  const [newMemoContent, setNewMemoContent] = useState('');
  const [showNewMemoForm, setShowNewMemoForm] = useState(false);

  useEffect(() => {
    console.log('[PAPER_DETAIL] 論文詳細取得開始: ID=', id);
    loadPaper();
    loadMemos();
  }, [id]);

  const loadPaper = async () => {
    try {
      const result = await window.electronAPI.paper.get(parseInt(id));
      
      if (result.success && result.paper) {
        console.log('[PAPER_DETAIL] 論文取得成功');
        setPaper(result.paper);
      } else {
        console.error('[PAPER_DETAIL] 論文が見つかりません');
        toast.error('論文が見つかりませんでした');
        navigate('/papers');
      }
    } catch (error) {
      console.error('[PAPER_DETAIL] 取得エラー:', error);
      toast.error('論文の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const loadMemos = async () => {
    try {
      const result = await window.electronAPI.memo.list(parseInt(id));
      
      if (result.success) {
        console.log('[PAPER_DETAIL] メモ取得成功:', result.memos.length, '件');
        setMemos(result.memos);
      }
    } catch (error) {
      console.error('[PAPER_DETAIL] メモ取得エラー:', error);
    }
  };

  const handleOpenPdf = async () => {
    console.log('[PAPER_DETAIL] PDF表示:', paper.pdf_path);
    const result = await window.electronAPI.pdf.open(paper.pdf_path);
    
    if (!result.success) {
      toast.error('PDFを開けませんでした');
    }
  };

  const handleAddMemo = async () => {
    if (!newMemoContent.trim()) {
      toast.error('メモ内容を入力してください');
      return;
    }

    console.log('[PAPER_DETAIL] メモ追加開始');
    const loadingToast = toast.loading('メモを追加中...');

    try {
      const result = await window.electronAPI.memo.add(parseInt(id), newMemoContent);
      
      if (result.success) {
        console.log('[PAPER_DETAIL] メモ追加成功');
        toast.dismiss(loadingToast);
        toast.success('メモを追加しました');
        setNewMemoContent('');
        setShowNewMemoForm(false);
        loadMemos();
      } else {
        toast.dismiss(loadingToast);
        toast.error('メモの追加に失敗しました');
      }
    } catch (error) {
      console.error('[PAPER_DETAIL] メモ追加エラー:', error);
      toast.dismiss(loadingToast);
      toast.error('メモの追加に失敗しました');
    }
  };

  const handleUpdateMemo = async (memoId, content) => {
    console.log('[PAPER_DETAIL] メモ更新:', memoId);
    const loadingToast = toast.loading('メモを更新中...');

    try {
      const result = await window.electronAPI.memo.update(memoId, content);
      
      if (result.success) {
        toast.dismiss(loadingToast);
        toast.success('メモを更新しました');
        setEditingMemo(null);
        loadMemos();
      } else {
        toast.dismiss(loadingToast);
        toast.error('メモの更新に失敗しました');
      }
    } catch (error) {
      console.error('[PAPER_DETAIL] メモ更新エラー:', error);
      toast.dismiss(loadingToast);
      toast.error('メモの更新に失敗しました');
    }
  };

  const handleDeleteMemo = async (memoId) => {
    if (!confirm('このメモを削除しますか?')) {
      return;
    }

    console.log('[PAPER_DETAIL] メモ削除:', memoId);
    const loadingToast = toast.loading('メモを削除中...');

    try {
      const result = await window.electronAPI.memo.delete(memoId);
      
      if (result.success) {
        toast.dismiss(loadingToast);
        toast.success('メモを削除しました');
        loadMemos();
      } else {
        toast.dismiss(loadingToast);
        toast.error('メモの削除に失敗しました');
      }
    } catch (error) {
      console.error('[PAPER_DETAIL] メモ削除エラー:', error);
      toast.dismiss(loadingToast);
      toast.error('メモの削除に失敗しました');
    }
  };

  const handleDeletePaper = async () => {
    if (!confirm('この論文を削除しますか？関連するメモもすべて削除されます。')) {
      return;
    }

    console.log('[PAPER_DETAIL] 論文削除:', id);
    const loadingToast = toast.loading('論文を削除中...');

    try {
      const result = await window.electronAPI.paper.delete(parseInt(id));
      
      if (result.success) {
        toast.dismiss(loadingToast);
        toast.success('論文を削除しました');
        navigate('/papers');
      } else {
        toast.dismiss(loadingToast);
        toast.error('論文の削除に失敗しました');
      }
    } catch (error) {
      console.error('[PAPER_DETAIL] 論文削除エラー:', error);
      toast.dismiss(loadingToast);
      toast.error('論文の削除に失敗しました');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400 text-xl">読み込み中...</div>
      </div>
    );
  }

  if (!paper) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* 論文情報 */}
      <div className="bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-700">
        <h2 className="text-3xl font-bold text-gray-100 mb-4">
          📄 {paper.title}
        </h2>

        <div className="space-y-2 mb-6">
          {paper.authors && (
            <div className="text-gray-300">
              <span className="font-medium">著者:</span> {paper.authors}
            </div>
          )}
          {paper.year && (
            <div className="text-gray-300">
              <span className="font-medium">発行年:</span> {paper.year}
            </div>
          )}
          <div className="text-gray-400 text-sm">
            登録日: {formatDate(paper.created_at)}
          </div>
        </div>

        {paper.tags && (
          <div className="flex flex-wrap gap-2 mb-6">
            {paper.tags.split(', ').map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleOpenPdf}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
          >
            📄 PDFを開く
          </button>
          <button
            onClick={handleDeletePaper}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
          >
            🗑️ 削除
          </button>
        </div>
      </div>

      {/* メモセクション */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-100 flex items-center gap-2">
            📝 メモ
            <span className="text-lg font-normal text-gray-400">
              ({memos.length}件)
            </span>
          </h3>
          <button
            onClick={() => setShowNewMemoForm(!showNewMemoForm)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            {showNewMemoForm ? 'キャンセル' : '＋ 新規メモ'}
          </button>
        </div>

        {/* 新規メモフォーム */}
        {showNewMemoForm && (
          <div className="mb-6 p-4 bg-gray-700 rounded-lg">
            <textarea
              value={newMemoContent}
              onChange={(e) => setNewMemoContent(e.target.value)}
              placeholder="メモ内容を入力..."
              rows={6}
              className="w-full px-4 py-3 bg-gray-800 text-gray-100 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleAddMemo}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
              >
                保存
              </button>
              <button
                onClick={() => {
                  setShowNewMemoForm(false);
                  setNewMemoContent('');
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}

        {/* メモ一覧 */}
        {memos.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            まだメモがありません
          </div>
        ) : (
          <div className="space-y-4">
            {memos.map((memo) => (
              <div key={memo.id} className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                {editingMemo === memo.id ? (
                  <div>
                    <textarea
                      defaultValue={memo.content}
                      id={`memo-edit-${memo.id}`}
                      rows={6}
                      className="w-full px-4 py-3 bg-gray-800 text-gray-100 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {
                          const content = document.getElementById(`memo-edit-${memo.id}`).value;
                          handleUpdateMemo(memo.id, content);
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setEditingMemo(null)}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg font-medium transition"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-gray-300 whitespace-pre-wrap mb-3">
                      {memo.content}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {formatDate(memo.created_at)}
                        {memo.updated_at !== memo.created_at && (
                          <span className="ml-2">(更新: {formatDate(memo.updated_at)})</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingMemo(memo.id)}
                          className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded-lg transition"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDeleteMemo(memo.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition"
                        >
                          削除
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PaperDetail;