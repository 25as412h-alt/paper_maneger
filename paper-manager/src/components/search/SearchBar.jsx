import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const SCOPES = [
  { value: 'all', label: '全体' },
  { value: 'title_author', label: 'タイトル / 著者' },
  { value: 'memo', label: 'メモ' },
  { value: 'content', label: '本文' },
  { value: 'figure', label: '図表' }
];

function SearchBar() {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState('all');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    try {
      const data = await window.electronAPI.search.getHistory(10);
      setHistory(data);
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    
    if (!query.trim()) return;

    try {
      // 検索実行
      const results = await window.electronAPI.search.searchByScope(query, scope);
      
      // 検索履歴に保存
      await window.electronAPI.search.saveHistory(query, scope, results.total);
      
      // 検索結果ページへ遷移
      navigate(`/search?q=${encodeURIComponent(query)}&scope=${scope}`);
      
      // 履歴を再読み込み
      loadSearchHistory();
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleHistoryClick = (item) => {
    setQuery(item.query);
    setScope(item.scope);
    setShowHistory(false);
    
    // 即座に検索実行
    navigate(`/search?q=${encodeURIComponent(item.query)}&scope=${item.scope}`);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffHours < 1) return '数分前';
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffHours < 48) return '昨日';
    return `${Math.floor(diffHours / 24)}日前`;
  };

  return (
    <div className="relative">
      <form onSubmit={handleSearch} className="flex items-center gap-2">
        {/* 検索アイコン */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400 text-xl">🔍</span>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowHistory(true)}
            onBlur={() => setTimeout(() => setShowHistory(false), 200)}
            placeholder="検索語を入力"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* スコープ選択 */}
        <select
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {SCOPES.map(s => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        {/* 検索ボタン */}
        <button
          type="submit"
          disabled={!query.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
        >
          検索
        </button>
      </form>

      {/* 検索履歴ドロップダウン */}
      {showHistory && history.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto">
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">
                📜 検索履歴
              </span>
              <button
                type="button"
                onClick={async () => {
                  await window.electronAPI.search.clearHistory();
                  setHistory([]);
                }}
                className="text-xs text-red-600 hover:text-red-700"
              >
                クリア
              </button>
            </div>
          </div>
          <div className="py-2">
            {history.map((item, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleHistoryClick(item)}
                className="w-full px-4 py-3 hover:bg-gray-50 text-left transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {item.query}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {SCOPES.find(s => s.value === item.scope)?.label || item.scope}
                      </span>
                      <span className="ml-2">
                        {item.result_count}件
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 ml-4">
                    {formatTimestamp(item.searched_at)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchBar;