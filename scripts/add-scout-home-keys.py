import json

for lang in ['it', 'en']:
    with open(f'src/messages/{lang}.json', 'r', encoding='utf-8') as f:
        d = json.load(f)

    if 'scout' not in d.get('pages', {}):
        d.setdefault('pages', {})['scout'] = {}

    if lang == 'it':
        d['pages']['scout']['home'] = {
            'greeting': 'Ciao, {name}',
            'searchModels': 'Cerca Modelli',
            'newCasting': 'Nuovo Casting',
            'contactsUsed': 'Contatti utilizzati',
            'thisMonth': 'questo mese',
            'contactsRemaining': 'contatti rimanenti',
            'activeCastings': 'Casting attivi',
            'activeJobs': 'Lavori attivi',
            'pendingReview': 'Da revisionare',
            'activeConversations': 'Conversazioni',
            'shortlists': 'Shortlist',
            'modelsLiked': 'Modelli salvati',
            'pendingContacts': 'Contatti in attesa',
            'recentApplications': 'Candidature recenti',
            'recentActivity': 'Attività recente',
            'viewAll': 'Vedi tutto',
            'noApplicationsYet': 'Nessuna candidatura ancora. Pubblica un casting per iniziare!',
            'noActivity': 'Nessuna attività recente.',
            'quickSearch': 'Cerca modelli',
            'quickCasting': 'Crea casting',
            'quickJob': 'Crea lavoro',
            'quickBoards': 'Le tue board'
        }
    else:
        d['pages']['scout']['home'] = {
            'greeting': 'Hello, {name}',
            'searchModels': 'Search Models',
            'newCasting': 'New Casting',
            'contactsUsed': 'Contacts used',
            'thisMonth': 'this month',
            'contactsRemaining': 'contacts remaining',
            'activeCastings': 'Active castings',
            'activeJobs': 'Active jobs',
            'pendingReview': 'Pending review',
            'activeConversations': 'Conversations',
            'shortlists': 'Shortlists',
            'modelsLiked': 'Models saved',
            'pendingContacts': 'Pending contacts',
            'recentApplications': 'Recent applications',
            'recentActivity': 'Recent activity',
            'viewAll': 'View all',
            'noApplicationsYet': 'No applications yet. Publish a casting to get started!',
            'noActivity': 'No recent activity.',
            'quickSearch': 'Search models',
            'quickCasting': 'Create casting',
            'quickJob': 'Create job',
            'quickBoards': 'Your boards'
        }

    with open(f'src/messages/{lang}.json', 'w', encoding='utf-8') as f:
        json.dump(d, f, indent=2, ensure_ascii=False)
        f.write('\n')

print('Scout home i18n keys added')
