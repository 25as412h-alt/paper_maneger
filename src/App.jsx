import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// ページコンポーネント
import Dashboard from './pages/Dashboard';
import PaperList from './pages/PaperList';
import PaperDetail from './pages/PaperDetail';
import PaperRegister from './pages/PaperRegister';
import SearchResult from './pages/SearchResult';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* ナビゲーションバー */}
        <Navigation />
        
        {/* メインコンテンツ */}
        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/papers" element={<PaperList />} />
            <Route path="/papers/new" element={<PaperRegister />} />
            <Route path="/papers/:id" element={<PaperDetail />} />
            <Route path="/papers/:id/edit" element={<PaperRegister />} />
            <Route path="/search" element={<SearchResult />} />
          </Routes>
        </main>
        
        {/* トースト通知 */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 2000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

// ナビゲーションコンポーネント
function Navigation() {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100';
  };
  
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* ロゴ */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">📄</span>
            <span className="text-xl font-bold text-gray-800">Paper Manager</span>
          </Link>
          
          {/* ナビゲーションリンク */}
          <div className="flex space-x-1">
            <Link 
              to="/" 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/')}`}
            >
              ダッシュボード
            </Link>
            <Link 
              to="/papers" 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/papers')}`}
            >
              論文一覧
            </Link>
            <Link 
              to="/papers/new" 
              className="px-4 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              + 新規登録
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default App;