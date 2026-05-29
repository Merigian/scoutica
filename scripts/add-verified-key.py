import json

for lang in ['it', 'en']:
    with open(f'src/messages/{lang}.json', 'r', encoding='utf-8') as f:
        d = json.load(f)
    
    pp = d.get('pages', {}).get('publicProfile', {})
    if lang == 'it':
        pp['verified'] = 'Verificato'
    else:
        pp['verified'] = 'Verified'
    d.setdefault('pages', {})['publicProfile'] = pp
    
    with open(f'src/messages/{lang}.json', 'w', encoding='utf-8') as f:
        json.dump(d, f, indent=2, ensure_ascii=False)
        f.write('\n')

print('Done')
