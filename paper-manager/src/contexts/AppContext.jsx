import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // タグ一覧の読み込み
  const loadTags = async () => {
    try {
      const allTags = await window.electronAPI.tags.getAll();
      setTags(allTags);
    } catch (err) {
      console.error('Failed to load tags:', err);
      setError(err.message);
    }
  };

  // 初期化
  useEffect(() => {
    loadTags();
  }, []);

  // エラー表示用のトースト（簡易版）
  const showError = (message) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const value = {
    tags,
    loading,
    error,
    loadTags,
    showError,
    setLoading
  };

  return (
    <AppContext.Provider value={value}>
      {children}
      
      {/* エラー表示 */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}