const fs = require('fs');
const en = JSON.parse(fs.readFileSync('src/messages/en.json', 'utf8'));
const it = JSON.parse(fs.readFileSync('src/messages/it.json', 'utf8'));

function setNested(obj, path, val) {
  const keys = path.split('.');
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!cur[keys[i]]) cur[keys[i]] = {};
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = val;
}

const pairs = [
  ['components.studioPublish.deleteConfirm', 'Are you sure you want to delete this studio? This action is irreversible.', "Sei sicuro di voler eliminare questo studio? L'azione è irreversibile."],
  ['components.studioPublish.view', 'View', 'Vedi'],
  ['components.studioPublish.publish', 'Publish', 'Pubblica'],
  ['components.studioPublish.pause', 'Pause', 'Metti in pausa'],
];

for (const [key, enVal, itVal] of pairs) {
  setNested(en, key, enVal);
  setNested(it, key, itVal);
}

fs.writeFileSync('src/messages/en.json', JSON.stringify(en, null, 2) + '\n');
fs.writeFileSync('src/messages/it.json', JSON.stringify(it, null, 2) + '\n');
console.log(`Done adding ${pairs.length} key pairs`);
