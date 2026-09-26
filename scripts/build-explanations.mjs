/**
 * Genera src/data/explanations.js a partir de docs/explicacion-oficial-del-himno.md.
 *
 * El documento de docs/ es la copia legible y citable de la explicación oficial de
 * Gualberto Cantarero Palacios; este script la convierte en datos para la web sin
 * que nadie tenga que volver a transcribirla. Si el texto cambia allí, se ejecuta
 * esto y la aplicación queda al día: una sola fuente de verdad.
 *
 * Uso: node scripts/build-explanations.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ORIGEN = path.join(process.cwd(), 'docs', 'explicacion-oficial-del-himno.md');
const DESTINO = path.join(process.cwd(), 'src', 'data', 'explanations.js');

// El orden es el del himno; el id debe coincidir con el de src/data/stanzas.js.
const SECCIONES = [
  ['coro', 'Coro'],
  ['primera', 'Primera estrofa'],
  ['segunda', 'Segunda estrofa'],
  ['tercera', 'Tercera estrofa'],
  ['cuarta', 'Cuarta estrofa'],
  ['quinta', 'Quinta estrofa'],
  ['sexta', 'Sexta estrofa'],
  ['septima', 'Séptima estrofa'],
];

const markdown = fs.readFileSync(ORIGEN, 'utf8');

/** Devuelve el cuerpo que hay entre un encabezado `## X` y el siguiente `##`. */
function seccion(titulo) {
  const inicio = markdown.indexOf('\n## ' + titulo + '\n');
  if (inicio === -1) throw new Error('No se encontró la sección «' + titulo + '».');
  const desde = inicio + titulo.length + 5;
  const siguiente = markdown.indexOf('\n## ', desde);
  const fin = siguiente === -1 ? markdown.length : siguiente;
  return markdown.slice(desde, fin);
}

/** Deshace el ajuste de línea del markdown y deja un párrafo por entrada. */
function parrafos(cuerpo) {
  return cuerpo
    .split(/\n\s*\n/)
    .map(bloque => bloque.split('\n').map(l => l.trim()).join(' ').trim())
    .filter(bloque => bloque && !bloque.startsWith('#') && !bloque.startsWith('---') && !bloque.startsWith('|'));
}

const entradas = SECCIONES.map(([id, titulo]) => {
  const texto = parrafos(seccion(titulo)).join('\n\n');
  if (!texto) throw new Error('La sección «' + titulo + '» quedó vacía.');
  return { id, titulo, texto };
});

const cuerpo = entradas
  .map(e => '  ' + e.id + ': ' + JSON.stringify(e.texto) + ',')
  .join('\n');

const salida = `// Generado por scripts/build-explanations.mjs. No editar a mano:
// el texto vive en docs/explicacion-oficial-del-himno.md.
//
// Explicación oficial del Himno Nacional de Honduras, de Gualberto Cantarero
// Palacios, «Interpretación y explicación del himno nacional» (1983). Es la obra
// que la pregunta 12 del cuestionario señala como autora de la explicación y que
// la Cátedra del Himno Nacional (Secretaría de Educación, 2023) cita como
// referencia oficial. Las respuestas 49 a 56 del cuestionario son resúmenes de
// este texto y se conservan aparte, en el apartado del cuestionario.

export const explanations = {
${cuerpo}
};

export const EXPLANATION_SOURCE = 'Gualberto Cantarero Palacios, «Interpretación y explicación del himno nacional» (1983)';
`;

fs.writeFileSync(DESTINO, salida);
console.log(
  entradas.length + ' explicaciones escritas en src/data/explanations.js (' +
  entradas.reduce((n, e) => n + e.texto.length, 0) + ' caracteres).',
);
