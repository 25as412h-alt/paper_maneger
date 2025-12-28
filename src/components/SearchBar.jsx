// src/components/SearchBar.jsx - 検索バーコンポーネント
import React, { useState } from 'react';

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState('all');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      console.log('[SEARCHBAR] 検索語が空です');
      return;
    }

    console.log('[SEARCHBAR] 検索実行:', query, scope);
    onSearch(query, scope);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="論文やメモを検索..."
            className="w-full px-4 py-3 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder-gray-400"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
            🔍
          </span>
        </div>
        
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
        >
          検索
        </button>
      </div>

      <div className="flex items-center space-x-4 text-sm">
        <span className="text-gray-400">検索対象:</span>
        
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name="scope"
            value="all"
            checked={scope === 'all'}
            onChange={(e) => setScope(e.target.value)}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-gray-300">全体（本文 + メモ）</span>
        </label>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name="scope"
            value="papers"
            checked={scope === 'papers'}
            onChange={(e) => setScope(e.target.value)}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-gray-300">本文のみ</span>
        </label>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name="scope"
            value="memos"
            checked={scope === 'memos'}
            onChange={(e) => setScope(e.target.value)}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-gray-300">メモのみ</span>
        </label>
      </div>
    </form>
  );
}

export default SearchBar;