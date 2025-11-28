import React, { useRef, useEffect, useState } from 'react';
import { DrawingPath, Point, DrawingTool } from '../types';

interface DrawingCanvasProps {
  width: number;
  height: number;
  isActive: boolean;
  activeTool: DrawingTool;
  paths: DrawingPath[];
  currentColor: string;
  currentWidth: number;
  onAddPath: (path: DrawingPath) => void;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  width,
  height,
  isActive,
  activeTool,
  paths,
  currentColor,
  currentWidth,
  onAddPath
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  
  // Cursor state
  const [cursorPos, setCursorPos] = useState<{x: number, y: number} | null>(null);

  // Helper to get coordinates relative to canvas
  const getCoords = (e: React.MouseEvent | React.TouchEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: (clientX - rect.left) / width,
      y: (clientY - rect.top) / height
    };
  };

  // Update cursor position
  const updateCursor = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isActive || activeTool !== DrawingTool.ERASER) {
        setCursorPos(null);
        return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
       if (e.touches.length > 0) {
           clientX = e.touches[0].clientX;
           clientY = e.touches[0].clientY;
       } else {
           return; 
       }
    } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
    }

    // Relative to the container/page is fine for fixed positioning, 
    // but here we render the cursor inside the relative container of the canvas
    setCursorPos({
        x: clientX - rect.left,
        y: clientY - rect.top
    });
  }

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isActive) return;
    updateCursor(e);
    const coords = getCoords(e);
    if (coords) {
      setIsDrawing(true);
      setCurrentPoints([coords]);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isActive) return;
    updateCursor(e);
    if (!isDrawing) return;
    
    const coords = getCoords(e);
    if (coords) {
      setCurrentPoints(prev => [...prev, coords]);
    }
  };

  const endDrawing = () => {
    if (!isActive) return;
    setIsDrawing(false);
    
    if (currentPoints.length > 0) {
      onAddPath({
        points: currentPoints,
        color: currentColor,
        width: currentWidth,
        type: activeTool
      });
      setCurrentPoints([]);
    }
  };

  const handleMouseLeave = () => {
      endDrawing();
      setCursorPos(null);
  }

  // Render logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    
    // Style logic for CSS size
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.clearRect(0, 0, width, height);

    // Helper function to draw a path
    const renderPath = (points: Point[], color: string, lineWidth: number, type: DrawingTool) => {
        if (points.length < 2) return;
        
        ctx.beginPath();
        // IMPORTANT: Eraser logic uses destination-out to clear pixels
        ctx.globalCompositeOperation = type === DrawingTool.ERASER ? 'destination-out' : 'source-over';
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        
        ctx.moveTo(points[0].x * width, points[0].y * height);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x * width, points[i].y * height);
        }
        ctx.stroke();
    };

    // Draw saved paths
    paths.forEach(path => {
       renderPath(path.points, path.color, path.width, path.type || DrawingTool.PEN);
    });

    // Draw current stroke
    if (isDrawing && currentPoints.length > 1) {
       renderPath(currentPoints, currentColor, currentWidth, activeTool);
    }
    
    // Reset composite operation to default
    ctx.globalCompositeOperation = 'source-over';

  }, [width, height, paths, isDrawing, currentPoints, currentColor, currentWidth, activeTool]);

  return (
    <div ref={containerRef} className="absolute inset-0 w-full h-full">
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 z-10 ${isActive ? (activeTool === DrawingTool.ERASER ? 'cursor-none' : 'cursor-crosshair') : 'pointer-events-none'} touch-none`}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={endDrawing}
            onMouseLeave={handleMouseLeave}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={endDrawing}
        />
        {/* Custom Eraser Cursor */}
        {isActive && activeTool === DrawingTool.ERASER && cursorPos && (
            <div 
                className="absolute pointer-events-none border border-slate-500 bg-white/30 rounded-full z-20 shadow-sm"
                style={{
                    width: currentWidth,
                    height: currentWidth,
                    left: cursorPos.x,
                    top: cursorPos.y,
                    transform: 'translate(-50%, -50%)',
                }}
            />
        )}
    </div>
  );
};

export default DrawingCanvas;