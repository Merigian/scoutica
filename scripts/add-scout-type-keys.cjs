const fs = require('fs');
const en = JSON.parse(fs.readFileSync('src/messages/en.json', 'utf8'));
const it = JSON.parse(fs.readFileSync('src/messages/it.json', 'utf8'));

// Add scout type labels under auth.register namespace
en.auth.register.scoutLabel = 'Scout';
it.auth.register.scoutLabel = 'Scout';
en.auth.register.agencyLabel = 'Agency';
it.auth.register.agencyLabel = 'Agenzia';
en.auth.register.brandLabel = 'Brand';
it.auth.register.brandLabel = 'Brand';

fs.writeFileSync('src/messages/en.json', JSON.stringify(en, null, 2) + '\n');
fs.writeFileSync('src/messages/it.json', JSON.stringify(it, null, 2) + '\n');
console.log('Done');
