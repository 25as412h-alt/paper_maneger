import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Loading, Button } from '../components/common/Button';
import MemoList from '../components/memo/MemoList';
import MemoEditor from '../components/memo/MemoEditor';
import PDFViewer from '../components/paper/PDFViewer';
import TXTViewer from '../components/paper/TXTViewer';
import ProcessingStatus from '../components/paper/ProcessingStatus';

function PaperDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [paper, setPaper] = useState(null);
  const [memos, setMemos] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [figures, setFigures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pdf');
  const [showMemoEditor, setShowMemoEditor] = useState(false);

  useEffect(() => {
    loadPaperData();
    updateViewedAt();
  }, [id]);

  const loadPaperData = async () => {
    try {
      setLoading(true);

      // 論文情報取得
      const paperData = await window.electronAPI.papers.getById(parseInt(id));
      if (!paperData) {
        navigate('/papers');
        return;
      }
      setPaper(paperData);

      // メモ取得
      const memoData = await window.electronAPI.memos.getByPaper(parseInt(id));
      setMemos(memoData);

      // 章取得
      const chapterData = await window.electronAPI.chapters.getByPaper(parseInt(id));
      setChapters(chapterData);

      // 図表取得
      const figureData = await window.electronAPI.figures.getByPaper(parseInt(id));
      setFigures(figureData);

    } catch (error) {
      console.error('Failed to load paper data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateViewedAt = async () => {
    try {
      await window.electronAPI.papers.updateViewedAt(parseInt(id));
    } catch (error) {
      console.error('Failed to update viewed_at:', error);
    }
  };

  const handleMemoCreated = () => {
    setShowMemoEditor(false);
    loadPaperData();
  };

  const handleMemoDeleted = () => {
    loadPaperData();
  };

  if (loading) {
    return <Loading />;
  }

  if (!paper) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* ヘッダー */}
      <div className="mb-6">
        <Link to="/papers" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
          ← 論文一覧に戻る
        </Link>
        
        {/* 処理状態表示 */}
        <div className="mb-4">
          <ProcessingStatus paperId={parseInt(id)} />
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 flex-1">
              {paper.title}
            </h1>
            <Link to={`/papers/${id}/edit`}>
              <Button variant="secondary" size="sm">
                ✏️ 編集
              </Button>
            </Link>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <div>
              <span className="font-medium">著者:</span> {paper.authors || '不明'}
            </div>
            {paper.year && (
              <div>
                <span className="font-medium">年:</span> {paper.year}
              </div>
            )}
            {paper.doi && (
              <div>
                <span className="font-medium">DOI:</span> {paper.doi}
              </div>
            )}
            <div>
              <span className="font-medium">メモ数:</span> {paper.memo_count}件
            </div>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左メイン（2/3） */}
        <div className="lg:col-span-2">
          {/* タブ */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <TabButton
                  active={activeTab === 'pdf'}
                  onClick={() => setActiveTab('pdf')}
                >
                  {paper.file_type === 'pdf' ? '📄 PDF' : '📝 テキスト'}
                </TabButton>
                <TabButton
                  active={activeTab === 'chapters'}
                  onClick={() => setActiveTab('chapters')}
                >
                  📚 章 ({chapters.length})
                </TabButton>
                <TabButton
                  active={activeTab === 'figures'}
                  onClick={() => setActiveTab('figures')}
                >
                  🖼 図表 ({figures.length})
                </TabButton>
              </nav>
            </div>

            <div className="p-6">
              {/* PDFタブ */}
              {activeTab === 'pdf' && (
                <div className="h-[800px]">
                  {paper.file_type === 'pdf' ? (
                    <PDFViewer paperId={parseInt(id)} />
                  ) : (
                    <TXTViewer paperId={parseInt(id)} />
                  )}
                </div>
              )}

              {/* 章タブ */}
              {activeTab === 'chapters' && (
                <div>
                  {chapters.length > 0 ? (
                    <div className="space-y-6">
                      {chapters.map(chapter => (
                        <div key={chapter.id} className="border-b border-gray-200 pb-6 last:border-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {chapter.title}
                            </h3>
                            {chapter.is_auto_extracted && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                                ⚠ 自動抽出
                              </span>
                            )}
                          </div>
                          {chapter.page_start && (
                            <p className="text-sm text-gray-600 mb-3">
                              p.{chapter.page_start}
                              {chapter.page_end && ` - ${chapter.page_end}`}
                            </p>
                          )}
                          <p className="text-gray-700 whitespace-pre-wrap">
                            {chapter.content?.substring(0, 500)}
                            {chapter.content?.length > 500 && '...'}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <p>章情報がありません</p>
                      <p className="text-sm mt-2">PDF解析後に表示されます</p>
                    </div>
                  )}
                </div>
              )}

              {/* 図表タブ */}
              {activeTab === 'figures' && (
                <div>
                  {figures.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {figures.map(figure => (
                        <div key={figure.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-gray-900">
                              {figure.figure_number}
                            </h4>
                            {figure.page_number && (
                              <span className="text-sm text-gray-600">
                                p.{figure.page_number}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700">
                            {figure.caption}
                          </p>
                          {figure.is_auto_extracted && (
                            <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                              ⚠ 自動抽出
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <p>図表情報がありません</p>
                      <p className="text-sm mt-2">PDF解析後に表示されます</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右サイドバー（1/3） */}
        <div className="space-y-6">
          {/* メモセクション */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                📝 メモ ({memos.length})
              </h2>
              <Button
                size="sm"
                onClick={() => setShowMemoEditor(true)}
              >
                + 追加
              </Button>
            </div>

            <MemoList
              memos={memos}
              onMemoDeleted={handleMemoDeleted}
            />
          </div>
        </div>
      </div>

      {/* メモ作成モーダル */}
      {showMemoEditor && (
        <MemoEditor
          paperId={parseInt(id)}
          onClose={() => setShowMemoEditor(false)}
          onSave={handleMemoCreated}
        />
      )}
    </div>
  );
}

// タブボタン
function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 font-medium border-b-2 transition-colors ${
        active
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-600 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  );
}

export default PaperDetail;