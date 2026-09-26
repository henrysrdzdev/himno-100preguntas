import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react';
import { ArrowDown, ArrowLeft, ArrowRight, Bookmark, BookOpen, CheckCircle, ChevronDown, CloseCircle, Copy, Eye, EyeOff, FilePdf, InfoCircle, Palette, Pin, Search3, TextHighlight, X } from 'reicon-react';
import { PreviewCard, PreviewCardPanel, PreviewCardTrigger } from './components/animate-ui/components/base/preview-card';
import { stanzas } from './data/stanzas';
import { explanations, EXPLANATION_SOURCE } from './data/explanations';
import questions from './data/questions.json';
import './styles.css';

const COLORS = [
  { name: 'Azul', value: '#1689e9' }, { name: 'Coral', value: '#f36a52' },
  { name: 'Amarillo', value: '#f5b427' }, { name: 'Verde', value: '#21aa87' },
];
const CATEGORIES = [
  { label: 'El himno', first: 1, last: 48 },
  { label: 'Explicación', first: 49, last: 56 },
  { label: 'La bandera', first: 57, last: 78 },
  { label: 'El escudo', first: 79, last: 100 },
];
const SOURCE_ANTHEM = 'https://www.se.gob.hn/media/files/coleccion_civica/documentos/Catedra_del_Himno_Nacional_de_Honduras_1.9.23.pdf';
const SOURCE_QUESTIONS = 'https://www.xplorhonduras.com/cuestionario-civico-del-himno-nacional-de-honduras/';
const MOBILE_QUERY = '(max-width: 760px)';
function stored(key, fallback) { try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } }
function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const list = window.matchMedia(query);
    const sync = event => setMatches(event.matches);
    setMatches(list.matches);
    list.addEventListener('change', sync);
    return () => list.removeEventListener('change', sync);
  }, [query]);
  return matches;
}
// El coro no es una estrofa numerada: el índice 0 es el coro y del 1 al 7 van las siete estrofas.
function stanzaPosition(index) { return index === 0 ? 'Coro' : 'Estrofa ' + index + ' de 7'; }
function stanzaFolio(index) { return index === 0 ? 'CORO' : 'ESTROFA ' + String(index).padStart(2, '0') + ' / 07'; }
function DuoIcon({ icon: Icon, size = 20 }) { return <span className="duo-icon" style={{ width: size, height: size }} aria-hidden="true"><Icon size={size} weight="Filled" className="duo-fill"/><Icon size={size} weight="Outline" className="duo-line"/></span>; }
function Marked({ text, unitKey, marks }) {
  const fragments = marks.filter(m => m.unitKey === unitKey && m.text?.length > 1);
  if (!fragments.length) return text;
  const output = []; let cursor = 0;
  while (cursor < text.length) {
    let hit = null, at = text.length;
    for (const mark of fragments) { const found = text.toLocaleLowerCase('es').indexOf(mark.text.toLocaleLowerCase('es'), cursor); if (found >= 0 && found < at) { hit = mark; at = found; } }
    if (!hit) { output.push(text.slice(cursor)); break; }
    if (at > cursor) output.push(text.slice(cursor, at));
    output.push(<mark key={hit.id + '-' + at} style={{ '--marker': hit.color }}>{text.slice(at, at + hit.text.length)}</mark>);
    cursor = at + hit.text.length;
  }
  return output;
}
function AnswerParagraphs({ text, unitKey, marks }) { return <div className="answer-paragraphs" data-copy-text={text}>{text.split(/\n+/).map(s => s.trim()).filter(Boolean).map((p, i) => <p key={i} data-copy-text={p}><Marked text={p} unitKey={unitKey} marks={marks}/></p>)}</div>; }
function App() {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const heroY = useSpring(useTransform(scrollY, [0, 720], [0, 76]), { stiffness: 110, damping: 26 });
  const heroScale = useSpring(useTransform(scrollY, [0, 720], [1, .965]), { stiffness: 110, damping: 26 });
  const heroRadius = useTransform(scrollY, [0, 180], [0, 30]);
  const initial = useMemo(() => stored('raiz-progress-v1', { mode: 'himno', stanza: 0, question: 0 }), []);
  const [mode, setMode] = useState(initial.mode === 'preguntas' ? 'preguntas' : 'himno');
  const [stanzaIndex, setStanzaIndex] = useState(Math.min(7, Math.max(0, initial.stanza || 0)));
  const [questionIndex, setQuestionIndex] = useState(Math.min(99, Math.max(0, initial.question || 0)));
  const [focusedLine, setFocusedLine] = useState(null), [focusMode, setFocusMode] = useState(false);
  const [fontScale, setFontScale] = useState(() => stored('raiz-font-v1', 0));
  const [bookmarks, setBookmarks] = useState(() => stored('raiz-bookmarks-v1', []));
  const [highlights, setHighlights] = useState(() => stored('raiz-highlights-v1', []));
  const [color, setColor] = useState(() => stored('raiz-color-v1', COLORS[0].value));
  const [search, setSearch] = useState(''), [bubbleVisible, setBubbleVisible] = useState(() => typeof window !== 'undefined' && !window.matchMedia('(max-width: 760px)').matches);
  const [searchOpen, setSearchOpen] = useState(false), [markersOpen, setMarkersOpen] = useState(false);
  const isMobile = useMediaQuery(MOBILE_QUERY);
  const [sheet, setSheet] = useState(null);
  const [radial, setRadial] = useState(null), [toast, setToast] = useState('');
  const [pdfEstado, setPdfEstado] = useState('listo');
  const [fontNotice, setFontNotice] = useState(null);
  const studyRef = useRef(null), questionRefs = useRef([]), bubbleTimer = useRef(null), scrollTick = useRef(false), jumping = useRef(false), jumpTimer = useRef(null);
  const lastSelection = useRef({ text: '', unitKey: '' });
  const activeUnit = mode === 'himno' ? 's-' + stanzaIndex : 'q-' + questionIndex;
  const activeText = mode === 'himno' ? stanzas[stanzaIndex].lines.join('\n') + '\n' + explanations[stanzas[stanzaIndex].id] : questions[questionIndex].question + '\n' + questions[questionIndex].answer;
  useEffect(() => { localStorage.setItem('raiz-progress-v1', JSON.stringify({ mode, stanza: stanzaIndex, question: questionIndex })); }, [mode, stanzaIndex, questionIndex]);
  useEffect(() => { localStorage.setItem('raiz-bookmarks-v1', JSON.stringify(bookmarks)); }, [bookmarks]);
  useEffect(() => { localStorage.setItem('raiz-highlights-v1', JSON.stringify(highlights)); }, [highlights]);
  useEffect(() => { localStorage.setItem('raiz-color-v1', JSON.stringify(color)); }, [color]);
  useEffect(() => { localStorage.setItem('raiz-font-v1', JSON.stringify(fontScale)); }, [fontScale]);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 3200); return () => clearTimeout(timer); }, [toast]);
  useEffect(() => { if (!fontNotice) return; const timer = setTimeout(() => setFontNotice(null), 820); return () => clearTimeout(timer); }, [fontNotice]);
  useEffect(() => { function remember() { const selection = window.getSelection(), text = selection?.toString().trim(); if (!text) return; const unit = selection.anchorNode?.parentElement?.closest('[data-unit-key]')?.dataset.unitKey; if (unit) lastSelection.current = { text, unitKey: unit }; } document.addEventListener('selectionchange', remember); return () => document.removeEventListener('selectionchange', remember); }, []);
  const showBubble = useCallback(() => {
    if (window.matchMedia('(max-width: 760px)').matches) return;
    setBubbleVisible(true);
    clearTimeout(bubbleTimer.current);
    bubbleTimer.current = setTimeout(() => { setBubbleVisible(false); setMarkersOpen(false); }, 3300);
  }, []);
  useEffect(() => { showBubble(); return () => clearTimeout(bubbleTimer.current); }, [showBubble]);
  useEffect(() => {
    const query = window.matchMedia('(max-width: 760px)');
    const syncDock = event => { clearTimeout(bubbleTimer.current); setMarkersOpen(false); setBubbleVisible(!event.matches); if (!event.matches) showBubble(); };
    query.addEventListener('change', syncDock);
    return () => query.removeEventListener('change', syncDock);
  }, [showBubble]);
  useEffect(() => {
    function onScroll() {
      const study = studyRef.current;
      if (study) setStudyInView(study.getBoundingClientRect().top < window.innerHeight * .3);
      if (window.matchMedia('(max-width: 760px)').matches) {
        clearTimeout(bubbleTimer.current);
        setBubbleVisible(false);
        setMarkersOpen(false);
      } else showBubble();
      if (mode !== 'preguntas') return;
      if (scrollTick.current || jumping.current) return; scrollTick.current = true;
      requestAnimationFrame(() => {
        const focusY = window.innerHeight * .47; let next = questionIndex, distance = Infinity;
        questionRefs.current.forEach((node, index) => { if (!node) return; const r = node.getBoundingClientRect(); const d = r.top <= focusY && r.bottom >= focusY ? 0 : Math.min(Math.abs(r.top - focusY), Math.abs(r.bottom - focusY)); if (d < distance) { next = index; distance = d; } });
        if (!jumping.current) setQuestionIndex(next); scrollTick.current = false;
      });
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [mode, questionIndex, showBubble]);
  useEffect(() => { if (!sheet) return; const previous = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = previous; }; }, [sheet]);
  useEffect(() => { if (!isMobile) setSheet(null); }, [isMobile]);
  const [studyInView, setStudyInView] = useState(false);
  useEffect(() => { function onKey(e) { if (e.key === 'Escape') { setRadial(null); setFocusMode(false); setSearchOpen(false); setMarkersOpen(false); setSheet(null); } if (e.target instanceof HTMLElement && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return; if (mode === 'himno' && e.key === 'ArrowRight') setStanzaIndex(x => Math.min(7, x + 1)); if (mode === 'himno' && e.key === 'ArrowLeft') setStanzaIndex(x => Math.max(0, x - 1)); } window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }, [mode]);
  const scrollToStudy = (smooth = false) => studyRef.current?.scrollIntoView({ behavior: smooth && !reduceMotion ? 'smooth' : reduceMotion ? 'auto' : 'instant', block: 'start' });
  function goStanza(index, smooth = false) { jumping.current = true; clearTimeout(jumpTimer.current); setMode('himno'); setStanzaIndex(Math.min(7, Math.max(0, index))); setFocusedLine(null); setRadial(null); setSheet(null); showBubble(); jumpTimer.current = setTimeout(() => { scrollToStudy(smooth); if (smooth && !reduceMotion) jumpTimer.current = setTimeout(() => { jumping.current = false; }, 900); else jumping.current = false; }, 40); }
  function goQuestion(index, smooth = false) { const next = Math.min(99, Math.max(0, index)); jumping.current = true; clearTimeout(jumpTimer.current); setMode('preguntas'); setQuestionIndex(next); setRadial(null); setSheet(null); showBubble(); jumpTimer.current = setTimeout(() => { questionRefs.current[next]?.scrollIntoView({ behavior: smooth && !reduceMotion ? 'smooth' : reduceMotion ? 'auto' : 'instant', block: 'center' }); if (smooth && !reduceMotion) jumpTimer.current = setTimeout(() => { jumping.current = false; }, 950); else requestAnimationFrame(() => { jumping.current = false; }); }, 60); }
  function openRadial(event, unitKey = activeUnit, fallback = activeText) {
    event.preventDefault();
    const selected = window.getSelection()?.toString().trim() || (lastSelection.current.unitKey === unitKey ? lastSelection.current.text : '');
    const clicked = event.target.closest?.('[data-copy-text]')?.getAttribute('data-copy-text');
    setRadial({ x: Math.min(window.innerWidth - 125, Math.max(125, event.clientX || window.innerWidth / 2)), y: Math.min(window.innerHeight - 170, Math.max(150, event.clientY || window.innerHeight / 2)), unitKey, text: selected || clicked || fallback, hasSelection: Boolean(selected || clicked) });
  }
  function actionHighlight() { if (!radial) return; if (!radial.hasSelection) { setToast('Selecciona texto o haz clic derecho sobre un verso.'); return; } const parts = radial.text.split(/[\r\n]+/).map(s => s.trim()).filter(s => s.length > 1); setHighlights(all => [...all, ...parts.map(text => ({ id: crypto.randomUUID(), unitKey: radial.unitKey, text, color }))]); setToast('Subrayado guardado'); setRadial(null); lastSelection.current = { text: '', unitKey: '' }; window.getSelection()?.removeAllRanges(); }
  async function actionCopy() { if (!radial) return; try { await navigator.clipboard.writeText(radial.text); setToast('Texto copiado'); } catch { setToast('No se pudo copiar. Prueba Ctrl+C.'); } setRadial(null); lastSelection.current = { text: '', unitKey: '' }; }
  function actionPin() { if (!radial) return; setBookmarks(all => [...all, { id: crypto.randomUUID(), unitKey: radial.unitKey, color, createdAt: Date.now() }]); setToast('Lugar guardado'); setRadial(null); lastSelection.current = { text: '', unitKey: '' }; window.getSelection()?.removeAllRanges(); }
  function goMark(item) { const [kind, raw] = item.unitKey.split('-'); if (kind === 's') goStanza(Number(raw)); else goQuestion(Number(raw)); }
  const descargarPdf = useCallback(async () => {
    if (pdfEstado === 'armando') return;
    setPdfEstado('armando');
    setToast('Armando el cuadernillo…');
    // El armado bloquea el hilo cerca de un segundo (bastante más en un teléfono),
    // así que se cede un fotograma para que el botón alcance a pintar su estado.
    // requestAnimationFrame no corre con la pestaña en segundo plano, de modo que
    // un temporizador corre la carrera y evita que la descarga se quede colgada
    // si la persona cambia de aplicación mientras se genera.
    await new Promise(listo => {
      const red = setTimeout(listo, 80);
      requestAnimationFrame(() => { clearTimeout(red); setTimeout(listo, 0); });
    });
    try {
      const { descargarCuadernillo } = await import('./lib/study-pdf');
      const paginas = await descargarCuadernillo();
      setToast('Cuadernillo listo: ' + paginas + ' páginas');
    } catch (error) {
      console.error(error);
      setToast('No se pudo generar el PDF. Intenta de nuevo.');
    } finally {
      setPdfEstado('listo');
    }
  }, [pdfEstado]);
  const searchResults = useMemo(() => { const term = search.trim().toLocaleLowerCase('es'); return term ? questions.filter(q => (q.number + ' ' + q.question + ' ' + q.answer).toLocaleLowerCase('es').includes(term)).slice(0, 8) : []; }, [search]);
  const bubbleItems = mode === 'himno' ? stanzas.map((s, i) => ({ label: s.label, short: i === 0 ? 'C' : String(i), active: stanzaIndex === i, action: () => goStanza(i, true) })) : CATEGORIES.map((c, i) => ({ label: c.label, short: String(i + 1), active: questions[questionIndex].category === c.label, action: () => goQuestion(c.first - 1, true) }));
  const markerLabel = item => item.unitKey.startsWith('s-') ? stanzas[Number(item.unitKey.slice(2))]?.label : 'Pregunta ' + (Number(item.unitKey.slice(2)) + 1);
  const cycleFontScale = () => { const next = (fontScale + 1) % 4; setFontScale(next); setFontNotice({ level: next + 1, id: Date.now() }); };
  return <div className={'site ' + (focusMode ? 'focus-mode' : '')} style={{ '--reader-scale': 1 + fontScale * .11 }}>
    <div className="ambient-bg" aria-hidden="true"><i/><i/><i/></div>
    <TopSearch open={searchOpen} setOpen={setSearchOpen} search={search} setSearch={setSearch} searchResults={searchResults} goQuestion={goQuestion} reduceMotion={reduceMotion}/>
    <div className="page-column">
      <motion.section className="hero" aria-label="Bienvenida a 12 BTP INFO STUDY" style={reduceMotion ? undefined : { y: heroY, scale: heroScale, borderRadius: heroRadius }}>
        <div className="hero-art" aria-hidden="true"><span className="hero-light light-one"/><span className="hero-light light-two"/><span className="hero-ribbon ribbon-one"/><span className="hero-ribbon ribbon-two"/><span className="hero-ribbon ribbon-three"/><span className="hero-star star-one">✦</span><span className="hero-star star-two">✦</span><span className="hero-star star-three">✦</span><span className="hero-star star-four">✦</span><span className="hero-star star-five">✦</span></div>
        <div className="hero-top"><span className="hero-tag"><i/> HONDURAS · ESTUDIO CÍVICO</span><span className="hero-edition">EDICIÓN 001 / 2026</span></div>
        <motion.div className="hero-copy" initial={reduceMotion ? false : { y: 38 }} animate={{ y: 0 }} transition={{ duration: .9, ease: [0.22, 1, 0.36, 1] }}>
          <div className="hero-title-block">
            <span className="hero-kicker">El conocimiento que llevas contigo.</span>
            <h1><span>12 BTP</span><span>INFO</span><em>STUDY<span className="hero-dot">.</span></em></h1>
          </div>
          <motion.aside className="hero-manifesto" initial={reduceMotion ? false : { x: 26 }} animate={{ x: 0 }} transition={{ delay: .28, duration: .7, ease: [0.22, 1, 0.36, 1] }}>
            <span className="hero-manifesto-label">HIMNO NACIONAL</span>
            <span className="hero-manifesto-label">100 PREGUNTAS</span>
            <p>Estudia con tranquilidad, comprende y analiza.</p>
            <PreviewCard followCursor="x">
              <PreviewCardTrigger render={<a className="hero-author" href="https://github.com/henrysrdzdev" target="_blank" rel="noreferrer" aria-label="Ver perfil de GitHub de henrysrdzdev"/>}>De parte de henrysrdz. <span aria-hidden="true">↗</span></PreviewCardTrigger>
              <PreviewCardPanel side="top" align="start" className="github-preview"><div className="github-preview-head"><img src="https://github.com/henrysrdzdev.png?size=160" alt="Avatar de henrysrdzdev"/><div><strong>henrysrdzdev</strong><span>GitHub</span></div></div><p>Creador de 12 INFO STUDY.</p><div className="github-preview-meta"><span>1 repositorio público</span><a href="https://github.com/henrysrdzdev" target="_blank" rel="noreferrer">Ver perfil <ArrowRight size={14}/></a></div></PreviewCardPanel>
            </PreviewCard>
          </motion.aside>
        </motion.div>
        <div className="hero-bottom"><div className="hero-actions"><button type="button" onClick={() => goStanza(0, true)}>Explorar el himno <DuoIcon icon={ArrowRight} size={21}/></button><button type="button" onClick={() => goQuestion(0, true)}>Abrir cuestionario <DuoIcon icon={ArrowRight} size={21}/></button><button type="button" className="hero-download" onClick={descargarPdf} disabled={pdfEstado === 'armando'} aria-label="Descargar el himno y las 100 preguntas en un PDF">{pdfEstado === 'armando' ? 'Armando el PDF…' : 'Descargar todo en PDF'} <DuoIcon icon={FilePdf} size={21}/></button></div><button className="hero-scroll" type="button" onClick={() => scrollToStudy(true)}>DESLIZA PARA ESTUDIAR <DuoIcon icon={ArrowDown} size={18}/></button></div>
      </motion.section>
      <section className="study-section" id="estudiar" ref={studyRef}>
        <header className="study-topbar"><div><span className="study-eyebrow">12 INFO STUDY <b>/</b> {mode === 'himno' ? 'HIMNO NACIONAL' : 'CUESTIONARIO CÍVICO'}</span><h2>{mode === 'himno' ? 'Himno Nacional de Honduras' : '100 preguntas cívicas'}</h2></div><div className="study-actions"><button type="button" className={focusMode ? 'selected' : ''} data-tooltip={focusMode ? 'Salir del enfoque' : 'Modo enfoque'} aria-label={focusMode ? 'Salir del modo enfoque' : 'Modo enfoque'} onClick={() => setFocusMode(x => !x)}><DuoIcon icon={focusMode ? EyeOff : Eye} size={20}/></button><button type="button" className="font-size-button" data-tooltip={'Tamaño del texto · nivel ' + (fontScale + 1)} aria-label={'Cambiar tamaño del texto. Nivel ' + (fontScale + 1) + ' de 4'} onClick={cycleFontScale}><span className="font-glyph" aria-hidden="true"><b>A</b><i>a</i></span><span className="font-level" aria-hidden="true">{fontScale + 1}</span><AnimatePresence>{fontNotice && <motion.span key={fontNotice.id} className="font-level-pop" aria-hidden="true" initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 4, scale: .55 }} animate={reduceMotion ? { opacity: 1 } : { opacity: [0, 1, 1, 0], y: [4, -12, -22, -30], scale: [.55, 1.18, 1, .9] }} exit={{ opacity: 0 }} transition={{ duration: .78, ease: [0.2, .8, .2, 1] }}>{fontNotice.level}</motion.span>}</AnimatePresence></button></div></header>
        {mode === 'himno' ? <main className="reading-layout" data-unit-key={'s-' + stanzaIndex} onContextMenu={e => openRadial(e, 's-' + stanzaIndex, activeText)}><div className="folio-index"><span>HIMNO NACIONAL</span><span>{stanzaFolio(stanzaIndex)}</span></div><AnimatePresence mode="wait"><motion.div key={stanzaIndex} className="stanza-panel" initial={reduceMotion ? false : { opacity: 0, y: 18, filter: 'blur(7px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12, filter: 'blur(5px)' }} transition={{ duration: .38 }}><div className="stanza-title-row"><div><span className="stanza-period">{stanzas[stanzaIndex].period}</span><h3>{stanzas[stanzaIndex].label}</h3></div><button type="button" className="circle-tool" data-tooltip="Herramientas de lectura" aria-label="Abrir herramientas de lectura" onClick={e => { const r = e.currentTarget.getBoundingClientRect(); openRadial({ preventDefault() {}, clientX: r.left + r.width / 2, clientY: r.bottom + 68, target: e.currentTarget }, 's-' + stanzaIndex, activeText); }}><DuoIcon icon={Pin} size={21}/></button></div><div className={'verse ' + (focusedLine !== null ? 'verse-focused' : '')}>{stanzas[stanzaIndex].lines.map((line, i) => <button type="button" className={'verse-line ' + (focusedLine === i ? 'active' : '')} key={i} data-copy-text={line} onClick={() => setFocusedLine(x => x === i ? null : i)}><small>{String(i + 1).padStart(2, '0')}</small><span><Marked text={line} unitKey={'s-' + stanzaIndex} marks={highlights}/></span></button>)}</div><p className="reading-hint">Toca un verso para enfocarlo. Selecciona texto y abre las herramientas con clic derecho.</p><section className="full-explanation"><div className="section-rule"><span>EXPLICACIÓN COMPLETA</span><span>{stanzaPosition(stanzaIndex).toUpperCase()}</span></div><h4>¿Qué explica {stanzaIndex === 0 ? 'el coro' : 'esta estrofa'}?</h4><AnswerParagraphs text={explanations[stanzas[stanzaIndex].id]} unitKey={'s-' + stanzaIndex} marks={highlights}/><p className="explanation-source">{EXPLANATION_SOURCE}</p><button type="button" className="explanation-jump" onClick={() => goQuestion(48 + stanzaIndex, true)}>Ver el resumen del cuestionario, pregunta {49 + stanzaIndex} <DuoIcon icon={ArrowRight} size={16}/></button></section></motion.div></AnimatePresence><div className="study-pager"><button type="button" onClick={() => goStanza(stanzaIndex - 1)} disabled={stanzaIndex === 0}><DuoIcon icon={ArrowLeft} size={20}/> Anterior</button><strong>{stanzaPosition(stanzaIndex)}</strong><button type="button" onClick={() => goStanza(stanzaIndex + 1)} disabled={stanzaIndex === 7}>Siguiente <DuoIcon icon={ArrowRight} size={20}/></button></div></main>
          : <main className="questions-layout"><div className="questions-intro"><div><span className="stanza-period">UNA PREGUNTA A LA VEZ</span><h3>Aprende a tu ritmo.</h3><p>La pregunta que estás leyendo abre su respuesta automáticamente. Desliza para avanzar.</p></div><strong>{String(questionIndex + 1).padStart(2, '0')}<small> / 100</small></strong></div><div className="question-list">{questions.map((q, i) => <QuestionCard key={q.number} q={q} index={i} active={questionIndex === i} marks={highlights} pins={bookmarks.filter(p => p.unitKey === 'q-' + i)} reduceMotion={reduceMotion} setRef={node => { questionRefs.current[i] = node; }} onActivate={() => goQuestion(i)} onContextMenu={e => openRadial(e, 'q-' + i, q.question + '\n' + q.answer)} onTools={e => { const r = e.currentTarget.getBoundingClientRect(); openRadial({ preventDefault() {}, clientX: r.left + r.width / 2, clientY: r.top - 60, target: e.currentTarget }, 'q-' + i, q.question + '\n' + q.answer); }}/>)}</div><div className="study-pager"><button type="button" onClick={() => goQuestion(questionIndex - 1)} disabled={questionIndex === 0}><DuoIcon icon={ArrowLeft} size={20}/> Anterior</button><strong>{String(questionIndex + 1).padStart(2, '0')} / 100</strong><button type="button" onClick={() => goQuestion(questionIndex + 1)} disabled={questionIndex === 99}>Siguiente <DuoIcon icon={ArrowRight} size={20}/></button></div></main>}
        <footer className="source-footer"><span>12 INFO STUDY · by henrysrdz</span><div>FUENTES <a href={SOURCE_QUESTIONS} target="_blank" rel="noreferrer">Cuestionario cívico</a><a href={SOURCE_ANTHEM} target="_blank" rel="noreferrer">Secretaría de Educación</a></div></footer>
      </section>
    </div>
    <StudyDock mode={mode} bubbleVisible={bubbleVisible} setBubbleVisible={setBubbleVisible} bubbleItems={bubbleItems} bubbleTimer={bubbleTimer} showBubble={showBubble} markersOpen={markersOpen} setMarkersOpen={setMarkersOpen} bookmarks={bookmarks} setBookmarks={setBookmarks} highlights={highlights} setHighlights={setHighlights} markerLabel={markerLabel} goMark={goMark} goStanza={() => goStanza(stanzaIndex, true)} goQuestions={() => goQuestion(questionIndex, true)} reduceMotion={reduceMotion}/>
    {isMobile && <MobileBar visible={studyInView || Boolean(sheet)} mode={mode} stanzaIndex={stanzaIndex} questionIndex={questionIndex} goStanza={goStanza} goQuestion={goQuestion} sheet={sheet} setSheet={setSheet} savedCount={bookmarks.length + highlights.length} focusMode={focusMode} goStanzaMode={() => goStanza(stanzaIndex, true)} goQuestionsMode={() => goQuestion(questionIndex, true)}/>}
    <AnimatePresence>{isMobile && sheet && <MobileSheet key="sheet" sheet={sheet} setSheet={setSheet} mode={mode} stanzaIndex={stanzaIndex} questionIndex={questionIndex} goStanza={goStanza} goQuestion={goQuestion} search={search} setSearch={setSearch} searchResults={searchResults} bookmarks={bookmarks} setBookmarks={setBookmarks} highlights={highlights} setHighlights={setHighlights} markerLabel={markerLabel} goMark={goMark} focusMode={focusMode} setFocusMode={setFocusMode} fontScale={fontScale} setFontScale={setFontScale} reduceMotion={reduceMotion}/>}</AnimatePresence>
    <AnimatePresence>{radial && <><motion.button type="button" className="radial-dismiss" aria-label="Cerrar herramientas" onClick={() => setRadial(null)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}/><motion.div className="radial-menu" role="menu" aria-label="Herramientas de lectura" style={{ left: radial.x, top: radial.y }} initial={reduceMotion ? false : { opacity: 0, scale: .68 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .8 }} transition={{ type: 'spring', stiffness: 390, damping: 28 }}><div className="radial-core"><DuoIcon icon={Palette} size={23}/><span>HERRAMIENTAS</span></div><button type="button" className="radial-action radial-top" role="menuitem" aria-label="Subrayar selección" data-tooltip="Subrayar" onClick={actionHighlight}><DuoIcon icon={TextHighlight} size={21}/></button><button type="button" className="radial-action radial-right" role="menuitem" aria-label="Copiar texto" data-tooltip="Copiar" onClick={actionCopy}><DuoIcon icon={Copy} size={21}/></button><button type="button" className="radial-action radial-left" role="menuitem" aria-label="Guardar marcador" data-tooltip="Guardar lugar" onClick={actionPin}><DuoIcon icon={Bookmark} size={21}/></button><button type="button" className="radial-action radial-bottom" role="menuitem" aria-label="Cerrar menú" onClick={() => setRadial(null)}><DuoIcon icon={CloseCircle} size={21}/></button><div className="radial-colors" aria-label="Color del marcador">{COLORS.map(option => <button type="button" key={option.value} aria-label={option.name} title={option.name} aria-pressed={color === option.value} className={color === option.value ? 'selected' : ''} style={{ '--color': option.value }} onClick={() => setColor(option.value)}/>)}</div></motion.div></>}</AnimatePresence>
    <AnimatePresence>{toast && <motion.div className="toast" role="status" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}><DuoIcon icon={InfoCircle} size={18}/>{toast}</motion.div>}</AnimatePresence>
  </div>;
}
function TopSearch({ open, setOpen, search, setSearch, searchResults, goQuestion, reduceMotion }) {
  const shellRef = useRef(null), inputRef = useRef(null), hideTimer = useRef(null);
  const cancelHide = () => clearTimeout(hideTimer.current);
  const close = useCallback(() => { clearTimeout(hideTimer.current); setOpen(false); setSearch(''); }, [setOpen, setSearch]);
  const armHide = useCallback((delay = 4800) => { clearTimeout(hideTimer.current); hideTimer.current = setTimeout(close, delay); }, [close]);
  const reveal = () => { cancelHide(); setOpen(true); armHide(); };
  const openAndFocus = () => { reveal(); requestAnimationFrame(() => inputRef.current?.focus()); };
  useEffect(() => () => clearTimeout(hideTimer.current), []);
  return <div ref={shellRef} className={'top-search ' + (open ? 'is-open' : '')} onMouseEnter={reveal} onMouseLeave={() => armHide(1500)} onFocusCapture={reveal} onBlurCapture={e => { if (!e.currentTarget.contains(e.relatedTarget)) armHide(900); }}>
    <button type="button" className="top-search-handle" aria-label="Abrir búsqueda" aria-expanded={open} onClick={openAndFocus}><DuoIcon icon={Search3} size={20}/><span>BUSCAR</span></button>
    <div className="top-search-bar">
      <DuoIcon icon={Search3} size={21}/>
      <input ref={inputRef} type="search" value={search} onChange={e => { setSearch(e.target.value); armHide(); }} onKeyDown={e => { if (e.key === 'Escape') close(); }} placeholder="Busca una pregunta, respuesta o número…" aria-label="Buscar en las 100 preguntas" tabIndex={open ? 0 : -1}/>
      <kbd>100</kbd>
      <button type="button" aria-label="Cerrar búsqueda" tabIndex={open ? 0 : -1} onClick={close}><DuoIcon icon={X} size={18}/></button>
    </div>
    <AnimatePresence>{open && search.trim() && <motion.div className="top-search-results" initial={reduceMotion ? false : { opacity: 0, y: -8, filter: 'blur(5px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -5, filter: 'blur(4px)' }} transition={{ duration: .2 }}>
      {searchResults.length ? searchResults.map(q => <button type="button" className="top-search-result" key={q.number} onClick={() => { goQuestion(q.number - 1, true); close(); }}><strong>{String(q.number).padStart(2, '0')}</strong><span>{q.question}</span><DuoIcon icon={ArrowRight} size={17}/></button>) : <p>No hay coincidencias para “{search}”.</p>}
    </motion.div>}</AnimatePresence>
  </div>;
}
function StudyDock({ mode, bubbleVisible, setBubbleVisible, bubbleItems, bubbleTimer, showBubble, markersOpen, setMarkersOpen, bookmarks, setBookmarks, highlights, setHighlights, markerLabel, goMark, goStanza, goQuestions, reduceMotion }) {
  const isMobileDock = () => window.matchMedia('(max-width: 760px)').matches;
  const keepOpen = () => { if (isMobileDock()) return; clearTimeout(bubbleTimer.current); setBubbleVisible(true); };
  const toggleMarkers = () => { keepOpen(); setMarkersOpen(x => !x); };
  const toggleDock = () => {
    clearTimeout(bubbleTimer.current);
    setMarkersOpen(false);
    if (isMobileDock()) setBubbleVisible(open => !open);
    else setBubbleVisible(true);
  };
  const savedCount = bookmarks.length + highlights.length;
  return <nav className={'bubble-nav ' + (bubbleVisible ? 'is-visible' : '')} aria-label="Centro de navegación" onMouseEnter={keepOpen} onMouseLeave={showBubble} onFocus={keepOpen} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) showBubble(); }}>
    <button className="bubble-handle" type="button" aria-label={bubbleVisible ? 'Ocultar navegación' : 'Mostrar navegación'} aria-expanded={bubbleVisible} onClick={toggleDock}><span/><span/><span/></button>
    <div className="bubble-stack">
      <button type="button" className={'dock-button dock-mode ' + (mode === 'himno' ? 'active' : '')} aria-label="Estudiar el Himno Nacional" data-tooltip="Himno" onClick={goStanza}><DuoIcon icon={BookOpen} size={21}/></button>
      <button type="button" className={'dock-button dock-mode ' + (mode === 'preguntas' ? 'active' : '')} aria-label="Estudiar el cuestionario cívico" data-tooltip="Cuestionario" onClick={goQuestions}><DuoIcon icon={CheckCircle} size={21}/></button>
      <span className="dock-divider"/>
      <div className="dock-index" aria-label={mode === 'himno' ? 'Estrofas' : 'Apartados'}>{bubbleItems.map(item => <button type="button" key={item.label} className={'bubble-item ' + (item.active ? 'active' : '')} aria-label={item.label} data-tooltip={item.label} onClick={item.action}>{item.short}</button>)}</div>
      <span className="dock-divider"/>
      <button type="button" className={'dock-button ' + (markersOpen ? 'active' : '')} aria-label={'Elementos guardados: ' + savedCount} data-tooltip="Guardados" aria-expanded={markersOpen} onClick={toggleMarkers}><DuoIcon icon={Bookmark} size={20}/>{savedCount > 0 && <span className="dock-count">{savedCount}</span>}</button>
      <AnimatePresence>{markersOpen && <motion.div className="dock-panel markers-panel" initial={reduceMotion ? false : { opacity: 0, x: 12, filter: 'blur(6px)' }} animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, x: 8, filter: 'blur(4px)' }} transition={{ duration: .24 }}><div className="dock-panel-title"><Bookmark size={16}/><span>Guardados</span><b>{savedCount}</b></div><div className="dock-marks">
        <section className="saved-section"><div className="saved-section-title"><span>Marcadores</span><b>{bookmarks.length}</b></div>{bookmarks.length ? [...bookmarks].reverse().map(item => <div className="dock-mark-row" key={item.id}><button type="button" onClick={() => { goMark(item); setMarkersOpen(false); }}><i style={{ background: item.color }}/><span>{markerLabel(item)}</span></button><button type="button" aria-label={'Quitar ' + markerLabel(item)} onClick={() => setBookmarks(all => all.filter(x => x.id !== item.id))}><X size={14}/></button></div>) : <p>Aún no hay marcadores.</p>}</section>
        <section className="saved-section"><div className="saved-section-title"><span>Subrayados</span><b>{highlights.length}</b></div>{highlights.length ? [...highlights].reverse().map(item => <div className="dock-mark-row" key={item.id}><button type="button" onClick={() => { goMark(item); setMarkersOpen(false); }}><i style={{ background: item.color }}/><span>{item.text}</span></button><button type="button" aria-label={'Borrar subrayado: ' + item.text} onClick={() => setHighlights(all => all.filter(x => x.id !== item.id))}><X size={14}/></button></div>) : <p>Aún no hay subrayados.</p>}</section>
      </div></motion.div>}</AnimatePresence>
    </div>
  </nav>;
}
/* Barra inferior de teléfono: vive en la zona del pulgar y no se esconde al desplazar,
   para que el punto de lectura siempre esté a la vista y a un toque de distancia. */
function MobileBar({ visible, mode, stanzaIndex, questionIndex, goStanza, goQuestion, sheet, setSheet, savedCount, focusMode, goStanzaMode, goQuestionsMode }) {
  const atStart = mode === 'himno' ? stanzaIndex === 0 : questionIndex === 0;
  const atEnd = mode === 'himno' ? stanzaIndex === 7 : questionIndex === 99;
  const step = delta => (mode === 'himno' ? goStanza(stanzaIndex + delta, true) : goQuestion(questionIndex + delta, true));
  const now = mode === 'himno'
    ? { kicker: stanzas[stanzaIndex].label, title: stanzas[stanzaIndex].title, position: stanzaPosition(stanzaIndex) }
    : { kicker: 'Pregunta ' + String(questionIndex + 1).padStart(2, '0'), title: questions[questionIndex].question, position: questions[questionIndex].category };
  const toggle = name => setSheet(open => (open === name ? null : name));
  return <nav className={'mobile-bar ' + (visible ? 'is-visible' : '')} aria-label="Navegación de estudio" aria-hidden={!visible}>
    <div className="mobile-now">
      <button type="button" className="mobile-step" aria-label={mode === 'himno' ? 'Estrofa anterior' : 'Pregunta anterior'} disabled={atStart} onClick={() => step(-1)}><DuoIcon icon={ArrowLeft} size={21}/></button>
      <button type="button" className="mobile-now-label" aria-haspopup="dialog" aria-expanded={sheet === 'index'} onClick={() => toggle('index')}>
        <small>{now.kicker}</small>
        <strong>{now.title}</strong>
        <span>{now.position}<DuoIcon icon={ChevronDown} size={14}/></span>
      </button>
      <button type="button" className="mobile-step" aria-label={mode === 'himno' ? 'Estrofa siguiente' : 'Pregunta siguiente'} disabled={atEnd} onClick={() => step(1)}><DuoIcon icon={ArrowRight} size={21}/></button>
    </div>
    <div className="mobile-actions">
      <button type="button" className={mode === 'himno' ? 'active' : ''} aria-pressed={mode === 'himno'} onClick={goStanzaMode}><DuoIcon icon={BookOpen} size={20}/><span>Himno</span></button>
      <button type="button" className={mode === 'preguntas' ? 'active' : ''} aria-pressed={mode === 'preguntas'} onClick={goQuestionsMode}><DuoIcon icon={CheckCircle} size={20}/><span>Preguntas</span></button>
      <button type="button" className={sheet === 'search' ? 'active' : ''} aria-haspopup="dialog" aria-expanded={sheet === 'search'} onClick={() => toggle('search')}><DuoIcon icon={Search3} size={20}/><span>Buscar</span></button>
      <button type="button" className={sheet === 'saved' ? 'active' : ''} aria-haspopup="dialog" aria-expanded={sheet === 'saved'} onClick={() => toggle('saved')}><DuoIcon icon={Bookmark} size={20}/><span>Guardados</span>{savedCount > 0 && <i className="mobile-badge">{savedCount}</i>}</button>
      <button type="button" className={sheet === 'reading' || focusMode ? 'active' : ''} aria-haspopup="dialog" aria-expanded={sheet === 'reading'} onClick={() => toggle('reading')}><span className="font-glyph" aria-hidden="true"><b>A</b><i>a</i></span><span>Lectura</span></button>
    </div>
  </nav>;
}
function MobileSheet({ sheet, setSheet, mode, stanzaIndex, questionIndex, goStanza, goQuestion, search, setSearch, searchResults, bookmarks, setBookmarks, highlights, setHighlights, markerLabel, goMark, focusMode, setFocusMode, fontScale, setFontScale, reduceMotion }) {
  const inputRef = useRef(null);
  useEffect(() => { if (sheet === 'search') requestAnimationFrame(() => inputRef.current?.focus()); }, [sheet]);
  if (!sheet) return null;
  const titles = { index: mode === 'himno' ? 'Ir a una estrofa' : 'Ir a una pregunta', search: 'Buscar', saved: 'Guardados', reading: 'Lectura' };
  return <>
    <motion.button type="button" className="sheet-scrim" aria-label="Cerrar" onClick={() => setSheet(null)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}/>
    <motion.div className="sheet" role="dialog" aria-modal="true" aria-label={titles[sheet]} initial={reduceMotion ? false : { y: '100%' }} animate={{ y: 0 }} exit={reduceMotion ? { opacity: 0 } : { y: '100%' }} transition={{ type: 'spring', stiffness: 420, damping: 40 }}>
      <div className="sheet-grip" aria-hidden="true"/>
      <div className="sheet-head"><strong>{titles[sheet]}</strong><button type="button" aria-label="Cerrar" onClick={() => setSheet(null)}><DuoIcon icon={X} size={18}/></button></div>
      {sheet === 'index' && <div className="sheet-body">
        {mode === 'himno'
          ? <div className="sheet-list">{stanzas.map((s, i) => <button type="button" key={s.id} className={'sheet-row ' + (stanzaIndex === i ? 'active' : '')} onClick={() => goStanza(i, true)}><b>{i === 0 ? 'C' : String(i).padStart(2, '0')}</b><span><strong>{s.label}</strong><small>{s.period}</small></span></button>)}</div>
          : <>
            <div className="sheet-chips">{CATEGORIES.map(c => <button type="button" key={c.label} className={questions[questionIndex].category === c.label ? 'active' : ''} onClick={() => goQuestion(c.first - 1, true)}>{c.label}<i>{c.first}–{c.last}</i></button>)}</div>
            <div className="sheet-list">{questions.map((q, i) => <button type="button" key={q.number} className={'sheet-row ' + (questionIndex === i ? 'active' : '')} onClick={() => goQuestion(i, true)}><b>{String(q.number).padStart(2, '0')}</b><span><strong>{q.question}</strong><small>{q.category}</small></span></button>)}</div>
          </>}
      </div>}
      {sheet === 'search' && <div className="sheet-body">
        <div className="sheet-search"><DuoIcon icon={Search3} size={20}/><input ref={inputRef} type="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Número, pregunta o respuesta…" aria-label="Buscar en las 100 preguntas"/>{search && <button type="button" aria-label="Limpiar búsqueda" onClick={() => setSearch('')}><DuoIcon icon={X} size={16}/></button>}</div>
        <div className="sheet-list">{search.trim()
          ? (searchResults.length ? searchResults.map(q => <button type="button" key={q.number} className="sheet-row" onClick={() => goQuestion(q.number - 1, true)}><b>{String(q.number).padStart(2, '0')}</b><span><strong>{q.question}</strong><small>{q.category}</small></span></button>) : <p className="sheet-empty">No hay coincidencias para «{search}».</p>)
          : <p className="sheet-empty">Escribe un número del 1 al 100 o cualquier palabra de una pregunta o respuesta.</p>}</div>
      </div>}
      {sheet === 'saved' && <div className="sheet-body">
        <div className="sheet-list">
          <div className="sheet-group">Marcadores <i>{bookmarks.length}</i></div>
          {bookmarks.length ? [...bookmarks].reverse().map(item => <div className="sheet-row saved" key={item.id}><button type="button" onClick={() => goMark(item)}><i style={{ background: item.color }}/><span>{markerLabel(item)}</span></button><button type="button" aria-label={'Quitar ' + markerLabel(item)} onClick={() => setBookmarks(all => all.filter(x => x.id !== item.id))}><X size={15}/></button></div>) : <p className="sheet-empty">Aún no hay marcadores.</p>}
          <div className="sheet-group">Subrayados <i>{highlights.length}</i></div>
          {highlights.length ? [...highlights].reverse().map(item => <div className="sheet-row saved" key={item.id}><button type="button" onClick={() => goMark(item)}><i style={{ background: item.color }}/><span>{item.text}</span></button><button type="button" aria-label={'Borrar subrayado: ' + item.text} onClick={() => setHighlights(all => all.filter(x => x.id !== item.id))}><X size={15}/></button></div>) : <p className="sheet-empty">Aún no hay subrayados.</p>}
        </div>
      </div>}
      {sheet === 'reading' && <div className="sheet-body">
        <div className="sheet-field"><span>Tamaño del texto</span><div className="sheet-scale" role="group" aria-label="Tamaño del texto">{[0, 1, 2, 3].map(level => <button type="button" key={level} className={fontScale === level ? 'active' : ''} aria-pressed={fontScale === level} onClick={() => setFontScale(level)}>{level + 1}</button>)}</div></div>
        <p className="sheet-sample" style={{ fontSize: 'calc(15px * ' + (1 + fontScale * .11) + ')' }}>Tu bandera es un lampo de cielo por un bloque de nieve cruzado.</p>
        <button type="button" className="sheet-focus" aria-pressed={focusMode} onClick={() => setFocusMode(x => !x)}><DuoIcon icon={focusMode ? EyeOff : Eye} size={19}/> {focusMode ? 'Salir del modo enfoque' : 'Activar modo enfoque'}</button>
        <p className="sheet-empty">El modo enfoque atenúa todo lo que no estás leyendo.</p>
      </div>}
    </motion.div>
  </>;
}
function QuestionCard({ q, index, active, marks, pins, reduceMotion, setRef, onActivate, onContextMenu, onTools }) {
  return <article ref={setRef} className={'question-card ' + (active ? 'active' : '')} data-unit-key={'q-' + index} data-question={q.number} onContextMenu={onContextMenu}><button type="button" className="question-trigger" aria-expanded={active} aria-controls={'answer-' + q.number} onClick={onActivate}><span className="question-number">{String(q.number).padStart(2, '0')}</span><span className="question-heading"><small>{q.category.toUpperCase()}</small><strong data-copy-text={q.question}><Marked text={q.question} unitKey={'q-' + index} marks={marks}/></strong></span><span className="question-end">{pins.map(pin => <i key={pin.id} style={{ background: pin.color }}/>) }<DuoIcon icon={ChevronDown} size={21}/></span></button><AnimatePresence initial={false}>{active && <motion.div id={'answer-' + q.number} className="answer-wrap" initial={reduceMotion ? false : { height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .34, ease: [0.22, 1, 0.36, 1] }}><div className="answer-body"><span className="answer-kicker">RESPUESTA COMPLETA</span><AnswerParagraphs text={q.answer} unitKey={'q-' + index} marks={marks}/>{q.image && <figure className="answer-diagram"><img src={q.image} alt={q.imageAlt} loading="lazy"/><figcaption>Diagrama incluido en la fuente del cuestionario.</figcaption></figure>}{q.editorialNote && <p className="editorial-note">{q.editorialNote}</p>}<div className="answer-footer"><span>Selecciona texto para subrayar o copiar.</span><button type="button" onClick={onTools}><DuoIcon icon={Bookmark} size={17}/> Herramientas</button></div></div></motion.div>}</AnimatePresence></article>;
}
const root = import.meta.hot?.data.root ?? createRoot(document.getElementById('root'));
root.render(<App/>);
if (import.meta.hot) import.meta.hot.data.root = root;
