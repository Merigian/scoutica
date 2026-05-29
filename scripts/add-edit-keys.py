import json

for lang in ['it', 'en']:
    with open(f'src/messages/{lang}.json', 'r', encoding='utf-8') as f:
        d = json.load(f)
    
    if 'pages' not in d:
        d['pages'] = {}
    if 'scout' not in d['pages']:
        d['pages']['scout'] = {}
    
    if lang == 'it':
        if 'castingsNew' not in d['pages']['scout']:
            d['pages']['scout']['castingsNew'] = {}
        d['pages']['scout']['castingsNew']['editTitle'] = 'Modifica Casting'
        if 'lavoriNew' not in d['pages']['scout']:
            d['pages']['scout']['lavoriNew'] = {}
        d['pages']['scout']['lavoriNew']['editTitle'] = 'Modifica Lavoro'
    else:
        if 'castingsNew' not in d['pages']['scout']:
            d['pages']['scout']['castingsNew'] = {}
        d['pages']['scout']['castingsNew']['editTitle'] = 'Edit Casting'
        if 'lavoriNew' not in d['pages']['scout']:
            d['pages']['scout']['lavoriNew'] = {}
        d['pages']['scout']['lavoriNew']['editTitle'] = 'Edit Job'
    
    with open(f'src/messages/{lang}.json', 'w', encoding='utf-8') as f:
        json.dump(d, f, indent=2, ensure_ascii=False)
        f.write('\n')

print('Edit title keys added')
