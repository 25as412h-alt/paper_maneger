# test_data.py を作成して実行
from models.database import Database

db = Database()

# テストデータ追加
test_papers = [
    ("Deep Learning", "Geoffrey Hinton", 2015, "", "", "深層学習の基礎"),
    ("Attention Is All You Need", "Vaswani et al.", 2017, "", "", "Transformer論文"),
    ("BERT", "Devlin et al.", 2018, "", "", "事前学習言語モデル"),
    ("GPT-3", "Brown et al.", 2020, "", "", "大規模言語モデル"),
    ("ResNet", "He et al.", 2015, "", "", "残差ネットワーク"),
]

for title, author, year, pdf, img, memo in test_papers:
    db.add_paper(title, author, year, pdf, img, memo)

print("テストデータを追加しました")