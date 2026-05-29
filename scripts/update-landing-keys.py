import json

for lang in ['it', 'en']:
    with open(f'src/messages/{lang}.json', 'r', encoding='utf-8') as f:
        d = json.load(f)
    
    if lang == 'it':
        d['landing']['hero']['trustVerified'] = 'Scout e agenzie verificate'
        d['landing']['hero']['trustSafe'] = 'Piattaforma sicura e GDPR'
        d['landing']['hero']['trustProfessional'] = 'Solo professionisti del settore'
        d['landing']['hero']['studioLink'] = 'Hai uno studio fotografico? Pubblicalo qui →'
    else:
        d['landing']['hero']['trustVerified'] = 'Verified scouts & agencies'
        d['landing']['hero']['trustSafe'] = 'Safe & GDPR compliant'
        d['landing']['hero']['trustProfessional'] = 'Industry professionals only'
        d['landing']['hero']['studioLink'] = 'Have a photo studio? List it here →'
    
    with open(f'src/messages/{lang}.json', 'w', encoding='utf-8') as f:
        json.dump(d, f, indent=2, ensure_ascii=False)
        f.write('\n')

print('Landing trust i18n keys added')
