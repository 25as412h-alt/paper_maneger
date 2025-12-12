# インストールガイド

学術論文管理システムのインストール手順

---

## 📋 目次

1. [システム要件](#1-システム要件)
2. [Python環境の準備](#2-python環境の準備)
3. [アプリケーションのインストール](#3-アプリケーションのインストール)
4. [動作確認](#4-動作確認)
5. [トラブルシューティング](#5-トラブルシューティング)

---

## 1. システム要件

### 最小要件

- **OS**: Windows 10 (64-bit)
- **CPU**: Intel Core i3 相当以上
- **メモリ**: 4GB RAM
- **ストレージ**: 500MB以上の空き容量

### 推奨要件

- **OS**: Windows 10/11 (64-bit)
- **CPU**: Intel Core i5 相当以上
- **メモリ**: 8GB RAM
- **ストレージ**: 1GB以上の空き容量

### ソフトウェア要件

- **Python**: 3.9 以上
- **インターネット接続**: 初回インストール時のみ必要

---

## 2. Python環境の準備

### 2.1 Pythonのインストール確認

すでにPythonがインストールされているか確認します。

**コマンドプロンプトを開く:**
1. `Windows + R` キーを押す
2. `cmd` と入力して `Enter`

**バージョン確認:**
```bash
python --version
```

**結果の確認:**
- `Python 3.9.x` 以上が表示されれば OK
- エラーが表示される場合は、次のステップへ

### 2.2 Pythonのインストール（必要な場合）

#### Step 1: ダウンロード

1. [Python公式サイト](https://www.python.org/downloads/)にアクセス
2. **Download Python 3.x.x** ボタンをクリック
3. インストーラーをダウンロード

#### Step 2: インストール

1. ダウンロードした `python-3.x.x.exe` を実行
2. **重要:** 「**Add Python to PATH**」に✅チェックを入れる
3. **Install Now** をクリック
4. インストール完了を待つ
5. **Close** をクリック

#### Step 3: 確認

コマンドプロンプトで再度確認:
```bash
python --version
```

**注意:** コマンドプロンプトを再起動する必要がある場合があります。

---

## 3. アプリケーションのインストール

### 方法1: ZIP形式でダウンロード（推奨）

#### Step 1: ダウンロード

1. [GitHubリリースページ](https://github.com/yourusername/paper_manager/releases)にアクセス
2. 最新版の `paper_manager-v1.0.0.zip` をダウンロード
3. ダウンロードフォルダで右クリック → **すべて展開**
4. 展開先を選択（例: `C:\Users\YourName\Documents\paper_manager`）

#### Step 2: 仮想環境の作成

コマンドプロンプトで展開したフォルダに移動:
```bash
cd C:\Users\YourName\Documents\paper_manager
```

仮想環境を作成:
```bash
python -m venv venv
```

仮想環境を有効化:
```bash
venv\Scripts\activate
```

**成功すると、プロンプトに `(venv)` が表示されます。**

#### Step 3: 依存パッケージのインストール

```bash
pip install -r requirements.txt
```

**進行状況が表示されます。完了まで3-5分程度かかります。**

#### Step 4: 完了

インストール完了！次のステップで動作確認を行います。

---

### 方法2: Gitでクローン（開発者向け）

#### 前提条件

Gitがインストールされていること。未インストールの場合は[Git公式サイト](https://git-scm.com/)からインストール。

#### Step 1: クローン

```bash
cd C:\Users\YourName\Documents
git clone https://github.com/yourusername/paper_manager.git
cd paper_manager
```

#### Step 2: 仮想環境とパッケージ

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

---

## 4. 動作確認

### 4.1 アプリケーションの起動

仮想環境が有効化された状態で:
```bash
python main.py
```

**正常に起動すると:**
- ウィンドウが表示されます
- タイトルバーに「学術論文管理システム」と表示されます

### 4.2 テストデータの投入（オプション）

動作確認用のテストデータを投入できます。

**test_data.py を作成:**
```python
from models.database import Database

db = Database()

test_papers = [
    ("Deep Learning", "Geoffrey Hinton", 2015, "", "", "深層学習の基礎論文"),
    ("Attention Is All You Need", "Vaswani et al.", 2017, "", "", "Transformer"),
    ("BERT", "Devlin et al.", 2018, "", "", "事前学習言語モデル"),
]

for title, author, year, pdf, img, memo in test_papers:
    db.add_paper(title, author, year, pdf, img, memo)

print("テストデータを追加しました")
```

**実行:**
```bash
python test_data.py
```

**確認:**
アプリを再起動すると、3件の論文が表示されます。

---

## 5. トラブルシューティング

### 問題1: 「pythonは内部コマンドまたは外部コマンド...」

**原因:** PythonがPATHに登録されていない

**対処法:**
1. Pythonを再インストール
2. 「Add Python to PATH」に✅チェック

### 問題2: 「pip: command not found」

**原因:** pipがインストールされていない

**対処法:**
```bash
python -m ensurepip --upgrade
```

### 問題3: 「No module named 'PySide6'」

**原因:** 依存パッケージが未インストール

**対処法:**
```bash
pip install -r requirements.txt
```

### 問題4: 仮想環境が有効化できない

**症状:** `venv\Scripts\activate` でエラー

**原因:** PowerShellの実行ポリシー

**対処法（PowerShellの場合）:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

その後再度:
```powershell
venv\Scripts\Activate.ps1
```

### 問題5: 「ImportError: DLL load failed」

**原因:** Visual C++ 再頒布可能パッケージが不足

**対処法:**
1. [Microsoft公式サイト](https://support.microsoft.com/ja-jp/help/2977003/the-latest-supported-visual-c-downloads)にアクセス
2. 「Visual Studio 2015, 2017, 2019, and 2022」の x64版をダウンロード
3. インストール
4. PCを再起動

---

## 6. アンインストール

### アプリケーションの削除

1. インストールフォルダ全体を削除
   ```
   C:\Users\YourName\Documents\paper_manager
   ```

2. データベースファイルも削除する場合
   - 上記フォルダ内の `data/papers.db` も含まれます
   - バックアップを取っていない場合は注意

### Pythonの削除（完全削除する場合）

1. **設定** → **アプリ** → **Python 3.x.x**
2. **アンインストール** をクリック

**注意:** 他のPythonアプリケーションも使えなくなります。

---

## 7. よくある質問（インストール関連）

### Q1. Python 2.7がすでにインストールされています

**A:** Python 3.9以上が必要です。Python 2.7と共存可能なので、3.9以上を追加インストールしてください。

### Q2. 会社のPCでインストールできません

**A:** 管理者権限が必要な場合があります。IT部門に相談してください。

### Q3. インストールに時間がかかります

**A:** 依存パッケージのダウンロードに3-5分程度かかることがあります。インターネット接続を確認してください。

### Q4. MacやLinuxでも使えますか？

**A:** 基本的には動作しますが、このガイドはWindows向けです。

**macOS:**
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Q5. ポータブル版はありますか？

**A:** 現在は提供していません。将来的にPyInstallerでの実行ファイル化を検討中です。

---

## 8. 次のステップ

インストールが完了したら:

1. **[README.md](README.md)** を読む
2. **[USER_MANUAL.md](USER_MANUAL.md)** で使い方を学ぶ
3. テストデータで操作を試す
4. 実際の論文データを登録

---

## 9. サポート

インストールで問題が発生した場合:

1. このガイドの[トラブルシューティング](#5-トラブルシューティング)を確認
2. [GitHub Issues](https://github.com/yourusername/paper_manager/issues)で検索
3. 解決しない場合は新しいIssueを作成

**Issue作成時に含める情報:**
- OS（Windows 10/11）
- Pythonバージョン（`python --version`）
- エラーメッセージの全文
- 実行したコマンド

---

**Happy Installing! 🚀**