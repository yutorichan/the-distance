"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Users } from "lucide-react";

interface Post {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  contributorCount: number;
  wordCount: number;
}

interface BubbleFeedProps {
  posts: Post[];
}

interface BubbleData extends Post {
  size: number; // rem
  radius: number; // physics units
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  vx: number; // velocity x
  vy: number; // velocity y
  animationDelay: string;
}

export function BubbleFeed({ posts }: BubbleFeedProps) {
  const [bubbles, setBubbles] = useState<BubbleData[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const requestRef = useRef<number>(0);

  // Initialize bubbles with random placement and velocities
  useEffect(() => {
    const isOverlapping = (x: number, y: number, r: number, existing: { x: number, y: number, r: number }[]) => {
      for (const e of existing) {
        const dx = x - e.x;
        const dy = y - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // Space buffer to prevent touching
        if (dist < (r + e.r) * 1.2) return true;
      }
      return false;
    };

    const placed: { x: number, y: number, r: number }[] = [];
    
    const newBubbles = posts.map((post) => {
      // Calculate radius in "percentage" units roughly. 1rem is ~1-1.5% of container width/height usually.
      // Let's assume a unit radius for collision logic.
      const radius = 6 + (post.contributorCount * 0.5); 
      const sizeRem = Math.min(25, 12 + post.contributorCount * 0.5);
      
      let x = 0;
      let y = 0;
      let attempts = 0;
      let found = false;

      while (!found && attempts < 300) {
        x = 10 + Math.random() * 80; 
        y = 10 + Math.random() * 80;

        if (!isOverlapping(x, y, radius, placed)) {
          found = true;
        }
        attempts++;
      }

      placed.push({ x, y, r: radius });
      
      return {
        ...post,
        size: sizeRem,
        radius, // storage for physics
        x,
        y,
        // Very slow drift velocities
        vx: (Math.random() - 0.5) * 0.015,
        vy: (Math.random() - 0.5) * 0.015,
        animationDelay: `-${Math.random() * 5}s`,
      };
    });
    setBubbles(newBubbles as any);
  }, [posts]);

  // Physics loop for drifting
  const animate = useCallback(() => {
    setBubbles((prevBubbles) => {
      return prevBubbles.map((b) => {
        if (b.id === draggingId) return b; // Skip physics for the dragged item

        let nextX = b.x + b.vx;
        let nextY = b.y + b.vy;
        let nextVx = b.vx;
        let nextVy = b.vy;

        // Bounce off edges (considering radius)
        const margin = b.radius;
        if (nextX < margin || nextX > 100 - margin) {
          nextVx *= -1;
          nextX = b.x + nextVx;
        }
        if (nextY < margin || nextY > 100 - margin) {
          nextVy *= -1;
          nextY = b.y + nextVy;
        }

        return { ...b, x: nextX, y: nextY, vx: nextVx, vy: nextVy };
      });
    });
    requestRef.current = requestAnimationFrame(animate);
  }, [draggingId]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [animate]);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    // Prevent navigating if starting a drag
    if (e.button !== 0) return;
    
    const bubble = bubbles.find(b => b.id === id);
    if (!bubble || !containerRef.current) return;

    setDraggingId(id);
    
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    
    // Convert current bubble x/y (%) to pixels
    const bubbleXpx = (bubble.x / 100) * rect.width;
    const bubbleYpx = (bubble.y / 100) * rect.height;

    dragOffset.current = {
      x: clientX - bubbleXpx,
      y: clientY - bubbleYpx
    };

    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!draggingId || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    // New target position in percentage
    const targetX = ((clientX - dragOffset.current.x) / rect.width) * 100;
    const targetY = ((clientY - dragOffset.current.y) / rect.height) * 100;

    setBubbles(current => current.map(b => 
      b.id === draggingId ? { ...b, x: targetX, y: targetY } : b
    ));
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  useEffect(() => {
    if (draggingId) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingId]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[700px] sm:h-[900px] overflow-hidden bg-canvas/30 select-none cursor-default"
    >
      {bubbles.length === 0 && (
        <div className="flex items-center justify-center h-full text-ink-muted/40 font-serif italic">
          思考の種を探しています...
        </div>
      )}
      
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className={`absolute rounded-full flex flex-col items-center justify-center text-center p-8 transition-shadow duration-300 border border-border/60 bg-surface/90 backdrop-blur-md group
            ${draggingId === bubble.id ? 'z-50 shadow-2xl scale-[1.02]' : 'z-10 shadow-sm hover:shadow-lg hover:border-accent/30'}
            ${draggingId ? '' : 'animate-bubble-float'}
          `}
          style={{
            width: `${bubble.size}rem`,
            height: `${bubble.size}rem`,
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
            transform: "translate(-50%, -50%)", // Center the bubble on its x/y coordinates
            cursor: draggingId === bubble.id ? 'grabbing' : 'grab',
            animationDelay: bubble.animationDelay,
            transition: draggingId === bubble.id ? 'none' : 'left 0.1s linear, top 0.1s linear, box-shadow 0.3s ease'
          }}
          onMouseDown={(e) => handleMouseDown(e, bubble.id)}
        >
          {/* Metadata */}
          <div className="flex items-center justify-center gap-1.5 bg-canvas px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-sans text-ink-muted mb-4 shadow-sm border border-border/50 group-hover:border-accent/40 group-hover:text-accent transition-colors">
            <Users className="w-3 h-3" />
            {bubble.contributorCount}人の共同執筆者
          </div>
          
          {/* Title */}
          <Link 
            href={`/${bubble.id}`}
            onMouseDown={(e) => e.stopPropagation()} // Allow clicking the link without dragging
            className="text-lg sm:text-xl font-bold font-serif text-ink leading-tight line-clamp-3 px-2 hover:text-accent transition-colors"
          >
            {bubble.title}
          </Link>
          
          {/* Author */}
          <div className="mt-6 text-[10px] font-sans text-ink-muted/60 uppercase tracking-widest">
            {bubble.author}
          </div>
        </div>
      ))}
      
      {/* Decorative center glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-4xl max-h-[4xl] bg-[radial-gradient(circle,rgba(58,92,204,0.03)_0%,transparent_70%)] blur-3xl -z-10" />
    </div>
  );
}
