import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import MemoList from '../components/MemoList';

function PaperDetail() {
  const [paper, setPaper] = useState(null);
  const [memos, setMemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const { id } = useParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    loadPaperDetail();
  }, [id]);
  
  const loadPaperDetail = async () => {
    try {
      // 論文情報取得
      const paperData = await window.api.papers.findById(parseInt(id));
      setPaper(paperData);
      
      // メモ取得
      const memosData = await window.api.memos.findByPaperId(parseInt(id));
      setMemos(memosData);
      
      setLoading(false);
    } catch (error) {
      console.error('論文詳細読み込みエラー:', error);
      toast.error('論文の読み込みに失敗しました');
      setLoading(false);
    }
  };
  
  const handleOpenPDF = async () => {
    if (paper?.pdf_path) {
      try {
        await window.api.openPDF(paper.pdf_path);
      } catch (error) {
        toast.error('PDFを開けませんでした');
      }
    }
  };
  
  const handleDelete = async () => {
    try {
      await window.api.papers.delete(parseInt(id));
      toast.success('論文を削除しました');
      navigate('/papers');
    } catch (error) {
      console.error('論文削除エラー:', error);
      toast.error('論文の削除に失敗しました');
    }
  };
  
  const handleMemoCreated = () => {
    loadPaperDetail();
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }
  
  if (!paper) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="text-4xl mb-4">❌</div>
        <p className="text-gray-600 mb-4">論文が見つかりません</p>
        <Link to="/papers" className="text-blue-600 hover:text-blue-700">
          論文一覧に戻る
        </Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-3">
              📄 {paper.title}
            </h1>
            
            <p className="text-gray-600 text-lg mb-3">
              {paper.authors}
              {paper.year && <span className="ml-2">({paper.year})</span>}
            </p>
            
            {/* タグ */}
            {paper.tags && paper.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {paper.tags.map((tag, idx) => (
                  <Link
                    key={idx}
                    to={`/papers?tag=${encodeURIComponent(tag)}`}
                    className="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
            
            {/* 日時 */}
            <div className="text-sm text-gray-500">
              登録日: {new Date(paper.created_at).toLocaleString('ja-JP')}
              {paper.last_viewed_at && (
                <span className="ml-4">
                  最終閲覧: {new Date(paper.last_viewed_at).toLocaleString('ja-JP')}
                </span>
              )}
            </div>
          </div>
          
          {/* アクションボタン */}
          <div className="flex flex-col space-y-2 ml-4">
            <button
              onClick={handleOpenPDF}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
            >
              📄 PDFを開く
            </button>
            <Link
              to={`/papers/${id}/edit`}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-center transition-colors"
            >
              ✏️ 編集
            </Link>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
            >
              🗑️ 削除
            </button>
          </div>
        </div>
      </div>
      
      {/* 本文プレビュー */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">📝 本文</h2>
        <div className="bg-gray-50 rounded p-4 max-h-96 overflow-y-auto">
          <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">
            {paper.content}
          </pre>
        </div>
      </div>
      
      {/* メモセクション */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <MemoList 
          paperId={parseInt(id)} 
          memos={memos}
          onMemoCreated={handleMemoCreated}
        />
      </div>
      
      {/* 削除確認モーダル */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              論文を削除しますか?
            </h3>
            <p className="text-gray-600 mb-6">
              この操作は取り消せません。論文とすべてのメモが削除されます。
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaperDetail;