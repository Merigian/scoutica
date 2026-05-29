import json

for lang in ['it', 'en']:
    with open(f'src/messages/{lang}.json', 'r', encoding='utf-8') as f:
        d = json.load(f)
    if lang == 'it':
        d['report']['cancel'] = 'Annulla'
    else:
        d['report']['cancel'] = 'Cancel'
    with open(f'src/messages/{lang}.json', 'w', encoding='utf-8') as f:
        json.dump(d, f, indent=2, ensure_ascii=False)
        f.write('\n')
print('Done')
