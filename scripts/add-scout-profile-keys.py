import json

for lang in ['it', 'en']:
    with open(f'src/messages/{lang}.json', 'r', encoding='utf-8') as f:
        d = json.load(f)
    
    if lang == 'it':
        d['pages']['publicScoutProfile'] = {
            'back': 'Indietro',
            'verified': 'Verificato',
            'location': 'Sede',
            'website': 'Sito web',
            'activeCastings': 'Casting attivi',
            'activeJobs': 'Lavori attivi'
        }
    else:
        d['pages']['publicScoutProfile'] = {
            'back': 'Back',
            'verified': 'Verified',
            'location': 'Location',
            'website': 'Website',
            'activeCastings': 'Active castings',
            'activeJobs': 'Active jobs'
        }
    
    with open(f'src/messages/{lang}.json', 'w', encoding='utf-8') as f:
        json.dump(d, f, indent=2, ensure_ascii=False)
        f.write('\n')
print('Scout profile i18n keys added')
