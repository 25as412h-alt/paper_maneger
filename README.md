# Paper Manager

論文とメモを一元管理し、全文横断検索で研究を加速させるデスクトップアプリケーション

## 📋 特徴

- **PDFファイル保存**: 論文PDFをデータベースで一元管理
- **本文テキスト検索**: 論文本文とメモを横断的に全文検索
- **メモ機能**: 論文ごとにMarkdown対応のメモを作成・管理
- **タグ管理**: タグで論文を分類・フィルタリング
- **オフライン動作**: 完全ローカルで動作、インターネット不要

## 🚀 セットアップ

### 前提条件

- Node.js (v16以上)
- npm (v8以上)

### インストール手順

1. **依存関係のインストール**

```bash
npm install
```

2. **アプリケーション起動**

```bash
node start.js
```

または

```bash
npm start
```

## 📁 プロジェクト構成

```
paper-manager/
├── main.js                 # Electronメインプロセス
├── preload.js              # IPC通信ブリッジ
├── start.js                # 起動スクリプト
├── package.json            # プロジェクト設定
├── webpack.config.js       # Webpack設定
├── tailwind.config.js      # Tailwind CSS設定
├── .babelrc                # Babel設定
│
├── database/               # データベース関連
│   ├── db.js              # SQLiteデータベースクラス
│   └── schema.sql         # データベーススキーマ
│
├── src/                    # Reactソースコード
│   ├── index.jsx          # Reactエントリーポイント
│   ├── index.css          # グローバルスタイル
│   ├── App.jsx            # メインアプリケーション
│   └── components/        # Reactコンポーネント
│       ├── Header.jsx              # ヘッダー
│       ├── SearchBar.jsx           # 検索バー
│       ├── Dashboard.jsx           # ダッシュボード
│       ├── PaperList.jsx           # 論文一覧
│       ├── PaperAdd.jsx            # 論文登録
│       ├── PaperDetail.jsx         # 論文詳細
│       └── SearchResults.jsx       # 検索結果
│
├── public/                 # 静的ファイル
│   └── index.html         # HTMLテンプレート
│
├── data/                   # データディレクトリ（自動生成）
│   ├── papers.db          # SQLiteデータベース
│   ├── pdfs/              # PDFファイル保存先
│   └── backups/           # バックアップファイル
│
└── dist/                   # ビルド出力（自動生成）
```

## 🎯 使い方

### 1. 論文登録

1. ヘッダーの「新規登録」ボタンをクリック
2. PDFファイルを選択
3. タイトル、著者、発行年を入力
4. タグをカンマ区切りで入力（例: `NLP, Transformer, Attention`）
5. 本文テキストをコピー＆ペースト
6. 「登録」ボタンをクリック

### 2. 論文検索

1. ヘッダーの検索バーにキーワードを入力
2. 検索対象を選択（全体 / 本文のみ / メモのみ）
3. 「検索」ボタンをクリック
4. 検索結果から論文やメモにアクセス

### 3. メモ作成

1. 論文詳細画面を開く
2. 「新規メモ」ボタンをクリック
3. メモ内容を入力（Markdown記法対応）
4. 「保存」ボタンをクリック

### 4. PDF閲覧

- 論文一覧や詳細画面の「PDF」ボタンをクリック
- システムのデフォルトPDFリーダーで開かれます

### 5. データバックアップ

- メニュー > ファイル > データをエクスポート
- バックアップファイルが `data/backups/` に保存されます

## 🔍 検索機能

### 英語検索（FTS5）

- 部分一致検索が可能
- 複数単語での検索に対応
- 高速な全文検索

例: `attention mechanism`, `transformer architecture`

### 日本語検索（LIKE検索）

- 完全一致検索
- MVP段階での実装

例: `自然言語処理`, `機械学習`

## 🐛 デバッグ

### ターミナルログ

アプリケーション実行中、以下の形式でログが出力されます:

```
[MAIN] アプリケーション起動開始
[DB] データベース接続成功
[IPC] 論文登録リクエスト: Attention Is All You Need
[DB] 論文追加完了: ID=1
```

ログプレフィックスの意味:

- `[MAIN]`: Electronメインプロセス
- `[DB]`: データベース操作
- `[IPC]`: プロセス間通信
- `[PRELOAD]`: プリロードスクリプト
- `[APP]`: Reactアプリケーション
- `[コンポーネント名]`: 各Reactコンポーネント

### 開発者ツール

- アプリケーション起動後、`Ctrl+Shift+I`（Windows）で開発者ツールを開く
- Console タブでブラウザ側のログを確認

### よくあるエラー

**1. `sqlite3`モジュールが見つからない**

```bash
npm install sqlite3 --save
```

**2. Webpack Dev Serverが起動しない**

```bash
npm install --save-dev webpack webpack-cli webpack-dev-server
```

**3. データベース接続エラー**

- `data/` ディレクトリが存在することを確認
- データベースファイルの権限を確認

## 📊 技術スタック

### フロントエンド

- React 18
- React Router 6
- Tailwind CSS 3
- react-hot-toast

### バックエンド

- Electron 28
- SQLite 3
- FTS5（全文検索）

### 開発ツール

- Webpack 5
- Babel 7
- PostCSS

## 🛠️ 開発コマンド

```bash
# 開発モードで起動
npm run dev

# 本番ビルド
npm run build

# Electronのみ起動
npm run electron

# パッケージ化（インストーラー作成）
npm run package
```

## 📝 今後の拡張予定

- [ ] N-gram方式の日本語検索対応
- [ ] Markdown表示対応（メモ）
- [ ] 論文編集機能
- [ ] CSV/BibTeXエクスポート
- [ ] 自動バックアップ機能
- [ ] 統計情報ダッシュボード
- [ ] クラウド同期機能

## 📄 ライセンス

MIT License

## 🙏 謝辞

本アプリケーションは研究者の論文管理を支援するために開発されました。