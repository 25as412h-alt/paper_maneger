import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

function PaperRegister() {
  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    year: '',
    content: '',
    tags: '',
    pdf_path: ''
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const navigate = useNavigate();
  const { id } = useParams();
  
  // デバッグログ
  useEffect(() => {
    console.log('[PaperRegister] コンポーネントマウント');
    console.log('[PaperRegister] window.api:', window.api);
    console.log('[PaperRegister] window.api.selectPDF:', window.api?.selectPDF);
  }, []);
  
  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      loadPaper(id);
    }
  }, [id]);
  
  const loadPaper = async (paperId) => {
    try {
      console.log('[PaperRegister] 論文読み込み開始:', paperId);
      const paper = await window.api.papers.findById(parseInt(paperId));
      console.log('[PaperRegister] 論文データ:', paper);
      
      if (paper) {
        setFormData({
          title: paper.title || '',
          authors: paper.authors || '',
          year: paper.year || '',
          content: paper.content || '',
          tags: paper.tags ? paper.tags.join(', ') : '',
          pdf_path: paper.pdf_path || ''
        });
        setPdfFile({ originalName: paper.pdf_path.split('_').slice(1).join('_') });
      }
    } catch (error) {
      console.error('[PaperRegister] 論文読み込みエラー:', error);
      toast.error('論文の読み込みに失敗しました');
    }
  };
  
  const handleSelectPDF = async () => {
    console.log('[PaperRegister] PDFファイル選択開始');
    console.log('[PaperRegister] window.api.selectPDF:', window.api?.selectPDF);
    
    try {
      if (!window.api || !window.api.selectPDF) {
        console.error('[PaperRegister] window.api.selectPDF が未定義です');
        toast.error('APIが利用できません。アプリを再起動してください。');
        return;
      }
      
      const result = await window.api.selectPDF();
      console.log('[PaperRegister] PDF選択結果:', result);
      
      if (result) {
        setPdfFile(result);
        setFormData(prev => ({ ...prev, pdf_path: result.path }));
        toast.success('PDFファイルを選択しました');
      }
    } catch (error) {
      console.error('[PaperRegister] PDF選択エラー:', error);
      toast.error('PDFファイルの選択に失敗しました: ' + error.message);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('[PaperRegister] フォーム変更:', name, value);
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[PaperRegister] フォーム送信開始');
    console.log('[PaperRegister] フォームデータ:', formData);
    
    // バリデーション
    if (!formData.title.trim()) {
      toast.error('タイトルを入力してください');
      return;
    }
    
    if (!isEditMode && !formData.pdf_path) {
      toast.error('PDFファイルを選択してください');
      return;
    }
    
    if (!formData.content.trim()) {
      toast.error('本文テキストを入力してください');
      return;
    }
    
    setLoading(true);
    
    try {
      // タグを配列に変換
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      const data = {
        title: formData.title.trim(),
        authors: formData.authors.trim(),
        year: formData.year ? parseInt(formData.year) : null,
        content: formData.content.trim(),
        pdf_path: formData.pdf_path,
        tags: tags
      };
      
      console.log('[PaperRegister] 送信データ:', data);
      
      if (isEditMode) {
        // 更新
        console.log('[PaperRegister] 論文更新開始:', id);
        await window.api.papers.update(parseInt(id), data);
        toast.success('論文を更新しました');
        navigate(`/papers/${id}`);
      } else {
        // 新規登録
        console.log('[PaperRegister] 論文登録開始');
        const result = await window.api.papers.create(data);
        console.log('[PaperRegister] 論文登録結果:', result);
        toast.success('論文を登録しました');
        navigate(`/papers/${result.id}`);
      }
    } catch (error) {
      console.error('[PaperRegister] 論文保存エラー:', error);
      console.error('[PaperRegister] エラー詳細:', error.stack);
      toast.error('論文の保存に失敗しました: ' + error.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      {/* ヘッダー */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {isEditMode ? '📝 論文編集' : '📄 論文登録'}
        </h1>
        
        {/* デバッグ情報 */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <div className="font-semibold mb-2">🔧 デバッグ情報:</div>
          <div>window.api 存在: {window.api ? '✅' : '❌'}</div>
          <div>window.api.selectPDF 存在: {window.api?.selectPDF ? '✅' : '❌'}</div>
          <div>window.api.papers.create 存在: {window.api?.papers?.create ? '✅' : '❌'}</div>
          
          {/* テストボタン */}
          <button
            type="button"
            onClick={() => {
              console.log('テストボタンがクリックされました');
              alert('ボタンクリックは動作しています！\nConsoleを確認してください。');
            }}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            🧪 クリックテスト
          </button>
        </div>
      </div>
      
      {/* フォーム */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
        {/* PDFファイル */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            PDFファイル <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={handleSelectPDF}
              disabled={isEditMode}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-md transition-colors"
            >
              ファイル選択
            </button>
            {pdfFile && (
              <span className="text-sm text-gray-600">
                📄 {pdfFile.originalName}
              </span>
            )}
          </div>
          {isEditMode && (
            <p className="text-xs text-gray-500 mt-2">
              ※編集時はPDFファイルを変更できません
            </p>
          )}
        </div>
        
        {/* タイトル */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            タイトル <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="論文のタイトルを入力"
          />
        </div>
        
        {/* 著者 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            著者
          </label>
          <input
            type="text"
            name="authors"
            value={formData.authors}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例: John Doe, Jane Smith"
          />
        </div>
        
        {/* 発行年 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            発行年
          </label>
          <input
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            className="w-32 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="2024"
            min="1900"
            max="2100"
          />
        </div>
        
        {/* タグ */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            タグ（カンマ区切り）
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例: NLP, Transformer, Attention"
          />
          <p className="text-xs text-gray-500 mt-1">
            複数のタグはカンマで区切って入力してください
          </p>
        </div>
        
        {/* 本文テキスト */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            本文テキスト <span className="text-red-500">*</span>
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={15}
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder="論文の本文をコピー＆ペーストしてください...

Abstract, Introduction, Methodなど全文を含めることで検索精度が向上します。"
          />
          <p className="text-xs text-gray-500 mt-1">
            ※ PDFから本文をコピー＆ペーストしてください
          </p>
        </div>
        
        {/* ボタン */}
        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-md transition-colors"
          >
            {loading ? '保存中...' : isEditMode ? '更新' : '登録'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default PaperRegister;