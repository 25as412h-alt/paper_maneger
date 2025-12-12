"""
論文の登録・編集ダイアログ
新規登録と既存データの編集の両方に対応
"""
from PySide6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QFormLayout,
    QLineEdit, QSpinBox, QTextEdit, QPushButton,
    QLabel, QFileDialog, QMessageBox, QGroupBox
)
from PySide6.QtCore import Qt
from PySide6.QtGui import QPixmap
import os


class EditDialog(QDialog):
    """論文登録・編集ダイアログ"""
    
    def __init__(self, parent=None, paper_data=None):
        """
        初期化
        
        Args:
            parent: 親ウィジェット
            paper_data: 編集する論文データ（新規登録時はNone）
        """
        super().__init__(parent)
        self.paper_data = paper_data
        self.is_edit_mode = paper_data is not None
        
        # 選択されたファイルパス
        self.selected_pdf_path = ""
        self.selected_image_path = ""
        
        self.init_ui()
        
        # 編集モードの場合、既存データを読み込み
        if self.is_edit_mode:
            self.load_data()
    
    def init_ui(self):
        """UIの初期化"""
        title = "論文情報の編集" if self.is_edit_mode else "新規論文登録"
        self.setWindowTitle(title)
        self.setMinimumWidth(600)
        self.setMinimumHeight(550)
        
        # メインレイアウト
        main_layout = QVBoxLayout(self)
        
        # 基本情報フォーム
        form_group = self._create_form_section()
        main_layout.addWidget(form_group)
        
        # ファイル選択セクション
        file_group = self._create_file_section()
        main_layout.addWidget(file_group)
        
        # メモセクション
        memo_group = self._create_memo_section()
        main_layout.addWidget(memo_group)
        
        # ボタン
        button_layout = self._create_buttons()
        main_layout.addLayout(button_layout)
    
    def _create_form_section(self) -> QGroupBox:
        """基本情報フォームの作成"""
        group = QGroupBox("基本情報")
        form_layout = QFormLayout()
        
        # タイトル（必須）
        self.title_input = QLineEdit()
        self.title_input.setPlaceholderText("論文のタイトルを入力してください（必須）")
        form_layout.addRow("タイトル *:", self.title_input)
        
        # 著者
        self.author_input = QLineEdit()
        self.author_input.setPlaceholderText("著者名を入力してください")
        form_layout.addRow("著者:", self.author_input)
        
        # 年
        self.year_input = QSpinBox()
        self.year_input.setRange(1900, 2100)
        self.year_input.setValue(2024)
        self.year_input.setSpecialValueText("未設定")
        form_layout.addRow("年:", self.year_input)
        
        group.setLayout(form_layout)
        return group
    
    def _create_file_section(self) -> QGroupBox:
        """ファイル選択セクションの作成"""
        group = QGroupBox("ファイル")
        layout = QVBoxLayout()
        
        # PDFファイル選択
        pdf_layout = QHBoxLayout()
        pdf_layout.addWidget(QLabel("PDF:"))
        
        self.pdf_path_label = QLabel("未選択")
        self.pdf_path_label.setStyleSheet("color: gray;")
        pdf_layout.addWidget(self.pdf_path_label, stretch=1)
        
        pdf_browse_btn = QPushButton("📁 参照")
        pdf_browse_btn.clicked.connect(self.browse_pdf)
        pdf_layout.addWidget(pdf_browse_btn)
        
        pdf_clear_btn = QPushButton("✕")
        pdf_clear_btn.setMaximumWidth(30)
        pdf_clear_btn.clicked.connect(self.clear_pdf)
        pdf_layout.addWidget(pdf_clear_btn)
        
        layout.addLayout(pdf_layout)
        
        # 画像ファイル選択
        image_layout = QHBoxLayout()
        image_layout.addWidget(QLabel("画像:"))
        
        self.image_path_label = QLabel("未選択")
        self.image_path_label.setStyleSheet("color: gray;")
        image_layout.addWidget(self.image_path_label, stretch=1)
        
        image_browse_btn = QPushButton("📁 参照")
        image_browse_btn.clicked.connect(self.browse_image)
        image_layout.addWidget(image_browse_btn)
        
        image_clear_btn = QPushButton("✕")
        image_clear_btn.setMaximumWidth(30)
        image_clear_btn.clicked.connect(self.clear_image)
        image_layout.addWidget(image_clear_btn)
        
        layout.addLayout(image_layout)
        
        # 画像プレビュー
        self.image_preview = QLabel()
        self.image_preview.setFixedSize(150, 150)
        self.image_preview.setStyleSheet(
            "border: 1px solid #ccc; background-color: #f5f5f5;"
        )
        self.image_preview.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.image_preview.setText("プレビュー")
        layout.addWidget(self.image_preview)
        
        group.setLayout(layout)
        return group
    
    def _create_memo_section(self) -> QGroupBox:
        """メモセクションの作成"""
        group = QGroupBox("メモ")
        layout = QVBoxLayout()
        
        self.memo_input = QTextEdit()
        self.memo_input.setPlaceholderText("メモや要約を入力してください...")
        self.memo_input.setMaximumHeight(120)
        layout.addWidget(self.memo_input)
        
        group.setLayout(layout)
        return group
    
    def _create_buttons(self) -> QHBoxLayout:
        """ボタンの作成"""
        layout = QHBoxLayout()
        layout.addStretch()
        
        # 保存ボタン
        save_btn = QPushButton("💾 保存")
        save_btn.setMinimumWidth(100)
        save_btn.clicked.connect(self.save)
        layout.addWidget(save_btn)
        
        # キャンセルボタン
        cancel_btn = QPushButton("✕ キャンセル")
        cancel_btn.setMinimumWidth(100)
        cancel_btn.clicked.connect(self.reject)
        layout.addWidget(cancel_btn)
        
        return layout
    
    def browse_pdf(self):
        """PDFファイルを選択"""
        file_path, _ = QFileDialog.getOpenFileName(
            self,
            "PDFファイルを選択",
            "",
            "PDF Files (*.pdf);;All Files (*)"
        )
        
        if file_path:
            self.selected_pdf_path = file_path
            file_name = os.path.basename(file_path)
            self.pdf_path_label.setText(file_name)
            self.pdf_path_label.setStyleSheet("color: black;")
    
    def clear_pdf(self):
        """PDF選択をクリア"""
        self.selected_pdf_path = ""
        self.pdf_path_label.setText("未選択")
        self.pdf_path_label.setStyleSheet("color: gray;")
    
    def browse_image(self):
        """画像ファイルを選択"""
        file_path, _ = QFileDialog.getOpenFileName(
            self,
            "画像ファイルを選択",
            "",
            "Image Files (*.png *.jpg *.jpeg *.bmp);;All Files (*)"
        )
        
        if file_path:
            self.selected_image_path = file_path
            file_name = os.path.basename(file_path)
            self.image_path_label.setText(file_name)
            self.image_path_label.setStyleSheet("color: black;")
            
            # プレビュー表示
            self.show_image_preview(file_path)
    
    def clear_image(self):
        """画像選択をクリア"""
        self.selected_image_path = ""
        self.image_path_label.setText("未選択")
        self.image_path_label.setStyleSheet("color: gray;")
        self.image_preview.clear()
        self.image_preview.setText("プレビュー")
    
    def show_image_preview(self, image_path: str):
        """画像プレビューを表示"""
        try:
            pixmap = QPixmap(image_path)
            if not pixmap.isNull():
                scaled_pixmap = pixmap.scaled(
                    150, 150,
                    Qt.AspectRatioMode.KeepAspectRatio,
                    Qt.TransformationMode.SmoothTransformation
                )
                self.image_preview.setPixmap(scaled_pixmap)
        except Exception as e:
            print(f"画像プレビューエラー: {e}")
            self.image_preview.setText("読込失敗")
    
    def load_data(self):
        """既存データを読み込み（編集モード）"""
        if not self.paper_data:
            return
        
        # 基本情報
        self.title_input.setText(self.paper_data.get('title', ''))
        self.author_input.setText(self.paper_data.get('author', ''))
        
        year = self.paper_data.get('year')
        if year:
            self.year_input.setValue(year)
        
        # ファイルパス
        pdf_path = self.paper_data.get('pdf_path', '')
        if pdf_path:
            self.selected_pdf_path = pdf_path
            self.pdf_path_label.setText(os.path.basename(pdf_path))
            self.pdf_path_label.setStyleSheet("color: black;")
        
        image_path = self.paper_data.get('image_path', '')
        if image_path:
            self.selected_image_path = image_path
            self.image_path_label.setText(os.path.basename(image_path))
            self.image_path_label.setStyleSheet("color: black;")
            
            # プレビュー表示
            if os.path.exists(image_path):
                self.show_image_preview(image_path)
        
        # メモ
        self.memo_input.setPlainText(self.paper_data.get('memo', ''))
    
    def validate(self) -> bool:
        """入力検証"""
        title = self.title_input.text().strip()
        
        if not title:
            QMessageBox.warning(
                self,
                "入力エラー",
                "タイトルは必須項目です。"
            )
            self.title_input.setFocus()
            return False
        
        return True
    
    def save(self):
        """データを保存"""
        if not self.validate():
            return
        
        # ダイアログを閉じる
        self.accept()
    
    def get_data(self) -> dict:
        """入力されたデータを取得"""
        return {
            'title': self.title_input.text().strip(),
            'author': self.author_input.text().strip(),
            'year': self.year_input.value() if self.year_input.value() > 1900 else None,
            'pdf_path': self.selected_pdf_path,
            'image_path': self.selected_image_path,
            'memo': self.memo_input.toPlainText().strip()
        }


# テスト用コード
if __name__ == "__main__":
    from PySide6.QtWidgets import QApplication
    import sys
    
    app = QApplication(sys.argv)
    
    # 新規登録ダイアログ
    dialog = EditDialog()
    if dialog.exec() == QDialog.DialogCode.Accepted:
        data = dialog.get_data()
        print("入力データ:", data)
    
    sys.exit()