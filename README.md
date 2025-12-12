# 学術論文管理システム

PySide6ベースの論文管理デスクトップアプリケーション

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Python](https://img.shields.io/badge/python-3.9+-green)
![License](https://img.shields.io/badge/license-MIT-yellow)

## 📖 概要

研究者・学生向けの論文管理ツールです。PDFファイルと画像を添付し、検索・整理・プレビューが簡単にできます。

### 主な機能

- ✅ 論文の登録・編集・削除
- 🔍 高度な検索機能（複数条件、年範囲指定）
- 📄 PDFプレビュー（1ページ目を表示）
- 🖼️ 画像プレビュー
- 💾 自動バックアップ（起動時に実行）
- 📊 CSV エクスポート/インポート
- ⌨️ キーボードショートカット対応
- 🗂️ 10,000件以上のデータに対応

---

## 🚀 クイックスタート

### 必要要件

- **Python**: 3.9 以上
- **OS**: Windows 10/11（他OSでも動作可能）
- **メモリ**: 4GB以上推奨

### インストール

#### 1. リポジトリのクローン

```bash
git clone https://github.com/yourusername/paper_manager.git
cd paper_manager
```

#### 2. 仮想環境の作成（推奨）

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

#### 3. 依存パッケージのインストール

```bash
pip install -r requirements.txt
```

#### 4. アプリケーションの起動

```bash
python main.py
```

---

## 📚 使い方

### 基本操作

#### 📝 新規登録

1. `Ctrl+N` または メニュー → **ファイル** → **新規登録**
2. 以下の情報を入力：
   - **タイトル**（必須）
   - 著者
   - 年
   - PDFファイル（参照ボタンで選択）
   - 画像ファイル（参照ボタンで選択）
   - メモ
3. **保存**ボタンをクリック

#### ✏️ 編集

1. テーブルで論文を選択
2. `Ctrl+E` または **編集**ボタン
3. 情報を修正して**保存**

#### 🗑️ 削除

1. テーブルで論文を選択
2. `Delete` または **削除**ボタン
3. 確認ダイアログで**はい**

#### 🔍 検索

**簡易検索:**
1. 検索フィールドを選択（タイトル/著者/メモ/全体）
2. キーワードを入力
3. `Enter` または **検索**ボタン

**詳細検索:**
1. **詳細検索...**ボタンをクリック
2. 複数条件を入力：
   - タイトル
   - 著者
   - 年範囲（From - To）
   - メモ
3. **検索**ボタン

#### 👁️ 詳細表示

1. テーブルで論文を**ダブルクリック**
2. タブで情報を確認：
   - **基本情報**: タイトル、著者、年など
   - **メモ**: 登録したメモ
   - **プレビュー**: PDFまたは画像のプレビュー
   - **メタデータ**: ファイル情報、PDFメタデータ

---

## ⌨️ キーボードショートカット

| ショートカット | 機能 |
|--------------|------|
| `Ctrl+N` | 新規登録 |
| `Ctrl+E` | 編集 |
| `Delete` | 削除 |
| `Ctrl+F` | 検索欄にフォーカス |
| `F5` | リスト更新 |
| `Ctrl+Q` | 終了 |

---

## 💾 バックアップとデータ管理

### 自動バックアップ

アプリ起動時に自動的にバックアップが作成されます。

- **保存場所**: `data/backups/`
- **ファイル名**: `papers_auto_YYYYMMDD_HHMMSS.db`
- **世代管理**: 最新5世代を保持（古いものは自動削除）

### 手動バックアップ

メニュー → **ファイル** → **バックアップ**

### CSV エクスポート/インポート

**エクスポート:**
1. メニュー → **ファイル** → **CSVエクスポート**
2. 保存先を指定
3. Excelで編集可能なCSVファイルが作成されます

**インポート:**
1. メニュー → **ファイル** → **CSVインポート**
2. CSVファイルを選択
3. データが追加されます（既存データは保持）

---

## 🗂️ ディレクトリ構造

```
paper_manager/
├── main.py                     # エントリーポイント
├── requirements.txt            # 依存パッケージ
├── README.md                   # このファイル
├── ui/                         # UIモジュール
│   ├── __init__.py
│   ├── main_window.py          # メインウィンドウ
│   ├── edit_dialog.py          # 登録・編集ダイアログ
│   ├── detail_dialog.py        # 詳細表示ダイアログ
│   └── advanced_search_dialog.py # 高度な検索
├── models/                     # データモデル
│   ├── __init__.py
│   └── database.py             # データベース操作
├── utils/                      # ユーティリティ
│   ├── __init__.py
│   ├── pdf_handler.py          # PDF処理
│   └── image_handler.py        # 画像処理
├── resources/                  # リソースファイル
│   └── icons/                  # アイコン
└── data/                       # データディレクトリ（自動生成）
    ├── papers.db               # メインデータベース
    └── backups/                # バックアップフォルダ
```

---

## 🔧 技術仕様

### 使用技術

- **言語**: Python 3.9+
- **GUIフレームワーク**: PySide6 (Qt6)
- **データベース**: SQLite 3
- **PDF処理**: PyMuPDF (fitz)
- **画像処理**: Pillow

### データベーススキーマ

```sql
CREATE TABLE papers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT,
    year INTEGER,
    pdf_path TEXT,
    image_path TEXT,
    memo TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### パフォーマンス

- **起動時間**: 5秒以内
- **検索速度**: 2秒以内（10,000件）
- **メモリ使用**: 500MB以下

---

## 🐛 トラブルシューティング

### アプリが起動しない

**原因1: Pythonバージョンが古い**
```bash
python --version  # 3.9以上か確認
```

**原因2: 依存パッケージが未インストール**
```bash
pip install -r requirements.txt
```

### PDFプレビューが表示されない

**原因: PyMuPDFが正しくインストールされていない**
```bash
pip uninstall PyMuPDF
pip install PyMuPDF
```

### データベースエラー

**対処法: バックアップから復元**
1. `data/backups/` フォルダを確認
2. 最新の `papers_auto_*.db` ファイルを見つける
3. `data/papers.db` にリネームしてコピー

### CSV文字化け（Excel）

**原因: Excelの文字コード認識問題**

本アプリはUTF-8 BOM付きでエクスポートしているため、通常は文字化けしません。
それでも文字化けする場合：

1. CSVをメモ帳で開く
2. **名前を付けて保存** → エンコード: **UTF-8**
3. 再度Excelで開く

---

## 🛠️ 開発者向け情報

### 開発環境のセットアップ

```bash
# 開発用依存パッケージのインストール
pip install -r requirements.txt
pip install pytest black flake8

# コードフォーマット
black .

# リント
flake8 .
```

### テストの実行

```bash
# データベーステスト
python models/database.py

# PDFハンドラーテスト
python utils/pdf_handler.py sample.pdf

# 画像ハンドラーテスト
python utils/image_handler.py sample.png
```

### 新機能の追加

1. `ui/` または `utils/` に新しいモジュールを追加
2. `main_window.py` に統合
3. 必要に応じて `database.py` を更新

---

## 📝 今後の改善予定

- [ ] SQLite FTS5による全文検索
- [ ] タグ機能
- [ ] ダークモード対応
- [ ] PDF内文字列検索
- [ ] サムネイル自動生成
- [ ] 複数ウィンドウ対応
- [ ] クラウド同期機能

---

## 🤝 コントリビューション

バグ報告や機能提案は Issues でお願いします。

プルリクエストも歓迎します！

---

## 📄 ライセンス

MIT License

Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## 👤 作成者

**開発者**: あなたの名前

**コンタクト**: your.email@example.com

**GitHub**: https://github.com/yourusername

---

## 🙏 謝辞

- **PySide6**: Qtプロジェクト
- **PyMuPDF**: Artifex Software
- **Pillow**: Python Imaging Library

---

## 📞 サポート

質問や問題がある場合：

1. まず [トラブルシューティング](#-トラブルシューティング) を確認
2. [Issues](https://github.com/yourusername/paper_manager/issues) で検索
3. 解決しない場合は新しいIssueを作成

---

**Happy Research! 📚✨**