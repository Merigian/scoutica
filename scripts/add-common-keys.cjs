const fs = require('fs');
const en = JSON.parse(fs.readFileSync('src/messages/en.json', 'utf8'));
const it = JSON.parse(fs.readFileSync('src/messages/it.json', 'utf8'));

en.common.description = 'Description';
it.common.description = 'Descrizione';
en.common.address = 'Address';
it.common.address = 'Indirizzo';
en.common.cancel = en.common.cancel || 'Cancel';
it.common.cancel = it.common.cancel || 'Annulla';

// Also add "Nome dello studio" as "Studio name" label since nameRequired was used as both error and label
en.pages.studio.createStudio.studioName = 'Studio name';
it.pages.studio.createStudio.studioName = 'Nome dello studio';

fs.writeFileSync('src/messages/en.json', JSON.stringify(en, null, 2) + '\n');
fs.writeFileSync('src/messages/it.json', JSON.stringify(it, null, 2) + '\n');
console.log('Done');
