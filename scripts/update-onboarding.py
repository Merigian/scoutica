import json

for lang in ['it', 'en']:
    with open(f'src/messages/{lang}.json', 'r', encoding='utf-8') as f:
        d = json.load(f)
    
    if lang == 'it':
        d['onboarding']['welcome'] = 'Benvenuto su Scoutica'
        d['onboarding']['subtitle'] = 'Costruisci il tuo portfolio professionale per essere scoperto da scout e agenzie verificate.'
        d['onboarding']['steps']['photo'] = 'Costruisci il tuo portfolio'
        d['onboarding']['steps']['photoDesc'] = 'Carica almeno 3 foto professionali.'
        d['onboarding']['steps']['measurements'] = 'Aggiungi le misure'
        d['onboarding']['steps']['measurementsDesc'] = 'I direttori casting cercano per misure specifiche.'
        d['onboarding']['steps']['info'] = 'Completa il tuo profilo'
        d['onboarding']['steps']['infoDesc'] = 'Nome, città e categoria professionale.'
        d['onboarding']['steps']['publish'] = 'Vai live'
        d['onboarding']['steps']['publishDesc'] = 'Renditi visibile a professionisti verificati.'
        d['onboarding']['done'] = 'Il tuo portfolio è pronto'
        d['onboarding']['doneDesc'] = 'Ora sei visibile a scout e agenzie verificate.'
    else:
        d['onboarding']['welcome'] = 'Welcome to Scoutica'
        d['onboarding']['subtitle'] = 'Build your professional portfolio to be discovered by verified scouts and agencies.'
        d['onboarding']['steps']['photo'] = 'Build your portfolio'
        d['onboarding']['steps']['photoDesc'] = 'Upload at least 3 professional photos.'
        d['onboarding']['steps']['measurements'] = 'Add your measurements'
        d['onboarding']['steps']['measurementsDesc'] = 'Casting directors search by specific measurements.'
        d['onboarding']['steps']['info'] = 'Complete your profile'
        d['onboarding']['steps']['infoDesc'] = 'Name, city and professional category.'
        d['onboarding']['steps']['publish'] = 'Go live'
        d['onboarding']['steps']['publishDesc'] = 'Become visible to verified professionals.'
        d['onboarding']['done'] = 'Your portfolio is ready'
        d['onboarding']['doneDesc'] = 'You are now visible to verified scouts and agencies.'
    
    with open(f'src/messages/{lang}.json', 'w', encoding='utf-8') as f:
        json.dump(d, f, indent=2, ensure_ascii=False)
        f.write('\n')

print('Professional onboarding copy updated')
