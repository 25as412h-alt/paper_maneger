// ============================================
// src/index.js
// ============================================
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ============================================
// src/styles/index.css
// ============================================

@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
}

/* カスタムスクロールバー */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* マークダウンスタイル */
.markdown-content h1 {
  @apply text-2xl font-bold mt-6 mb-4;
}

.markdown-content h2 {
  @apply text-xl font-bold mt-5 mb-3;
}

.markdown-content h3 {
  @apply text-lg font-bold mt-4 mb-2;
}

.markdown-content p {
  @apply mb-4;
}

.markdown-content ul, .markdown-content ol {
  @apply ml-6 mb-4;
}

.markdown-content code {
  @apply bg-gray-100 px-1 py-0.5 rounded text-sm;
}

.markdown-content pre {
  @apply bg-gray-900 text-white p-4 rounded-lg overflow-x-auto mb-4;
}

.markdown-content pre code {
  @apply bg-transparent p-0;
}

.markdown-content blockquote {
  @apply border-l-4 border-gray-300 pl-4 italic my-4;
}

/* ハイライト表示 */
mark {
  background-color: #fef08a;
  padding: 2px 4px;
  border-radius: 2px;
}

/* アニメーション */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.3s ease-out;
}
