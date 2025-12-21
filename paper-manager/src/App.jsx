import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { SearchProvider } from './contexts/SearchContext';

// Pages
import Dashboard from './pages/Dashboard';
import PaperList from './pages/PaperList';
import PaperDetail from './pages/PaperDetail';
import SearchResult from './pages/SearchResult';
import PaperUpload from './pages/PaperUpload';
import MetadataEdit from './pages/MetadataEdit';

// Layout
import Header from './components/layout/Header';

function App() {
  return (
    <AppProvider>
      <SearchProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main className="container mx-auto px-4 py-6">
              <Routes>
                {/* ダッシュボード（起動時画面） */}
                <Route path="/" element={<Dashboard />} />
                
                {/* 論文一覧 */}
                <Route path="/papers" element={<PaperList />} />
                
                {/* 論文詳細 */}
                <Route path="/papers/:id" element={<PaperDetail />} />
                
                {/* 検索結果 */}
                <Route path="/search" element={<SearchResult />} />
                
                {/* 論文登録 */}
                <Route path="/upload" element={<PaperUpload />} />
                
                {/* メタデータ編集 */}
                <Route path="/papers/:id/edit" element={<MetadataEdit />} />
                
                {/* 404 */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </SearchProvider>
    </AppProvider>
  );
}

export default App;