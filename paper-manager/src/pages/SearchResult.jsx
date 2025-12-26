import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import toast from 'react-hot-toast';

function SearchResult() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const query = searchParams.get('q') || '';
  const scope = searchParams.get('scope') || 'all';
  
  useEffect(() => {
    if (query) {
      performSearch(query, scope);
    }
  }, [query, scope]);
  
  const performSearch = async (searchQuery, searchScope) => {
    setLoading(true);
    try {
      const searchResults = await window.api.search.fullText(searchQuery, searchScope);
      setResults(searchResults);
    } catch (error) {
      console.error('検索エラー:', error);
      toast.error('検索に失敗しました');
    } finally {
      setLoading(false);
    }
  };
  
  const handleNewSearch = (newQuery, newScope) => {
    navigate(`/search?q=${encodeURIComponent(newQuery)}&scope=${newScope}`);
  };
  
  const handleOpenPDF = async (pdfPath) => {
    try {
      await window.api.openPDF(pdfPath);
    } catch (error) {
      toast.error('PDFを開けませんでした');
    }
  };
  
  const paperResults = results.filter(r => r.type === 'paper');
  const memoResults = results.filter(r => r.type === 'memo');
  
  return (
    <div className="max-w-6xl mx-auto">
      {/* 検索バー */}
      <div className="mb-6">
        <SearchBar 
          onSearch={handleNewSearch}
          defaultScope={scope}
        />
      </div>
      
      {/* 検索結果ヘッダー */}
      {query && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            検索: "{query}"
          </h1>
          <p className="text-gray-600">
            結果: {results.length}件
            {scope !== 'all' && (
              <span className="ml-2">
                ({scope === 'papers' ? '本文のみ' : 'メモのみ'})
              </span>
            )}
          </p>
        </div>
      )}
      
      {/* 検索中 */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">検索中...</div>
        </div>
      )}
      
      {/* 検索結果 */}
      {!loading && query && (
        <>
          {results.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-gray-600 mb-2">検索結果が見つかりませんでした</p>
              <p className="text-sm text-gray-500">
                別のキーワードで検索してみてください
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 本文検索結果 */}
              {paperResults.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    📄 本文 ({paperResults.length}件)
                  </h2>
                  <div className="space-y-3">
                    {paperResults.map((result, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Link
                              to={`/papers/${result.paper_id}`}
                              className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors"
                            >
                              {result.title}
                            </Link>
                            
                            {result.authors && (
                              <p className="text-sm text-gray-600 mt-1">
                                {result.authors}
                              </p>
                            )}
                            
                            <div 
                              className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm"
                              dangerouslySetInnerHTML={{ __html: result.snippet }}
                            />
                          </div>
                          
                          <div className="flex flex-col space-y-2 ml-4">
                            <button
                              onClick={async () => {
                                const paper = await window.api.papers.findById(result.paper_id);
                                handleOpenPDF(paper.pdf_path);
                              }}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded transition-colors whitespace-nowrap"
                            >
                              PDFを開く
                            </button>
                            <Link
                              to={`/papers/${result.paper_id}`}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded text-center transition-colors"
                            >
                              詳細へ
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* メモ検索結果 */}
              {memoResults.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    📝 メモ ({memoResults.length}件)
                  </h2>
                  <div className="space-y-3">
                    {memoResults.map((result, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="text-sm text-gray-500 mb-2">
                              論文: 
                              <Link
                                to={`/papers/${result.paper_id}`}
                                className="ml-1 text-blue-600 hover:text-blue-700 font-medium"
                              >
                                {result.paper_title}
                              </Link>
                            </div>
                            
                            <div 
                              className="p-3 bg-blue-50 border border-blue-200 rounded text-sm"
                              dangerouslySetInnerHTML={{ __html: result.snippet }}
                            />
                          </div>
                          
                          <Link
                            to={`/papers/${result.paper_id}`}
                            className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors whitespace-nowrap"
                          >
                            詳細へ
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
      
      {/* 初期状態 */}
      {!query && (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-gray-600">
            キーワードを入力して検索してください
          </p>
        </div>
      )}
    </div>
  );
}

export default SearchResult;