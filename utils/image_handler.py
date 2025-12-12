"""
画像処理ハンドラー
画像の読み込み、リサイズ、サムネイル生成を提供
"""
from PIL import Image
import os
from typing import Optional, Tuple


class ImageHandler:
    """画像処理クラス"""
    
    # サポートする画像フォーマット
    SUPPORTED_FORMATS = ['.png', '.jpg', '.jpeg', '.bmp', '.gif', '.tiff']
    
    @staticmethod
    def is_valid_image(image_path: str) -> bool:
        """
        画像ファイルが有効かチェック
        
        Args:
            image_path: 画像ファイルパス
            
        Returns:
            有効な場合True
        """
        if not os.path.exists(image_path):
            return False
        
        ext = os.path.splitext(image_path)[1].lower()
        if ext not in ImageHandler.SUPPORTED_FORMATS:
            return False
        
        try:
            with Image.open(image_path) as img:
                img.verify()
            return True
        except Exception as e:
            print(f"画像検証エラー: {e}")
            return False
    
    @staticmethod
    def get_image_size(image_path: str) -> Optional[Tuple[int, int]]:
        """
        画像のサイズを取得
        
        Args:
            image_path: 画像ファイルパス
            
        Returns:
            (幅, 高さ) のタプル、失敗時None
        """
        try:
            with Image.open(image_path) as img:
                return img.size
        except Exception as e:
            print(f"画像サイズ取得エラー: {e}")
            return None
    
    @staticmethod
    def create_thumbnail(image_path: str, output_path: str, 
                        max_size: Tuple[int, int] = (200, 200)) -> bool:
        """
        サムネイルを生成
        
        Args:
            image_path: 入力画像パス
            output_path: 出力先パス
            max_size: 最大サイズ (幅, 高さ)
            
        Returns:
            成功時True
        """
        try:
            with Image.open(image_path) as img:
                # RGBに変換（透過情報があっても対応）
                if img.mode in ('RGBA', 'LA', 'P'):
                    # 白背景を作成
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    if img.mode == 'P':
                        img = img.convert('RGBA')
                    background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                    img = background
                elif img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # サムネイル作成
                img.thumbnail(max_size, Image.Resampling.LANCZOS)
                
                # 保存
                os.makedirs(os.path.dirname(output_path), exist_ok=True)
                img.save(output_path, 'PNG')
                
            return True
            
        except Exception as e:
            print(f"サムネイル生成エラー: {e}")
            return False
    
    @staticmethod
    def resize_image(image_path: str, output_path: str, 
                    size: Tuple[int, int], keep_aspect: bool = True) -> bool:
        """
        画像をリサイズ
        
        Args:
            image_path: 入力画像パス
            output_path: 出力先パス
            size: リサイズ後のサイズ (幅, 高さ)
            keep_aspect: アスペクト比を維持するか
            
        Returns:
            成功時True
        """
        try:
            with Image.open(image_path) as img:
                if keep_aspect:
                    img.thumbnail(size, Image.Resampling.LANCZOS)
                else:
                    img = img.resize(size, Image.Resampling.LANCZOS)
                
                # RGBに変換
                if img.mode in ('RGBA', 'LA', 'P'):
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    if img.mode == 'P':
                        img = img.convert('RGBA')
                    background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                    img = background
                elif img.mode != 'RGB':
                    img = img.convert('RGB')
                
                os.makedirs(os.path.dirname(output_path), exist_ok=True)
                img.save(output_path)
                
            return True
            
        except Exception as e:
            print(f"リサイズエラー: {e}")
            return False
    
    @staticmethod
    def get_image_data(image_path: str, max_size: Optional[Tuple[int, int]] = None) -> Optional[bytes]:
        """
        画像データをバイト列として取得
        
        Args:
            image_path: 画像ファイルパス
            max_size: 最大サイズ（指定時はリサイズ）
            
        Returns:
            画像データ（bytes）、失敗時None
        """
        try:
            with Image.open(image_path) as img:
                # リサイズが必要な場合
                if max_size:
                    img.thumbnail(max_size, Image.Resampling.LANCZOS)
                
                # RGBに変換
                if img.mode in ('RGBA', 'LA', 'P'):
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    if img.mode == 'P':
                        img = img.convert('RGBA')
                    background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                    img = background
                elif img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # バイト列に変換
                import io
                buffer = io.BytesIO()
                img.save(buffer, format='PNG')
                return buffer.getvalue()
                
        except Exception as e:
            print(f"画像データ取得エラー: {e}")
            return None
    
    @staticmethod
    def convert_format(image_path: str, output_path: str, 
                      output_format: str = 'PNG') -> bool:
        """
        画像形式を変換
        
        Args:
            image_path: 入力画像パス
            output_path: 出力先パス
            output_format: 出力形式（PNG, JPEG, BMPなど）
            
        Returns:
            成功時True
        """
        try:
            with Image.open(image_path) as img:
                # JPEGの場合はRGBに変換
                if output_format.upper() in ('JPEG', 'JPG'):
                    if img.mode in ('RGBA', 'LA', 'P'):
                        background = Image.new('RGB', img.size, (255, 255, 255))
                        if img.mode == 'P':
                            img = img.convert('RGBA')
                        background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                        img = background
                    elif img.mode != 'RGB':
                        img = img.convert('RGB')
                
                os.makedirs(os.path.dirname(output_path), exist_ok=True)
                img.save(output_path, format=output_format.upper())
                
            return True
            
        except Exception as e:
            print(f"形式変換エラー: {e}")
            return False


# テスト用コード
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        
        print(f"画像ファイル: {image_path}")
        print(f"有効: {ImageHandler.is_valid_image(image_path)}")
        
        size = ImageHandler.get_image_size(image_path)
        if size:
            print(f"サイズ: {size[0]} x {size[1]}")
        
        # サムネイル生成テスト
        output = "test_thumbnail.png"
        if ImageHandler.create_thumbnail(image_path, output):
            print(f"サムネイル生成成功: {output}")
    else:
        print("使用方法: python image_handler.py <画像ファイルパス>")