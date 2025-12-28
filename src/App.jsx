// src/App.jsx - メインReactアプリケーション
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './components/Dashboard';
import PaperList from './components/PaperList';
import PaperAdd from './components/PaperAdd';
import PaperDetail from './components/PaperDetail';
import SearchResults from './components/SearchResults';
import Header from './components/Header';

function App() {
  console.log('[APP] アプリケーション初期化');

  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Header />
        
        <main className="container mx-auto px-4 py-6 max-w-7xl">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/papers" element={<PaperList />} />
            <Route path="/papers/add" element={<PaperAdd />} />
            <Route path="/papers/:id" element={<PaperDetail />} />
            <Route path="/search" element={<SearchResults />} />
          </Routes>
        </main>

        {/* トースト通知 */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1f2937',
              color: '#f3f4f6',
              border: '1px solid #374151'
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: '#f3f4f6'
              }
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#f3f4f6'
              }
            }
          }}
        />
      </div>
    </Router>
  );
}

export default App;