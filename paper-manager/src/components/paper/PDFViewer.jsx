import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../common/Button';

// PDF.jsはCDNから読み込む想定
// public/index.htmlに以下を追加する必要がある:
// <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>

function PDFViewer({ paperId, pdfPath, initialPage = 1, onPageChange }) {
  const [pdf, setPdf] = useState(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [numPages, setNumPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);

  useEffect(() => {
    loadPDF();
  }, [pdfPath]);

  useEffect(() => {
    if (pdf && currentPage) {
      renderPage(currentPage);
    }
  }, [pdf, currentPage, scale]);

  const loadPDF = async () => {
    try {
      setLoading(true);
      setError(null);

      // PDF.jsがロードされているか確認
      if (typeof window.pdfjsLib === 'undefined') {
        throw new Error('PDF.js is not loaded');
      }

      // workerの設定
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      // PDFファイルパスを取得
      const filePath = pdfPath || await window.electronAPI.files.getPDFPath(paperId);
      
      if (!filePath) {
        throw new Error('PDF file not found');
      }

      // ファイルをArrayBufferとして読み込み
      // ElectronのfsモジュールでPDFを読み込む必要があるため、
      // IPCを通じてバイナリデータを取得
      const pdfData = await window.electronAPI.files.readPDFAsBuffer(filePath);

      // PDFドキュメントをロード
      const loadingTask = window.pdfjsLib.getDocument({ data: pdfData });
      const pdfDoc = await loadingTask.promise;

      setPdf(pdfDoc);
      setNumPages(pdfDoc.numPages);
      setCurrentPage(initialPage);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load PDF:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const renderPage = async (pageNumber) => {
    if (!pdf || !canvasRef.current) return;

    try {
      // 既存のレンダリングタスクをキャンセル
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      renderTaskRef.current = page.render(renderContext);
      await renderTaskRef.current.promise;
      renderTaskRef.current = null;

      // ページ変更を通知
      if (onPageChange) {
        onPageChange(pageNumber);
      }
    } catch (err) {
      if (err.name === 'RenderingCancelledException') {
        // キャンセルは正常な動作
        return;
      }
      console.error('Failed to render page:', err);
    }
  };

  const goToPage = (pageNum) => {
    if (pageNum >= 1 && pageNum <= numPages) {
      setCurrentPage(pageNum);
    }
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setScale(1.5);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">PDFを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            PDFの読み込みに失敗しました
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadPDF}>再試行</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* ツールバー */}
      <div className="bg-gray-100 border-b border-gray-300 p-3 flex items-center justify-between rounded-t-lg">
        {/* ページナビゲーション */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            ←
          </Button>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={currentPage}
              onChange={(e) => goToPage(parseInt(e.target.value))}
              className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
              min={1}
              max={numPages}
            />
            <span className="text-sm text-gray-600">/ {numPages}</span>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= numPages}
          >
            →
          </Button>
        </div>

        {/* ズームコントロール */}
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={handleZoomOut}>
            −
          </Button>
          <span className="text-sm text-gray-600 min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button size="sm" variant="secondary" onClick={handleZoomIn}>
            +
          </Button>
          <Button size="sm" variant="secondary" onClick={handleResetZoom}>
            リセット
          </Button>
        </div>
      </div>

      {/* PDFキャンバス */}
      <div className="flex-1 overflow-auto bg-gray-800 rounded-b-lg">
        <div className="flex justify-center p-4">
          <canvas
            ref={canvasRef}
            className="shadow-lg bg-white"
          />
        </div>
      </div>
    </div>
  );
}

export default PDFViewer;