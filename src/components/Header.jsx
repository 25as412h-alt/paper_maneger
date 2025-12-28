// src/components/Header.jsx - ヘッダーコンポーネント
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from './SearchBar';

function Header() {
  const navigate = useNavigate();

  const handleSearch = (query, scope) => {
    console.log('[HEADER] 検索実行:', query, scope);
    navigate(`/search?q=${encodeURIComponent(query)}&scope=${scope}`);
  };

  return (
    <header className="bg-gray-800 border-b border-gray-700 shadow-lg">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between mb-4">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition">
            <span className="text-3xl">📚</span>
            <h1 className="text-2xl font-bold text-gray-100">Paper Manager</h1>
          </Link>

          <nav className="flex items-center space-x-4">
            <Link 
              to="/" 
              className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition"
            >
              ダッシュボード
            </Link>
            <Link 
              to="/papers" 
              className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition"
            >
              論文一覧
            </Link>
            <Link 
              to="/papers/add" 
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
            >
              ＋ 新規登録
            </Link>
          </nav>
        </div>

        <SearchBar onSearch={handleSearch} />
      </div>
    </header>
  );
}

export default Header;