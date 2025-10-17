"use client"
import React, { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [boxes, setBoxes] = useState([]);
  const [draggedBox, setDraggedBox] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoverIndex, setHoverIndex] = useState(null);
  const containerRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Generate random boxes (uniform width)
  useEffect(() => {
    const newBoxes = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      height: Math.floor(Math.random() * 150) + 100,
      backgroundColor: `rgb(${Math.floor(Math.random() * 50) + 150}, ${Math.floor(Math.random() * 50) + 150}, ${Math.floor(Math.random() * 50) + 150})`,
    }));
    setBoxes(newBoxes);
  }, []);

  const handleMouseDown = (e, boxId) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const box = document.getElementById(`box-${boxId}`);
    const rect = box.getBoundingClientRect();

    setDraggedBox(boxId);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });

    setMousePos({ x: e.clientX, y: e.clientY });

    // Apply detachment styling
    box.style.position = 'fixed';
    box.style.zIndex = '1000';
    box.style.width = `${rect.width}px`;
    box.style.height = `${rect.height}px`;
    box.style.left = `${rect.left}px`;
    box.style.top = `${rect.top}px`;
    box.style.pointerEvents = 'none';
    box.style.transition = 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s';
    box.style.transform = 'scale(1.08) rotate(2deg)';
    box.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.35)';
    box.style.opacity = '0.92';
    box.style.cursor = 'grabbing';
  };

  const getBoxGridPosition = (boxId) => {
    const element = document.getElementById(`box-${boxId}`);
    if (!element || !containerRef.current) return null;

    const rect = element.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    return {
      left: rect.left - containerRect.left,
      top: rect.top - containerRect.top,
      right: rect.right - containerRect.left,
      bottom: rect.bottom - containerRect.top,
      centerX: rect.left + rect.width / 2 - containerRect.left,
      centerY: rect.top + rect.height / 2 - containerRect.top,
      width: rect.width,
      height: rect.height
    };
  };

  const findHoverIndex = () => {
    if (!containerRef.current || draggedBox === null) return null;

    const containerRect = containerRef.current.getBoundingClientRect();
    const relativeX = mousePos.x - containerRect.left;
    const relativeY = mousePos.y - containerRect.top;

    let closestIndex = null;
    let closestDistance = Infinity;

    boxes.forEach((box, index) => {
      if (box.id === draggedBox) return;

      const pos = getBoxGridPosition(box.id);
      if (!pos) return;

      const distance = Math.sqrt(
        Math.pow(relativeX - pos.centerX, 2) + 
        Math.pow(relativeY - pos.centerY, 2)
      );

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    return closestIndex;
  };

  const applySpaceClearing = () => {
    if (draggedBox === null || !containerRef.current) return;

    const currentHoverIndex = findHoverIndex();
    setHoverIndex(currentHoverIndex);

    if (currentHoverIndex === null) {
      // Reset all boxes when not hovering
      boxes.forEach(box => {
        if (box.id === draggedBox) return;
        const element = document.getElementById(`box-${box.id}`);
        if (element) {
          element.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s';
          element.style.transform = 'translate(0, 0)';
          element.style.opacity = '1';
        }
      });
      return;
    }

    const draggedIndex = boxes.findIndex(b => b.id === draggedBox);
    const containerRect = containerRef.current.getBoundingClientRect();
    
    // Get grid layout information
    const gridComputedStyle = window.getComputedStyle(containerRef.current);
    const gap = parseFloat(gridComputedStyle.gap) || 16;

    boxes.forEach((box, index) => {
      if (box.id === draggedBox) return;

      const element = document.getElementById(`box-${box.id}`);
      if (!element) return;

      const pos = getBoxGridPosition(box.id);
      if (!pos) return;

      // Calculate if this box needs to shift to make space
      let translateX = 0;
      let translateY = 0;
      let opacity = 1;

      // Determine shift direction based on hover position
      if (currentHoverIndex !== null) {
        if (draggedIndex < currentHoverIndex) {
          // Dragging down/right - push boxes after hover point forward
          if (index > draggedIndex && index <= currentHoverIndex) {
            // Shift left (make space on right)
            translateX = -(pos.width + gap);
            opacity = 0.6;
          }
        } else if (draggedIndex > currentHoverIndex) {
          // Dragging up/left - push boxes before hover point backward
          if (index < draggedIndex && index >= currentHoverIndex) {
            // Shift right (make space on left)
            translateX = pos.width + gap;
            opacity = 0.6;
          }
        }
      }

      element.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s';
      element.style.transform = `translate(${translateX}px, ${translateY}px)`;
      element.style.opacity = `${opacity}`;
    });
  };

  const handleMouseMove = (e) => {
    if (draggedBox !== null) {
      const box = document.getElementById(`box-${draggedBox}`);
      if (!box) return;

      box.style.left = `${e.clientX - dragOffset.x}px`;
      box.style.top = `${e.clientY - dragOffset.y}px`;

      setMousePos({ x: e.clientX, y: e.clientY });

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(applySpaceClearing);
    }
  };

  const handleMouseUp = () => {
    if (draggedBox !== null) {
      const box = document.getElementById(`box-${draggedBox}`);
      
      // Reorder based on hover index
      if (hoverIndex !== null) {
        const newBoxes = [...boxes];
        const draggedIndex = newBoxes.findIndex(b => b.id === draggedBox);

        if (draggedIndex !== -1) {
          const [removed] = newBoxes.splice(draggedIndex, 1);
          newBoxes.splice(hoverIndex, 0, removed);
          setBoxes(newBoxes);
        }
      }

      // Reset dragged box styling
      if (box) {
        box.style.position = '';
        box.style.zIndex = '';
        box.style.width = '';
        box.style.height = '';
        box.style.left = '';
        box.style.top = '';
        box.style.pointerEvents = '';
        box.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        box.style.transform = 'scale(1) rotate(0deg)';
        box.style.boxShadow = '';
        box.style.opacity = '';
        box.style.cursor = '';
      }

      // Reset all other boxes
      boxes.forEach(b => {
        if (b.id === draggedBox) return;
        const element = document.getElementById(`box-${b.id}`);
        if (element) {
          element.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s';
          element.style.transform = 'translate(0, 0)';
          element.style.opacity = '1';
        }
      });

      setDraggedBox(null);
      setMousePos({ x: 0, y: 0 });
      setHoverIndex(null);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  useEffect(() => {
    if (draggedBox !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedBox, mousePos, dragOffset, hoverIndex]);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px',
        padding: '20px',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        position: 'relative',
      }}
    >
      {boxes.map((box) => (
        <div
          key={box.id}
          id={`box-${box.id}`}
          onMouseDown={(e) => handleMouseDown(e, box.id)}
          style={{
            height: `${box.height}px`,
            backgroundColor: box.backgroundColor,
            borderRadius: '8px',
            cursor: draggedBox === box.id ? 'grabbing' : 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#333',
            userSelect: 'none',
            willChange: 'transform, opacity',
          }}
        >
          {box.id + 1}
        </div>
      ))}
    </div>
  );
}
git