import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from '../components/SearchBar';

function Dashboard() {
  const [recentPapers, setRecentPapers] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState('checking');
  const navigate = useNavigate();
  
  useEffect(() => {
    // APIチェック
    console.log('[Dashboard] window.api:', window.api);
    if (!window.api || !window.api.papers) {
      setApiStatus('error');
      console.error('[Dashboard] window.api が利用できません');
      return;
    }
    setApiStatus('ok');
    
    loadDashboardData();
  }, []);
  
  const loadDashboardData = async () => {
    try {
      console.log('[Dashboard] データ読み込み開始');
      
      // 最近の論文取得
      const papers = await window.api.papers.findRecent(5);
      console.log('[Dashboard] 論文データ:', papers);
      setRecentPapers(papers);
      
      // タグ一覧取得
      const allTags = await window.api.tags.findAll();
      console.log('[Dashboard] タグデータ:', allTags);
      setTags(allTags);
      
      setLoading(false);
      console.log('[Dashboard] データ読み込み完了');
    } catch (error) {
      console.error('[Dashboard] データ読み込みエラー:', error);
      setLoading(false);
    }
  };
  
  const handleSearch = (query, scope) => {
    navigate(`/search?q=${encodeURIComponent(query)}&scope=${scope}`);
  };
  
  const handleTagClick = (tagName) => {
    navigate(`/papers?tag=${encodeURIComponent(tagName)}`);
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '今日';
    if (diffDays === 1) return '昨日';
    if (diffDays < 7) return `${diffDays}日前`;
    return date.toLocaleDateString('ja-JP');
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-gray-500 mb-4">読み込み中...</div>
        {apiStatus === 'error' && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">⚠️ API接続エラー</p>
            <p className="text-sm">window.api が利用できません。</p>
            <p className="text-sm">開発者ツールのConsoleタブを確認してください。</p>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">📊 ダッシュボード</h1>
        <p className="text-gray-600">論文を検索・管理・メモを作成</p>
      </div>
      
      {/* 検索バー */}
      <div className="mb-8">
        <SearchBar onSearch={handleSearch} />
      </div>
      
      {/* 最近追加した論文 */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">📌 最近追加した論文</h2>
          <Link to="/papers" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            一覧へ →
          </Link>
        </div>
        
        {recentPapers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-2">まだ論文が登録されていません</p>
            <Link to="/papers/new" className="text-blue-600 hover:text-blue-700 font-medium">
              最初の論文を登録
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentPapers.map(paper => (
              <Link
                key={paper.id}
                to={`/papers/${paper.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800 mb-1">{paper.title}</h3>
                    <p className="text-sm text-gray-600">
                      {paper.authors} {paper.year && `(${paper.year})`}
                    </p>
                    {paper.tags && paper.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {paper.tags.map((tag, idx) => (
                          <span 
                            key={idx}
                            className="inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 ml-4">
                    {formatDate(paper.created_at)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      
      {/* タグ一覧 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">🏷️ タグ</h2>
        
        {tags.length === 0 ? (
          <p className="text-gray-500 text-center py-4">タグがありません</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, idx) => (
              <button
                key={idx}
                onClick={() => handleTagClick(tag.tag_name)}
                className="px-3 py-2 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-lg text-sm font-medium transition-colors"
              >
                #{tag.tag_name} ({tag.count})
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* クイックアクション */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/papers/new"
          className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg text-center transition-colors"
        >
          <div className="text-3xl mb-2">📄</div>
          <div className="font-semibold">新規論文登録</div>
        </Link>
        
        <Link
          to="/papers"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-6 rounded-lg text-center transition-colors"
        >
          <div className="text-3xl mb-2">📚</div>
          <div className="font-semibold">論文一覧</div>
        </Link>
        
        <button
          onClick={async () => {
            const result = await window.api.backup.export();
            if (result.success) {
              alert(`バックアップを作成しました:\n${result.fileName}`);
            } else {
              alert('バックアップに失敗しました');
            }
          }}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-6 rounded-lg text-center transition-colors"
        >
          <div className="text-3xl mb-2">💾</div>
          <div className="font-semibold">バックアップ</div>
        </button>
      </div>
    </div>
  );
}

export default Dashboard;