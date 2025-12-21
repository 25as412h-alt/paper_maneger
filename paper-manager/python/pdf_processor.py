#!/usr/bin/env python3
"""
PDF処理スクリプト
PyMuPDFを使用してPDFからテキストを抽出
"""

import sys
import json
import fitz  # PyMuPDF
import re
from pathlib import Path


def extract_metadata(pdf_path):
    """PDFからメタデータを抽出"""
    try:
        doc = fitz.open(pdf_path)
        metadata = doc.metadata
        
        return {
            'title': metadata.get('title', ''),
            'author': metadata.get('author', ''),
            'subject': metadata.get('subject', ''),
            'creator': metadata.get('creator', ''),
            'page_count': len(doc)
        }
    except Exception as e:
        return {'error': str(e)}


def extract_text_by_page(pdf_path):
    """PDFからページ単位でテキストを抽出"""
    try:
        doc = fitz.open(pdf_path)
        pages = []
        
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text()
            
            pages.append({
                'page_number': page_num + 1,
                'content': text.strip()
            })
        
        return {
            'success': True,
            'page_count': len(doc),
            'pages': pages
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }


def detect_chapters(pages):
    """章構造の検出（簡易版）"""
    chapters = []
    
    # 章タイトルのパターン
    chapter_patterns = [
        r'^(\d+\.?\s+[A-Z][a-zA-Z\s]+)$',  # "1. Introduction"
        r'^([A-Z][A-Z\s]+)$',               # "INTRODUCTION"
        r'^(Chapter\s+\d+[:\.]?\s*[A-Z].+)$',  # "Chapter 1: Title"
    ]
    
    for page_data in pages:
        page_num = page_data['page_number']
        lines = page_data['content'].split('\n')
        
        for i, line in enumerate(lines):
            line = line.strip()
            if not line:
                continue
            
            # パターンマッチング
            for pattern in chapter_patterns:
                match = re.match(pattern, line)
                if match:
                    # 章の本文を取得（次の章まで、または残り全部）
                    content_lines = lines[i+1:]
                    content = '\n'.join(content_lines[:100])  # 最初の100行
                    
                    chapters.append({
                        'title': match.group(1),
                        'page_start': page_num,
                        'content': content.strip(),
                        'is_auto_extracted': True
                    })
                    break
    
    return chapters


def detect_figures(pages):
    """図表の検出（簡易版）"""
    figures = []
    
    # 図表キャプションのパターン
    figure_patterns = [
        r'(Figure\s+\d+[:\.]?\s*(.+))',
        r'(Fig\.\s+\d+[:\.]?\s*(.+))',
        r'(Table\s+\d+[:\.]?\s*(.+))',
    ]
    
    for page_data in pages:
        page_num = page_data['page_number']
        lines = page_data['content'].split('\n')
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            for pattern in figure_patterns:
                match = re.search(pattern, line, re.IGNORECASE)
                if match:
                    figure_type = 'table' if 'table' in match.group(1).lower() else 'figure'
                    
                    figures.append({
                        'figure_number': match.group(1),
                        'caption': match.group(2) if len(match.groups()) > 1 else '',
                        'page_number': page_num,
                        'figure_type': figure_type,
                        'is_auto_extracted': True
                    })
                    break
    
    return figures


def process_pdf(pdf_path, mode='all'):
    """
    PDFを処理
    
    Args:
        pdf_path: PDFファイルのパス
        mode: 処理モード ('metadata', 'pages', 'chapters', 'figures', 'all')
    
    Returns:
        JSON形式の結果
    """
    result = {
        'success': True,
        'pdf_path': pdf_path
    }
    
    try:
        if mode in ['metadata', 'all']:
            result['metadata'] = extract_metadata(pdf_path)
        
        if mode in ['pages', 'chapters', 'figures', 'all']:
            pages_data = extract_text_by_page(pdf_path)
            if pages_data['success']:
                result['pages'] = pages_data['pages']
                result['page_count'] = pages_data['page_count']
                
                if mode in ['chapters', 'all']:
                    result['chapters'] = detect_chapters(pages_data['pages'])
                
                if mode in ['figures', 'all']:
                    result['figures'] = detect_figures(pages_data['pages'])
            else:
                result['success'] = False
                result['error'] = pages_data['error']
        
    except Exception as e:
        result['success'] = False
        result['error'] = str(e)
    
    return result


def main():
    """コマンドライン実行"""
    if len(sys.argv) < 2:
        print(json.dumps({
            'success': False,
            'error': 'Usage: python pdf_processor.py <pdf_path> [mode]'
        }))
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    mode = sys.argv[2] if len(sys.argv) > 2 else 'all'
    
    if not Path(pdf_path).exists():
        print(json.dumps({
            'success': False,
            'error': f'File not found: {pdf_path}'
        }))
        sys.exit(1)
    
    result = process_pdf(pdf_path, mode)
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()