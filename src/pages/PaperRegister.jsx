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
  
  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      loadPaper(id);
    }
  }, [id]);
  
  const loadPaper = async (paperId) => {
    try {
      const paper = await window.api.papers.findById(parseInt(paperId));
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
      console.error('論文読み込みエラー:', error);
      toast.error('論文の読み込みに失敗しました');
    }
  };
  
  const handleSelectPDF = async () => {
    const result = await window.api.selectPDF();
    if (result) {
      setPdfFile(result);
      setFormData(prev => ({ ...prev, pdf_path: result.path }));
      toast.success('PDFファイルを選択しました');
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
      
      if (isEditMode) {
        // 更新
        await window.api.papers.update(parseInt(id), data);
        toast.success('論文を更新しました');
        navigate(`/papers/${id}`);
      } else {
        // 新規登録
        const result = await window.api.papers.create(data);
        toast.success('論文を登録しました');
        navigate(`/papers/${result.id}`);
      }
    } catch (error) {
      console.error('論文保存エラー:', error);
      toast.error('論文の保存に失敗しました');
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