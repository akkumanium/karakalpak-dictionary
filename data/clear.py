import json
import re

def wrap_numbers_in_tags(file_path, output_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Regex breakdown:
    # (?<!<b>)    -> Lookbehind: Ensure it's NOT preceded by <b>
    # (\d+\.)     -> Match one or more digits followed by a period
    # (?!<\/b>)   -> Lookahead: Ensure it's NOT followed by </b>
    pattern = r'(?<!<b>)(\d+\.)(?!<\/b>)'

    for entry in data:
        if "translation" in entry:
            # We use a lambda to ensure we only wrap if it's not already wrapped
            entry["translation"] = re.sub(pattern, r'<b>\1</b>', entry["translation"])

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

# Usage
wrap_numbers_in_tags('ru-kaa.json', 'ru-kaa_fixed.json')
print("Cleanup complete! Check ru-kaa_fixed.json")