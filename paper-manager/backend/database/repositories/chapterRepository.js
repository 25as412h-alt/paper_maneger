// ============================================
// chapterRepository.js
// ============================================
const { getDatabase } = require('../db');

class ChapterRepository {
  findByPaper(paperId) {
    const db = getDatabase();
    return db.prepare(`
      SELECT * FROM chapters
      WHERE paper_id = ?
      ORDER BY chapter_number ASC, page_start ASC
    `).all(paperId);
  }

  findById(id) {
    const db = getDatabase();
    return db.prepare('SELECT * FROM chapters WHERE id = ?').get(id);
  }

  create(chapterData) {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO chapters (
        paper_id, title, content, page_start, page_end,
        chapter_number, is_auto_extracted
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      chapterData.paper_id,
      chapterData.title,
      chapterData.content,
      chapterData.page_start,
      chapterData.page_end,
      chapterData.chapter_number,
      chapterData.is_auto_extracted ?? 1
    );

    return result.lastInsertRowid;
  }

  update(id, chapterData) {
    const db = getDatabase();
    const fields = [];
    const params = [];

    if (chapterData.title !== undefined) {
      fields.push('title = ?');
      params.push(chapterData.title);
    }
    if (chapterData.content !== undefined) {
      fields.push('content = ?');
      params.push(chapterData.content);
    }
    if (chapterData.page_start !== undefined) {
      fields.push('page_start = ?');
      params.push(chapterData.page_start);
    }
    if (chapterData.page_end !== undefined) {
      fields.push('page_end = ?');
      params.push(chapterData.page_end);
    }
    if (chapterData.is_auto_extracted !== undefined) {
      fields.push('is_auto_extracted = ?');
      params.push(chapterData.is_auto_extracted);
    }

    if (fields.length === 0) return 0;

    params.push(id);
    const query = `UPDATE chapters SET ${fields.join(', ')} WHERE id = ?`;
    const result = db.prepare(query).run(...params);

    return result.changes;
  }

  delete(id) {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM chapters WHERE id = ?').run(id);
    return result.changes;
  }

  deleteByPaper(paperId) {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM chapters WHERE paper_id = ?').run(paperId);
    return result.changes;
  }
}

module.exports = new ChapterRepository();

// ============================================
// figureRepository.js
// ============================================
const { getDatabase: getDb } = require('../db');

class FigureRepository {
  findByPaper(paperId) {
    const db = getDb();
    return db.prepare(`
      SELECT * FROM figures
      WHERE paper_id = ?
      ORDER BY page_number ASC, figure_number ASC
    `).all(paperId);
  }

  findById(id) {
    const db = getDb();
    return db.prepare('SELECT * FROM figures WHERE id = ?').get(id);
  }

  create(figureData) {
    const db = getDb();
    const stmt = db.prepare(`
      INSERT INTO figures (
        paper_id, figure_number, caption, image_path,
        page_number, figure_type, is_auto_extracted
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      figureData.paper_id,
      figureData.figure_number,
      figureData.caption,
      figureData.image_path,
      figureData.page_number,
      figureData.figure_type || 'figure',
      figureData.is_auto_extracted ?? 1
    );

    return result.lastInsertRowid;
  }

  update(id, figureData) {
    const db = getDb();
    const fields = [];
    const params = [];

    if (figureData.figure_number !== undefined) {
      fields.push('figure_number = ?');
      params.push(figureData.figure_number);
    }
    if (figureData.caption !== undefined) {
      fields.push('caption = ?');
      params.push(figureData.caption);
    }
    if (figureData.page_number !== undefined) {
      fields.push('page_number = ?');
      params.push(figureData.page_number);
    }
    if (figureData.is_auto_extracted !== undefined) {
      fields.push('is_auto_extracted = ?');
      params.push(figureData.is_auto_extracted);
    }

    if (fields.length === 0) return 0;

    params.push(id);
    const query = `UPDATE figures SET ${fields.join(', ')} WHERE id = ?`;
    const result = db.prepare(query).run(...params);

    return result.changes;
  }

  delete(id) {
    const db = getDb();
    const result = db.prepare('DELETE FROM figures WHERE id = ?').run(id);
    return result.changes;
  }

  deleteByPaper(paperId) {
    const db = getDb();
    const result = db.prepare('DELETE FROM figures WHERE paper_id = ?').run(paperId);
    return result.changes;
  }
}

module.exports = new FigureRepository();