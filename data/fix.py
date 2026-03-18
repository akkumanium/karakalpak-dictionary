import re

input_file = "data\combined.txt"
output_file = "data\combined.txt"

with open(input_file, "r", encoding="utf-8") as f:
    text = f.read()

# 1. Merge separated Roman numerals (I I -> II, etc.)
def merge_roman(match):
    letters = match.group(0).split()
    return "".join(letters)

text = re.sub(r'\bI(?:\s+I)+\b', merge_roman, text)
text = re.sub(r'\bV(?:\s+V)+\b', merge_roman, text)
text = re.sub(r'\bX(?:\s+X)+\b', merge_roman, text)

# 2. ұ > у (and uppercase)
text = text.replace("ұ", "у")
text = text.replace("һ", "ҳ")
text = text.replace("Һ", "Ҳ")
text = text.replace("Ұ", "У")

# 3. і > и (and uppercase)
text = text.replace("і", "и")
text = text.replace("І", "И")

# 4. vowel + у -> vowel + ў
replacements = {
    "ыу": "ыў",
    "иу": "иў",
    "үу": "үў",
    "еу": "еў",
    "ау": "аў",
    "уу": "уў",

    "ыү": "ыў",
    "иү": "иў",
    "үү": "үў",
    "еү": "еў",
    "аү": "аў",
    "уү": "уў",
    
    "ЫҮ": "ЫЎ",
    "ИҮ": "ИЎ",
    "ҮҮ": "ҮЎ",
    "ЕҮ": "ЕЎ",
    "АҮ": "АЎ",
    "УҮ": "УЎ",

    "ЫУ": "ЫЎ",
    "ИУ": "ИЎ",
    "ҮУ": "ҮЎ",
    "ЕУ": "ЕЎ",
    "АУ": "АЎ",
    "УУ": "УЎ",

    "уы": "ўы",
    "уи": "ўи",
    "уе": "ўе",
    "уа": "ўа",
}

for k, v in replacements.items():
    text = text.replace(k, v)

with open(output_file, "w", encoding="utf-8") as f:
    f.write(text)

print("Done! Saved to", output_file)