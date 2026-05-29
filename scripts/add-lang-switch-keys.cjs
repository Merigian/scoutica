const fs = require('fs');
const en = JSON.parse(fs.readFileSync('src/messages/en.json', 'utf8'));
const it = JSON.parse(fs.readFileSync('src/messages/it.json', 'utf8'));

if (!en.nav) en.nav = {};
if (!it.nav) it.nav = {};

// When current lang is English, show Italian option (inverted)
en.nav.switchToOtherLang = "Passa all'italiano";
it.nav.switchToOtherLang = 'Switch to English';
en.nav.otherLangCode = 'IT';
it.nav.otherLangCode = 'EN';
en.nav.otherLangName = 'Italiano';
it.nav.otherLangName = 'English';

fs.writeFileSync('src/messages/en.json', JSON.stringify(en, null, 2) + '\n');
fs.writeFileSync('src/messages/it.json', JSON.stringify(it, null, 2) + '\n');
console.log('Done');
