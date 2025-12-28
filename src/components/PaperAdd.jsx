// src/components/PaperAdd.jsx - 論文登録画面
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function PaperAdd() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    pdfPath: '',
    pdfFileName: '',
    title: '',
    authors: '',
    year: '',
    tags: '',
    content: ''
  });

  const handleFileSelect = async () => {
    console.log('[PAPER_ADD] ファイル選択ダイアログ表示');
    
    try {
      const result = await window.electronAPI.pdf.selectFile();
      
      if (result.success) {
        console.log('[PAPER_ADD] PDFファイル選択:', result.fileName);
        
        setFormData({
          ...formData,
          pdfPath: result.filePath,
          pdfFileName: result.fileName
        });
        
        toast.success('PDFファイルを選択しました');
      } else if (!result.canceled) {
        toast.error('ファイル選択に失敗しました');
      }
    } catch (error) {
      console.error('[PAPER_ADD] ファイル選択エラー:', error);
      toast.error('ファイル選択に失敗しました');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('[PAPER_ADD] 論文登録開始');
    
    // バリデーション
    if (!formData.pdfPath) {
      toast.error('PDFファイルを選択してください');
      return;
    }
    if (!formData.title.trim()) {
      toast.error('タイトルを入力してください');
      return;
    }
    if (!formData.content.trim()) {
      toast.error('本文テキストを入力してください');
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading('論文を登録中...');

    try {
      // タグを配列に変換
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const paperData = {
        pdfPath: formData.pdfPath,
        title: formData.title,
        authors: formData.authors,
        year: formData.year ? parseInt(formData.year) : null,
        tags: tags,
        content: formData.content
      };

      console.log('[PAPER_ADD] 登録データ:', paperData);

      const result = await window.electronAPI.paper.add(paperData);

      if (result.success) {
        console.log('[PAPER_ADD] 登録成功: ID=', result.paperId);
        toast.dismiss(loadingToast);
        toast.success('論文を登録しました');
        navigate(`/papers/${result.paperId}`);
      } else {
        console.error('[PAPER_ADD] 登録失敗:', result.error);
        toast.dismiss(loadingToast);
        toast.error(`登録に失敗しました: ${result.error}`);
      }
    } catch (error) {
      console.error('[PAPER_ADD] 登録エラー:', error);
      toast.dismiss(loadingToast);
      toast.error('登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-8">
        <h2 className="text-2xl font-bold text-gray-100 mb-6 flex items-center gap-2">
          📄 論文登録
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* PDFファイル選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              PDFファイル <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleFileSelect}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition border border-gray-600"
              >
                ファイルを選択
              </button>
              {formData.pdfFileName && (
                <span className="text-gray-400 flex items-center gap-2">
                  📄 {formData.pdfFileName}
                </span>
              )}
            </div>
          </div>

          {/* タイトル */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="例: Attention Is All You Need"
              className="w-full px-4 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* 著者 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              著者
            </label>
            <input
              type="text"
              value={formData.authors}
              onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
              placeholder="例: Vaswani et al."
              className="w-full px-4 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* 発行年 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              発行年
            </label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              placeholder="例: 2017"
              min="1900"
              max="2100"
              className="w-full px-4 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* タグ */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              タグ（カンマ区切り）
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="例: NLP, Transformer, Attention"
              className="w-full px-4 py-2 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <p className="text-sm text-gray-500 mt-1">
              カンマで区切って複数のタグを入力できます
            </p>
          </div>

          {/* 本文テキスト */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              本文テキスト <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="論文の本文をコピー＆ペーストしてください&#10;&#10;検索機能で使用されます"
              rows={15}
              className="w-full px-4 py-3 bg-gray-700 text-gray-100 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono text-sm"
            />
            <p className="text-sm text-gray-500 mt-1">
              PDFから本文をコピーして貼り付けてください
            </p>
          </div>

          {/* ボタン */}
          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition"
            >
              {loading ? '登録中...' : '登録'}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={loading}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-gray-300 rounded-lg font-medium transition"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PaperAdd;