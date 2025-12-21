import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/search/SearchBar';
import PaperCard from '../components/paper/PaperCard';
import Loading from '../components/common/Loading';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    recentPapers: [],
    recentlyViewed: [],
    unorganized: [],
    tags: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await window.electronAPI.dashboard.getData();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          📊 ダッシュボード
        </h1>
        <SearchBar />
      </div>

      {/* メインコンテンツ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 最近追加した論文 */}
        <Section
          title="📌 最近追加した論文"
          viewAllLink="/papers?sort=newest"
        >
          {dashboardData.recentPapers.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recentPapers.map(paper => (
                <PaperCard key={paper.id} paper={paper} compact />
              ))}
            </div>
          ) : (
            <EmptyState message="まだ論文が登録されていません" />
          )}
        </Section>

        {/* 最近参照した論文 */}
        <Section
          title="📌 最近参照した論文"
          viewAllLink="/papers?sort=viewed"
        >
          {dashboardData.recentlyViewed.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recentlyViewed.map(paper => (
                <PaperCard key={paper.id} paper={paper} compact />
              ))}
            </div>
          ) : (
            <EmptyState message="まだ論文を開いていません" />
          )}
        </Section>

        {/* 未整理（メモ0件） */}
        <Section
          title="📌 未整理（メモ0件）"
          viewAllLink="/papers?filter=unorganized"
        >
          {dashboardData.unorganized.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.unorganized.map(paper => (
                <PaperCard key={paper.id} paper={paper} compact />
              ))}
            </div>
          ) : (
            <EmptyState message="未整理の論文はありません" />
          )}
        </Section>

        {/* タグ別 */}
        <Section title="📌 タグ別" viewAllLink="/papers">
          {dashboardData.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {dashboardData.tags.map(tag => (
                <Link
                  key={tag.tag_name}
                  to={`/papers?tag=${encodeURIComponent(tag.tag_name)}`}
                  className="inline-flex items-center px-3 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <span className="font-medium">#{tag.tag_name}</span>
                  <span className="ml-2 text-sm text-blue-600">
                    ({tag.paper_count})
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState message="タグがありません" />
          )}
        </Section>
      </div>

      {/* クイックアクション */}
      <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          クイックアクション
        </h2>
        <div className="flex gap-4">
          <Link
            to="/upload"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            📄 論文を追加
          </Link>
          <Link
            to="/papers"
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            📚 すべての論文を見る
          </Link>
        </div>
      </div>
    </div>
  );
}

// セクションコンポーネント
function Section({ title, viewAllLink, children }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            もっと見る →
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

// 空状態コンポーネント
function EmptyState({ message }) {
  return (
    <div className="text-center py-8 text-gray-500">
      <p>{message}</p>
    </div>
  );
}

export default Dashboard;