import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import PaperCard from '../components/paper/PaperCard';
import { Loading, Button, Dropdown } from '../components/common/Button';
import { useApp } from '../contexts/AppContext';

function PaperList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { tags } = useApp();
  
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [filterTag, setFilterTag] = useState(searchParams.get('tag') || '');
  const [filterUnorganized, setFilterUnorganized] = useState(
    searchParams.get('filter') === 'unorganized'
  );

  useEffect(() => {
    loadPapers();
  }, [sortBy, filterTag, filterUnorganized]);

  const loadPapers = async () => {
    try {
      setLoading(true);
      
      const filters = {
        sortBy,
        tag: filterTag || undefined
      };

      let result;
      if (filterUnorganized) {
        result = await window.electronAPI.papers.getUnorganized(100);
      } else {
        result = await window.electronAPI.papers.getAll(filters);
      }

      setPapers(result);
    } catch (error) {
      console.error('Failed to load papers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    searchParams.set('sort', value);
    setSearchParams(searchParams);
  };

  const handleTagFilter = (tag) => {
    setFilterTag(tag);
    setFilterUnorganized(false);
    if (tag) {
      searchParams.set('tag', tag);
    } else {
      searchParams.delete('tag');
    }
    searchParams.delete('filter');
    setSearchParams(searchParams);
  };

  const handleUnorganizedFilter = () => {
    setFilterUnorganized(!filterUnorganized);
    setFilterTag('');
    searchParams.delete('tag');
    if (!filterUnorganized) {
      searchParams.set('filter', 'unorganized');
    } else {
      searchParams.delete('filter');
    }
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setFilterTag('');
    setFilterUnorganized(false);
    setSearchParams({});
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* ヘッダー */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-900">
            📚 論文一覧
          </h1>
          <Link to="/upload">
            <Button>+ 論文を追加</Button>
          </Link>
        </div>

        {/* フィルタ・ソート */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* ソート */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                並び順
              </label>
              <Dropdown
                value={sortBy}
                onChange={handleSortChange}
                options={[
                  { value: 'newest', label: '新しい順' },
                  { value: 'oldest', label: '古い順' },
                  { value: 'title', label: 'タイトル順' },
                  { value: 'viewed', label: '最近参照した順' }
                ]}
              />
            </div>

            {/* タグフィルタ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                タグで絞り込み
              </label>
              <Dropdown
                value={filterTag}
                onChange={handleTagFilter}
                placeholder="すべて"
                options={tags.map(tag => ({
                  value: tag.tag_name,
                  label: `${tag.tag_name} (${tag.paper_count})`
                }))}
              />
            </div>

            {/* その他フィルタ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                その他
              </label>
              <button
                onClick={handleUnorganizedFilter}
                className={`w-full px-4 py-2 rounded-lg border font-medium transition-colors ${
                  filterUnorganized
                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                📝 未整理のみ
              </button>
            </div>
          </div>

          {/* アクティブフィルタ表示 */}
          {(filterTag || filterUnorganized) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">フィルタ中:</span>
                {filterTag && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    #{filterTag}
                  </span>
                )}
                {filterUnorganized && (
                  <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                    未整理
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="ml-auto text-sm text-gray-600 hover:text-gray-900"
                >
                  クリア
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 論文数 */}
      <div className="mb-4 text-sm text-gray-600">
        {papers.length}件の論文
      </div>

      {/* 論文リスト */}
      {papers.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {papers.map(paper => (
            <PaperCard key={paper.id} paper={paper} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <span className="text-3xl">📄</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            論文がありません
          </h3>
          <p className="text-gray-600 mb-6">
            {filterTag || filterUnorganized
              ? '条件に一致する論文が見つかりませんでした'
              : 'まだ論文が登録されていません'}
          </p>
          {!filterTag && !filterUnorganized && (
            <Link to="/upload">
              <Button>論文を追加</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default PaperList;