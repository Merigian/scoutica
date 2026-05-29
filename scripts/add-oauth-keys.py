import json

for lang in ['it', 'en']:
    with open(f'src/messages/{lang}.json', 'r', encoding='utf-8') as f:
        d = json.load(f)
    if lang == 'it':
        d['auth']['register']['completeSetup'] = 'Completa la registrazione'
        d['auth']['register']['selectRole'] = 'Scegli il tuo ruolo per continuare.'
        d['auth']['register']['continue'] = 'Continua'
        d['auth']['register']['roles'] = {'model': 'Modello/a', 'scout': 'Scout', 'studio': 'Studio'}
        d['auth']['register']['rolesDesc'] = {'model': 'Crea il tuo portfolio e ricevi opportunit\u00e0.', 'scout': 'Cerca talenti e pubblica casting.', 'studio': 'Pubblica il tuo spazio e ricevi prenotazioni.'}
    else:
        d['auth']['register']['completeSetup'] = 'Complete Registration'
        d['auth']['register']['selectRole'] = 'Choose your role to continue.'
        d['auth']['register']['continue'] = 'Continue'
        d['auth']['register']['roles'] = {'model': 'Model', 'scout': 'Scout', 'studio': 'Studio'}
        d['auth']['register']['rolesDesc'] = {'model': 'Create your portfolio and receive opportunities.', 'scout': 'Search talent and post castings.', 'studio': 'List your space and receive bookings.'}
    with open(f'src/messages/{lang}.json', 'w', encoding='utf-8') as f:
        json.dump(d, f, indent=2, ensure_ascii=False)
        f.write('\n')
print('OAuth i18n keys added')
