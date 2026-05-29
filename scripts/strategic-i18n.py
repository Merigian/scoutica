import json

for lang in ['it', 'en']:
    with open(f'src/messages/{lang}.json', 'r', encoding='utf-8') as f:
        d = json.load(f)
    
    if lang == 'it':
        # Pricing page - complete rewrite
        d['pricing'] = {
            'label': 'Prezzi',
            'title': 'Tutto gratuito. Nessun abbonamento.',
            'subtitle': 'Scoutica è gratuito per modelli e professionisti. Costruisci il tuo portfolio, cerca talenti, pubblica casting — senza limiti.',
            'freeForever': 'Gratuito per sempre',
            'freeDesc': 'Tutti gli strumenti professionali, senza costi nascosti.',
            'feature1': { 'title': 'Portfolio illimitato', 'desc': 'Fino a 12 foto, video e PDF book.' },
            'feature2': { 'title': 'Ricerca talenti avanzata', 'desc': 'Filtri per misure, città, categorie.' },
            'feature3': { 'title': 'Casting e lavori', 'desc': 'Pubblica annunci e ricevi candidature.' },
            'feature4': { 'title': 'Messaggistica diretta', 'desc': 'Contatta modelli e scout senza limiti.' },
            'feature5': { 'title': 'Shortlist e pipeline', 'desc': 'Organizza i talenti in bacheche.' },
            'feature6': { 'title': 'Profili verificati', 'desc': 'Scout e agenzie verificate per la tua sicurezza.' },
            'ctaModel': 'Registrati come Modello',
            'ctaScout': 'Registrati come Scout',
            'promotedTeaser': 'Vuoi dare più visibilità ai tuoi casting? I casting promossi saranno disponibili a breve.'
        }
        
        # Landing hero professional copy
        d['landing']['hero']['title'] = 'La piattaforma professionale per lo scouting nella moda'
        d['landing']['hero']['subtitle'] = 'Connetti modelli con scout, agenzie e brand verificati. Gratuito per tutti.'
        
        # Model dashboard
        d['pages']['model']['home']['profileStrength'] = 'Profilo'
        
    else:
        d['pricing'] = {
            'label': 'Pricing',
            'title': 'Completely free. No subscriptions.',
            'subtitle': 'Scoutica is free for models and professionals. Build your portfolio, search talent, post castings — no limits.',
            'freeForever': 'Free forever',
            'freeDesc': 'All professional tools, no hidden costs.',
            'feature1': { 'title': 'Unlimited portfolio', 'desc': 'Up to 12 photos, video and PDF book.' },
            'feature2': { 'title': 'Advanced talent search', 'desc': 'Filter by measurements, city, categories.' },
            'feature3': { 'title': 'Castings and jobs', 'desc': 'Post listings and receive applications.' },
            'feature4': { 'title': 'Direct messaging', 'desc': 'Contact models and scouts with no limits.' },
            'feature5': { 'title': 'Shortlists and pipeline', 'desc': 'Organize talent into boards.' },
            'feature6': { 'title': 'Verified profiles', 'desc': 'Verified scouts and agencies for your safety.' },
            'ctaModel': 'Sign up as Model',
            'ctaScout': 'Sign up as Scout',
            'promotedTeaser': 'Want more visibility for your castings? Promoted castings coming soon.'
        }
        
        d['landing']['hero']['title'] = 'The professional platform for fashion talent scouting'
        d['landing']['hero']['subtitle'] = 'Connect models with verified scouts, agencies and brands. Free for everyone.'
        
        d['pages']['model']['home']['profileStrength'] = 'Profile'
    
    with open(f'src/messages/{lang}.json', 'w', encoding='utf-8') as f:
        json.dump(d, f, indent=2, ensure_ascii=False)
        f.write('\n')

print('Strategic i18n update complete')
