/**
 * Correcciones cotejadas de src/data/questions.json
 *
 * La transcripción base proviene de XplorHonduras y arrastra dos clases de
 * defectos: corrupción de la digitalización (la «ñ» convertida en «;», tildes
 * perdidas) y errores de dato que la fuente repite desde hace años.
 *
 * Este script aplica ambas capas y deja constancia:
 *   - `replace`: sustituciones literales sobre `answer`.
 *   - `note`:    texto para `editorialNote`, que la interfaz muestra bajo la
 *                respuesta cuando el dato canónico no coincide con la fuente
 *                oficial (Cátedra del Himno Nacional, Secretaría de Educación)
 *                o con la historiografía.
 *
 * Cada sustitución se verifica: si un `from` no aparece, el script falla en vez
 * de guardar un archivo a medias.
 *
 * Uso: node scripts/fix-questions.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const FILE = path.join(process.cwd(), 'src', 'data', 'questions.json');

const CATEDRA = 'Cátedra del Himno Nacional de Honduras (Secretaría de Educación, 2023)';
const PALACIOS = 'explicación oficial de Gualberto Cantarero Palacios («Interpretación y explicación del himno nacional», 1983)';

/** @type {Record<number, { replace?: [string, string][], note?: string }>} */
const FIXES = {
  2: { replace: [['Literalmente esta compuesto', 'Literalmente está compuesto'], ['cada estrofa esta formada', 'cada estrofa está formada']] },

  10: {
    replace: [['el 8 de Septiembre de de 1941', 'el 8 de Septiembre de 1941']],
    note: `Nota de cotejo: la mayoría de las biografías (Wikipedia en español, RedHonduras) sitúan el nacimiento de Augusto C. Coello el 1 de septiembre de 1884, no de 1883. La fecha exacta no es unánime entre las fuentes.`,
  },

  11: {
    replace: [['Schtlotheim, Erfurt, Capital del estado de Turingia, Alemania Federal', 'Schlotheim, en el actual estado de Turingia (cuya capital es Erfurt), Alemania']],
    note: `Nota de cotejo: Schlotheim no pertenece a Erfurt; ambas están en Turingia, de la que Erfurt es la capital. En 1869 la región no era «Alemania Federal», sino el principado de Schwarzburgo-Sondershausen.`,
  },

  12: { replace: [['departamento de Intibuca', 'departamento de Intibucá']] },

  13: { replace: [['José Antonio Dominguez', 'José Antonio Domínguez']] },

  22: {
    replace: [
      ['constituído', 'constituido'],
      ['el Decreto No. 42 del 3 de Noviembre de 1915', 'el Decreto No. 42 del 13 de Noviembre de 1915'],
    ],
    note: `Corrección cotejada: el Decreto No. 42 está fechado el 13 de noviembre de 1915. La ${CATEDRA} reproduce el texto íntegro del decreto, que cierra «Dado en Tegucigalpa, en el Palacio Nacional, a los trece días del mes de noviembre de mil novecientos quince». Muchas copias del cuestionario traen «3 de noviembre».`,
  },

  34: { replace: [['su música esta inspirada', 'su música está inspirada']] },

  37: { replace: [['dios de los Brahamanes en la India', 'dios de los brahmanes en la India']] },

  38: { replace: [['y «La Cai-rá»', 'y «Ça ira» (que el cuestionario transcribe «La Cai-rá»)']] },

  47: { replace: [['Porque esta amparado', 'Porque está amparado']] },

  49: {
    replace: [['Los otros cuatros versos restantes', 'Los otros cuatro versos restantes']],
    note: `Precisión de la ${CATEDRA}: la bandera lleva dos franjas azules —no una sola— que representan el cielo patrio, y la franja blanca del centro simboliza la paz, la serenidad y la pureza. El «formaron» no es errata: la ${PALACIOS} dice «formaron y han de formar una sola patria», y el cuestionario abrevió la frase a su primera mitad.`,
  },

  50: { replace: [['descubierto por Cristobal Colón', 'descubierto por Cristóbal Colón'], ['Colón les llamo «indios»', 'Colón les llamó «indios»']] },

  51: { replace: [['Cristobal Colón soñaba', 'Cristóbal Colón soñaba']] },

  52: {
    replace: [
      ['que los nativos de Copantl opusieron resistencia', 'que los nativos lencas de Cerquín opusieron resistencia'],
      ['el gobernador Francisco Montejo', 'el gobernador Francisco de Montejo'],
    ],
    note: `Corrección cotejada: la ${PALACIOS} precisa que para 1537 ya había sido vencida la gente de Copantl y fueron las tribus aguerridas de Cerquín las que se unieron bajo el mando de Lempira; el cuestionario fundía ambos pueblos en uno. Esa misma explicación detalla que el gobernador Francisco de Montejo mandó al capitán Alonso de Cáceres, y que un emisario enviado con bandera blanca disparó su arcabuz e hirió en la frente al héroe. La ${CATEDRA} identifica el «peñón» del himno con Congolón. La historiografía moderna discute el relato de la traición: la probanza de méritos de Rodrigo Ruiz (1558) da a Lempira caído en combate.`,
  },

  53: {
    note: `Precisión de la ${CATEDRA}: la dominación española se extendió 319 años, de 1502 a 1821. El «león» que ruge al otro lado del Atlántico es Francia, según lo aclara la quinta estrofa.`,
  },

  58: { replace: [['Simboliza el manto o se el vestido inmaculado', 'Simboliza el manto o el vestido inmaculado']] },

  61: {
    note: `Nota de cotejo: «bandum» es voz de origen germánico (gótico «bandwa», señal) incorporada al latín tardío. Hablar de «los romanos en la edad media» es un anacronismo: el Imperio romano de Occidente ya había caído.`,
  },

  63: {
    replace: [
      ['el 1 de Septiembre de cada a;o', 'el 1 de Septiembre de cada año'],
      ['Decreto Legislativo No. 84-91 del 9 de mayo de 1995', 'Decreto Legislativo No. 84-95 del 23 de mayo de 1995'],
      ['deroga al No. 5 que establecía', 'deroga al No. 5 del 7 de junio de 1943, que establecía'],
    ],
    note: `Correcciones cotejadas: el decreto es el 84-95 del 23 de mayo de 1995, emitido durante el gobierno de Carlos Roberto Reina, y derogó el Decreto No. 5 del 7 de junio de 1943, que fijaba el Día de la Bandera el 14 de junio.`,
  },

  67: { replace: [['el constante anhelo de paz de los hondureño', 'el constante anhelo de paz de los hondureños']] },

  69: {
    replace: [['la del Sureste a El Salvador y la del Sureste a Costa Rica', 'la del Suroeste a El Salvador y la del Sureste a Costa Rica']],
    note: `Corrección cotejada: la fuente repetía «Sureste» para El Salvador y para Costa Rica. A El Salvador le corresponde la estrella del Suroeste.`,
  },

  78: { replace: [['alumnos que se hallan destacado', 'alumnos que se hayan destacado']] },

  83: { replace: [['El triangulo se encuentra', 'El triángulo se encuentra']] },

  84: {
    replace: [
      ['tres arboles de roble', 'tres árboles de roble'],
      ['conveniente, unas minas, una barra, un barreno, una cu;a, una almádena y un martillo', 'conveniente, dos bocaminas, una barra, un barreno, una cuña, una almádena y un martillo'],
    ],
  },

  87: {
    note: `Nota de cotejo: ésta es la lectura simbólica tradicional. Históricamente las dos fortalezas son españolas y muy posteriores a la conquista: la de San Fernando de Omoa se construyó entre 1756 y 1775 para defender la costa caribeña de los ataques de piratas y corsarios ingleses.`,
  },

  89: {
    note: `Nota de cotejo: Colón sólo llegó a la costa caribeña de Honduras; nunca navegó el litoral hondureño del Pacífico. Los dos mares del escudo representan los dos océanos que bañan el territorio.`,
  },

  91: { replace: [['tres arboles de roble', 'tres árboles de roble']] },
};

const questions = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const byNumber = new Map(questions.map(q => [q.number, q]));

let replacements = 0;
let notes = 0;
const problems = [];

for (const [raw, fix] of Object.entries(FIXES)) {
  const number = Number(raw);
  const question = byNumber.get(number);
  if (!question) {
    problems.push(`No existe la pregunta ${number}.`);
    continue;
  }
  for (const [from, to] of fix.replace ?? []) {
    const field = question.answer.includes(from) ? 'answer' : question.question.includes(from) ? 'question' : null;
    if (!field) {
      problems.push(`Pregunta ${number}: no se encontró «${from.slice(0, 60)}…».`);
      continue;
    }
    if (question[field].indexOf(from) !== question[field].lastIndexOf(from)) {
      problems.push(`Pregunta ${number}: «${from.slice(0, 40)}…» aparece más de una vez.`);
      continue;
    }
    question[field] = question[field].replace(from, to);
    replacements++;
  }
  if (fix.note) {
    question.editorialNote = fix.note;
    notes++;
  }
}

if (problems.length) {
  console.error('No se guardó nada. Problemas:\n' + problems.map(p => ' - ' + p).join('\n'));
  process.exit(1);
}

fs.writeFileSync(FILE, JSON.stringify(questions, null, 2) + '\n');
console.log(`${replacements} sustituciones y ${notes} notas aplicadas sobre ${questions.length} preguntas.`);
