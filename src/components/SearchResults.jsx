// src/components/SearchResults.jsx - 検索結果画面
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';

function SearchResults() {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const query = searchParams.get('q');
  const scope = searchParams.get('scope') || 'all';

  useEffect(() => {
    if (query) {
      console.log('[SEARCH_RESULTS] 検索実行:', query, scope);
      performSearch();
    }
  }, [query, scope]);

  const performSearch = async () => {
    setLoading(true);
    
    try {
      const result = await window.electronAPI.search.query(query, scope);
      
      if (result.success) {
        console.log('[SEARCH_RESULTS] 検索成功:', result.results.length, '件');
        setResults(result.results);
      } else {
        console.error('[SEARCH_RESULTS] 検索失敗:', result.error);
        toast.error('検索に失敗しました');
      }
    } catch (error) {
      console.error('[SEARCH_RESULTS] 検索エラー:', error);
      toast.error('検索に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPdf = async (pdfPath) => {
    const result = await window.electronAPI.pdf.open(pdfPath);
    if (!result.success) {
      toast.error('PDFを開けませんでした');
    }
  };

  const getScopeLabel = (scope) => {
    switch (scope) {
      case 'all': return '全体（本文 + メモ）';
      case 'papers': return '本文のみ';
      case 'memos': return 'メモのみ';
      default: return '全体';
    }
  };

  if (!query) {
    return (
      <div className="bg-gray-800 rounded-xl p-12 text-center shadow-lg border border-gray-700">
        <div className="text-gray-500 text-lg">
          検索語を入力してください
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 検索情報 */}
      <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-100 mb-2">
              🔍 検索結果
            </h2>
            <div className="text-gray-400">
              検索語: <span className="text-blue-400 font-medium">"{query}"</span>
              <span className="mx-2">•</span>
              範囲: <span className="text-blue-400 font-medium">{getScopeLabel(scope)}</span>
            </div>
          </div>
          <div className="text-gray-400">
            {loading ? '検索中...' : `${results.length}件`}
          </div>
        </div>
      </div>

      {/* 検索結果 */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400 text-xl">検索中...</div>
        </div>
      ) : results.length === 0 ? (
        <div className="bg-gray-800 rounded-xl p-12 text-center shadow-lg border border-gray-700">
          <div className="text-gray-500 text-lg mb-4">
            検索結果が見つかりませんでした
          </div>
          <p className="text-gray-600 text-sm">
            別の検索語をお試しください
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((result, index) => (
            <div
              key={`${result.type}-${result.id}-${index}`}
              className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 hover:border-blue-500 transition"
            >
              {/* 論文本文の検索結果 */}
              {result.type === 'paper' && (
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded font-medium">
                          本文
                        </span>
                        <Link
                          to={`/papers/${result.id}`}
                          className="text-xl font-semibold text-gray-100 hover:text-blue-400 transition"
                        >
                          📄 {result.title}
                        </Link>
                      </div>
                      {result.authors && (
                        <div className="text-gray-400 text-sm mb-3">
                          {result.authors}
                        </div>
                      )}
                      
                      {/* スニペット（ハイライト表示） */}
                      <div 
                        className="text-gray-300 bg-gray-700 p-3 rounded border-l-4 border-blue-500"
                        dangerouslySetInnerHTML={{ 
                          __html: result.snippet || '...' 
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={async () => {
                        const paper = await window.electronAPI.paper.get(result.id);
                        if (paper.success) {
                          handleOpenPdf(paper.paper.pdf_path);
                        }
                      }}
                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition"
                    >
                      PDFを開く
                    </button>
                    <Link
                      to={`/papers/${result.id}`}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition"
                    >
                      詳細へ
                    </Link>
                  </div>
                </div>
              )}

              {/* メモの検索結果 */}
              {result.type === 'memo' && (
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded font-medium">
                          メモ
                        </span>
                        <Link
                          to={`/papers/${result.paper_id}`}
                          className="text-lg font-semibold text-gray-100 hover:text-blue-400 transition"
                        >
                          論文: {result.paper_title}
                        </Link>
                      </div>
                      
                      {/* スニペット（ハイライト表示） */}
                      <div 
                        className="text-gray-300 bg-gray-700 p-3 rounded border-l-4 border-purple-500"
                        dangerouslySetInnerHTML={{ 
                          __html: result.snippet || '...' 
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Link
                      to={`/papers/${result.paper_id}`}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition"
                    >
                      論文詳細へ
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 検索のヒント */}
      {!loading && results.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700">
          <div className="text-sm text-gray-400">
            💡 <span className="font-medium">検索のコツ:</span>
            <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
              <li>英語キーワードは部分一致検索が可能です</li>
              <li>複数の単語で検索すると、すべてを含む結果が表示されます</li>
              <li>日本語は完全一致検索になります</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchResults;