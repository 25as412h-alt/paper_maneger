"""
メインウィンドウの実装
論文一覧表示、検索、CRUD操作のUIを提供
"""
from PySide6.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QHBoxLayout, QPushButton,
    QTableWidget, QTableWidgetItem, QLineEdit, QComboBox, QMessageBox,
    QLabel, QHeaderView, QAbstractItemView
)
from PySide6.QtCore import Qt, Signal
from PySide6.QtGui import QAction, QKeySequence
import sys
import os

# 親ディレクトリをパスに追加
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from models.database import Database


class MainWindow(QMainWindow):
    """メインウィンドウクラス"""
    
    def __init__(self):
        super().__init__()
        self.db = Database()
        self.current_sort_column = "id"
        self.current_sort_desc = False
        self.init_ui()
        self.load_papers()
    
    def init_ui(self):
        """UIの初期化"""
        self.setWindowTitle("学術論文管理システム")
        self.setGeometry(100, 100, 1200, 700)
        
        # メニューバー
        self._create_menu_bar()
        
        # 中央ウィジェット
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        # メインレイアウト
        main_layout = QVBoxLayout(central_widget)
        
        # 検索バー
        search_layout = self._create_search_bar()
        main_layout.addLayout(search_layout)
        
        # ツールバー
        toolbar_layout = self._create_toolbar()
        main_layout.addLayout(toolbar_layout)
        
        # テーブル
        self.table = self._create_table()
        main_layout.addWidget(self.table)
        
        # ステータスバー
        self.statusBar().showMessage("準備完了")
    
    def _create_menu_bar(self):
        """メニューバーの作成"""
        menubar = self.menuBar()
        
        # ファイルメニュー
        file_menu = menubar.addMenu("ファイル(&F)")
        
        # 新規登録
        new_action = QAction("新規登録(&N)", self)
        new_action.setShortcut(QKeySequence("Ctrl+N"))
        new_action.triggered.connect(self.add_paper)
        file_menu.addAction(new_action)
        
        file_menu.addSeparator()
        
        # バックアップ
        backup_action = QAction("バックアップ(&B)", self)
        backup_action.triggered.connect(self.backup_database)
        file_menu.addAction(backup_action)
        
        file_menu.addSeparator()
        
        # 終了
        exit_action = QAction("終了(&X)", self)
        exit_action.setShortcut(QKeySequence("Ctrl+Q"))
        exit_action.triggered.connect(self.close)
        file_menu.addAction(exit_action)
        
        # 編集メニュー
        edit_menu = menubar.addMenu("編集(&E)")
        
        # 編集
        edit_action = QAction("編集(&E)", self)
        edit_action.setShortcut(QKeySequence("Ctrl+E"))
        edit_action.triggered.connect(self.edit_paper)
        edit_menu.addAction(edit_action)
        
        # 削除
        delete_action = QAction("削除(&D)", self)
        delete_action.setShortcut(QKeySequence("Delete"))
        delete_action.triggered.connect(self.delete_paper)
        edit_menu.addAction(delete_action)
        
        # 表示メニュー
        view_menu = menubar.addMenu("表示(&V)")
        
        # 更新
        refresh_action = QAction("更新(&R)", self)
        refresh_action.setShortcut(QKeySequence("F5"))
        refresh_action.triggered.connect(self.load_papers)
        view_menu.addAction(refresh_action)
        
        # ヘルプメニュー
        help_menu = menubar.addMenu("ヘルプ(&H)")
        
        # バージョン情報
        about_action = QAction("バージョン情報(&A)", self)
        about_action.triggered.connect(self.show_about)
        help_menu.addAction(about_action)
    
    def _create_search_bar(self) -> QHBoxLayout:
        """検索バーの作成"""
        layout = QHBoxLayout()
        
        # 検索ラベル
        search_label = QLabel("🔍 検索:")
        layout.addWidget(search_label)
        
        # 検索フィールド選択
        self.search_field_combo = QComboBox()
        self.search_field_combo.addItems(["タイトル", "著者", "メモ", "全体"])
        self.search_field_combo.setCurrentIndex(0)
        layout.addWidget(self.search_field_combo)
        
        # 検索入力欄
        self.search_input = QLineEdit()
        self.search_input.setPlaceholderText("検索キーワードを入力...")
        self.search_input.returnPressed.connect(self.search_papers)
        layout.addWidget(self.search_input, stretch=1)
        
        # 検索ボタン
        search_btn = QPushButton("検索")
        search_btn.clicked.connect(self.search_papers)
        layout.addWidget(search_btn)
        
        # 高度な検索ボタン
        advanced_btn = QPushButton("詳細検索...")
        advanced_btn.clicked.connect(self.advanced_search)
        layout.addWidget(advanced_btn)
        
        # クリアボタン
        clear_btn = QPushButton("クリア")
        clear_btn.clicked.connect(self.clear_search)
        layout.addWidget(clear_btn)
        
        return layout
    
    def _create_toolbar(self) -> QHBoxLayout:
        """ツールバーの作成"""
        layout = QHBoxLayout()
        
        # 新規登録ボタン
        add_btn = QPushButton("➕ 新規登録")
        add_btn.clicked.connect(self.add_paper)
        layout.addWidget(add_btn)
        
        # 編集ボタン
        edit_btn = QPushButton("✏️ 編集")
        edit_btn.clicked.connect(self.edit_paper)
        layout.addWidget(edit_btn)
        
        # 削除ボタン
        delete_btn = QPushButton("🗑️ 削除")
        delete_btn.clicked.connect(self.delete_paper)
        layout.addWidget(delete_btn)
        
        # スペーサー
        layout.addStretch()
        
        # 更新ボタン
        refresh_btn = QPushButton("↻ 更新")
        refresh_btn.clicked.connect(self.load_papers)
        layout.addWidget(refresh_btn)
        
        return layout
    
    def _create_table(self) -> QTableWidget:
        """テーブルの作成"""
        table = QTableWidget()
        
        # 列設定
        columns = ["ID", "タイトル", "著者", "年", "登録日", "更新日"]
        table.setColumnCount(len(columns))
        table.setHorizontalHeaderLabels(columns)
        
        # テーブル設定
        table.setSelectionBehavior(QAbstractItemView.SelectionBehavior.SelectRows)
        table.setSelectionMode(QAbstractItemView.SelectionMode.SingleSelection)
        table.setEditTriggers(QAbstractItemView.EditTrigger.NoEditTriggers)
        table.setAlternatingRowColors(True)
        
        # 列幅調整
        header = table.horizontalHeader()
        header.setSectionResizeMode(0, QHeaderView.ResizeMode.ResizeToContents)  # ID
        header.setSectionResizeMode(1, QHeaderView.ResizeMode.Stretch)  # タイトル
        header.setSectionResizeMode(2, QHeaderView.ResizeMode.ResizeToContents)  # 著者
        header.setSectionResizeMode(3, QHeaderView.ResizeMode.ResizeToContents)  # 年
        header.setSectionResizeMode(4, QHeaderView.ResizeMode.ResizeToContents)  # 登録日
        header.setSectionResizeMode(5, QHeaderView.ResizeMode.ResizeToContents)  # 更新日
        
        # ソート有効化
        table.setSortingEnabled(True)
        header.sectionClicked.connect(self.on_header_clicked)
        
        # ダブルクリックで詳細表示（Phase 2で実装）
        table.doubleClicked.connect(self.show_detail)
        
        return table
    
    def load_papers(self, papers=None):
        """論文一覧をテーブルに読み込み"""
        if papers is None:
            papers = self.db.get_all_papers(
                order_by=self.current_sort_column,
                order_desc=self.current_sort_desc
            )
        
        self.table.setRowCount(len(papers))
        
        for row_idx, paper in enumerate(papers):
            # ID
            self.table.setItem(row_idx, 0, QTableWidgetItem(str(paper['id'])))
            
            # タイトル
            title = paper['title'] or ""
            self.table.setItem(row_idx, 1, QTableWidgetItem(title))
            
            # 著者
            author = paper['author'] or ""
            self.table.setItem(row_idx, 2, QTableWidgetItem(author))
            
            # 年
            year = str(paper['year']) if paper['year'] else ""
            self.table.setItem(row_idx, 3, QTableWidgetItem(year))
            
            # 登録日
            created = paper['created_at'][:10] if paper['created_at'] else ""
            self.table.setItem(row_idx, 4, QTableWidgetItem(created))
            
            # 更新日
            updated = paper['updated_at'][:10] if paper['updated_at'] else ""
            self.table.setItem(row_idx, 5, QTableWidgetItem(updated))
        
        # ステータスバー更新
        count = len(papers)
        total = self.db.get_paper_count()
        self.statusBar().showMessage(f"表示: {count}件 / 全{total}件")
    
    def on_header_clicked(self, logical_index):
        """ヘッダークリック時のソート処理"""
        column_map = {
            0: "id",
            1: "title",
            2: "author",
            3: "year",
            4: "created_at",
            5: "updated_at"
        }
        
        column = column_map.get(logical_index, "id")
        
        # 同じ列なら昇順/降順切り替え
        if self.current_sort_column == column:
            self.current_sort_desc = not self.current_sort_desc
        else:
            self.current_sort_column = column
            self.current_sort_desc = False
        
        self.load_papers()
    
    def search_papers(self):
        """論文を検索"""
        keyword = self.search_input.text().strip()
        
        if not keyword:
            QMessageBox.warning(self, "警告", "検索キーワードを入力してください")
            return
        
        # 検索フィールドを取得
        field_map = {
            "タイトル": "title",
            "著者": "author",
            "メモ": "memo",
            "全体": "all"
        }
        field = field_map[self.search_field_combo.currentText()]
        
        # 検索実行
        results = self.db.search_papers(keyword, field)
        self.load_papers(results)
        
        # ステータス更新
        self.statusBar().showMessage(f"検索結果: {len(results)}件 (キーワード: '{keyword}')")
    
    def advanced_search(self):
        """高度な検索"""
        from ui.advanced_search_dialog import AdvancedSearchDialog
        
        dialog = AdvancedSearchDialog(self)
        if dialog.exec() == AdvancedSearchDialog.DialogCode.Accepted:
            if not dialog.has_criteria():
                QMessageBox.information(
                    self,
                    "情報",
                    "検索条件を指定してください"
                )
                return
            
            criteria = dialog.get_search_criteria()
            
            try:
                results = self.db.advanced_search(
                    title=criteria['title'],
                    author=criteria['author'],
                    year_from=criteria['year_from'],
                    year_to=criteria['year_to'],
                    memo=criteria['memo']
                )
                
                self.load_papers(results)
                
                # 検索条件の要約を作成
                conditions = []
                if criteria['title']:
                    conditions.append(f"タイトル:'{criteria['title']}'")
                if criteria['author']:
                    conditions.append(f"著者:'{criteria['author']}'")
                if criteria['year_from']:
                    conditions.append(f"年>={criteria['year_from']}")
                if criteria['year_to']:
                    conditions.append(f"年<={criteria['year_to']}")
                if criteria['memo']:
                    conditions.append(f"メモ:'{criteria['memo']}'")
                
                condition_text = ", ".join(conditions)
                self.statusBar().showMessage(
                    f"詳細検索結果: {len(results)}件 ({condition_text})"
                )
                
            except Exception as e:
                QMessageBox.critical(
                    self,
                    "エラー",
                    f"検索に失敗しました:\n{str(e)}"
                )
    
    def clear_search(self):
        """検索をクリア"""
        self.search_input.clear()
        self.load_papers()
    
    def add_paper(self):
        """新規論文登録"""
        from ui.edit_dialog import EditDialog
        
        dialog = EditDialog(self)
        if dialog.exec() == EditDialog.DialogCode.Accepted:
            data = dialog.get_data()
            
            try:
                paper_id = self.db.add_paper(
                    title=data['title'],
                    author=data['author'],
                    year=data['year'],
                    pdf_path=data['pdf_path'],
                    image_path=data['image_path'],
                    memo=data['memo']
                )
                
                QMessageBox.information(
                    self,
                    "成功",
                    f"論文を登録しました (ID: {paper_id})"
                )
                self.load_papers()
                
            except Exception as e:
                QMessageBox.critical(
                    self,
                    "エラー",
                    f"論文の登録に失敗しました:\n{str(e)}"
                )
    
    def edit_paper(self):
        """論文編集"""
        selected_row = self.table.currentRow()
        if selected_row < 0:
            QMessageBox.warning(self, "警告", "編集する論文を選択してください")
            return
        
        # 選択された論文のIDを取得
        paper_id = int(self.table.item(selected_row, 0).text())
        paper_data = self.db.get_paper(paper_id)
        
        if not paper_data:
            QMessageBox.critical(self, "エラー", "論文データの取得に失敗しました")
            return
        
        from ui.edit_dialog import EditDialog
        
        dialog = EditDialog(self, paper_data)
        if dialog.exec() == EditDialog.DialogCode.Accepted:
            data = dialog.get_data()
            
            try:
                success = self.db.update_paper(
                    paper_id=paper_id,
                    title=data['title'],
                    author=data['author'],
                    year=data['year'],
                    pdf_path=data['pdf_path'],
                    image_path=data['image_path'],
                    memo=data['memo']
                )
                
                if success:
                    QMessageBox.information(self, "成功", "論文を更新しました")
                    self.load_papers()
                else:
                    QMessageBox.critical(self, "エラー", "論文の更新に失敗しました")
                    
            except Exception as e:
                QMessageBox.critical(
                    self,
                    "エラー",
                    f"論文の更新に失敗しました:\n{str(e)}"
                )
    
    def delete_paper(self):
        """論文削除"""
        selected_row = self.table.currentRow()
        if selected_row < 0:
            QMessageBox.warning(self, "警告", "削除する論文を選択してください")
            return
        
        # 選択された論文の情報を取得
        paper_id = int(self.table.item(selected_row, 0).text())
        paper_title = self.table.item(selected_row, 1).text()
        
        # 確認ダイアログ
        reply = QMessageBox.question(
            self,
            "削除確認",
            f"以下の論文を削除してもよろしいですか?\n\n"
            f"ID: {paper_id}\n"
            f"タイトル: {paper_title}\n\n"
            f"※この操作は取り消せません",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No,
            QMessageBox.StandardButton.No
        )
        
        if reply == QMessageBox.StandardButton.Yes:
            try:
                success = self.db.delete_paper(paper_id)
                
                if success:
                    QMessageBox.information(self, "成功", "論文を削除しました")
                    self.load_papers()
                else:
                    QMessageBox.critical(self, "エラー", "論文の削除に失敗しました")
                    
            except Exception as e:
                QMessageBox.critical(
                    self,
                    "エラー",
                    f"論文の削除に失敗しました:\n{str(e)}"
                )
    
    def show_detail(self):
        """詳細表示（Phase 2で実装）"""
        QMessageBox.information(self, "情報", "詳細表示機能はPhase 2で実装予定です")
    
    def backup_database(self):
        """データベースバックアップ"""
        from datetime import datetime
        backup_name = f"papers_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.db"
        backup_path = f"data/backups/{backup_name}"
        
        if self.db.backup_database(backup_path):
            QMessageBox.information(self, "成功", f"バックアップを作成しました:\n{backup_path}")
        else:
            QMessageBox.critical(self, "エラー", "バックアップに失敗しました")
    
    def show_about(self):
        """バージョン情報表示"""
        QMessageBox.about(self, "バージョン情報",
                         "学術論文管理システム v1.0\n\n"
                         "PySide6ベースの論文管理アプリケーション\n"
                         "Phase 1: 基本機能実装")