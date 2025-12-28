// src/components/Dashboard.jsx - ダッシュボード画面
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function Dashboard() {
  const [recentPapers, setRecentPapers] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[DASHBOARD] ダッシュボードデータ取得開始');
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const result = await window.electronAPI.dashboard.getData();
      
      if (result.success) {
        console.log('[DASHBOARD] データ取得成功');
        setRecentPapers(result.data.recentPapers);
        setTags(result.data.tags);
      } else {
        console.error('[DASHBOARD] データ取得失敗:', result.error);
        toast.error('データの取得に失敗しました');
      }
    } catch (error) {
      console.error('[DASHBOARD] データ取得エラー:', error);
      toast.error('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '今日';
    if (diffDays === 1) return '昨日';
    if (diffDays < 7) return `${diffDays}日前`;
    
    return date.toLocaleDateString('ja-JP', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400 text-xl">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ウェルカムメッセージ */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 shadow-lg">
        <h2 className="text-3xl font-bold text-white mb-2">
          📊 Paper Manager へようこそ
        </h2>
        <p className="text-blue-100">
          論文とメモを横断検索して、研究を加速させましょう
        </p>
      </div>

      {/* 最近追加した論文 */}
      <section className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
            📌 最近追加した論文
          </h3>
          <Link 
            to="/papers" 
            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition"
          >
            すべて表示 →
          </Link>
        </div>

        {recentPapers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">まだ論文が登録されていません</div>
            <Link 
              to="/papers/add"
              className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              最初の論文を登録する
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentPapers.map((paper) => (
              <Link
                key={paper.id}
                to={`/papers/${paper.id}`}
                className="block p-4 bg-gray-700 hover:bg-gray-650 rounded-lg transition border border-gray-600 hover:border-blue-500"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-100 mb-1">
                      📄 {paper.title}
                    </h4>
                    <p className="text-sm text-gray-400">
                      {paper.authors} {paper.year && `(${paper.year})`}
                    </p>
                    {paper.tags && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {paper.tags.split(', ').map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 ml-4">
                    {formatDate(paper.created_at)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* タグ一覧 */}
      <section className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
        <h3 className="text-xl font-semibold text-gray-100 mb-4 flex items-center gap-2">
          🏷️ タグ一覧
        </h3>

        {tags.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            タグが登録されていません
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <Link
                key={tag.tag_name}
                to={`/papers?tag=${encodeURIComponent(tag.tag_name)}`}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium flex items-center gap-2"
              >
                <span>#{tag.tag_name}</span>
                <span className="text-sm bg-blue-700 px-2 py-0.5 rounded">
                  {tag.count}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* クイックアクション */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/papers/add"
          className="p-6 bg-gradient-to-br from-green-600 to-green-700 rounded-xl hover:from-green-700 hover:to-green-800 transition shadow-lg"
        >
          <div className="text-4xl mb-2">➕</div>
          <h4 className="font-semibold text-white mb-1">論文を登録</h4>
          <p className="text-sm text-green-100">新しい論文をデータベースに追加</p>
        </Link>

        <Link
          to="/papers"
          className="p-6 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl hover:from-purple-700 hover:to-purple-800 transition shadow-lg"
        >
          <div className="text-4xl mb-2">📚</div>
          <h4 className="font-semibold text-white mb-1">論文一覧</h4>
          <p className="text-sm text-purple-100">すべての論文を閲覧・管理</p>
        </Link>

        <div className="p-6 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
          <div className="text-4xl mb-2">📊</div>
          <h4 className="font-semibold text-white mb-1">統計情報</h4>
          <div className="space-y-1 text-sm text-blue-100">
            <p>登録論文数: {recentPapers.length > 0 ? '取得中...' : '0'}</p>
            <p>タグ数: {tags.length}</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;