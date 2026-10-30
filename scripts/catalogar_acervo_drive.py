#!/usr/bin/env python3
"""
Melos — Etapa 4: Script de Catalogação Inicial (Migração do Acervo Existente no Google Drive)
Varre uma pasta do Google Drive, aplica parsing sobre "Compositor - Obra (Arranjador).pdf"
e popula a tabela `scores` no Supabase.
"""

import os
import re
from typing import Dict

FILENAME_PATTERN = re.compile(r"^(?P<composer>[^-]+?)\s*-\s*(?P<title>[^()]+?)(?:\s*\((?P<arranger>[^)]+)\))?\.pdf$", re.IGNORECASE)

def parse_pdf_filename(filename: str) -> Dict[str, str]:
    match = FILENAME_PATTERN.match(filename.strip())
    if match:
        return {
            "composer": match.group("composer").strip(),
            "title": match.group("title").strip(),
            "arranger": (match.group("arranger") or "").strip(),
        }
    clean = re.sub(r"\.pdf$", "", filename, flags=re.IGNORECASE).strip()
    return {
        "composer": "Compositor a definir",
        "title": clean,
        "arranger": "",
    }

if __name__ == "__main__":
    exemplos = [
        "Frédéric Chopin - Noturno Op. 9 No 2 (Jan Ekier).pdf",
        "Tom Jobim - Águas de Março (Arranjo 4 mãos).pdf",
        "Claude Debussy - Clair de Lune.pdf",
    ]
    for arq in exemplos:
        print(f"{arq} -> {parse_pdf_filename(arq)}")
