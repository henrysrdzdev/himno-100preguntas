# 12 INFO STUDY · by henrysrdz

Web responsive para estudiar el Himno Nacional de Honduras y las 100 preguntas del cuestionario cívico, con una unidad de lectura en foco.

## Ejecutar

```bash
npm install
npm run dev
```

Abre `http://localhost:5173/`. Para compilar: `npm run build`.

## Uso

- **Himno:** el coro y las siete estrofas tienen su letra y la explicación íntegra de las preguntas 49 a 56 del cuestionario. El coro no se cuenta como estrofa: la cabecera dice `CORO` o `ESTROFA 03 / 07`, nunca «03 / 08». Navega con el dock derecho, la barra inferior en móvil o los botones del pie. Toca un verso para enfocarlo.
- **Cuestionario:** las 100 preguntas están numeradas. La pregunta en foco despliega automáticamente la respuesta completa; el desplazamiento actualiza el foco. En escritorio, el buscador superior con efecto blur encuentra preguntas por número o texto y se oculta tras unos segundos sin actividad.
- **Herramientas:** selecciona texto y haz clic derecho para subrayar o copiar; el menú radial también permite guardar varios marcadores de distintos colores. El panel **Guardados** del dock permite volver a cada marcador o subrayado y borrar cualquiera de ellos. El botón de herramientas abre el mismo menú en dispositivos táctiles.
- **Portada y lectura:** el Hero ocupa el viewport completo, conserva sus dos accesos durante la transición de desplazamiento y muestra una vista previa animada del perfil de GitHub del autor. El botón `Aa` indica los cuatro niveles disponibles y anima el nivel elegido.
- **Lectura:** cambia el tamaño del texto y activa el modo enfoque desde la cabecera. En escritorio, la barra burbuja se oculta sola y vuelve al pasar por su borde.
- **Móvil:** al entrar en la zona de estudio aparece una barra inferior fija que ya no se esconde al desplazar. Su fila superior dice dónde estás (`Coro`, `Estrofa 3 de 7`, `Pregunta 34`) entre dos flechas para avanzar y retroceder; tocar el centro abre el índice. La fila inferior lleva a **Himno**, **Preguntas**, **Buscar**, **Guardados** y **Lectura** (tamaño de texto y modo enfoque), cada uno en una hoja que sube desde abajo. Todos los controles miden al menos 46 px y quedan al alcance del pulgar; el dock lateral y la píldora de búsqueda quedan sólo para escritorio.
- **Continuidad privada:** la posición, los marcadores, los subrayados, el color y el tamaño de letra se guardan únicamente en `localStorage`, dentro del navegador y perfil de cada estudiante. No se envían a Render ni se comparten con otras personas conectadas al mismo tiempo.

## Publicar en Render

El proyecto está preparado como **Static Site** mediante `render.yaml`:

- Build command: `npm ci && npm run build`
- Publish directory: `dist`
- Runtime de Node: 20 o superior
- Reescritura SPA: cualquier ruta sirve `index.html`

Conecta el repositorio en Render y el Blueprint detectará estos valores. La web no requiere base de datos, servicio web persistente ni variables de entorno. El progreso local no se sincroniza entre navegadores o dispositivos y desaparece si la persona borra los datos del sitio.

## Contenido y fuentes

Las preguntas y respuestas conservan el texto completo de la [edición digital del cuestionario cívico de XplorHonduras](https://www.xplorhonduras.com/cuestionario-civico-del-himno-nacional-de-honduras/). Los diagramas necesarios para las preguntas 3 y 33 están incluidos localmente. La letra del himno se cotejó con la [Cátedra del Himno Nacional de la Secretaría de Educación](https://www.se.gob.hn/media/files/coleccion_civica/documentos/Catedra_del_Himno_Nacional_de_Honduras_1.9.23.pdf) y con [Wikisource](https://es.wikisource.org/wiki/Himno_Nacional_de_Honduras).

### Cómo se corrigió el contenido

La transcripción de partida arrastraba dos clases de defectos y cada una se trató distinto. `scripts/fix-questions.mjs` documenta y reaplica todas las correcciones; falla en vez de guardar a medias si alguna deja de encajar.

1. **Corrupción de la digitalización y erratas** — corregidas en el texto sin más: la «ñ» convertida en «;» (`a;o`, `cu;a`), tildes perdidas (`Cristobal`, `arboles`, `triangulo`), `se hallan destacado` por `se hayan destacado`, `el manto o se el vestido` por `el manto o el vestido`.
2. **Errores de dato verificables** — corregidos en el texto y acompañados de una nota de cotejo que dice qué se cambió y por qué, para que nadie se sorprenda al compararlo con otra copia:
   - **22.** El Decreto No. 42 es del **13** de noviembre de 1915, no del 3. La Cátedra reproduce el decreto: «a los trece días del mes de noviembre de mil novecientos quince».
   - **52.** La resistencia de Lempira se organizó en **Cerquín**, entre los lencas del occidente, no en «Copantl»; y el verso «era inútil que el indio… se aprestara a la lucha» dice que la lucha no podía vencer a la conquista, no que el sacrificio de Lempira fuera vano, como daba a entender la redacción anterior.
   - **63.** El Día de la Bandera lo fija el **Decreto Legislativo 84-95 del 23 de mayo de 1995**, que derogó el Decreto No. 5 del 7 de junio de 1943.
   - **69.** La fuente repetía «Sureste» para El Salvador y para Costa Rica; a El Salvador le toca el **Suroeste**.
   - **84.** «unas minas» pasa a «dos bocaminas», como en la respuesta 91 y en la descripción oficial del escudo.

Además llevan nota de cotejo, **sin tocar la respuesta**, los puntos donde el texto canónico que se pide en el examen no coincide con la historiografía: la fecha de nacimiento de Coello (10), la geografía natal de Hartling (11), el nombre de Gualberto Cantarero Palacios (12), las dos franjas azules de la bandera (49), los 319 años de dominación (53), el origen germánico de «bandum» (61), las fortalezas de Omoa y del Golfo de Fonseca (87) y la ruta de Colón (89). La interfaz muestra estas notas bajo la respuesta, tanto en el cuestionario como en la explicación del himno.

Las ocho explicaciones del himno (preguntas 49 a 56) se cotejaron una por una con el apartado 3.3 de la Cátedra. Los rótulos de época de cada estrofa también se ajustaron: la segunda estrofa trata del **descubrimiento**, no de la conquista, que es el asunto de la tercera.

El script `scripts/extract-questions.mjs` documenta la extracción. Para regenerar `src/data/questions.json`, necesita una copia local de `cuestionario-source.html` en la raíz; después hay que volver a pasar `scripts/fix-questions.mjs`.

## Tecnología

React, Vite, Tailwind CSS, Motion, Base UI y Reicon. El dock derecho se oculta automáticamente y reúne el cambio de modo, la navegación contextual y los elementos guardados. La búsqueda vive en una superficie blur independiente en la parte superior.
