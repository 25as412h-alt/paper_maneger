import React, { createContext, useContext, useState } from 'react';

const SearchContext = createContext();

export function SearchProvider({ children }) {
  const [searchResults, setSearchResults] = useState(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const [currentScope, setCurrentScope] = useState('all');
  const [isSearching, setIsSearching] = useState(false);

  // 検索実行
  const executeSearch = async (query, scope = 'all') => {
    try {
      setIsSearching(true);
      setCurrentQuery(query);
      setCurrentScope(scope);

      const results = await window.electronAPI.search.searchByScope(query, scope);
      setSearchResults(results);

      // 検索履歴に保存
      await window.electronAPI.search.saveHistory(query, scope, results.total || 0);

      return results;
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    } finally {
      setIsSearching(false);
    }
  };

  // ファセット情報取得
  const getFacets = async (query) => {
    try {
      return await window.electronAPI.search.getFacets(query);
    } catch (error) {
      console.error('Failed to get facets:', error);
      throw error;
    }
  };

  // 検索結果のクリア
  const clearSearch = () => {
    setSearchResults(null);
    setCurrentQuery('');
    setCurrentScope('all');
  };

  const value = {
    searchResults,
    currentQuery,
    currentScope,
    isSearching,
    executeSearch,
    getFacets,
    clearSearch
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return context;
}