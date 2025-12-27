const db = require('../database/db');

console.log('====================================');
console.log('  サンプルデータ投入');
console.log('====================================\n');

// サンプル論文データ
const samplePapers = [
  {
    title: 'Attention Is All You Need',
    authors: 'Vaswani et al.',
    year: 2017,
    pdf_path: './data/pdfs/sample_attention.pdf',
    content: `Abstract
The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely.

Introduction
Recurrent neural networks, long short-term memory and gated recurrent neural networks in particular, have been firmly established as state of the art approaches in sequence modeling and transduction problems such as language modeling and machine translation. The Transformer model architecture eschews recurrence and instead relies entirely on an attention mechanism to draw global dependencies between input and output.`,
    tags: ['NLP', 'Transformer', 'Attention', 'DeepLearning']
  },
  {
    title: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding',
    authors: 'Devlin et al.',
    year: 2018,
    pdf_path: './data/pdfs/sample_bert.pdf',
    content: `Abstract
We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers. Unlike recent language representation models, BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers.

Introduction
Language model pre-training has been shown to be effective for improving many natural language processing tasks. These include sentence-level tasks such as natural language inference and paraphrasing, which aim to predict the relationships between sentences by analyzing them holistically, as well as token-level tasks such as named entity recognition and question answering.`,
    tags: ['NLP', 'BERT', 'Transformer', 'PreTraining']
  },
  {
    title: 'Deep Residual Learning for Image Recognition',
    authors: 'He et al.',
    year: 2015,
    pdf_path: './data/pdfs/sample_resnet.pdf',
    content: `Abstract
Deeper neural networks are more difficult to train. We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously. We explicitly reformulate the layers as learning residual functions with reference to the layer inputs, instead of learning unreferenced functions.

Introduction
Deep convolutional neural networks have led to a series of breakthroughs for image classification. Deep networks naturally integrate low/mid/high-level features and classifiers in an end-to-end multi-layer fashion, and the "levels" of features can be enriched by the number of stacked layers (depth).`,
    tags: ['ComputerVision', 'ResNet', 'CNN', 'DeepLearning']
  }
];

// サンプルメモ
const sampleMemos = [
  {
    paperId: 1,
    content: 'Transformerの構造について\n\nSelf-Attentionメカニズムが革新的。Position Encodingで位置情報を埋め込む工夫が面白い。'
  },
  {
    paperId: 1,
    content: 'Multi-Head Attentionの実装メモ\n\n複数のAttention Headを並列に計算することで、異なる表現部分空間を学習できる。'
  },
  {
    paperId: 2,
    content: 'BERTの事前学習タスク\n\n1. Masked Language Model (MLM)\n2. Next Sentence Prediction (NSP)\n\nMLMが特に効果的。'
  },
  {
    paperId: 3,
    content: 'ResNetのSkip Connection\n\n恒等写像を追加することで勾配消失問題を解決。深いネットワークの学習を可能にした。'
  }
];

async function insertSampleData() {
  try {
    console.log('📝 論文データを投入中...\n');
    
    // 論文を登録
    for (let i = 0; i < samplePapers.length; i++) {
      const paper = samplePapers[i];
      const result = await db.papers.create(paper);
      console.log(`✅ [${i + 1}/${samplePapers.length}] ${paper.title}`);
      
      // 対応するメモを登録
      const memos = sampleMemos.filter(m => m.paperId === i + 1);
      for (const memo of memos) {
        await db.memos.create(result.id, memo.content);
      }
      
      if (memos.length > 0) {
        console.log(`   └─ メモ ${memos.length}件を追加`);
      }
    }
    
    console.log('\n====================================');
    console.log('✨ サンプルデータの投入が完了しました!');
    console.log('====================================\n');
    console.log('投入内容:');
    console.log(`- 論文: ${samplePapers.length}件`);
    console.log(`- メモ: ${sampleMemos.length}件`);
    console.log('\nアプリを起動して確認してください。\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

// データベース初期化後にサンプルデータ投入
db.initDB();
setTimeout(() => {
  insertSampleData();
}, 1000);