// components/DraggableItem.jsx
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DraggableItem } from '../components/DraggableItem';

export function DraggableItem({ id, content, height }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging, // State to know if this specific item is being dragged
  } = useSortable({ id: id });

  // Generate dynamic height and slightly varying grey background
  const itemHeight = height || Math.floor(Math.random() * (250 - 100 + 1)) + 100; // Random height between 100px and 250px if not provided
  const greyShade = Math.floor(Math.random() * (5 - 2 + 1)) + 2; // Random grey shade (200 to 500)

  const style = {
    transform: CSS.Transform.toString(transform), // Apply dnd-kit transform for smooth movement
    transition: transition || 'transform 250ms ease', // Smooth transition for drop/reorder
    height: `${itemHeight}px`, // Apply dynamic height
    // Opacity effect while dragging
    opacity: isDragging ? 0.7 : 1,
    // Prevent interference with touch scrolling
    touchAction: 'none',
     // Optimize rendering during transform changes
    willChange: 'transform',
    // Make sure items don't shrink in flex/grid contexts unexpectedly
    flexShrink: 0,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes} // Spread attributes for accessibility and internal dnd-kit functionality
      {...listeners} // Spread listeners to make the whole div the drag handle
      className={`
        p-4 rounded-lg shadow-md mb-4  /* Item base styles + margin bottom for masonry gap */
        bg-gray-${greyShade}00      /* Dynamic background color */
        text-gray-800              /* Text color */
        cursor-grab                /* Indicate draggable */
        ${isDragging ? 'z-10 shadow-xl relative' : 'z-0'} /* Elevate visually when dragging */
      `}
    >
      Item {content} <br /> (ID: {id.split('-')[1]}) <br /> H: {itemHeight}px
    </div>
  );
}