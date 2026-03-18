#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
dict_to_json.py

Parse a scanned dictionary text file where each entry starts on a line with an uppercase head.
This version **prevents tokens that contain digits or non-alphabetic characters** from being
included in the head ("word"). Only tokens composed entirely of letters and containing at
least one uppercase letter are allowed in the head. Everything from the first disallowed token
onward is considered the translation.

Usage:
    python data\into_json.py data\combined.txt data\kaa-kaa.json
"""

import sys
import json
from typing import List, Tuple

def is_entry_start(line: str) -> bool:
    s = line.lstrip()
    return bool(s) and s[0].isalpha() and s[0].isupper()

def token_has_lower(token: str) -> bool:
    return any(ch.isalpha() and ch.islower() for ch in token)

def token_has_digit_or_nonalpha(token: str) -> bool:
    # Returns True if token contains a digit or any non-alphabetic character.
    for ch in token:
        if ch.isdigit():
            return True
        if not ch.isalpha():
            return True
    return False

def token_is_head_candidate(token: str) -> bool:
    """
    Head tokens must:
      - contain no lowercase letters
      - contain no digits
      - contain only alphabetic characters (no punctuation/symbols)
      - contain at least one uppercase letter
    """
    if not token:
        return False
    if token_has_lower(token):
        return False
    if token_has_digit_or_nonalpha(token):
        return False
    # must include at least one uppercase alphabetic char
    return any(ch.isalpha() and ch.isupper() for ch in token)

def split_head_translation(entry_text: str) -> Tuple[str, str]:
    """
    Split by tokens. The first token that is NOT a valid head candidate marks the start
    of the translation. Head is the tokens before that token.
    """
    text = entry_text.strip()
    if not text:
        return "", ""

    tokens = text.split()
    head_tokens = []
    for i, tok in enumerate(tokens):
        if token_is_head_candidate(tok):
            head_tokens.append(tok)
            continue
        # token isn't a head candidate -> start of translation
        head = " ".join(head_tokens).strip()
        translation = " ".join(tokens[i:]).strip()
        # If no head tokens found (rare), treat first token as head fallback
        if not head:
            # fallback: first token as head (but strip trailing non-alpha)
            # try to salvage by taking leading alphabetic portion of first token
            leading_alpha = "".join(ch for ch in tokens[0] if ch.isalpha())
            if leading_alpha:
                return leading_alpha, " ".join(tokens[1:]).strip()
            return tokens[0], " ".join(tokens[1:]).strip()
        return head, translation

    # all tokens were head-candidates -> no translation part
    head = " ".join(head_tokens).strip()
    return head, ""

def parse_text_to_entries(text: str) -> List[Tuple[str, str]]:
    lines = text.splitlines()
    entries_raw: List[str] = []
    current = None

    for raw_line in lines:
        line = raw_line.rstrip("\r\n")
        if not line.strip():
            continue
        if is_entry_start(line):
            if current is not None:
                entries_raw.append(current)
            current = line.strip()
        else:
            if current is None:
                current = line.strip()
            else:
                current = current + " " + line.strip()

    if current is not None:
        entries_raw.append(current)

    parsed = []
    for raw in entries_raw:
        head, trans = split_head_translation(raw)
        parsed.append((head, trans))
    return parsed

def main(argv):
    if len(argv) != 3:
        print("Usage: python dict_to_json.py combined.txt combined.json")
        return 1

    infile, outfile = argv[1], argv[2]
    with open(infile, "r", encoding="utf-8") as f:
        text = f.read()

    parsed = parse_text_to_entries(text)

    objs = [{"word": h, "translation": t} for h, t in parsed]

    with open(outfile, "w", encoding="utf-8") as f:
        json.dump(objs, f, ensure_ascii=False, indent=2)

    print(f"Wrote {len(objs)} entries to {outfile}")
    return 0

if __name__ == "__main__":
    sys.exit(main(sys.argv))