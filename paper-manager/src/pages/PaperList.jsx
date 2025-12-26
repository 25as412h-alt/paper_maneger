import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

function PaperList() {
  const [papers, setPapers] = useState([]);
  const [filteredPapers, setFilteredPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    loadPapers();
    
    // URLパラメータからタグ取得
    const tagParam = searchParams.get('tag');
    if (tagParam) {
      setSelectedTag(tagParam);
    }
  }, [searchParams]);
  
  useEffect(() => {
    filterAndSortPapers();
  }, [papers, selectedTag, sortBy]);
  
  const loadPapers = async () => {
    try {
      const allPapers = await window.api.papers.findAll();
      setPapers(allPapers);
      setLoading(false);
    } catch (error) {
      console.error('論文読み込みエラー:', error);
      toast.error('論文の読み込みに失敗しました');
      setLoading(false);
    }
  };
  
  const filterAndSortPapers = () => {
    let filtered = [...papers];
    
    // タグでフィルタ
    if (selectedTag) {
      filtered = filtered.filter(paper => 
        paper.tags && paper.tags.includes(selectedTag)
      );
    }
    
    // ソート
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'created_at':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'year':
          return (b.year || 0) - (a.year || 0);
        default:
          return 0;
      }
    });
    
    setFilteredPapers(filtered);
  };
  
  const handleOpenPDF = async (pdfPath) => {
    try {
      await window.api.openPDF(pdfPath);
    } catch (error) {
      toast.error('PDFを開けませんでした');
    }
  };
  
  // 全タグ取得
  const allTags = [...new Set(papers.flatMap(p => p.tags || []))].sort();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      {/* ヘッダー */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          📚 論文一覧 ({filteredPapers.length}件)
        </h1>
      </div>
      
      {/* フィルタ・ソート */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between">
          {/* タグフィルタ */}
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700">フィルタ:</label>
            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">全タグ</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>#{tag}</option>
              ))}
            </select>
            
            {selectedTag && (
              <button
                onClick={() => setSelectedTag('')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                クリア
              </button>
            )}
          </div>
          
          {/* ソート */}
          <div className="flex items-center space-x-3">
            <label className="text-sm font-medium text-gray-700">ソート:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="created_at">新しい順</option>
              <option value="title">タイトル順</option>
              <option value="year">発行年順</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* 論文リスト */}
      {filteredPapers.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-4xl mb-4">📭</div>
          <p className="text-gray-500 mb-4">
            {selectedTag ? 'このタグの論文が見つかりません' : '論文が登録されていません'}
          </p>
          <Link
            to="/papers/new"
            className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            論文を登録
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPapers.map(paper => (
            <div
              key={paper.id}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* タイトル */}
                  <Link
                    to={`/papers/${paper.id}`}
                    className="text-xl font-semibold text-gray-800 hover:text-blue-600 transition-colors"
                  >
                    📄 {paper.title}
                  </Link>
                  
                  {/* 著者・年 */}
                  <p className="text-gray-600 mt-2">
                    {paper.authors}
                    {paper.year && <span className="ml-2">({paper.year})</span>}
                  </p>
                  
                  {/* タグ */}
                  {paper.tags && paper.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {paper.tags.map((tag, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedTag(tag)}
                          className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* アクションボタン */}
                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => handleOpenPDF(paper.pdf_path)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors"
                  >
                    PDF
                  </button>
                  <Link
                    to={`/papers/${paper.id}`}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded text-center transition-colors"
                  >
                    詳細
                  </Link>
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