/**
 * Arma el cuadernillo completo —himno con explicaciones y las 100 preguntas—
 * en un único PDF con texto seleccionable.
 *
 * Se apoya en las fuentes estándar de jsPDF (Helvetica y Times), que usan
 * codificación WinAnsi: cubre tildes, «ñ», comillas angulares, rayas y el punto
 * medio, que es todo lo que aparece en el contenido. `sanear()` sustituye
 * cualquier carácter que se salga de ahí en lugar de dejar que el visor pinte
 * un cuadrito vacío.
 *
 * El módulo se carga con import() dinámico desde el Hero, así que jsPDF no pesa
 * en el paquete inicial: sólo se descarga cuando alguien pulsa el botón.
 */
import { stanzas } from '../data/stanzas';
import questions from '../data/questions.json';

const PAGE = { w: 595.28, h: 841.89 }; // A4 en puntos
const M = { left: 62, right: 62, top: 70, bottom: 74 };
const ANCHO = PAGE.w - M.left - M.right;

const INK = [9, 47, 67];
const AZUL = [8, 125, 202];
const APAGADO = [69, 110, 129];
const LINEA = [189, 218, 232];
const NOTA_FONDO = [234, 249, 255];

const FUENTE = 'https://www.xplorhonduras.com/cuestionario-civico-del-himno-nacional-de-honduras/';
const CATEDRA = 'https://www.se.gob.hn/media/files/coleccion_civica/documentos/Catedra_del_Himno_Nacional_de_Honduras_1.9.23.pdf';

const REEMPLAZOS = [
  [/[‘’‛]/g, "'"],
  [/[“”]/g, '"'],
  [/–/g, '-'],
  [/—/g, '—'],
  [/…/g, '...'],
  [/ /g, ' '],
  [/[​-‍﻿]/g, ''],
];

function sanear(texto) {
  let salida = String(texto ?? '');
  for (const [patron, valor] of REEMPLAZOS) salida = salida.replace(patron, valor);
  // Cualquier resto fuera de Latin-1 se descarta antes de llegar al visor.
  return salida.replace(/[^\u0000-ÿ—]/g, '');
}

function parrafos(texto) {
  return sanear(texto).split(/\n+/).map(p => p.trim()).filter(Boolean);
}

class Cuadernillo {
  constructor(doc) {
    this.doc = doc;
    this.y = M.top;
    this.seccion = '';
  }

  get fondo() {
    return PAGE.h - M.bottom;
  }

  nuevaPagina() {
    this.doc.addPage();
    this.y = M.top;
  }

  /** Reserva `alto`; si no cabe en lo que queda de página, salta a la siguiente. */
  reservar(alto) {
    if (this.y + alto > this.fondo) this.nuevaPagina();
  }

  estilo({ familia = 'helvetica', peso = 'normal', tam = 10.5, color = INK }) {
    this.doc.setFont(familia, peso);
    this.doc.setFontSize(tam);
    this.doc.setTextColor(...color);
  }

  /** Escribe un bloque de texto ajustado al ancho, partiéndolo entre páginas. */
  bloque(texto, opciones = {}) {
    const { interlineado = 1.5, sangria = 0, espacioDespues = 0, ancho = ANCHO - (opciones.sangria ?? 0) } = opciones;
    this.estilo(opciones);
    const alto = this.doc.getFontSize() * interlineado;
    const lineas = this.doc.splitTextToSize(sanear(texto), ancho);
    for (const linea of lineas) {
      this.reservar(alto);
      this.doc.text(linea, M.left + sangria, this.y + this.doc.getFontSize() * 0.8);
      this.y += alto;
    }
    this.y += espacioDespues;
  }

  regla(espacioAntes = 0, espacioDespues = 10) {
    this.y += espacioAntes;
    this.reservar(12);
    this.doc.setDrawColor(...LINEA);
    this.doc.setLineWidth(0.7);
    this.doc.line(M.left, this.y, PAGE.w - M.right, this.y);
    this.y += espacioDespues;
  }

  /** Aviso de cotejo: fondo suave y filete azul, igual que en la web. */
  nota(texto) {
    const limpio = sanear(texto);
    this.estilo({ tam: 8.5, color: [40, 95, 118] });
    const lineas = this.doc.splitTextToSize(limpio, ANCHO - 30);
    const alto = lineas.length * 11.5 + 18;
    this.reservar(alto);
    this.doc.setFillColor(...NOTA_FONDO);
    this.doc.rect(M.left, this.y, ANCHO, alto, 'F');
    this.doc.setDrawColor(...AZUL);
    this.doc.setLineWidth(1.6);
    this.doc.line(M.left + 0.8, this.y, M.left + 0.8, this.y + alto);
    let cursor = this.y + 13;
    for (const linea of lineas) {
      this.doc.text(linea, M.left + 15, cursor);
      cursor += 11.5;
    }
    this.y += alto + 14;
  }
}

function portada(c) {
  const { doc } = c;
  doc.setFillColor(8, 125, 202);
  doc.rect(0, 0, PAGE.w, 250, 'F');

  doc.setFont('times', 'normal');
  doc.setFontSize(40);
  doc.setTextColor(255, 255, 255);
  doc.text('Himno Nacional', M.left, 118);
  doc.text('de Honduras', M.left, 162);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(210, 238, 252);
  doc.text('Y LAS 100 PREGUNTAS DEL CUESTIONARIO CÍVICO', M.left, 200);

  c.y = 300;
  c.bloque('Cuadernillo de estudio', { familia: 'times', tam: 20, color: INK, interlineado: 1.3, espacioDespues: 6 });
  c.bloque(
    'El coro y las siete estrofas con su letra y su explicación íntegra, seguidos de las cien preguntas del cuestionario cívico con su respuesta completa.',
    { tam: 11, color: APAGADO, interlineado: 1.6, espacioDespues: 26 },
  );
  c.regla(0, 18);

  c.bloque('FUENTES', { peso: 'bold', tam: 8.5, color: AZUL, espacioDespues: 8 });
  c.bloque(
    'Las preguntas y respuestas conservan el texto del cuestionario cívico publicado por XplorHonduras. La letra del himno y las explicaciones se cotejaron con la Cátedra del Himno Nacional de Honduras (Secretaría de Educación, 2023) y con la explicación oficial de Gualberto Cantarero Palacios (1983).',
    { tam: 9, color: APAGADO, interlineado: 1.6, espacioDespues: 6 },
  );
  c.bloque(FUENTE, { tam: 8, color: AZUL, interlineado: 1.5, espacioDespues: 2 });
  c.bloque(CATEDRA, { tam: 8, color: AZUL, interlineado: 1.5, espacioDespues: 20 });

  c.bloque(
    'Las notas de cotejo que aparecen sobre fondo azul señalan los puntos en que el texto del cuestionario no coincide con las fuentes oficiales. La respuesta se conserva tal como se pide en el examen.',
    { tam: 8.5, color: APAGADO, interlineado: 1.6, espacioDespues: 24 },
  );

  const hoy = new Date().toLocaleDateString('es-HN', { day: 'numeric', month: 'long', year: 'numeric' });
  c.bloque('12 INFO STUDY  ·  by henrysrdz  ·  ' + sanear(hoy), { peso: 'bold', tam: 8.5, color: INK });
}

function portadilla(c, numero, titulo, entrada) {
  c.nuevaPagina();
  c.y = 250;
  c.bloque(numero, { peso: 'bold', tam: 9, color: AZUL, espacioDespues: 12 });
  c.bloque(titulo, { familia: 'times', tam: 30, color: INK, interlineado: 1.25, espacioDespues: 14 });
  c.bloque(entrada, { tam: 10.5, color: APAGADO, interlineado: 1.65 });
}

function seccionHimno(c) {
  portadilla(
    c,
    'PRIMERA PARTE',
    'El Himno Nacional',
    'El coro y las siete estrofas. Cada una con sus ocho versos decasílabos y la explicación completa que le corresponde en el cuestionario, de la pregunta 49 a la 56.',
  );
  c.seccion = 'Himno Nacional';

  stanzas.forEach((estrofa, indice) => {
    c.nuevaPagina();
    c.bloque(sanear(estrofa.period).toUpperCase(), { peso: 'bold', tam: 8.5, color: AZUL, espacioDespues: 9 });
    c.bloque(estrofa.label, { familia: 'times', tam: 26, color: INK, interlineado: 1.2, espacioDespues: 4 });
    c.bloque(estrofa.title, { tam: 10.5, color: APAGADO, interlineado: 1.5, espacioDespues: 16 });
    c.regla(0, 16);

    estrofa.lines.forEach((verso, i) => {
      c.reservar(22);
      c.estilo({ tam: 7.5, color: APAGADO });
      c.doc.text(String(i + 1).padStart(2, '0'), M.left, c.y + 11);
      c.estilo({ familia: 'times', tam: 13, color: INK });
      c.doc.text(sanear(verso), M.left + 24, c.y + 11);
      c.y += 22;
    });

    c.regla(14, 16);
    const explicacion = questions[48 + indice];
    c.bloque(indice === 0 ? 'QUÉ EXPLICA EL CORO' : 'QUÉ EXPLICA ESTA ESTROFA', { peso: 'bold', tam: 8.5, color: AZUL, espacioDespues: 11 });
    for (const parrafo of parrafos(explicacion.answer)) {
      c.bloque(parrafo, { tam: 10.5, interlineado: 1.68, espacioDespues: 9 });
    }
    if (explicacion.editorialNote) c.nota(explicacion.editorialNote);
    c.bloque('Cuestionario cívico, pregunta ' + explicacion.number, { tam: 8, color: APAGADO, espacioDespues: 0 });
  });
}

function seccionPreguntas(c) {
  portadilla(
    c,
    'SEGUNDA PARTE',
    'Las 100 preguntas',
    'El cuestionario cívico completo: el himno, su explicación, la bandera y el escudo. Cada pregunta con su respuesta íntegra.',
  );
  c.seccion = 'Cuestionario cívico';

  let categoria = '';
  questions.forEach(pregunta => {
    if (pregunta.category !== categoria) {
      categoria = pregunta.category;
      c.reservar(80);
      c.regla(12, 12);
      c.bloque(sanear(categoria).toUpperCase(), { peso: 'bold', tam: 11, color: AZUL, espacioDespues: 14 });
    }
    // Un enunciado nunca debe quedar solo al pie de la pagina.
    c.reservar(74);
    c.estilo({ familia: 'times', tam: 19, color: [168, 214, 236] });
    c.doc.text(String(pregunta.number).padStart(2, '0'), M.left, c.y + 15);
    c.bloque(pregunta.question, { peso: 'bold', tam: 11.5, interlineado: 1.45, sangria: 38, espacioDespues: 8 });
    for (const parrafo of parrafos(pregunta.answer)) {
      c.bloque(parrafo, { tam: 10.5, interlineado: 1.68, sangria: 38, espacioDespues: 8 });
    }
    if (pregunta.editorialNote) c.nota(pregunta.editorialNote);
    c.y += 12;
  });
}

function pies(doc) {
  const total = doc.getNumberOfPages();
  for (let pagina = 2; pagina <= total; pagina++) {
    doc.setPage(pagina);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...APAGADO);
    doc.text('12 INFO STUDY  ·  Himno Nacional y 100 preguntas', M.left, PAGE.h - 40);
    doc.text(String(pagina) + ' / ' + total, PAGE.w - M.right, PAGE.h - 40, { align: 'right' });
  }
}

export const NOMBRE_ARCHIVO = 'himno-nacional-y-100-preguntas.pdf';

/** Construye el documento y lo devuelve sin guardarlo, para poder inspeccionarlo. */
export async function construirCuadernillo() {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4', compress: true });
  doc.setProperties({
    title: 'Himno Nacional de Honduras y las 100 preguntas del cuestionario cívico',
    subject: 'Cuadernillo de estudio cívico',
    creator: '12 INFO STUDY',
  });

  const cuadernillo = new Cuadernillo(doc);
  portada(cuadernillo);
  seccionHimno(cuadernillo);
  seccionPreguntas(cuadernillo);
  pies(doc);

  return doc;
}

export async function descargarCuadernillo() {
  const doc = await construirCuadernillo();
  doc.save(NOMBRE_ARCHIVO);
  return doc.getNumberOfPages();
}
