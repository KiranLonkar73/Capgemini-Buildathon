import fitz
import re
from typing import List, Dict


def _guess_title_from_text(text: str) -> str:
    for line in text.splitlines():
        s = line.strip()
        if not s:
            continue
        # heuristics: short first non-empty line
        if len(s) <= 120:
            return s
    return ""


def parse_pdf(path: str, filename: str) -> List[Dict]:
    """Parse PDF using PyMuPDF. Returns list of dicts with page, text, section.

    Uses 'blocks' extraction and sorts by vertical then horizontal coordinate to
    preserve reading order for multi-column layouts.
    """
    doc = fitz.open(path)
    pages = []

    for page_num in range(len(doc)):
        page = doc.load_page(page_num)
        blocks = page.get_text("blocks")  # list of (x0, y0, x1, y1, text, block_no)

        # Sort blocks by y0 then x0 to maintain reading order
        try:
            blocks_sorted = sorted(blocks, key=lambda b: (b[1], b[0]))
        except Exception:
            blocks_sorted = blocks

        texts = []
        for b in blocks_sorted:
            # block format varies; usually text is at index 4
            txt = b[4] if len(b) > 4 else str(b)
            texts.append(txt.strip())

        page_text = "\n".join([t for t in texts if t])

        # simple title heuristic
        title = _guess_title_from_text(page_text)

        pages.append({
            "source": filename,
            "page": page_num + 1,
            "section": title,
            "text": page_text,
        })

    doc.close()
    return pages
