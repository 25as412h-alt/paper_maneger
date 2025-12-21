const fs = require('fs').promises;
const path = require('path');
const { detect } = require('jschardet');
const iconv = require('iconv-lite');
const paperRepository = require('../database/repositories/paperRepository');
const chapterRepository = require('../database/repositories/chapterRepository');
const { getDatabase } = require('../database/db');

/**
 * TXTファイルからメタデータを抽出（簡易版）
 * 最初の数行からタイトルや著者を推測
 */
async function extractMetadata(txtPath) {
  try {
    const content = await readTextFile(txtPath);
    const lines = content.split('\n').filter(line => line.trim());

    // 最初の行をタイトルとして扱う
    const title = lines[0]?.trim() || path.basename(txtPath, '.txt');
    
    // 2行目に著者情報があるかチェック
    let authors = '';
    if (lines.length > 1) {
      const secondLine = lines[1].trim();
      // "by", "著者", "Author:" などが含まれていれば著者情報として扱う
      if (/^(by|著者|author:?)/i.test(secondLine)) {
        authors = secondLine.replace(/^(by|著者|author:?)\s*/i, '');
      }
    }

    return {
      title,
      authors,
      line_count: lines.length,
      char_count: content.length,
      encoding: detectEncoding(await fs.readFile(txtPath))
    };
  } catch (error) {
    console.error('Failed to extract TXT metadata:', error);
    return {
      title: path.basename(txtPath, '.txt'),
      authors: '',
      line_count: 0,
      char_count: 0,
      encoding: 'utf-8'
    };
  }
}

/**
 * テキストファイルを読み込み（エンコーディング自動判定）
 */
async function readTextFile(txtPath) {
  const buffer = await fs.readFile(txtPath);
  const encoding = detectEncoding(buffer);
  
  // エンコーディングに応じて変換
  if (encoding === 'utf-8' || encoding === 'ascii') {
    return buffer.toString('utf8');
  } else {
    return iconv.decode(buffer, encoding);
  }
}

/**
 * エンコーディング検出
 */
function detectEncoding(buffer) {
  const detected = detect(buffer);
  const encoding = detected.encoding?.toLowerCase();
  
  // よく使われるエンコーディングにマッピング
  if (!encoding) return 'utf-8';
  if (encoding.includes('shift') || encoding.includes('sjis')) return 'shift_jis';
  if (encoding.includes('euc')) return 'euc-jp';
  if (encoding.includes('iso')) return 'iso-2022-jp';
  if (encoding.includes('utf')) return 'utf-8';
  
  return 'utf-8'; // デフォルト
}

/**
 * TXTファイルから行単位でテキストを抽出
 * PDFの"ページ"に相当する単位として、100行ごとにチャンク化
 */
async function extractLineChunks(paperId, txtPath) {
  try {
    const content = await readTextFile(txtPath);
    const lines = content.split('\n');
    const chunkSize = 100; // 100行ごと
    const chunks = [];

    for (let i = 0; i < lines.length; i += chunkSize) {
      const chunkLines = lines.slice(i, i + chunkSize);
      const chunkContent = chunkLines.join('\n');
      
      chunks.push({
        chunk_number: Math.floor(i / chunkSize) + 1,
        start_line: i + 1,
        end_line: Math.min(i + chunkSize, lines.length),
        content: chunkContent
      });
    }

    // ページテキストとしてDBに保存（TXTの場合はpage_numberの代わりにチャンク番号）
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO page_texts (paper_id, page_number, content)
      VALUES (?, ?, ?)
    `);

    for (const chunk of chunks) {
      stmt.run(paperId, chunk.chunk_number, chunk.content);
    }

    console.log(`Extracted ${chunks.length} chunks (${lines.length} lines) for paper ${paperId}`);
    return chunks.length;
  } catch (error) {
    console.error('Failed to extract line chunks:', error);
    throw error;
  }
}

/**
 * TXTファイルから章を抽出
 * 見出しパターンで章を検出
 */
async function extractChapters(paperId, txtPath) {
  try {
    const content = await readTextFile(txtPath);
    const lines = content.split('\n');
    const chapters = [];

    // 章タイトルのパターン
    const chapterPatterns = [
      /^#+\s+(.+)$/,                    // Markdown見出し: # Title
      /^第[0-9０-９]+章\s+(.+)$/,        // 日本語: 第1章 タイトル
      /^Chapter\s+\d+[:\.]?\s*(.+)$/i,  // 英語: Chapter 1: Title
      /^(\d+\.)\s+([A-Z].+)$/,          // 番号付き: 1. Title
      /^([A-Z][A-Z\s]+)$/,              // 全大文字: INTRODUCTION
    ];

    let currentChapter = null;
    let lineNumber = 1;

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        lineNumber++;
        continue;
      }

      // パターンマッチング
      let matched = false;
      for (const pattern of chapterPatterns) {
        const match = pattern.exec(trimmedLine);
        if (match) {
          // 前の章を保存
          if (currentChapter) {
            currentChapter.end_line = lineNumber - 1;
            chapters.push(currentChapter);
          }

          // 新しい章を開始
          currentChapter = {
            title: match[match.length - 1], // 最後のキャプチャグループがタイトル
            start_line: lineNumber,
            end_line: null,
            content: ''
          };
          
          matched = true;
          break;
        }
      }

      // 章の内容を蓄積
      if (currentChapter && !matched) {
        currentChapter.content += line + '\n';
      }

      lineNumber++;
    }

    // 最後の章を保存
    if (currentChapter) {
      currentChapter.end_line = lines.length;
      chapters.push(currentChapter);
    }

    // 既存の章を削除
    chapterRepository.deleteByPaper(paperId);

    // 新しい章を保存
    let chapterNumber = 1;
    for (const chapter of chapters) {
      chapterRepository.create({
        paper_id: paperId,
        title: chapter.title,
        content: chapter.content.substring(0, 5000), // 最初の5000文字
        page_start: null, // TXTなのでページ番号はnull
        page_end: null,
        chapter_number: chapterNumber++,
        is_auto_extracted: true
      });
    }

    console.log(`Extracted ${chapters.length} chapters for paper ${paperId}`);
    return chapters.length;
  } catch (error) {
    console.error('Failed to extract chapters from TXT:', error);
    return 0;
  }
}

/**
 * TXTファイル全体を処理
 */
async function processTXT(paperId, txtPath) {
  try {
    console.log(`Starting TXT processing for paper ${paperId}`);
    
    // 処理状態を更新
    paperRepository.updateProcessingStatus(paperId, 'processing');

    // 行チャンク抽出
    const chunkCount = await extractLineChunks(paperId, txtPath);

    // ページ数を更新（チャンク数をページ数として扱う）
    paperRepository.update(paperId, { page_count: chunkCount });

    // 章抽出（試行）
    await extractChapters(paperId, txtPath);

    // 処理完了
    paperRepository.updateProcessingStatus(paperId, 'completed');
    
    console.log(`Completed TXT processing for paper ${paperId}`);
    return true;
  } catch (error) {
    console.error(`Failed to process TXT for paper ${paperId}:`, error);
    paperRepository.updateProcessingStatus(paperId, 'failed');
    return false;
  }
}

module.exports = {
  extractMetadata,
  readTextFile,
  extractLineChunks,
  extractChapters,
  processTXT
};