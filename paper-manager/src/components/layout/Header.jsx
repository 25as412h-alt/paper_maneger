import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* ロゴ */}
          <Link to="/" className="flex items-center gap-3">
            <div className="text-2xl">📚</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Paper Manager
              </h1>
              <p className="text-xs text-gray-500">
                研究論文データベース
              </p>
            </div>
          </Link>

          {/* ナビゲーション */}
          <nav className="flex items-center gap-6">
            <NavLink to="/" active={isActive('/')} exact>
              🏠 ダッシュボード
            </NavLink>
            <NavLink to="/papers" active={isActive('/papers')}>
              📚 論文一覧
            </NavLink>
            <NavLink to="/upload" active={isActive('/upload')}>
              ➕ 追加
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}

function NavLink({ to, active, exact = false, children }) {
  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        active
          ? 'bg-blue-50 text-blue-600'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      {children}
    </Link>
  );
}

export default Header;