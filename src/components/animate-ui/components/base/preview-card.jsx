import React from 'react';
import {
  PreviewCard as PreviewCardPrimitive,
  PreviewCardTrigger as PreviewCardTriggerPrimitive,
  PreviewCardPortal,
  PreviewCardPositioner,
  PreviewCardPopup,
} from '../../primitives/base/preview-card';
import { cn } from '../../../../lib/utils';

function PreviewCard(props) {
  return <PreviewCardPrimitive {...props}/>;
}

function PreviewCardTrigger(props) {
  return <PreviewCardTriggerPrimitive {...props}/>;
}

function PreviewCardPanel({ className, align = 'center', sideOffset = 8, children, ...props }) {
  return <PreviewCardPortal><PreviewCardPositioner align={align} sideOffset={sideOffset} className="preview-card-positioner" {...props}><PreviewCardPopup className={cn('preview-card-panel', className)}>{children}</PreviewCardPopup></PreviewCardPositioner></PreviewCardPortal>;
}

export { PreviewCard, PreviewCardTrigger, PreviewCardPanel };
