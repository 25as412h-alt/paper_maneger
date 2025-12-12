"""
論文詳細表示ダイアログ
タブ形式で論文の詳細情報を表示
"""
from PySide6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QTabWidget,
    QLabel, QTextEdit, QPushButton, QScrollArea, QWidget,
    QFormLayout, QGroupBox, QMessageBox
)
from PySide6.QtCore import Qt
from PySide6.QtGui import QPixmap
import os
import sys

# 親ディレクトリをパスに追加
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.pdf_handler import PDFHandler
from utils.image_handler import ImageHandler


class DetailDialog(QDialog):
    """論文詳細表示ダイアログ"""
    
    def __init__(self, parent=None, paper_data=None):
        """
        初期化
        
        Args:
            parent: 親ウィジェット
            paper_data: 論文データ
        """
        super().__init__(parent)
        self.paper_data = paper_data
        self.init_ui()
        
        if paper_data:
            self.load_data()
    
    def init_ui(self):
        """UIの初期化"""
        self.setWindowTitle("論文詳細")
        self.setMinimumSize(800, 600)
        
        main_layout = QVBoxLayout(self)
        
        # タブウィジェット
        self.tab_widget = QTabWidget()
        
        # 各タブを作成
        self.tab_widget.addTab(self._create_basic_tab(), "📋 基本情報")
        self.tab_widget.addTab(self._create_memo_tab(), "📝 メモ")
        self.tab_widget.addTab(self._create_preview_tab(), "👁️ プレビュー")
        self.tab_widget.addTab(self._create_metadata_tab(), "ℹ️ メタデータ")
        
        main_layout.addWidget(self.tab_widget)
        
        # ボタン
        button_layout = self._create_buttons()
        main_layout.addLayout(button_layout)
    
    def _create_basic_tab(self) -> QWidget:
        """基本情報タブの作成"""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        
        # 基本情報グループ
        group = QGroupBox("基本情報")
        form_layout = QFormLayout()
        
        # ID
        self.id_label = QLabel()
        form_layout.addRow("ID:", self.id_label)
        
        # タイトル
        self.title_label = QLabel()
        self.title_label.setWordWrap(True)
        self.title_label.setStyleSheet("font-weight: bold; font-size: 14px;")
        form_layout.addRow("タイトル:", self.title_label)
        
        # 著者
        self.author_label = QLabel()
        self.author_label.setWordWrap(True)
        form_layout.addRow("著者:", self.author_label)
        
        # 年
        self.year_label = QLabel()
        form_layout.addRow("年:", self.year_label)
        
        # 登録日
        self.created_label = QLabel()
        form_layout.addRow("登録日:", self.created_label)
        
        # 更新日
        self.updated_label = QLabel()
        form_layout.addRow("更新日:", self.updated_label)
        
        group.setLayout(form_layout)
        layout.addWidget(group)
        
        # ファイル情報グループ
        file_group = QGroupBox("ファイル")
        file_layout = QVBoxLayout()
        
        # PDFパス
        pdf_layout = QHBoxLayout()
        pdf_layout.addWidget(QLabel("PDF:"))
        self.pdf_path_label = QLabel()
        self.pdf_path_label.setWordWrap(True)
        self.pdf_path_label.setStyleSheet("color: #666;")
        pdf_layout.addWidget(self.pdf_path_label, stretch=1)
        
        self.open_pdf_btn = QPushButton("📄 開く")
        self.open_pdf_btn.clicked.connect(self.open_pdf)
        pdf_layout.addWidget(self.open_pdf_btn)
        
        file_layout.addLayout(pdf_layout)
        
        # 画像パス
        image_layout = QHBoxLayout()
        image_layout.addWidget(QLabel("画像:"))
        self.image_path_label = QLabel()
        self.image_path_label.setWordWrap(True)
        self.image_path_label.setStyleSheet("color: #666;")
        image_layout.addWidget(self.image_path_label, stretch=1)
        
        self.open_image_btn = QPushButton("🖼️ 開く")
        self.open_image_btn.clicked.connect(self.open_image)
        image_layout.addWidget(self.open_image_btn)
        
        file_layout.addLayout(image_layout)
        
        file_group.setLayout(file_layout)
        layout.addWidget(file_group)
        
        layout.addStretch()
        
        return widget
    
    def _create_memo_tab(self) -> QWidget:
        """メモタブの作成"""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        
        self.memo_text = QTextEdit()
        self.memo_text.setReadOnly(True)
        layout.addWidget(self.memo_text)
        
        return widget
    
    def _create_preview_tab(self) -> QWidget:
        """プレビュータブの作成"""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        
        # スクロールエリア
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setAlignment(Qt.AlignmentFlag.AlignCenter)
        
        # プレビューラベル
        self.preview_label = QLabel()
        self.preview_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.preview_label.setText("プレビューを読み込み中...")
        
        scroll.setWidget(self.preview_label)
        layout.addWidget(scroll)
        
        # プレビュー切り替えボタン
        button_layout = QHBoxLayout()
        
        self.show_pdf_btn = QPushButton("PDF表示")
        self.show_pdf_btn.clicked.connect(self.show_pdf_preview)
        button_layout.addWidget(self.show_pdf_btn)
        
        self.show_image_btn = QPushButton("画像表示")
        self.show_image_btn.clicked.connect(self.show_image_preview)
        button_layout.addWidget(self.show_image_btn)
        
        button_layout.addStretch()
        
        layout.addLayout(button_layout)
        
        return widget
    
    def _create_metadata_tab(self) -> QWidget:
        """メタデータタブの作成"""
        widget = QWidget()
        layout = QVBoxLayout(widget)
        
        self.metadata_text = QTextEdit()
        self.metadata_text.setReadOnly(True)
        self.metadata_text.setFontFamily("Courier New")
        layout.addWidget(self.metadata_text)
        
        return widget
    
    def _create_buttons(self) -> QHBoxLayout:
        """ボタンの作成"""
        layout = QHBoxLayout()
        layout.addStretch()
        
        # 編集ボタン
        edit_btn = QPushButton("✏️ 編集")
        edit_btn.setMinimumWidth(100)
        edit_btn.clicked.connect(self.edit_paper)
        layout.addWidget(edit_btn)
        
        # 閉じるボタン
        close_btn = QPushButton("閉じる")
        close_btn.setMinimumWidth(100)
        close_btn.clicked.connect(self.accept)
        layout.addWidget(close_btn)
        
        return layout
    
    def load_data(self):
        """データを読み込み"""
        if not self.paper_data:
            return
        
        # 基本情報
        self.id_label.setText(str(self.paper_data.get('id', '')))
        self.title_label.setText(self.paper_data.get('title', ''))
        self.author_label.setText(self.paper_data.get('author', ''))
        
        year = self.paper_data.get('year')
        self.year_label.setText(str(year) if year else "未設定")
        
        self.created_label.setText(self.paper_data.get('created_at', ''))
        self.updated_label.setText(self.paper_data.get('updated_at', ''))
        
        # ファイルパス
        pdf_path = self.paper_data.get('pdf_path', '')
        if pdf_path:
            self.pdf_path_label.setText(pdf_path)
            self.open_pdf_btn.setEnabled(os.path.exists(pdf_path))
        else:
            self.pdf_path_label.setText("未設定")
            self.open_pdf_btn.setEnabled(False)
        
        image_path = self.paper_data.get('image_path', '')
        if image_path:
            self.image_path_label.setText(image_path)
            self.open_image_btn.setEnabled(os.path.exists(image_path))
        else:
            self.image_path_label.setText("未設定")
            self.open_image_btn.setEnabled(False)
        
        # メモ
        self.memo_text.setPlainText(self.paper_data.get('memo', ''))
        
        # プレビュー読み込み
        self.load_preview()
        
        # メタデータ読み込み
        self.load_metadata()
    
    def load_preview(self):
        """プレビューを読み込み"""
        # まず画像があればそれを表示
        image_path = self.paper_data.get('image_path', '')
        if image_path and os.path.exists(image_path):
            self.show_image_preview()
        else:
            # 画像がなければPDFのプレビュー
            pdf_path = self.paper_data.get('pdf_path', '')
            if pdf_path and os.path.exists(pdf_path):
                self.show_pdf_preview()
            else:
                self.preview_label.setText("プレビューできるファイルがありません")
    
    def show_pdf_preview(self):
        """PDFプレビューを表示"""
        pdf_path = self.paper_data.get('pdf_path', '')
        
        if not pdf_path or not os.path.exists(pdf_path):
            self.preview_label.setText("PDFファイルが見つかりません")
            return
        
        try:
            # PDFの1ページ目を画像として取得
            image_data = PDFHandler.get_page_as_image_data(pdf_path, 0, zoom=2.0)
            
            if image_data:
                pixmap = QPixmap()
                pixmap.loadFromData(image_data)
                
                # 画面に収まるようにスケール
                scaled_pixmap = pixmap.scaled(
                    700, 900,
                    Qt.AspectRatioMode.KeepAspectRatio,
                    Qt.TransformationMode.SmoothTransformation
                )
                
                self.preview_label.setPixmap(scaled_pixmap)
            else:
                self.preview_label.setText("PDFの読み込みに失敗しました")
                
        except Exception as e:
            print(f"PDFプレビューエラー: {e}")
            self.preview_label.setText(f"エラー: {str(e)}")
    
    def show_image_preview(self):
        """画像プレビューを表示"""
        image_path = self.paper_data.get('image_path', '')
        
        if not image_path or not os.path.exists(image_path):
            self.preview_label.setText("画像ファイルが見つかりません")
            return
        
        try:
            pixmap = QPixmap(image_path)
            
            if not pixmap.isNull():
                # 画面に収まるようにスケール
                scaled_pixmap = pixmap.scaled(
                    700, 900,
                    Qt.AspectRatioMode.KeepAspectRatio,
                    Qt.TransformationMode.SmoothTransformation
                )
                
                self.preview_label.setPixmap(scaled_pixmap)
            else:
                self.preview_label.setText("画像の読み込みに失敗しました")
                
        except Exception as e:
            print(f"画像プレビューエラー: {e}")
            self.preview_label.setText(f"エラー: {str(e)}")
    
    def load_metadata(self):
        """メタデータを読み込み"""
        metadata_text = "=== ファイル情報 ===\n\n"
        
        # PDFメタデータ
        pdf_path = self.paper_data.get('pdf_path', '')
        if pdf_path and os.path.exists(pdf_path):
            metadata_text += f"PDFファイル: {pdf_path}\n"
            
            if PDFHandler.is_valid_pdf(pdf_path):
                page_count = PDFHandler.get_page_count(pdf_path)
                metadata_text += f"ページ数: {page_count}\n"
                
                pdf_metadata = PDFHandler.get_metadata(pdf_path)
                if pdf_metadata:
                    metadata_text += "\n--- PDFメタデータ ---\n"
                    for key, value in pdf_metadata.items():
                        if value:
                            metadata_text += f"{key}: {value}\n"
            else:
                metadata_text += "※ PDFファイルが破損している可能性があります\n"
        
        # 画像情報
        image_path = self.paper_data.get('image_path', '')
        if image_path and os.path.exists(image_path):
            metadata_text += f"\n画像ファイル: {image_path}\n"
            
            if ImageHandler.is_valid_image(image_path):
                size = ImageHandler.get_image_size(image_path)
                if size:
                    metadata_text += f"画像サイズ: {size[0]} x {size[1]} px\n"
            else:
                metadata_text += "※ 画像ファイルが破損している可能性があります\n"
        
        self.metadata_text.setPlainText(metadata_text)
    
    def open_pdf(self):
        """PDFファイルを外部アプリで開く"""
        pdf_path = self.paper_data.get('pdf_path', '')
        
        if not pdf_path or not os.path.exists(pdf_path):
            QMessageBox.warning(self, "エラー", "PDFファイルが見つかりません")
            return
        
        try:
            import subprocess
            import platform
            
            system = platform.system()
            if system == "Windows":
                os.startfile(pdf_path)
            elif system == "Darwin":  # macOS
                subprocess.run(["open", pdf_path])
            else:  # Linux
                subprocess.run(["xdg-open", pdf_path])
                
        except Exception as e:
            QMessageBox.critical(self, "エラー", f"ファイルを開けませんでした:\n{str(e)}")
    
    def open_image(self):
        """画像ファイルを外部アプリで開く"""
        image_path = self.paper_data.get('image_path', '')
        
        if not image_path or not os.path.exists(image_path):
            QMessageBox.warning(self, "エラー", "画像ファイルが見つかりません")
            return
        
        try:
            import subprocess
            import platform
            
            system = platform.system()
            if system == "Windows":
                os.startfile(image_path)
            elif system == "Darwin":  # macOS
                subprocess.run(["open", image_path])
            else:  # Linux
                subprocess.run(["xdg-open", image_path])
                
        except Exception as e:
            QMessageBox.critical(self, "エラー", f"ファイルを開けませんでした:\n{str(e)}")
    
    def edit_paper(self):
        """編集ダイアログを開く"""
        # 編集機能は親ウィンドウで処理
        self.done(2)  # カスタムリターンコード


# テスト用コード
if __name__ == "__main__":
    from PySide6.QtWidgets import QApplication
    
    app = QApplication(sys.argv)
    
    # テストデータ
    test_data = {
        'id': 1,
        'title': 'Deep Learning',
        'author': 'Geoffrey Hinton',
        'year': 2015,
        'pdf_path': '',
        'image_path': '',
        'memo': 'これはテストメモです',
        'created_at': '2024-12-01 10:00:00',
        'updated_at': '2024-12-05 15:30:00'
    }
    
    dialog = DetailDialog(None, test_data)
    dialog.exec()
    
    sys.exit()