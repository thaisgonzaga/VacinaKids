// Seed da coleção global `campaigns` (T4.5).
//
// As regras de segurança negam `write` do cliente (PLANO §4), então o seed
// roda com o **Admin SDK** (ignora as regras). Uso:
//
//   1. npm i -D firebase-admin
//   2. Baixe a chave de service account no console do Firebase
//      (Configurações do projeto → Contas de serviço → Gerar nova chave) e
//      aponte a variável de ambiente para o arquivo:
//        export GOOGLE_APPLICATION_CREDENTIALS="/caminho/serviceAccount.json"
//   3. node scripts/seed-campaigns.mjs
//
// Alternativa sem script: criar os documentos manualmente no console do
// Firestore usando o conteúdo de `scripts/campaigns.seed.json`.

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { cert, initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const here = dirname(fileURLToPath(import.meta.url));
const campanhas = JSON.parse(
  await readFile(join(here, 'campaigns.seed.json'), 'utf8'),
);

// Usa GOOGLE_APPLICATION_CREDENTIALS; aceita também caminho via argv[2].
const credPath = process.argv[2];
initializeApp({
  credential: credPath ? cert(credPath) : applicationDefault(),
});

const db = getFirestore();
const col = db.collection('campaigns');

for (const campanha of campanhas) {
  const ref = await col.add(campanha);
  console.log(`✓ ${campanha.titulo} → ${ref.id}`);
}

console.log(`\nSeed concluído: ${campanhas.length} campanhas.`);
process.exit(0);
