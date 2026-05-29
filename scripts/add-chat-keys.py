import json

for lang in ['it', 'en']:
    with open(f'src/messages/{lang}.json', 'r', encoding='utf-8') as f:
        d = json.load(f)
    
    if lang == 'it':
        d.setdefault('components', {})['chatActions'] = {
            'delete': 'Elimina',
            'report': 'Segnala',
            'block': 'Blocca',
            'confirmDelete': 'Eliminare questa chat?',
            'confirmBlock': 'Bloccare questo utente?',
            'searchPlaceholder': 'Cerca conversazioni...'
        }
    else:
        d.setdefault('components', {})['chatActions'] = {
            'delete': 'Delete',
            'report': 'Report',
            'block': 'Block',
            'confirmDelete': 'Delete this chat?',
            'confirmBlock': 'Block this user?',
            'searchPlaceholder': 'Search conversations...'
        }
    
    with open(f'src/messages/{lang}.json', 'w', encoding='utf-8') as f:
        json.dump(d, f, indent=2, ensure_ascii=False)
        f.write('\n')

print('Chat actions i18n keys added')
