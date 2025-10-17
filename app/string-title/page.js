// app/page.jsx
"use client";

import React, { useState, useRef, useCallback } from 'react';
import Masonry from 'react-masonry-css';
import {
  DndContext,
  closestCenter,
  PointerSensor, // Use pointer events (mouse, touch, pen)
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay, // To render a smooth overlay while dragging
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove, // Utility to move items in the array
  rectSortingStrategy, // Strategy suitable for grid-like layouts
  sortableKeyboardCoordinates, // Accessibility for keyboard dragging
} from '@dnd-kit/sortable';
import { restrictToWindowEdges } from '@dnd-kit/modifiers'; // Prevent dragging outside window

import { DraggableItem } from '../components/DraggableItem'; // Adjust path if needed

// Initial items - give them unique IDs and potentially heights
const initialItems = Array.from({ length: 15 }, (_, i) => ({
  id: `item-${i + 1}`,
  content: `${i + 1}`,
  // Assign varying heights for masonry effect
  height: Math.floor(Math.random() * (280 - 120 + 1)) + 120,
}));

// Define breakpoints for masonry columns
const breakpointColumnsObj = {
  default: 4,
  1100: 3,
  700: 2,
  500: 1
};

// --- Threshold Logic ---
// We won't rearrange until the dragged item moves this far
const DRAG_THRESHOLD_PIXELS = 50; // Adjust as needed (e.g., based on half item width/height)

export default function MasonryDragPage() {
  const [items, setItems] = useState(initialItems);
  const [activeId, setActiveId] = useState(null); // ID of the item currently being dragged
  const [hasMovedEnough, setHasMovedEnough] = useState(false); // Track if threshold is met
  const initialDragPosition = useRef(null); // Store starting {x, y} of drag

  // Find the item data based on its ID
  const getActiveItem = () => items.find(item => item.id === activeId);

  // Configure sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require pointer to move specified pixels before activating drag
      // This prevents triggering drag on simple clicks
      activationConstraint: {
        distance: 8, // Adjust this value for sensitivity
      },
    }),
    useSensor(KeyboardSensor, {
      // Enable keyboard dragging with default coordinates
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // --- Drag Handlers ---

  const handleDragStart = useCallback((event) => {
    setActiveId(event.active.id);
    setHasMovedEnough(false); // Reset threshold flag on new drag
    initialDragPosition.current = null; // Reset initial position
  }, []);

  const handleDragMove = useCallback((event) => {
    if (!activeId || hasMovedEnough) return; // Only check threshold once

    const { active, delta } = event;

    // Store the starting position on the first move event after start
    if (initialDragPosition.current === null) {
        // This is a bit tricky because delta resets. A better way might be
        // to store the initial pointer coordinates from onDragStart, but
        // PointerSensor activationConstraint complicates that.
        // Let's use delta magnitude as a proxy for movement distance.
    }

    // Calculate distance moved from the start of the drag action
    const distanceMoved = Math.sqrt(delta.x ** 2 + delta.y ** 2);

    // Check if the threshold is met
    if (distanceMoved >= DRAG_THRESHOLD_PIXELS) {
      console.log("Threshold met!");
      setHasMovedEnough(true);
      // NOTE: We don't reorder *here*. The actual reorder happens in onDragEnd.
      // dnd-kit's SortableContext + CSS transform handles the visual movement.
      // The other items will shift *visually* based on the SortableContext's
      // updates during the drag when using `rectSortingStrategy`,
      // but the actual data order changes only on drop.
    }
  }, [activeId, hasMovedEnough]);


  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;

    // Reset active state and threshold flag
    setActiveId(null);
    setHasMovedEnough(false);
    initialDragPosition.current = null;


    // Only proceed if dragging ended over a valid sortable target
    // and the threshold was met during the drag
    if (over && active.id !== over.id && hasMovedEnough) {
      setItems((currentItems) => {
        const oldIndex = currentItems.findIndex((item) => item.id === active.id);
        const newIndex = currentItems.findIndex((item) => item.id === over.id);

        // Use arrayMove utility to update the array order immutably
        return arrayMove(currentItems, oldIndex, newIndex);
      });
    } else if (over && active.id !== over.id && !hasMovedEnough) {
        console.log("Drag ended, but threshold not met. No reorder.");
        // Item snaps back because state wasn't updated
    } else {
        console.log("Drag ended without moving over a different item or threshold not met.");
    }

  }, [hasMovedEnough]); // Dependency on hasMovedEnough ensures we use its latest value

  const handleDragCancel = useCallback(() => {
      // Handle cases where drag is cancelled (e.g., pressing Esc)
      setActiveId(null);
      setHasMovedEnough(false);
      initialDragPosition.current = null;
      console.log("Drag cancelled");
  }, [])

  return (
    <div className="p-5 min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-700">
        Draggable Masonry Layout
      </h1>

      {/* DndContext wraps the area where drag and drop is enabled */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter} // Strategy for determining drop target
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        // Apply modifier to keep dragged item within window bounds
        modifiers={[restrictToWindowEdges]}
      >
        {/* SortableContext provides context for sortable items */}
        <SortableContext items={items.map(item => item.id)} strategy={rectSortingStrategy}>
          {/* react-masonry-css component */}
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="my-masonry-grid flex w-auto" // Container class - use flex
            columnClassName="my-masonry-grid_column pl-4 bg-clip-padding" // Column class - add padding left (acts as gap)
          >
            {/* Map over items state to render DraggableItem components */}
            {items.map((item) => (
              <DraggableItem
                  key={item.id}
                  id={item.id}
                  content={item.content}
                  height={item.height}
              />
            ))}
          </Masonry>
        </SortableContext>

        {/* DragOverlay renders the item being dragged separately for smooth visuals */}
        <DragOverlay dropAnimation={null} >
          {activeId ? (
            <DraggableItem
                id={activeId}
                content={getActiveItem()?.content}
                height={getActiveItem()?.height}
                // Note: DragOverlay items don't need listeners/attributes,
                // they are just visual representations. They also shouldn't be sortable.
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}