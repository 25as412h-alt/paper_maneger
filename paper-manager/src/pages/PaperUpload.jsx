import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Loading } from '../components/common/Button';

function PaperUpload() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: ファイル選択, 2: メタデータ確認, 3: 処理中
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState(null); // 'pdf' or 'txt'
  const [metadata, setMetadata] = useState({
    title: '',
    authors: '',
    year: '',
    doi: ''
  });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  // ファイル選択
  const handleFileSelect = async () => {
    try {
      const filePath = await window.electronAPI.files.selectFile();
      if (filePath) {
        setSelectedFile(filePath);
        
        // ファイルタイプを判定
        const ext = filePath.split('.').pop().toLowerCase();
        setFileType(ext);
        
        // メタデータ抽出を試行
        await extractMetadata(filePath);
        setStep(2);
      }
    } catch (err) {
      setError('ファイルの選択に失敗しました: ' + err.message);
    }
  };

  // メタデータ抽出（簡易版）
  const extractMetadata = async (filePath) => {
    // TODO: バックエンドでメタデータ抽出API実装後に連携
    // 現在は手動入力を想定
    const fileName = filePath.split(/[/\\]/).pop();
    const ext = fileName.split('.').pop().toLowerCase();
    
    setMetadata({
      title: fileName.replace(`.${ext}`, ''),
      authors: '',
      year: new Date().getFullYear().toString(),
      doi: ''
    });
  };

  // メタデータ変更
  const handleMetadataChange = (field, value) => {
    setMetadata(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // 論文登録
  const handleSubmit = async () => {
    try {
      setProcessing(true);
      setStep(3);

      // ファイルをアップロード（コピー）
      const filePath = await window.electronAPI.files.uploadFile(selectedFile);

      // 論文レコードを作成
      const result = await window.electronAPI.papers.create({
        title: metadata.title,
        authors: metadata.authors,
        year: parseInt(metadata.year) || null,
        doi: metadata.doi,
        file_path: filePath,
        file_type: fileType,
        pdf_hash: '', // TODO: ハッシュ計算
        page_count: 0 // 解析で更新される
      });

      if (result.success) {
        // ファイル解析を非同期で開始（バックグラウンド処理）
        window.electronAPI.pdf.processPDF(result.id).catch(err => {
          console.error('File processing failed:', err);
        });
        
        // 論文詳細画面へ遷移（解析完了を待たない）
        navigate(`/papers/${result.id}`);
      } else {
        throw new Error('論文の登録に失敗しました');
      }
    } catch (err) {
      setError('論文の登録に失敗しました: ' + err.message);
      setProcessing(false);
      setStep(2);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          📄 論文を追加
        </h1>
        <p className="text-gray-600">
          PDFファイルをアップロードして、論文データベースに追加します
        </p>
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* ステップインジケーター */}
      <div className="mb-8 flex items-center justify-center">
        <StepIndicator step={1} current={step} label="ファイル選択" />
        <div className="w-16 h-0.5 bg-gray-300 mx-2" />
        <StepIndicator step={2} current={step} label="メタデータ確認" />
        <div className="w-16 h-0.5 bg-gray-300 mx-2" />
        <StepIndicator step={3} current={step} label="登録完了" />
      </div>

      {/* Step 1: ファイル選択 */}
      {step === 1 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
                <span className="text-4xl">📁</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                ファイルを選択
              </h2>
              <p className="text-gray-600">
                追加したい論文のPDFまたはテキストファイルを選択してください
              </p>
              <p className="text-sm text-gray-500 mt-2">
                対応形式: PDF (.pdf), テキスト (.txt)
              </p>
            </div>

            <Button onClick={handleFileSelect} size="lg">
              📂 ファイルを選択
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: メタデータ確認 */}
      {step === 2 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            論文情報の確認
          </h2>

          {/* 選択ファイル表示 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">選択したファイル</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {fileType === 'pdf' ? '📄' : '📝'}
              </span>
              <div className="flex-1">
                <p className="font-medium text-gray-900 truncate">
                  {selectedFile?.split(/[/\\]/).pop()}
                </p>
                <p className="text-xs text-gray-500">
                  {fileType === 'pdf' ? 'PDFファイル' : 'テキストファイル'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* タイトル */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                タイトル <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={metadata.title}
                onChange={(e) => handleMetadataChange('title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="論文のタイトルを入力"
              />
            </div>

            {/* 著者 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                著者
              </label>
              <input
                type="text"
                value={metadata.authors}
                onChange={(e) => handleMetadataChange('authors', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例: Smith, J., Doe, A."
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
                  value={metadata.year}
                  onChange={(e) => handleMetadataChange('year', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  DOI
                </label>
                <input
                  type="text"
                  value={metadata.doi}
                  onChange={(e) => handleMetadataChange('doi', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="10.xxxx/xxxxx"
                />
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="mt-8 flex gap-4">
            <Button
              variant="secondary"
              onClick={() => setStep(1)}
              className="flex-1"
            >
              ← 戻る
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!metadata.title}
              className="flex-1"
            >
              登録する →
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: 処理中 */}
      {step === 3 && processing && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <Loading message="論文を登録しています..." />
          <p className="text-center text-sm text-gray-600 mt-4">
            PDFの解析には数分かかる場合があります
          </p>
        </div>
      )}
    </div>
  );
}

// ステップインジケーターコンポーネント
function StepIndicator({ step, current, label }) {
  const isActive = step === current;
  const isComplete = step < current;

  return (
    <div className="flex flex-col items-center">
      <div className={`
        w-10 h-10 rounded-full flex items-center justify-center font-semibold
        ${isActive ? 'bg-blue-600 text-white' : ''}
        ${isComplete ? 'bg-green-500 text-white' : ''}
        ${!isActive && !isComplete ? 'bg-gray-200 text-gray-600' : ''}
      `}>
        {isComplete ? '✓' : step}
      </div>
      <span className="text-xs text-gray-600 mt-2">{label}</span>
    </div>
  );
}

export default PaperUpload;