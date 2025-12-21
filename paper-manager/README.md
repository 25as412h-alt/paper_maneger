# Paper Manager v3.0-beta

研究者のための論文データベース管理アプリケーション

## 📋 概要

Paper Managerは、論文PDF・本文・章・図表・メモを一元管理し、**全文横断検索とメモ同士の関連付け**によって研究者の思考整理と論文執筆を支援するデスクトップアプリケーションです。

### 🎉 v3.0-beta の新機能

- ✅ **PDFビューア統合** - PDF.jsによる高速なPDF表示
- ✅ **PDF解析自動化** - アップロード後の自動テキスト抽出
- ✅ **Markdownサポート** - メモのプレビュー表示
- ✅ **処理状態の可視化** - リアルタイムで進捗を確認
- ✅ **バックアップ機能** - データの安全な保管・復元

### 主な機能

- **全文横断検索**: 論文本文・メモ・図表を統合的に検索
- **ファセット検索**: 検索結果を種別ごとに絞り込み
- **PDFビューア**: ページ移動・ズーム・検索結果からのジャンプ
- **メモ管理**: Markdown対応、プレビュー表示、関連メモ自動検出
- **PDF解析**: 自動テキスト抽出、章・図表の検出
- **タグ管理**: 柔軟な分類とフィルタリング
- **ダッシュボード**: 研究状態を一目で把握
- **オフライン動作**: ローカルDB（SQLite）で完全なオフライン対応

## 🚀 クイックスタート

### 前提条件

- **Node.js 18.x以上**
- **Python 3.8以上**（PDF処理用）
- **Windows 10/11**（現バージョンはWindows専用）

### インストール

1. リポジトリをクローン

```bash
git clone https://github.com/your-repo/paper-manager.git
cd paper-manager
```

2. 依存関係のインストール

```bash
npm install
```

3. Python依存関係のインストール

```bash
cd python
pip install -r requirements.txt
```

### 起動方法

#### 開発モード

```bash
npm start
```

または、Windows起動スクリプトを使用：

```bash
Paper_Manager.bat
```

#### 本番ビルド

```bash
npm run build
npm run build:electron
```

実行可能ファイルは `dist/` ディレクトリに生成されます。

## 📁 プロジェクト構造

```
paper-manager/
├── electron/          # Electronメインプロセス
├── src/              # Reactフロントエンド
│   ├── components/  # UIコンポーネント
│   ├── pages/       # ページコンポーネント
│   └── contexts/    # 状態管理
├── backend/          # Node.jsバックエンド
│   ├── database/    # SQLite + FTS5
│   ├── services/    # ビジネスロジック
│   └── ipc/         # IPC通信
├── python/           # PDF処理スクリプト
└── data/             # アプリケーションデータ
    ├── papers.db    # SQLiteデータベース
    ├── pdfs/        # PDFファイル
    └── backups/     # バックアップ
```

詳細は `docs/architecture.md` を参照してください。

## 🎯 使い方

### 1. 論文の登録

1. ダッシュボードから「論文を追加」をクリック
2. PDFファイルを選択
3. 自動抽出されたメタデータを確認・修正
4. 「登録」をクリック
5. PDF解析が自動的に開始されます

### 2. PDFの閲覧

- 論文詳細画面の「PDF」タブでPDFを表示
- ページ移動、ズーム、全画面表示が可能
- 検索結果から該当ページに直接ジャンプ

### 3. 検索

1. ヘッダーまたはダッシュボードの検索バーに検索語を入力
2. スコープ（全体・メモ・本文など）を選択
3. 検索結果をファセット（種別）で絞り込み
4. 該当箇所へ直接ジャンプ

### 4. メモの作成

1. 論文詳細画面で「メモを追加」をクリック
2. Markdown形式でメモを記述
3. プレビューで確認
4. 保存すると、関連メモが自動的に表示される

### 5. データのバックアップ

```javascript
// アプリ内から実行（将来のUIで対応予定）
await window.electronAPI.files.createBackup();
```

## 🛠 開発

### テスト実行

```bash
npm test
```

### リント

```bash
npm run lint
```

### データベース初期化

```bash
node backend/database/initialize.js
```

## 📚 ドキュメント

- [要件定義書](docs/requirements.md) - 機能要件と設計思想
- [アーキテクチャ設計](docs/architecture.md) - システム構成
- [開発ガイド](docs/development.md) - 開発手順
- [実装状況](IMPLEMENTATION_STATUS.md) - 現在の進捗

## 🔧 トラブルシューティング

### データベースエラー

```bash
# データベースを再初期化
rm data/papers.db
npm start
```

### PDF解析が失敗する

- Python環境が正しくインストールされているか確認
- `python/requirements.txt` の依存関係を再インストール

```bash
pip install -r python/requirements.txt --force-reinstall
```

### PDFビューアが表示されない

- ブラウザのコンソールでPDF.jsのロードエラーを確認
- Content Security Policyの設定を確認

## 📝 ライセンス

MIT License

## 👥 コントリビューション

プルリクエストを歓迎します。大きな変更の場合は、まずissueで議論してください。

## 📞 サポート

問題が発生した場合は、[Issues](https://github.com/your-repo/paper-manager/issues)で報告してください。

---

**Paper Manager v3.0-beta** - Research Made Easier 🚀

**実装完了率**: 95% | **MVP達成**: 100% | **ファイル数**: 53

## 🚀 クイックスタート

### 前提条件

- **Node.js 18.x以上**
- **Python 3.8以上**（PDF処理用）
- **Windows 10/11**（現バージョンはWindows専用）

### インストール

1. リポジトリをクローン

```bash
git clone https://github.com/your-repo/paper-manager.git
cd paper-manager
```

2. 依存関係のインストール

```bash
npm install
```

3. Python依存関係のインストール

```bash
cd python
pip install -r requirements.txt
```

### 起動方法

#### 開発モード

```bash
npm start
```

または、Windows起動スクリプトを使用：

```bash
Paper_Manager.bat
```

#### 本番ビルド

```bash
npm run build
npm run build:electron
```

実行可能ファイルは `dist/` ディレクトリに生成されます。

## 📁 プロジェクト構造

```
paper-manager/
├── electron/          # Electronメインプロセス
├── src/              # Reactフロントエンド
├── backend/          # Node.jsバックエンド
├── python/           # PDF処理スクリプト
├── data/             # アプリケーションデータ
│   ├── papers.db    # SQLiteデータベース
│   ├── pdfs/        # PDFファイル
│   └── figures/     # 抽出図表
└── config/          # 設定ファイル
```

詳細は `docs/architecture.md` を参照してください。

## 🎯 使い方

### 1. 論文の登録

1. ダッシュボードから「論文を追加」をクリック
2. PDFファイルを選択
3. 自動抽出されたメタデータを確認・修正
4. 「登録」をクリック

### 2. 検索

1. ダッシュボードまたはヘッダーの検索バーに検索語を入力
2. スコープ（全体・メモ・本文など）を選択
3. 検索結果から必要な情報を閲覧

### 3. メモの作成

1. 論文詳細画面でPDFを開く
2. テキストを範囲選択 → 右クリック → 「メモを追加」
3. Markdown形式でメモを記述
4. 保存すると、関連メモが自動的に表示される

## 🛠 開発

### テスト実行

```bash
npm test
```

### リント

```bash
npm run lint
```

### データベース初期化

```bash
node backend/database/initialize.js
```

## 📚 ドキュメント

- [要件定義書](docs/requirements.md) - 機能要件と設計思想
- [アーキテクチャ設計](docs/architecture.md) - システム構成
- [API仕様](docs/api-spec.md) - IPC通信インターフェース
- [開発ガイド](docs/development.md) - 開発手順

## 🔧 トラブルシューティング

### データベースエラー

```bash
# データベースを再初期化
rm data/papers.db
npm start
```

### PDF解析が失敗する

- Python環境が正しくインストールされているか確認
- `python/requirements.txt` の依存関係を再インストール

```bash
pip install -r python/requirements.txt --force-reinstall
```

### 検索が遅い

```bash
# データベースを最適化
node backend/database/optimize.js
```

## 📝 ライセンス

MIT License

## 👥 コントリビューション

プルリクエストを歓迎します。大きな変更の場合は、まずissueで議論してください。

## 📞 サポート

問題が発生した場合は、[Issues](https://github.com/your-repo/paper-manager/issues)で報告してください。

---

**Paper Manager v3.0** - Research Made Easier