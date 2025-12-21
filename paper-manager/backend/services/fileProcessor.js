const path = require('path');
const { processPDF } = require('./pdfProcessor');
const { processTXT } = require('./txtProcessor');
const paperRepository = require('../database/repositories/paperRepository');

/**
 * ファイル形式を判定
 */
function detectFileType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  if (ext === '.pdf') return 'pdf';
  if (ext === '.txt') return 'txt';
  
  return null;
}

/**
 * ファイル形式に応じた処理を実行
 */
async function processFile(paperId, filePath) {
  try {
    const fileType = detectFileType(filePath);
    
    if (!fileType) {
      throw new Error(`Unsupported file type: ${filePath}`);
    }

    console.log(`Processing ${fileType.toUpperCase()} file for paper ${paperId}: ${filePath}`);

    let result;
    switch (fileType) {
      case 'pdf':
        result = await processPDF(paperId, filePath);
        break;
      
      case 'txt':
        result = await processTXT(paperId, filePath);
        break;
      
      default:
        throw new Error(`Unknown file type: ${fileType}`);
    }

    return result;
  } catch (error) {
    console.error(`File processing failed for paper ${paperId}:`, error);
    paperRepository.updateProcessingStatus(paperId, 'failed');
    throw error;
  }
}

/**
 * ファイル形式に応じたメタデータ抽出
 */
async function extractFileMetadata(filePath) {
  const fileType = detectFileType(filePath);
  
  if (!fileType) {
    throw new Error(`Unsupported file type: ${filePath}`);
  }

  switch (fileType) {
    case 'pdf': {
      const { extractMetadata } = require('./pdfProcessor');
      return await extractMetadata(filePath);
    }
    
    case 'txt': {
      const { extractMetadata } = require('./txtProcessor');
      return await extractMetadata(filePath);
    }
    
    default:
      throw new Error(`Unknown file type: ${fileType}`);
  }
}

module.exports = {
  detectFileType,
  processFile,
  extractFileMetadata
};