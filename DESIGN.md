---
name: 12 INFO STUDY
description: Lector cívico hondureño con portada azul y estudio de himno y cuestionario.
colors:
  background: "#ffffff"
  ambient: "#f9fdff"
  ink: "#092f43"
  muted-ink: "#456e81"
  flag-blue: "#087dca"
  bright-cyan: "#0ab5e7"
  deep-blue: "#07486f"
  accent-pale: "#b9eafb"
  accent-pro: "#0789d2"
  border: "#bddae8"
  hero-start: "#128ed1"
  hero-middle: "#057db9"
  hero-end: "#035f9d"
  marker-blue: "#1689e9"
  marker-coral: "#f36a52"
  marker-gold: "#f5b427"
  marker-green: "#21aa87"
typography:
  hero:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "clamp(104px, 11.25vw, 238px)"
    fontWeight: 400
    lineHeight: 0.78
    letterSpacing: "-.06em"
  section:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "clamp(42px, 5vw, 70px)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-.025em"
  folio:
    fontFamily: "Instrument Serif, Georgia, serif"
    fontSize: "clamp(64px, 8vw, 118px)"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "-.035em"
  reading:
    fontFamily: "Literata, Georgia, serif"
    fontSize: "calc(27px * var(--reader-scale))"
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: "-.025em"
  answer:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "calc(19px * var(--reader-scale))"
    lineHeight: 1.85
  body:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 700
  label:
    fontFamily: "DM Sans, Arial, sans-serif"
    fontSize: "11px"
    fontWeight: 800
    letterSpacing: ".14em"
rounded:
  row: "11px"
  diagram: "13px"
  card: "19px"
  explanation: "22px"
  hero: "28px"
  pill: "50px"
  circle: "50%"
spacing:
  card-gap: "18px"
  question-padding: "27px 29px"
  explanation-padding: "34px 42px 46px"
components:
  hero-primary-action:
    backgroundColor: "{colors.background}"
    textColor: "{colors.hero-end}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "50px"
  hero-secondary-action:
    backgroundColor: "rgba(255,255,255,.15)"
    textColor: "{colors.background}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "50px"
  study-tool:
    backgroundColor: "rgba(255,255,255,.7)"
    textColor: "{colors.deep-blue}"
    rounded: "{rounded.circle}"
    size: "48px"
  question-card:
    backgroundColor: "rgba(255,255,255,.75)"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
  explanation-panel:
    backgroundColor: "rgba(255,255,255,.81)"
    textColor: "{colors.ink}"
    rounded: "{rounded.explanation}"
    padding: "{spacing.explanation-padding}"
---

# Design System: 12 INFO STUDY

## Overview

**Creative North Star: "El estudio cívico luminoso"**

The interface presents a luminous blue cover before the study material. An oversized Instrument Serif wordmark sits over moving blue light and ribbon layers, with white pill actions into the hymn and questionnaire. Behind the study area, a pale cyan ambient field keeps the page airy.

Once studying, the content returns to a measured editorial pace. A centered 990 px study section, serif folio titles, numbered verses, complete explanations, and a focused question list guide attention. A single retractable dock at the right edge holds navigation and utilities without reducing the reading width.

**Key Characteristics:**

- Saturated blue gradient hero with soft moving light, ribbons, and oversized serif lettering.
- Instrument Serif display type, Literata study text, and DM Sans controls and explanations.
- Two-column cover: the 12 BTP INFO STUDY mark stays left while the study promise and author sit right.
- Auto-hiding right dock with mode icons, contextual index, bookmarks, and removable highlights.
- Independent blur search surface at the top edge, with an idle timeout and compact resting handle.
- Full-viewport hero that rounds and recedes as the reader moves into the study surface while preserving both primary actions.
- Animated author preview card and a four-level type control with a persistent badge and transient pop indicator.
- White translucent cards, fine cyan borders, and active question focus.

## Colors

The palette is white and pale cyan around the study content, then saturated blue and cyan in the cover and active controls.

### Primary

- **Flag Blue** (`colors.flag-blue`): study labels and active reading controls.
- **Bright Cyan** (`colors.bright-cyan`): a lighter blue used in the brand and decorative light.
- **Deep Blue** (`colors.deep-blue`): control ink and depth anchors.
- **Hero Blue Ramp** (`colors.hero-start`, `colors.hero-middle`, `colors.hero-end`): the cover's diagonal gradient, darkening toward its far edge.
- **Pale Accent and Pro Blue** (`colors.accent-pale`, `colors.accent-pro`): Tailwind theme accents and the cyan blue family.

### Secondary

- **Reader Markers** (`colors.marker-blue`, `colors.marker-coral`, `colors.marker-gold`, `colors.marker-green`): saved pins and inset text highlights chosen by the reader.

### Neutral

- **White and Ambient** (`colors.background`, `colors.ambient`): the base surface and near-white cyan page field.
- **Ink and Muted Ink** (`colors.ink`, `colors.muted-ink`): primary study text and secondary copy.
- **Border** (`colors.border`): the base cyan stroke; component borders vary within the same blue family.

**The Blue Field Rule.** Blue gradients and diffuse light are native to the cover; the study area uses pale cyan, translucent white, and fine blue strokes.

**The Marker Rule.** Coral, gold, and green enter through reader annotations; they do not replace blue navigation states.

## Typography

**Display Font:** Instrument Serif, then Georgia and serif.
**Reading Font:** Literata, then Georgia and serif.
**Body Font:** DM Sans, then Arial and sans serif.

**Character:** Instrument Serif makes the cover and folio titles expressive. Literata gives verse and question prompts a slower reading cadence. DM Sans keeps navigation, long explanations, labels, and tools direct.

### Hierarchy

- **Hero** (`typography.hero`): three-line 12 BTP / INFO / STUDY wordmark paired with the study promise; the blocks stack on phones.
- **Section** (`typography.section`): main heading at the study area's entrance.
- **Folio** (`typography.folio`): current stanza or question-view heading.
- **Reading** (`typography.reading`): numbered hymn lines; 19 px times reader scale at the phone breakpoint.
- **Answer** (`typography.answer`): complete explanation and answer paragraphs; 16 px on phones, with long line height.
- **Body and label** (`typography.body`, `typography.label`): navigation, controls, counts, and editorial metadata.

**The Three Voice Rule.** Instrument Serif names the experience, Literata carries prompts and verse, and DM Sans carries explanation and interface language.

## Layout

The page column spans the viewport with 26 px desktop gutters. The blue hero fills most of the first viewport, bounded by a 1700 px maximum width and rounded to 28 px. The study section below is centered at up to 990 px, with generous top space and one main reading column.

At 1100 px the outer padding and hero lettering tighten. At 760 px the page column uses 10 px gutters, hero actions stack, folio typography and content padding shrink, and the question list tightens. At 390 px the display and controls reduce again. The right dock remains available at every size and withdraws after inactivity.

**The Retractable Dock Rule.** Keep mode switching, contextual destinations, bookmarks, and highlights in one right-edge dock; expose only its handle at rest. Search remains a separate top-edge surface so it never competes with the reading index.

## Elevation & Depth

The world is deliberately layered. The cover combines gradient color, blurred radial light, translucent ribbons, and a soft ambient shadow. The right dock uses white transparency, backdrop blur, and restrained shadows. Question cards are faded at rest and the active card gains a clearer white fill, cyan border, and lifted shadow.

### Shadow Vocabulary

- **Hero** (`0 28px 70px -40px #086c9e`): diffuse blue depth beneath the cover.
- **Dock** (`0 18px 50px -30px rgba(7,84,119,.55)`): floating separation from the page edge.
- **Active question** (`0 26px 50px -42px #09648c`): focus in the scrolling list.
- **Radial tools** (`0 20px 55px rgba(5,53,79,.24)`): floating tool layer.

**The Focused Card Rule.** Resting questions fade and blur; the active or keyboard-focused question becomes fully legible and elevated.

## Shapes

The hero and explanation panel have generous rounded corners; question cards use 19 px corners. Pill forms belong to hero actions, pagination, the toast, and the bubble container. Study tools, bubble items, and radial actions are circular. Thin blue borders separate the glassy layers. Verse lines remain unboxed and gain a small horizontal movement on focus.

## Components

### Buttons

- **Hero actions:** 50 px tall pills, one solid white and one translucent white; hover raises them 4 px.
- **Study tools:** 48 px circular buttons with translucent white fill and blue border; hover lifts them 3 px. On phones they become 35 px.
- **Pagination:** bordered white pills with blue text, disabled opacity, and a subtle hover lift.
- **Focus:** keyboard focus has a 3 px bright-blue outline and 3 px offset.

### Cards / Containers

- **Question card:** translucent white, 19 px corners, pale border, and 18 px vertical gap. The active card clears its blur and opacity, brightens the border, and reveals the answer below an internal divider.
- **Explanation panel:** 22 px corners, translucent white, a cyan stroke and soft shadow, with complete text and a source link.
- **Answer diagram:** a 13 px bordered white figure that appears only for questions with a sourced image.

### Inputs / Fields

- **Top search:** an independent white blur field and result tray that withdraws to a small handle after inactivity.

### Navigation

- **Right dock:** circular mode icons, current stanza or category destinations, and a saved-items tray for bookmarks and removable highlights. It leaves only a narrow handle visible after inactivity.
- **Study switch:** a two-tab line with a 3 px blue active underline and light-blue count chips.
- **Navigation bubble:** a narrow right-edge handle reveals a vertical stack of circular short labels; the active item becomes solid blue and the stack hides after a pause.

### Reading Tools

The radial menu has a 150 px white circular body, central blue-tinted core, four circular actions, and a row of four annotation colors. Reicon symbols use filled and outlined layers with small hover movement. Marked text uses an inset lower-band color instead of a solid fill. A selected verse moves 7 px while other lines fade and blur; the current question reveals its complete answer automatically. Motion and scrolling honor reduced-motion preferences.

## Do's and Don'ts

### Do:

- **Do** use the blue cover's gradients and moving light when extending the brand-facing first view.
- **Do** retain the expressive display, literary reading, and direct interface type roles.
- **Do** keep the dock reachable by touch and keyboard, with visible focus and reduced-motion behavior.

### Don't:

- **Don't** turn reader marker colors into persistent navigation accents.
- **Don't** elevate every question card; only the active or focused card gets the stronger white and shadow treatment.
- **Don't** replace the complete answer and explanation text with short summaries.

