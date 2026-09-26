import React, { createContext, useContext, useMemo, useState } from 'react';
import { PreviewCard as PreviewCardPrimitive } from '@base-ui/react/preview-card';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'motion/react';

const PreviewCardContext = createContext(null);

function usePreviewCard() {
  const context = useContext(PreviewCardContext);
  if (!context) throw new Error('Preview Card components must be used inside PreviewCard.');
  return context;
}

function PreviewCard({ followCursor = false, followCursorSpringOptions = { stiffness: 200, damping: 17 }, open, defaultOpen = false, onOpenChange, children, ...props }) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = open ?? internalOpen;
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const setIsOpen = value => { if (open === undefined) setInternalOpen(value); onOpenChange?.(value); };
  const value = useMemo(() => ({ isOpen, x, y, followCursor, followCursorSpringOptions }), [isOpen, x, y, followCursor, followCursorSpringOptions]);

  return <PreviewCardContext.Provider value={value}><PreviewCardPrimitive.Root data-slot="preview-card" {...props} open={isOpen} onOpenChange={setIsOpen}>{children}</PreviewCardPrimitive.Root></PreviewCardContext.Provider>;
}

function PreviewCardTrigger({ onMouseMove, ...props }) {
  const { x, y, followCursor } = usePreviewCard();
  const handleMouseMove = event => {
    onMouseMove?.(event);
    const target = event.currentTarget.getBoundingClientRect();
    if (followCursor === 'x' || followCursor === true) x.set((event.clientX - target.left - target.width / 2) / 2);
    if (followCursor === 'y' || followCursor === true) y.set((event.clientY - target.top - target.height / 2) / 2);
  };
  return <PreviewCardPrimitive.Trigger data-slot="preview-card-trigger" onMouseMove={handleMouseMove} {...props}/>;
}

function PreviewCardPortal(props) {
  const { isOpen } = usePreviewCard();
  return <AnimatePresence>{isOpen && <PreviewCardPrimitive.Portal keepMounted data-slot="preview-card-portal" {...props}/>}</AnimatePresence>;
}

function PreviewCardPositioner(props) {
  return <PreviewCardPrimitive.Positioner data-slot="preview-card-positioner" {...props}/>;
}

function PreviewCardPopup({ transition = { type: 'spring', stiffness: 300, damping: 25 }, style, ...props }) {
  const { x, y, followCursor, followCursorSpringOptions } = usePreviewCard();
  const translateX = useSpring(x, followCursorSpringOptions);
  const translateY = useSpring(y, followCursorSpringOptions);
  return <PreviewCardPrimitive.Popup render={<motion.div key="preview-card-popup" data-slot="preview-card-popup" initial={{ opacity: 0, scale: .72, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .78, y: 6 }} transition={transition} style={{ x: followCursor === 'x' || followCursor === true ? translateX : undefined, y: followCursor === 'y' || followCursor === true ? translateY : undefined, ...style }} {...props}/>}/>;
}

export { PreviewCard, PreviewCardTrigger, PreviewCardPortal, PreviewCardPositioner, PreviewCardPopup };
