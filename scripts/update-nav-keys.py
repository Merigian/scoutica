import json

for lang in ['it', 'en']:
    with open(f'src/messages/{lang}.json', 'r', encoding='utf-8') as f:
        d = json.load(f)
    
    if lang == 'it':
        d['nav']['talentSearch'] = 'Ricerca Talenti'
        d['nav']['postings'] = 'Annunci'
        d['nav']['opportunities'] = 'Opportunità'
        d['components']['discover']['verified'] = 'Verificato'
    else:
        d['nav']['talentSearch'] = 'Talent Search'
        d['nav']['postings'] = 'Postings'
        d['nav']['opportunities'] = 'Opportunities'
        d['components']['discover']['verified'] = 'Verified'
    
    with open(f'src/messages/{lang}.json', 'w', encoding='utf-8') as f:
        json.dump(d, f, indent=2, ensure_ascii=False)
        f.write('\n')

print('Nav i18n keys updated')
