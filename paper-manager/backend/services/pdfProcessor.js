const { spawn } = require('child_process');
const path = require('path');
const paperRepository = require('../database/repositories/paperRepository');
const chapterRepository = require('../database/repositories/chapterRepository');
const figureRepository = require('../database/repositories/figureRepository');
const { getDatabase } = require('../database/db');

/**
 * Python PDF処理スクリプトを実行
 */
function executePythonScript(scriptPath, args) {
  return new Promise((resolve, reject) => {
    const python = spawn('python', [scriptPath, ...args]);
    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    python.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    python.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python script failed: ${stderr}`));
        return;
      }

      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (error) {
        reject(new Error(`Failed to parse Python output: ${error.message}`));
      }
    });
  });
}

/**
 * PDFからメタデータを抽出
 */
async function extractMetadata(pdfPath) {
  try {
    const scriptPath = path.join(__dirname, '../../python/pdf_processor.py');
    const result = await executePythonScript(scriptPath, [pdfPath, 'metadata']);

    if (!result.success) {
      throw new Error(result.error);
    }

    return result.metadata;
  } catch (error) {
    console.error('Failed to extract metadata:', error);
    return null;
  }
}

/**
 * PDFからページ単位でテキストを抽出
 */
async function extractPageTexts(paperId, pdfPath) {
  try {
    const scriptPath = path.join(__dirname, '../../python/pdf_processor.py');
    const result = await executePythonScript(scriptPath, [pdfPath, 'pages']);

    if (!result.success) {
      throw new Error(result.error);
    }

    // ページテキストをDBに保存
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO page_texts (paper_id, page_number, content)
      VALUES (?, ?, ?)
    `);

    for (const page of result.pages) {
      stmt.run(paperId, page.page_number, page.content);
    }

    console.log(`Extracted ${result.pages.length} pages for paper ${paperId}`);
    return result.pages.length;
  } catch (error) {
    console.error('Failed to extract page texts:', error);
    throw error;
  }
}

/**
 * PDFから章を抽出
 */
async function extractChapters(paperId, pdfPath) {
  try {
    const scriptPath = path.join(__dirname, '../../python/pdf_processor.py');
    const result = await executePythonScript(scriptPath, [pdfPath, 'chapters']);

    if (!result.success) {
      throw new Error(result.error);
    }

    // 既存の章を削除
    chapterRepository.deleteByPaper(paperId);

    // 新しい章を保存
    let chapterNumber = 1;
    for (const chapter of result.chapters) {
      chapterRepository.create({
        paper_id: paperId,
        title: chapter.title,
        content: chapter.content,
        page_start: chapter.page_start,
        chapter_number: chapterNumber++,
        is_auto_extracted: true
      });
    }

    console.log(`Extracted ${result.chapters.length} chapters for paper ${paperId}`);
    return result.chapters.length;
  } catch (error) {
    console.error('Failed to extract chapters:', error);
    return 0;
  }
}

/**
 * PDFから図表を抽出
 */
async function extractFigures(paperId, pdfPath) {
  try {
    const scriptPath = path.join(__dirname, '../../python/pdf_processor.py');
    const result = await executePythonScript(scriptPath, [pdfPath, 'figures']);

    if (!result.success) {
      throw new Error(result.error);
    }

    // 既存の図表を削除
    figureRepository.deleteByPaper(paperId);

    // 新しい図表を保存
    for (const figure of result.figures) {
      figureRepository.create({
        paper_id: paperId,
        figure_number: figure.figure_number,
        caption: figure.caption,
        page_number: figure.page_number,
        figure_type: figure.figure_type,
        is_auto_extracted: true
      });
    }

    console.log(`Extracted ${result.figures.length} figures for paper ${paperId}`);
    return result.figures.length;
  } catch (error) {
    console.error('Failed to extract figures:', error);
    return 0;
  }
}

/**
 * PDF全体を処理
 */
async function processPDF(paperId, pdfPath) {
  try {
    console.log(`Starting PDF processing for paper ${paperId}`);
    
    // 処理状態を更新
    paperRepository.updateProcessingStatus(paperId, 'processing');

    // ページテキスト抽出
    await extractPageTexts(paperId, pdfPath);

    // 章抽出（試行）
    await extractChapters(paperId, pdfPath);

    // 図表抽出（試行）
    await extractFigures(paperId, pdfPath);

    // 処理完了
    paperRepository.updateProcessingStatus(paperId, 'completed');
    
    console.log(`Completed PDF processing for paper ${paperId}`);
    return true;
  } catch (error) {
    console.error(`Failed to process PDF for paper ${paperId}:`, error);
    paperRepository.updateProcessingStatus(paperId, 'failed');
    return false;
  }
}

module.exports = {
  extractMetadata,
  extractPageTexts,
  extractChapters,
  extractFigures,
  processPDF
};