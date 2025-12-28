// src/components/PaperList.jsx - 論文一覧画面
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

function PaperList() {
  const [searchParams] = useSearchParams();
  const [papers, setPapers] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tagParam = searchParams.get('tag');
    if (tagParam) {
      setSelectedTag(tagParam);
    }
  }, [searchParams]);

  useEffect(() => {
    console.log('[PAPER_LIST] 論文一覧取得開始');
    loadPapers();
    loadTags();
  }, [selectedTag]);

  const loadPapers = async () => {
    try {
      const filters = selectedTag ? { tag: selectedTag } : {};
      const result = await window.electronAPI.paper.list(filters);
      
      if (result.success) {
        console.log('[PAPER_LIST] 取得成功:', result.papers.length, '件');
        setPapers(result.papers);
      } else {
        console.error('[PAPER_LIST] 取得失敗:', result.error);
        toast.error('論文の取得に失敗しました');
      }
    } catch (error) {
      console.error('[PAPER_LIST] 取得エラー:', error);
      toast.error('論文の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const result = await window.electronAPI.tag.list();
      
      if (result.success) {
        console.log('[PAPER_LIST] タグ取得成功:', result.tags.length, '件');
        setTags(result.tags);
      }
    } catch (error) {
      console.error('[PAPER_LIST] タグ取得エラー:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400 text-xl">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            📚 論文一覧
            <span className="text-lg font-normal text-gray-400">
              ({papers.length}件)
            </span>
          </h2>
          <Link
            to="/papers/add"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            ＋ 新規登録
          </Link>
        </div>

        {/* タグフィルター */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-gray-400 text-sm">フィルタ:</span>
          
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
              selectedTag === null
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            すべて
          </button>

          {tags.map((tag) => (
            <button
              key={tag.tag_name}
              onClick={() => setSelectedTag(tag.tag_name)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                selectedTag === tag.tag_name
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              #{tag.tag_name}
              <span className="text-xs opacity-75">({tag.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* 論文リスト */}
      {papers.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 text-center shadow-lg border border-gray-700">
          <div className="text-gray-500 text-lg mb-4">
            {selectedTag ? `タグ「${selectedTag}」の論文はありません` : '論文が登録されていません'}
          </div>
          {!selectedTag && (
            <Link
              to="/papers/add"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              最初の論文を登録する
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {papers.map((paper) => (
            <div
              key={paper.id}
              className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 hover:border-blue-500 transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <Link
                    to={`/papers/${paper.id}`}
                    className="text-xl font-semibold text-gray-100 hover:text-blue-400 transition block mb-2"
                  >
                    📄 {paper.title}
                  </Link>
                  
                  <div className="text-gray-400 mb-3">
                    {paper.authors && <span>{paper.authors}</span>}
                    {paper.year && <span> ({paper.year})</span>}
                  </div>

                  {paper.tags && (
                    <div className="flex flex-wrap gap-2">
                      {paper.tags.split(', ').map((tag, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedTag(tag)}
                          className="px-2 py-1 bg-gray-700 hover:bg-blue-600 text-gray-300 hover:text-white text-xs rounded transition"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="text-sm text-gray-500">
                    {formatDate(paper.created_at)}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        const result = await window.electronAPI.pdf.open(paper.pdf_path);
                        if (!result.success) {
                          toast.error('PDFを開けませんでした');
                        }
                      }}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition"
                    >
                      PDF
                    </button>
                    <Link
                      to={`/papers/${paper.id}`}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition"
                    >
                      詳細
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PaperList;