import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button, Loading } from '../components/common/Button';

function MetadataEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    year: '',
    doi: ''
  });
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    loadPaperData();
  }, [id]);

  const loadPaperData = async () => {
    try {
      setLoading(true);
      const paperData = await window.electronAPI.papers.getById(parseInt(id));
      
      if (!paperData) {
        navigate('/papers');
        return;
      }

      setPaper(paperData);
      setFormData({
        title: paperData.title,
        authors: paperData.authors || '',
        year: paperData.year?.toString() || '',
        doi: paperData.doi || ''
      });

      // タグ取得
      const paperTags = await window.electronAPI.papers.getTags(parseInt(id));
      setTags(paperTags.map(t => t.tag_name));
    } catch (error) {
      console.error('Failed to load paper:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const updateData = {
        title: formData.title,
        authors: formData.authors,
        year: formData.year ? parseInt(formData.year) : null,
        doi: formData.doi
      };

      await window.electronAPI.papers.update(parseInt(id), updateData);
      navigate(`/papers/${id}`);
    } catch (error) {
      console.error('Failed to save paper:', error);
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;

    try {
      await window.electronAPI.papers.addTag(parseInt(id), newTag.trim());
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    } catch (error) {
      console.error('Failed to add tag:', error);
    }
  };

  const handleRemoveTag = async (tag) => {
    try {
      await window.electronAPI.papers.removeTag(parseInt(id), tag);
      setTags(tags.filter(t => t !== tag));
    } catch (error) {
      console.error('Failed to remove tag:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('この論文を削除してもよろしいですか？この操作は取り消せません。')) {
      return;
    }

    try {
      await window.electronAPI.papers.delete(parseInt(id));
      navigate('/papers');
    } catch (error) {
      console.error('Failed to delete paper:', error);
      alert('削除に失敗しました');
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* ヘッダー */}
      <div className="mb-6">
        <Link to={`/papers/${id}`} className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
          ← 論文詳細に戻る
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900">
          ✏️ 論文情報の編集
        </h1>
      </div>

      {/* フォーム */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="space-y-6">
          {/* タイトル */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 著者 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              著者
            </label>
            <input
              type="text"
              value={formData.authors}
              onChange={(e) => handleChange('authors', e.target.value)}
              placeholder="例: Smith, J., Doe, A."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 年・DOI */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                発行年
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => handleChange('year', e.target.value)}
                placeholder="2024"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                DOI
              </label>
              <input
                type="text"
                value={formData.doi}
                onChange={(e) => handleChange('doi', e.target.value)}
                placeholder="10.xxxx/xxxxx"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* タグ管理 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タグ
            </label>
            
            {/* 既存タグ */}
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  #{tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* 新規タグ追加 */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="新しいタグを追加"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button onClick={handleAddTag} size="sm">
                追加
              </Button>
            </div>
          </div>

          {/* ファイル情報 */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              ファイル情報
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>ページ数: {paper.page_count || '未処理'}</p>
              <p>処理状態: {getStatusLabel(paper.processing_status)}</p>
              <p className="truncate">パス: {paper.pdf_path}</p>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="mt-8 flex gap-4">
          <Button
            variant="secondary"
            onClick={() => navigate(`/papers/${id}`)}
            disabled={saving}
            className="flex-1"
          >
            キャンセル
          </Button>
          <Button
            onClick={handleSave}
            disabled={!formData.title || saving}
            className="flex-1"
          >
            {saving ? '保存中...' : '保存'}
          </Button>
        </div>

        {/* 削除ボタン */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <Button
            variant="danger"
            onClick={handleDelete}
            size="sm"
          >
            🗑️ この論文を削除
          </Button>
        </div>
      </div>
    </div>
  );
}

function getStatusLabel(status) {
  const labels = {
    'pending': '未処理',
    'processing': '処理中',
    'completed': '完了',
    'failed': '失敗'
  };
  return labels[status] || status;
}

export default MetadataEdit;