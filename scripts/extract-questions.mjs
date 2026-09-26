import fs from 'node:fs';
import * as cheerio from 'cheerio';

const html = fs.readFileSync('cuestionario-source.html', 'utf8');
const start = html.indexOf('<p><strong>1.</strong>');
const end = html.indexOf('<p><strong>Jóvenes de Honduras</strong>');
if (start < 0 || end < 0) throw new Error('No se localizó el cuestionario en la fuente.');
let section = html.slice(start, end);
section = section
  .replace(/<strong>(?:&nbsp;|\s)*(\d{1,3})\.?(?:&nbsp;|\s)*<\/strong>(?:&nbsp;|\s)*\.?/g, '\n@@$1@@ ')
  .replace(/<h\d[^>]*>[\s\S]*?<\/h\d>/gi, '\n')
  .replace(/<br\s*\/?\s*>/gi, '\n')
  .replace(/<\/(?:p|li|ul|ol|h\d)>/gi, '\n')
  .replace(/<img\b[^>]*>/gi, ' ');
const plain = cheerio.load(`<div>${section}</div>`)('div').first().text()
  .replace(/\r/g, '')
  .replace(/\u00a0/g, ' ')
  .replace(/[ \t]+/g, ' ')
  .replace(/\n[ \t]*/g, '\n');
const parts = [...plain.matchAll(/@@(\d{1,3})@@([\s\S]*?)(?=@@\d{1,3}@@|$)/g)];
const records = parts.map(([, rawNum, rawBody]) => {
  const number = Number(rawNum);
  const body = rawBody.trim();
  const answerAt = body.search(/(?:^|\n|\s)R\s*=/i);
  let question, answer;
  if (answerAt >= 0) {
    const marker = body.slice(answerAt).match(/R\s*=/i);
    question = body.slice(0, answerAt).trim();
    answer = body.slice(answerAt + marker.index + marker[0].length).trim();
  } else {
    const breakAt = body.indexOf('\n');
    question = breakAt >= 0 ? body.slice(0, breakAt).trim() : body;
    answer = breakAt >= 0 ? body.slice(breakAt + 1).trim() : '';
  }
  return {
    number,
    category: number <= 48 ? 'El himno' : number <= 56 ? 'Explicación' : number <= 78 ? 'La bandera' : 'El escudo',
    question: question.replace(/\s+/g, ' '),
    answer: answer.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim(),
  };
});
const corrections = {
  3: { image: '/diagrams/acento-metrico.jpg', imageAlt: 'Diagrama del acento métrico del Himno Nacional de Honduras' },
  12: { editorialNote: 'Nota de cotejo: la Cátedra del Himno Nacional de la Secretaría de Educación consigna el nombre Gualberto Cantarero Palacios; esta respuesta conserva íntegra la transcripción del cuestionario.' },
  29: { question: '¿Qué constituyen las voces del Himno Nacional comprendidas desde la primera hasta la sexta estrofa?' },
  33: { image: '/diagrams/compas-himno.jpg', imageAlt: 'Diagrama de los cuatro movimientos del compás del himno' },
  41: { question: 'En cuanto a la música, ¿qué críticas se le hacen a nuestro Himno Nacional?' },
  72: { question: '¿Qué banderas existieron durante el período colonial en Honduras?' },
};
for (const record of records) {
  Object.assign(record, corrections[record.number] || {});
  record.question = record.question
    .replace(/¿Que\b/g, '¿Qué')
    .replace(/¿Como\b/g, '¿Cómo')
    .replace(/¿Cuales\b/g, '¿Cuáles')
    .replace(/¿Quien\b/g, '¿Quién')
    .replace(/¿Quienes\b/g, '¿Quiénes')
    .replace(/¿En que\b/g, '¿En qué')
    .replace(/\besta compuesto\b/g, 'está compuesto')
    .replace(/\besta estructurado\b/g, 'está estructurado')
    .replace(/\bPublica\b/g, 'Pública')
    .replace(/\barticulo\b/g, 'artículo')
    .replace(/\bCodigo\b/g, 'Código')
    .replace(/\bdespues\b/g, 'después')
    .replace(/\bautenticamente\b/g, 'auténticamente')
    .replace(/\bartísitico\b/g, 'artístico')
    .replace(/\bTriangulo\b/g, 'triángulo')
    .replace(/\bMenores\b/g, 'menores')
    .replace(/\bHimnos\b/g, 'himnos')
    .replace(/\bBandera \?/g, 'Bandera?');
}
records[86].question = '¿Dónde se sitúan los dos castillos y qué significan?';
records[74].answer = records[74].answer.replace(/\s+(?=(?:ll|[a-pñ])\)\s)/g, '\n');
fs.mkdirSync('src/data', { recursive: true });
fs.writeFileSync('src/data/questions.json', JSON.stringify(records, null, 2) + '\n');
console.log(`Se extrajeron ${records.length} entradas.`);
console.log('Números ausentes:', Array.from({ length: 100 }, (_, i) => i + 1).filter(n => !records.some(x => x.number === n)));
console.log('Respuestas vacías:', records.filter(x => !x.answer).map(x => x.number));
