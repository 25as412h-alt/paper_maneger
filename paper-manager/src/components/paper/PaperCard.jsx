import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

function PaperCard({ paper, compact = false }) {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: ja });
    } catch {
      return '';
    }
  };

  if (compact) {
    return (
      <Link
        to={`/papers/${paper.id}`}
        className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {paper.title}
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              {paper.authors} {paper.year && `(${paper.year})`}
            </p>
          </div>
          {paper.memo_count > 0 && (
            <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
              📝 {paper.memo_count}
            </span>
          )}
        </div>
        <div className="text-xs text-gray-400 mt-2">
          {formatDate(paper.created_at)}
        </div>
      </Link>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <Link to={`/papers/${paper.id}`} className="block p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 flex-1">
            {paper.title}
          </h3>
          {paper.memo_count > 0 && (
            <span className="ml-4 px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
              📝 {paper.memo_count}
            </span>
          )}
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <span className="font-medium mr-2">著者:</span>
            <span>{paper.authors || '不明'}</span>
          </div>
          
          {paper.year && (
            <div className="flex items-center">
              <span className="font-medium mr-2">年:</span>
              <span>{paper.year}</span>
            </div>
          )}

          {paper.doi && (
            <div className="flex items-center">
              <span className="font-medium mr-2">DOI:</span>
              <span className="text-blue-600 hover:underline">{paper.doi}</span>
            </div>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
          <span>追加: {formatDate(paper.created_at)}</span>
          {paper.last_viewed_at && (
            <span>参照: {formatDate(paper.last_viewed_at)}</span>
          )}
        </div>

        {/* タグ表示（もしあれば） */}
        {paper.tags && paper.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {paper.tags.map(tag => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </Link>
    </div>
  );
}

export default PaperCard;