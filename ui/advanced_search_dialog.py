"""
高度な検索ダイアログ
複数条件での検索機能を提供
"""
from PySide6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QFormLayout,
    QLineEdit, QSpinBox, QPushButton, QLabel, QGroupBox
)
from PySide6.QtCore import Qt


class AdvancedSearchDialog(QDialog):
    """高度な検索ダイアログ"""
    
    def __init__(self, parent=None):
        """初期化"""
        super().__init__(parent)
        self.init_ui()
    
    def init_ui(self):
        """UIの初期化"""
        self.setWindowTitle("高度な検索")
        self.setMinimumWidth(500)
        
        main_layout = QVBoxLayout(self)
        
        # 検索条件フォーム
        form_group = self._create_form_section()
        main_layout.addWidget(form_group)
        
        # ボタン
        button_layout = self._create_buttons()
        main_layout.addLayout(button_layout)
    
    def _create_form_section(self) -> QGroupBox:
        """検索条件フォームの作成"""
        group = QGroupBox("検索条件")
        form_layout = QFormLayout()
        
        # タイトル
        self.title_input = QLineEdit()
        self.title_input.setPlaceholderText("タイトルに含まれるキーワード")
        form_layout.addRow("タイトル:", self.title_input)
        
        # 著者
        self.author_input = QLineEdit()
        self.author_input.setPlaceholderText("著者名")
        form_layout.addRow("著者:", self.author_input)
        
        # 年範囲
        year_layout = QHBoxLayout()
        
        self.year_from_input = QSpinBox()
        self.year_from_input.setRange(1900, 2100)
        self.year_from_input.setValue(1900)
        self.year_from_input.setSpecialValueText("指定なし")
        year_layout.addWidget(self.year_from_input)
        
        year_layout.addWidget(QLabel("～"))
        
        self.year_to_input = QSpinBox()
        self.year_to_input.setRange(1900, 2100)
        self.year_to_input.setValue(2100)
        self.year_to_input.setSpecialValueText("指定なし")
        year_layout.addWidget(self.year_to_input)
        
        form_layout.addRow("年:", year_layout)
        
        # メモ
        self.memo_input = QLineEdit()
        self.memo_input.setPlaceholderText("メモに含まれるキーワード")
        form_layout.addRow("メモ:", self.memo_input)
        
        group.setLayout(form_layout)
        return group
    
    def _create_buttons(self) -> QHBoxLayout:
        """ボタンの作成"""
        layout = QHBoxLayout()
        
        # クリアボタン
        clear_btn = QPushButton("クリア")
        clear_btn.clicked.connect(self.clear_fields)
        layout.addWidget(clear_btn)
        
        layout.addStretch()
        
        # 検索ボタン
        search_btn = QPushButton("🔍 検索")
        search_btn.setMinimumWidth(100)
        search_btn.clicked.connect(self.accept)
        search_btn.setDefault(True)
        layout.addWidget(search_btn)
        
        # キャンセルボタン
        cancel_btn = QPushButton("キャンセル")
        cancel_btn.setMinimumWidth(100)
        cancel_btn.clicked.connect(self.reject)
        layout.addWidget(cancel_btn)
        
        return layout
    
    def clear_fields(self):
        """入力フィールドをクリア"""
        self.title_input.clear()
        self.author_input.clear()
        self.year_from_input.setValue(1900)
        self.year_to_input.setValue(2100)
        self.memo_input.clear()
    
    def get_search_criteria(self) -> dict:
        """検索条件を取得"""
        return {
            'title': self.title_input.text().strip(),
            'author': self.author_input.text().strip(),
            'year_from': self.year_from_input.value() if self.year_from_input.value() > 1900 else None,
            'year_to': self.year_to_input.value() if self.year_to_input.value() < 2100 else None,
            'memo': self.memo_input.text().strip()
        }
    
    def has_criteria(self) -> bool:
        """検索条件が入力されているかチェック"""
        criteria = self.get_search_criteria()
        return any([
            criteria['title'],
            criteria['author'],
            criteria['year_from'] is not None,
            criteria['year_to'] is not None,
            criteria['memo']
        ])


# テスト用コード
if __name__ == "__main__":
    from PySide6.QtWidgets import QApplication
    import sys
    
    app = QApplication(sys.argv)
    
    dialog = AdvancedSearchDialog()
    if dialog.exec() == QDialog.DialogCode.Accepted:
        criteria = dialog.get_search_criteria()
        print("検索条件:", criteria)
    
    sys.exit()