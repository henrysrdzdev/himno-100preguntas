# 12 INFO STUDY · by henrysrdz

Web responsive para estudiar el Himno Nacional de Honduras y las 100 preguntas del cuestionario cívico, con una unidad de lectura en foco.

## Ejecutar

```bash
npm install
npm run dev
```

Abre `http://localhost:5173/`. Para compilar: `npm run build`.

## Uso

- **Himno:** el coro y las siete estrofas tienen su letra y la explicación íntegra de las preguntas 49 a 56 del cuestionario. Navega con el dock derecho o los botones inferiores. Toca un verso para enfocarlo.
- **Cuestionario:** las 100 preguntas están numeradas. La pregunta en foco despliega automáticamente la respuesta completa; el desplazamiento actualiza el foco. El buscador superior con efecto blur encuentra preguntas por número o texto y se oculta tras unos segundos sin actividad.
- **Herramientas:** selecciona texto y haz clic derecho para subrayar o copiar; el menú radial también permite guardar varios marcadores de distintos colores. El panel **Guardados** del dock permite volver a cada marcador o subrayado y borrar cualquiera de ellos. El botón de herramientas abre el mismo menú en dispositivos táctiles.
- **Portada y lectura:** el Hero ocupa el viewport completo, conserva sus dos accesos durante la transición de desplazamiento y muestra una vista previa animada del perfil de GitHub del autor. El botón `Aa` indica los cuatro niveles disponibles y anima el nivel elegido.
- **Lectura:** cambia el tamaño del texto y activa el modo enfoque desde la cabecera. La barra burbuja se oculta sola y vuelve al pasar por su borde o tocar su asa.
- **Continuidad privada:** la posición, los marcadores, los subrayados, el color y el tamaño de letra se guardan únicamente en `localStorage`, dentro del navegador y perfil de cada estudiante. No se envían a Render ni se comparten con otras personas conectadas al mismo tiempo.

## Publicar en Render

El proyecto está preparado como **Static Site** mediante `render.yaml`:

- Build command: `npm ci && npm run build`
- Publish directory: `dist`
- Runtime de Node: 20 o superior
- Reescritura SPA: cualquier ruta sirve `index.html`

Conecta el repositorio en Render y el Blueprint detectará estos valores. La web no requiere base de datos, servicio web persistente ni variables de entorno. El progreso local no se sincroniza entre navegadores o dispositivos y desaparece si la persona borra los datos del sitio.

## Contenido y fuentes

Las preguntas y respuestas conservan el texto completo de la [edición digital del cuestionario cívico de XplorHonduras](https://www.xplorhonduras.com/cuestionario-civico-del-himno-nacional-de-honduras/), con correcciones ortográficas puntuales en los enunciados. Los diagramas necesarios para las preguntas 3 y 33 están incluidos localmente. La respuesta 12 se conserva íntegra y lleva una nota de cotejo con la [Cátedra del Himno Nacional de la Secretaría de Educación](https://www.se.gob.hn/media/files/coleccion_civica/documentos/Catedra_del_Himno_Nacional_de_Honduras_1.9.23.pdf). La letra del himno se cotejó con esta cátedra.

El script `scripts/extract-questions.mjs` documenta la extracción. Para regenerar `src/data/questions.json`, necesita una copia local de `cuestionario-source.html` en la raíz.

## Tecnología

React, Vite, Tailwind CSS, Motion, Base UI y Reicon. El dock derecho se oculta automáticamente y reúne el cambio de modo, la navegación contextual y los elementos guardados. La búsqueda vive en una superficie blur independiente en la parte superior.
