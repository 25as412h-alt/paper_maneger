import React, { useState } from 'react';

function SearchBar({ onSearch, defaultScope = 'all' }) {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState(defaultScope);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), scope);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <form onSubmit={handleSubmit}>
        {/* 検索入力 */}
        <div className="mb-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
              🔍
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="論文やメモを検索..."
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        {/* 検索対象選択 */}
        <div className="flex items-center space-x-6 mb-4">
          <span className="text-sm font-medium text-gray-700">検索対象:</span>
          
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="scope"
              value="all"
              checked={scope === 'all'}
              onChange={(e) => setScope(e.target.value)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">全体（本文 + メモ）</span>
          </label>
          
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="scope"
              value="papers"
              checked={scope === 'papers'}
              onChange={(e) => setScope(e.target.value)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">本文のみ</span>
          </label>
          
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="scope"
              value="memos"
              checked={scope === 'memos'}
              onChange={(e) => setScope(e.target.value)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">メモのみ</span>
          </label>
        </div>
        
        {/* 検索ボタン */}
        <button
          type="submit"
          disabled={!query.trim()}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
        >
          検索
        </button>
      </form>
    </div>
  );
}

export default SearchBar;