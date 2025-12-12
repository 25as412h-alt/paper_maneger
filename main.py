"""
学術論文管理システム - メインエントリーポイント
"""
import sys
from PySide6.QtWidgets import QApplication
from ui.main_window import MainWindow


def main():
    """アプリケーションのメイン関数"""
    app = QApplication(sys.argv)
    print("main.py が起動しました")
    
    # アプリケーション情報設定
    app.setApplicationName("学術論文管理システム")
    app.setOrganizationName("Research Lab")
    app.setApplicationVersion("1.0.0")
    
    # メインウィンドウ表示
    window = MainWindow()
    window.show()
    
    # イベントループ開始
    sys.exit(app.exec())


if __name__ == "__main__":
    main()