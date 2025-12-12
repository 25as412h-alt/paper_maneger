"""
データベース操作を管理するモジュール
SQLiteを使用して論文データを管理
"""
import sqlite3
import os
from datetime import datetime
from typing import List, Optional, Dict, Any


class Database:
    """論文データベース管理クラス"""
    
    def __init__(self, db_path: str = "data/papers.db"):
        """
        データベース初期化
        
        Args:
            db_path: データベースファイルのパス
        """
        self.db_path = db_path
        self._ensure_data_dir()
        self._create_tables()
    
    def _ensure_data_dir(self):
        """dataディレクトリが存在しない場合は作成"""
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
    
    def _create_tables(self):
        """テーブルが存在しない場合は作成"""
        conn = self._get_connection()
        try:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS papers (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    author TEXT,
                    year INTEGER,
                    pdf_path TEXT,
                    image_path TEXT,
                    memo TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # インデックス作成
            conn.execute("CREATE INDEX IF NOT EXISTS idx_title ON papers(title)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_author ON papers(author)")
            conn.execute("CREATE INDEX IF NOT EXISTS idx_year ON papers(year)")
            
            conn.commit()
        finally:
            conn.close()
    
    def _get_connection(self) -> sqlite3.Connection:
        """データベース接続を取得"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # 辞書形式でアクセス可能に
        return conn
    
    def add_paper(self, title: str, author: str = "", year: int = None,
                  pdf_path: str = "", image_path: str = "", memo: str = "") -> int:
        """
        論文を追加
        
        Args:
            title: タイトル
            author: 著者
            year: 年
            pdf_path: PDFファイルパス
            image_path: 画像ファイルパス
            memo: メモ
            
        Returns:
            追加されたレコードのID
        """
        conn = self._get_connection()
        try:
            cursor = conn.execute("""
                INSERT INTO papers (title, author, year, pdf_path, image_path, memo)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (title, author, year, pdf_path, image_path, memo))
            conn.commit()
            return cursor.lastrowid
        finally:
            conn.close()
    
    def update_paper(self, paper_id: int, title: str, author: str = "", 
                     year: int = None, pdf_path: str = "", 
                     image_path: str = "", memo: str = "") -> bool:
        """
        論文情報を更新
        
        Args:
            paper_id: 論文ID
            title: タイトル
            author: 著者
            year: 年
            pdf_path: PDFファイルパス
            image_path: 画像ファイルパス
            memo: メモ
            
        Returns:
            成功時True
        """
        conn = self._get_connection()
        try:
            conn.execute("""
                UPDATE papers 
                SET title = ?, author = ?, year = ?, pdf_path = ?, 
                    image_path = ?, memo = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (title, author, year, pdf_path, image_path, memo, paper_id))
            conn.commit()
            return True
        except Exception as e:
            print(f"更新エラー: {e}")
            return False
        finally:
            conn.close()
    
    def delete_paper(self, paper_id: int) -> bool:
        """
        論文を削除
        
        Args:
            paper_id: 論文ID
            
        Returns:
            成功時True
        """
        conn = self._get_connection()
        try:
            conn.execute("DELETE FROM papers WHERE id = ?", (paper_id,))
            conn.commit()
            return True
        except Exception as e:
            print(f"削除エラー: {e}")
            return False
        finally:
            conn.close()
    
    def get_paper(self, paper_id: int) -> Optional[Dict[str, Any]]:
        """
        指定IDの論文を取得
        
        Args:
            paper_id: 論文ID
            
        Returns:
            論文データの辞書、存在しない場合None
        """
        conn = self._get_connection()
        try:
            cursor = conn.execute("SELECT * FROM papers WHERE id = ?", (paper_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
        finally:
            conn.close()
    
    def get_all_papers(self, order_by: str = "id", 
                       order_desc: bool = False) -> List[Dict[str, Any]]:
        """
        全論文を取得
        
        Args:
            order_by: ソート列 (id, title, author, year, created_at)
            order_desc: 降順の場合True
            
        Returns:
            論文データのリスト
        """
        # SQLインジェクション対策: 許可された列名のみ
        allowed_columns = ["id", "title", "author", "year", "created_at", "updated_at"]
        if order_by not in allowed_columns:
            order_by = "id"
        
        order = "DESC" if order_desc else "ASC"
        query = f"SELECT * FROM papers ORDER BY {order_by} {order}"
        
        conn = self._get_connection()
        try:
            cursor = conn.execute(query)
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        finally:
            conn.close()
    
    def search_papers(self, keyword: str, 
                      search_field: str = "title") -> List[Dict[str, Any]]:
        """
        論文を検索
        
        Args:
            keyword: 検索キーワード
            search_field: 検索対象フィールド (title, author, memo, all)
            
        Returns:
            検索結果のリスト
        """
        allowed_fields = ["title", "author", "memo", "all"]
        if search_field not in allowed_fields:
            search_field = "title"
        
        search_pattern = f"%{keyword}%"
        
        conn = self._get_connection()
        try:
            if search_field == "all":
                # 全フィールド検索
                query = """
                    SELECT * FROM papers 
                    WHERE title LIKE ? OR author LIKE ? OR memo LIKE ?
                    ORDER BY updated_at DESC
                """
                cursor = conn.execute(query, (search_pattern, search_pattern, search_pattern))
            else:
                # 単一フィールド検索
                query = f"SELECT * FROM papers WHERE {search_field} LIKE ? ORDER BY updated_at DESC"
                cursor = conn.execute(query, (search_pattern,))
            
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        finally:
            conn.close()
    
    def advanced_search(self, title: str = "", author: str = "", 
                       year_from: int = None, year_to: int = None,
                       memo: str = "") -> List[Dict[str, Any]]:
        """
        高度な検索（複数条件）
        
        Args:
            title: タイトルキーワード
            author: 著者キーワード
            year_from: 開始年
            year_to: 終了年
            memo: メモキーワード
            
        Returns:
            検索結果のリスト
        """
        conditions = []
        params = []
        
        if title:
            conditions.append("title LIKE ?")
            params.append(f"%{title}%")
        
        if author:
            conditions.append("author LIKE ?")
            params.append(f"%{author}%")
        
        if year_from is not None:
            conditions.append("year >= ?")
            params.append(year_from)
        
        if year_to is not None:
            conditions.append("year <= ?")
            params.append(year_to)
        
        if memo:
            conditions.append("memo LIKE ?")
            params.append(f"%{memo}%")
        
        if not conditions:
            return self.get_all_papers()
        
        query = "SELECT * FROM papers WHERE " + " AND ".join(conditions)
        query += " ORDER BY updated_at DESC"
        
        conn = self._get_connection()
        try:
            cursor = conn.execute(query, params)
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        finally:
            conn.close()
    
    def get_paper_count(self) -> int:
        """論文の総数を取得"""
        conn = self._get_connection()
        try:
            cursor = conn.execute("SELECT COUNT(*) FROM papers")
            return cursor.fetchone()[0]
        finally:
            conn.close()
    
    def backup_database(self, backup_path: str) -> bool:
        """
        データベースをバックアップ
        
        Args:
            backup_path: バックアップ先のパス
            
        Returns:
            成功時True
        """
        import shutil
        try:
            os.makedirs(os.path.dirname(backup_path), exist_ok=True)
            shutil.copy2(self.db_path, backup_path)
            return True
        except Exception as e:
            print(f"バックアップエラー: {e}")
            return False


# テスト用コード
if __name__ == "__main__":
    # データベース初期化
    db = Database("data/test_papers.db")
    
    # サンプルデータ追加
    paper_id = db.add_paper(
        title="Deep Learning",
        author="Geoffrey Hinton",
        year=2015,
        memo="深層学習の基礎論文"
    )
    print(f"追加された論文ID: {paper_id}")
    
    # 全論文取得
    papers = db.get_all_papers()
    print(f"論文数: {len(papers)}")
    for paper in papers:
        print(f"  {paper['id']}: {paper['title']} by {paper['author']}")
    
    # 検索テスト
    results = db.search_papers("Deep", "title")
    print(f"検索結果: {len(results)}件")