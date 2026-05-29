const fs = require('fs');
const en = JSON.parse(fs.readFileSync('src/messages/en.json', 'utf8'));
const it = JSON.parse(fs.readFileSync('src/messages/it.json', 'utf8'));

if (!en.auth.forgotPassword) en.auth.forgotPassword = {};
if (!it.auth.forgotPassword) it.auth.forgotPassword = {};

en.auth.forgotPassword.sentTitle = 'Email sent';
it.auth.forgotPassword.sentTitle = 'Email inviata';
en.auth.forgotPassword.sentDescription = 'If an account with the email {email} exists, you will receive instructions to reset your password.';
it.auth.forgotPassword.sentDescription = "Se un account con l'email {email} esiste, riceverai le istruzioni per reimpostare la password.";
en.auth.forgotPassword.backToLogin = 'Back to login';
it.auth.forgotPassword.backToLogin = 'Torna al login';
en.auth.forgotPassword.description = 'Enter your email and we will send you instructions to reset your password.';
it.auth.forgotPassword.description = 'Inserisci la tua email e ti invieremo le istruzioni per reimpostare la password.';
en.auth.forgotPassword.emailPlaceholder = 'name@example.com';
it.auth.forgotPassword.emailPlaceholder = 'nome@esempio.com';
en.auth.forgotPassword.genericError = 'An error occurred. Please try again.';
it.auth.forgotPassword.genericError = "Si è verificato un errore. Riprova.";
en.auth.forgotPassword.submitting = 'Sending...';
it.auth.forgotPassword.submitting = 'Invio in corso...';
en.auth.forgotPassword.submit = 'Send reset link';
it.auth.forgotPassword.submit = 'Invia link di reset';

fs.writeFileSync('src/messages/en.json', JSON.stringify(en, null, 2) + '\n');
fs.writeFileSync('src/messages/it.json', JSON.stringify(it, null, 2) + '\n');
console.log('Done');
