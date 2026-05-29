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
  ['components.studioPhotos.formatError', 'Format not supported. Use JPG, PNG or WebP.', 'Formato non supportato. Usa JPG, PNG o WebP.'],
  ['components.studioPhotos.sizeError', 'File is too large. Maximum 10MB.', 'Il file è troppo grande. Massimo 10MB.'],
  ['components.studioPhotos.uploadError', 'Error uploading', 'Errore durante il caricamento'],
  ['components.studioPhotos.title', 'Photos', 'Foto'],
  ['components.studioPhotos.addPhoto', 'Add photo', 'Aggiungi foto'],
  ['components.studioPhotos.emptyMessage', 'Add at least one photo of your studio', 'Aggiungi almeno una foto del tuo studio'],
  ['components.studioPhotos.studioAlt', 'Studio', 'Studio'],
];

for (const [key, enVal, itVal] of pairs) {
  setNested(en, key, enVal);
  setNested(it, key, itVal);
}

fs.writeFileSync('src/messages/en.json', JSON.stringify(en, null, 2) + '\n');
fs.writeFileSync('src/messages/it.json', JSON.stringify(it, null, 2) + '\n');
console.log(`Done adding ${pairs.length} key pairs`);
