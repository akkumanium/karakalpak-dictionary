import re
import json

# -----------------------------
# 1️⃣ Settings
# -----------------------------
input_txt = "text.txt"
output_json = "dictionary.json"

# -----------------------------
# 2️⃣ Read text file
# -----------------------------
with open(input_txt, "r", encoding="utf-8") as f:
    text = f.read()

# -----------------------------
# 3️⃣ Merge lines into a single string
# -----------------------------
text = text.replace("\n", " ")  # merge all lines

# -----------------------------
# 4️⃣ Split entries by "dot + space + ALL CAPS word"
# -----------------------------
# This regex looks for: a dot or colon, then space(s), then an uppercase word (including special chars)
pattern = r"(?<=[\.])\s+(?=[A-Z‘ʻʼ’\-]{2,})"

raw_entries = re.split(pattern, text)

# -----------------------------
# 5️⃣ Split headword and definition
# -----------------------------
structured = []

for entry in raw_entries:
    entry = entry.strip()
    # Find the first dash (–) or colon (:)
    split_match = re.split(r"\s[–\:]\s", entry, maxsplit=1)
    if len(split_match) == 2:
        headword, definition = split_match
        definition = definition.strip()

        # Try to extract numbered senses
        senses = re.findall(r"\d+\.\s.*?(?=\s\d+\.\s|$)", definition)

        # If no numbered senses found, treat entire definition as one sense
        if not senses:
            senses = [definition]

        structured.append({
            "uzbek": headword.strip(),
            "karakalpak": [s.strip() for s in senses]
        })

# -----------------------------
# 6️⃣ Export to JSON
# -----------------------------
with open(output_json, "w", encoding="utf-8") as f:
    json.dump(structured, f, ensure_ascii=False, indent=2)

print(f"Done! Extracted {len(structured)} entries into {output_json}")