import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../common/Button';

function TXTViewer({ paperId, txtPath, initialLine = 1, onLineChange }) {
  const [content, setContent] = useState('');
  const [lines, setLines] = useState([]);
  const [currentLine, setCurrentLine] = useState(initialLine);
  const [fontSize, setFontSize] = useState(14);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedLines, setHighlightedLines] = useState(new Set());
  const contentRef = useRef(null);

  useEffect(() => {
    loadTXT();
  }, [txtPath]);

  useEffect(() => {
    if (currentLine && contentRef.current) {
      scrollToLine(currentLine);
      if (onLineChange) {
        onLineChange(currentLine);
      }
    }
  }, [currentLine]);

  const loadTXT = async () => {
    try {
      setLoading(true);
      setError(null);

      // TXTファイルパスを取得
      const filePath = txtPath || await window.electronAPI.files.getFilePath(paperId);
      
      if (!filePath) {
        throw new Error('Text file not found');
      }

      // ファイル内容を読み込み（IPCを通じて）
      const textContent = await window.electronAPI.files.readTextFile(filePath);
      
      setContent(textContent);
      const textLines = textContent.split('\n');
      setLines(textLines);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load TXT:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const scrollToLine = (lineNumber) => {
    if (!contentRef.current) return;
    
    const lineElement = contentRef.current.querySelector(`[data-line="${lineNumber}"]`);
    if (lineElement) {
      lineElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const goToLine = (lineNum) => {
    if (lineNum >= 1 && lineNum <= lines.length) {
      setCurrentLine(lineNum);
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setHighlightedLines(new Set());
      return;
    }

    const matches = new Set();
    const searchLower = searchTerm.toLowerCase();
    
    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(searchLower)) {
        matches.add(index + 1);
      }
    });

    setHighlightedLines(matches);
    
    // 最初のマッチにジャンプ
    if (matches.size > 0) {
      const firstMatch = Math.min(...matches);
      goToLine(firstMatch);
    }
  };

  const handleFontSizeChange = (delta) => {
    setFontSize(prev => Math.max(10, Math.min(prev + delta, 24)));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">テキストファイルを読み込んでいます...</p>
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
            テキストファイルの読み込みに失敗しました
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadTXT}>再試行</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* ツールバー */}
      <div className="bg-gray-100 border-b border-gray-300 p-3 flex items-center justify-between rounded-t-lg">
        {/* 行ナビゲーション */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => goToLine(currentLine - 10)}
            disabled={currentLine <= 1}
          >
            ↑↑
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => goToLine(currentLine - 1)}
            disabled={currentLine <= 1}
          >
            ↑
          </Button>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={currentLine}
              onChange={(e) => goToLine(parseInt(e.target.value))}
              className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-sm"
              min={1}
              max={lines.length}
            />
            <span className="text-sm text-gray-600">/ {lines.length} 行</span>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => goToLine(currentLine + 1)}
            disabled={currentLine >= lines.length}
          >
            ↓
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => goToLine(currentLine + 10)}
            disabled={currentLine >= lines.length}
          >
            ↓↓
          </Button>
        </div>

        {/* 検索 */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="検索..."
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          />
          <Button size="sm" variant="secondary" onClick={handleSearch}>
            🔍
          </Button>
          {highlightedLines.size > 0 && (
            <span className="text-sm text-gray-600">
              {highlightedLines.size}件
            </span>
          )}
        </div>

        {/* フォントサイズ */}
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => handleFontSizeChange(-2)}>
            A-
          </Button>
          <span className="text-sm text-gray-600 min-w-[40px] text-center">
            {fontSize}px
          </span>
          <Button size="sm" variant="secondary" onClick={() => handleFontSizeChange(2)}>
            A+
          </Button>
        </div>
      </div>

      {/* テキストコンテンツ */}
      <div
        ref={contentRef}
        className="flex-1 overflow-auto bg-white rounded-b-lg p-6"
        style={{ fontSize: `${fontSize}px` }}
      >
        <div className="font-mono whitespace-pre-wrap">
          {lines.map((line, index) => {
            const lineNumber = index + 1;
            const isHighlighted = highlightedLines.has(lineNumber);
            const isCurrent = lineNumber === currentLine;
            
            return (
              <div
                key={lineNumber}
                data-line={lineNumber}
                className={`flex hover:bg-gray-50 ${
                  isHighlighted ? 'bg-yellow-100' : ''
                } ${isCurrent ? 'bg-blue-50' : ''}`}
              >
                <div className="w-16 flex-shrink-0 text-right pr-4 text-gray-400 select-none border-r border-gray-200">
                  {lineNumber}
                </div>
                <div className="flex-1 pl-4 py-1">
                  {isHighlighted && searchTerm
                    ? highlightText(line, searchTerm)
                    : line || '\u00A0'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// テキストをハイライト
function highlightText(text, searchTerm) {
  if (!searchTerm) return text;
  
  const parts = text.split(new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi'));
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === searchTerm.toLowerCase() ? (
          <mark key={i} className="bg-yellow-300 font-semibold">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default TXTViewer;