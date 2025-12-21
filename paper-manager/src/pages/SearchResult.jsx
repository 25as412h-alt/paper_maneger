import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Loading } from '../components/common/Button';
import SearchBar from '../components/search/SearchBar';

function SearchResult() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const scope = searchParams.get('scope') || 'all';

  const [results, setResults] = useState(null);
  const [facets, setFacets] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(null);

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query, scope]);

  const performSearch = async () => {
    try {
      setLoading(true);

      // 検索実行
      const searchResults = await window.electronAPI.search.searchByScope(query, scope);
      setResults(searchResults);

      // ファセット情報取得（全体検索の場合のみ）
      if (scope === 'all') {
        const facetData = await window.electronAPI.search.getFacets(query);
        setFacets(facetData);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredResults = () => {
    if (!results || scope !== 'all') return results;
    if (!activeFilter) return results;

    // ファセットフィルタ適用
    const filtered = {};
    if (activeFilter === 'papers') filtered.papers = results.papers;
    if (activeFilter === 'memos') filtered.memos = results.memos;
    if (activeFilter === 'chapters') filtered.chapters = results.chapters;
    if (activeFilter === 'figures') filtered.figures = results.figures;

    return filtered;
  };

  if (loading) {
    return <Loading message="検索中..." />;
  }

  if (!query) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          検索語を入力してください
        </h2>
        <SearchBar />
      </div>
    );
  }

  const filteredResults = getFilteredResults();
  const totalCount = results?.total || 0;

  return (
    <div className="max-w-7xl mx-auto">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🔍 検索結果
        </h1>
        <SearchBar />
      </div>

      {/* 検索情報 */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-gray-600">検索語:</span>
            <span className="ml-2 font-semibold text-gray-900">"{query}"</span>
            <span className="ml-4 text-gray-600">スコープ:</span>
            <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {getScopeLabel(scope)}
            </span>
          </div>
          <div className="text-gray-600">
            <span className="font-semibold text-gray-900">{totalCount}</span>件
          </div>
        </div>
      </div>

      {/* ファセットフィルタ（全体検索時） */}
      {scope === 'all' && facets && (
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            📊 種別で絞り込み
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <FacetButton
              icon="📄"
              label="論文タイトル"
              count={facets.papers}
              active={activeFilter === 'papers'}
              onClick={() => setActiveFilter(activeFilter === 'papers' ? null : 'papers')}
            />
            <FacetButton
              icon="📝"
              label="メモ"
              count={facets.memos}
              active={activeFilter === 'memos'}
              onClick={() => setActiveFilter(activeFilter === 'memos' ? null : 'memos')}
            />
            <FacetButton
              icon="📃"
              label="本文"
              count={facets.chapters}
              active={activeFilter === 'chapters'}
              onClick={() => setActiveFilter(activeFilter === 'chapters' ? null : 'chapters')}
            />
            <FacetButton
              icon="🖼"
              label="図表"
              count={facets.figures}
              active={activeFilter === 'figures'}
              onClick={() => setActiveFilter(activeFilter === 'figures' ? null : 'figures')}
            />
          </div>
        </div>
      )}

      {/* 検索結果 */}
      {totalCount > 0 ? (
        <div className="space-y-6">
          {/* 論文結果 */}
          {filteredResults.papers?.length > 0 && (
            <ResultSection title="📄 論文タイトル" count={filteredResults.papers.length}>
              {filteredResults.papers.map(paper => (
                <PaperResult key={paper.id} paper={paper} />
              ))}
            </ResultSection>
          )}

          {/* メモ結果 */}
          {filteredResults.memos?.length > 0 && (
            <ResultSection title="📝 メモ" count={filteredResults.memos.length}>
              {filteredResults.memos.map(memo => (
                <MemoResult key={memo.id} memo={memo} />
              ))}
            </ResultSection>
          )}

          {/* 章結果 */}
          {filteredResults.chapters?.length > 0 && (
            <ResultSection title="📃 本文" count={filteredResults.chapters.length}>
              {filteredResults.chapters.map(chapter => (
                <ChapterResult key={chapter.id} chapter={chapter} />
              ))}
            </ResultSection>
          )}

          {/* 図表結果 */}
          {filteredResults.figures?.length > 0 && (
            <ResultSection title="🖼 図表" count={filteredResults.figures.length}>
              {filteredResults.figures.map(figure => (
                <FigureResult key={figure.id} figure={figure} />
              ))}
            </ResultSection>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            検索結果がありません
          </h3>
          <p className="text-gray-600">
            別の検索語やスコープをお試しください
          </p>
        </div>
      )}
    </div>
  );
}

// ファセットボタン
function FacetButton({ icon, label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-lg border-2 transition-all ${
        active
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
    >
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-sm font-medium text-gray-900">{label}</div>
      <div className={`text-lg font-bold mt-1 ${active ? 'text-blue-600' : 'text-gray-600'}`}>
        {count}件
      </div>
    </button>
  );
}

// 結果セクション
function ResultSection({ title, count, children }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <span className="text-sm text-gray-600">{count}件</span>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

// 論文結果
function PaperResult({ paper }) {
  return (
    <Link
      to={`/papers/${paper.id}`}
      className="block p-4 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <h3 className="font-semibold text-gray-900 mb-2">
        <span dangerouslySetInnerHTML={{ __html: paper.snippet || paper.title }} />
      </h3>
      <div className="text-sm text-gray-600">
        {paper.authors} {paper.year && `(${paper.year})`}
      </div>
    </Link>
  );
}

// メモ結果
function MemoResult({ memo }) {
  return (
    <Link
      to={`/papers/${memo.paper_id}`}
      className="block p-4 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <div className="text-sm text-gray-600 mb-2">
        📄 {memo.paper_title}
        {memo.page_number && ` • p.${memo.page_number}`}
      </div>
      <p
        className="text-gray-900"
        dangerouslySetInnerHTML={{ __html: memo.snippet }}
      />
    </Link>
  );
}

// 章結果
function ChapterResult({ chapter }) {
  return (
    <Link
      to={`/papers/${chapter.paper_id}`}
      className="block p-4 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <div className="text-sm text-gray-600 mb-2">
        📄 {chapter.paper_title} • {chapter.title}
        {chapter.page_start && ` • p.${chapter.page_start}`}
      </div>
      <p
        className="text-gray-900"
        dangerouslySetInnerHTML={{ __html: chapter.snippet }}
      />
    </Link>
  );
}

// 図表結果
function FigureResult({ figure }) {
  return (
    <Link
      to={`/papers/${figure.paper_id}`}
      className="block p-4 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <div className="text-sm text-gray-600 mb-2">
        📄 {figure.paper_title} • {figure.figure_number}
        {figure.page_number && ` • p.${figure.page_number}`}
      </div>
      <p
        className="text-gray-900"
        dangerouslySetInnerHTML={{ __html: figure.snippet }}
      />
    </Link>
  );
}

// スコープラベル取得
function getScopeLabel(scope) {
  const labels = {
    all: '全体',
    title_author: 'タイトル / 著者',
    memo: 'メモ',
    content: '本文',
    figure: '図表'
  };
  return labels[scope] || scope;
}

export default SearchResult;