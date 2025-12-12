"""
PDF処理ハンドラー
PDFの読み込み、サムネイル生成、プレビュー機能を提供
"""
import fitz  # PyMuPDF
from PIL import Image
import io
import os
from typing import Optional, Tuple


class PDFHandler:
    """PDF処理クラス"""
    
    @staticmethod
    def is_valid_pdf(pdf_path: str) -> bool:
        """
        PDFファイルが有効かチェック
        
        Args:
            pdf_path: PDFファイルパス
            
        Returns:
            有効な場合True
        """
        if not os.path.exists(pdf_path):
            return False
        
        try:
            doc = fitz.open(pdf_path)
            page_count = len(doc)
            doc.close()
            return page_count > 0
        except Exception as e:
            print(f"PDF検証エラー: {e}")
            return False
    
    @staticmethod
    def get_page_count(pdf_path: str) -> int:
        """
        PDFのページ数を取得
        
        Args:
            pdf_path: PDFファイルパス
            
        Returns:
            ページ数
        """
        try:
            doc = fitz.open(pdf_path)
            count = len(doc)
            doc.close()
            return count
        except Exception as e:
            print(f"ページ数取得エラー: {e}")
            return 0
    
    @staticmethod
    def generate_thumbnail(pdf_path: str, output_path: str, 
                          page_num: int = 0, max_size: Tuple[int, int] = (200, 200)) -> bool:
        """
        PDFの指定ページからサムネイルを生成
        
        Args:
            pdf_path: PDFファイルパス
            output_path: 出力先パス
            page_num: ページ番号（0始まり）
            max_size: 最大サイズ (幅, 高さ)
            
        Returns:
            成功時True
        """
        try:
            # PDFを開く
            doc = fitz.open(pdf_path)
            
            if page_num >= len(doc):
                page_num = 0
            
            # 指定ページを取得
            page = doc[page_num]
            
            # 画像に変換（解像度150dpi）
            zoom = 150 / 72  # 72dpiがデフォルト
            mat = fitz.Matrix(zoom, zoom)
            pix = page.get_pixmap(matrix=mat)
            
            # PIL Imageに変換
            img_data = pix.tobytes("png")
            img = Image.open(io.BytesIO(img_data))
            
            # リサイズ
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # 保存
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            img.save(output_path, "PNG")
            
            doc.close()
            return True
            
        except Exception as e:
            print(f"サムネイル生成エラー: {e}")
            return False
    
    @staticmethod
    def get_page_as_pixmap(pdf_path: str, page_num: int = 0, 
                          zoom: float = 1.0) -> Optional[fitz.Pixmap]:
        """
        PDFページをPixmapとして取得
        
        Args:
            pdf_path: PDFファイルパス
            page_num: ページ番号（0始まり）
            zoom: ズーム倍率
            
        Returns:
            Pixmapオブジェクト、失敗時None
        """
        try:
            doc = fitz.open(pdf_path)
            
            if page_num >= len(doc):
                page_num = 0
            
            page = doc[page_num]
            mat = fitz.Matrix(zoom, zoom)
            pix = page.get_pixmap(matrix=mat)
            
            doc.close()
            return pix
            
        except Exception as e:
            print(f"Pixmap取得エラー: {e}")
            return None
    
    @staticmethod
    def get_page_as_image_data(pdf_path: str, page_num: int = 0, 
                               zoom: float = 1.5) -> Optional[bytes]:
        """
        PDFページをPNG画像データとして取得
        
        Args:
            pdf_path: PDFファイルパス
            page_num: ページ番号（0始まり）
            zoom: ズーム倍率
            
        Returns:
            PNG画像データ（bytes）、失敗時None
        """
        try:
            doc = fitz.open(pdf_path)
            
            if page_num >= len(doc):
                page_num = 0
            
            page = doc[page_num]
            mat = fitz.Matrix(zoom, zoom)
            pix = page.get_pixmap(matrix=mat)
            
            # PNG形式のバイトデータに変換
            img_data = pix.tobytes("png")
            
            doc.close()
            return img_data
            
        except Exception as e:
            print(f"画像データ取得エラー: {e}")
            return None
    
    @staticmethod
    def extract_text(pdf_path: str, page_num: int = 0) -> str:
        """
        PDFページからテキストを抽出
        
        Args:
            pdf_path: PDFファイルパス
            page_num: ページ番号（0始まり）
            
        Returns:
            抽出されたテキスト
        """
        try:
            doc = fitz.open(pdf_path)
            
            if page_num >= len(doc):
                page_num = 0
            
            page = doc[page_num]
            text = page.get_text()
            
            doc.close()
            return text
            
        except Exception as e:
            print(f"テキスト抽出エラー: {e}")
            return ""
    
    @staticmethod
    def get_metadata(pdf_path: str) -> dict:
        """
        PDFのメタデータを取得
        
        Args:
            pdf_path: PDFファイルパス
            
        Returns:
            メタデータ辞書
        """
        try:
            doc = fitz.open(pdf_path)
            metadata = doc.metadata
            doc.close()
            return metadata
        except Exception as e:
            print(f"メタデータ取得エラー: {e}")
            return {}


# テスト用コード
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        pdf_path = sys.argv[1]
        
        print(f"PDFファイル: {pdf_path}")
        print(f"有効: {PDFHandler.is_valid_pdf(pdf_path)}")
        print(f"ページ数: {PDFHandler.get_page_count(pdf_path)}")
        
        # サムネイル生成テスト
        output = "test_thumbnail.png"
        if PDFHandler.generate_thumbnail(pdf_path, output):
            print(f"サムネイル生成成功: {output}")
        
        # メタデータ取得
        metadata = PDFHandler.get_metadata(pdf_path)
        print(f"メタデータ: {metadata}")
    else:
        print("使用方法: python pdf_handler.py <PDFファイルパス>")