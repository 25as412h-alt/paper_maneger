import React, { useEffect, useState } from 'react';

function ProcessingStatus({ paperId }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
    
    // 処理中の場合は定期的に状態を確認
    const interval = setInterval(() => {
      loadStatus();
    }, 5000); // 5秒ごと

    return () => clearInterval(interval);
  }, [paperId]);

  const loadStatus = async () => {
    try {
      const statusData = await window.electronAPI.pdf.getProcessingStatus(paperId);
      setStatus(statusData);
      setLoading(false);

      // 処理が完了したらポーリング停止
      if (statusData.status === 'completed' || statusData.status === 'failed') {
        // 次回のポーリングでクリアされる
      }
    } catch (error) {
      console.error('Failed to load processing status:', error);
      setLoading(false);
    }
  };

  if (loading || !status) return null;

  // 処理が完了している場合は何も表示しない
  if (status.isProcessed && status.status === 'completed') {
    return null;
  }

  return (
    <div className={`rounded-lg border p-4 ${getStatusColor(status.status)}`}>
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {getStatusIcon(status.status)}
        </div>
        <div className="flex-1">
          <div className="font-medium">
            {getStatusLabel(status.status)}
          </div>
          <div className="text-sm mt-1">
            {getStatusMessage(status)}
          </div>
        </div>
        {status.status === 'processing' && (
          <div className="flex-shrink-0">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current"></div>
          </div>
        )}
      </div>
    </div>
  );
}

function getStatusColor(status) {
  switch (status) {
    case 'pending':
      return 'bg-gray-50 border-gray-200 text-gray-700';
    case 'processing':
      return 'bg-blue-50 border-blue-200 text-blue-700';
    case 'completed':
      return 'bg-green-50 border-green-200 text-green-700';
    case 'failed':
      return 'bg-red-50 border-red-200 text-red-700';
    default:
      return 'bg-gray-50 border-gray-200 text-gray-700';
  }
}

function getStatusIcon(status) {
  switch (status) {
    case 'pending':
      return <span className="text-2xl">⏳</span>;
    case 'processing':
      return <span className="text-2xl">⚙️</span>;
    case 'completed':
      return <span className="text-2xl">✅</span>;
    case 'failed':
      return <span className="text-2xl">❌</span>;
    default:
      return <span className="text-2xl">❓</span>;
  }
}

function getStatusLabel(status) {
  switch (status) {
    case 'pending':
      return 'PDF解析待ち';
    case 'processing':
      return 'PDF解析中...';
    case 'completed':
      return 'PDF解析完了';
    case 'failed':
      return 'PDF解析失敗';
    default:
      return '不明な状態';
  }
}

function getStatusMessage(status) {
  switch (status.status) {
    case 'pending':
      return 'PDFの解析は自動的に開始されます';
    case 'processing':
      return 'テキスト抽出と章・図表の検出を実行しています。完了まで数分かかる場合があります。';
    case 'completed':
      return `${status.pageCount}ページの解析が完了しました`;
    case 'failed':
      return 'PDF解析中にエラーが発生しました。PDF形式が対応していない可能性があります。';
    default:
      return '';
  }
}

export default ProcessingStatus;