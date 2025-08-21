'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface FlickeringGridProps {
  squareSize?: number;
  gridGap?: number;
  flickerChance?: number;
  color?: string;
  width?: number;
  height?: number;
  className?: string;
  maxOpacity?: number;
  fadeDirection?: 'none' | 'top-right' | 'center' | 'top-left' | 'bottom-right' | 'bottom-left';
  fadeIntensity?: number;
  fadeStart?: number; // New prop: where fade begins (0-1)
  fadeEnd?: number;   // New prop: where fade ends completely (0-1)
}

const FlickeringGrid: React.FC<FlickeringGridProps> = ({
  squareSize = 4,
  gridGap = 6,
  flickerChance = 0.3,
  color = "rgb(255, 87, 51)",
  width,
  height,
  className,
  maxOpacity = 0.4,
  fadeDirection = 'top-right',
  fadeIntensity = 1.2,
  fadeStart = 0.2,   
  fadeEnd = 0.7,    
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const memoizedColor = useMemo(() => {
    const toRGBA = (color: string) => {
      if (typeof window === "undefined") {
        return `rgba(255, 87, 51,`;
      }
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext("2d");
      if (!ctx) return "rgba(255, 87, 51,";
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = Array.from(ctx.getImageData(0, 0, 1, 1).data);
      return `rgba(${r}, ${g}, ${b},`;
    };
    return toRGBA(color);
  }, [color]);

  const setupCanvas = useCallback(
    (canvas: HTMLCanvasElement, width: number, height: number) => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const cols = Math.floor(width / (squareSize + gridGap));
      const rows = Math.floor(height / (squareSize + gridGap));

      const squares = new Float32Array(cols * rows);
      for (let i = 0; i < squares.length; i++) {
        squares[i] = Math.random() * maxOpacity;
      }

      return { cols, rows, squares, dpr };
    },
    [squareSize, gridGap, maxOpacity],
  );

  const updateSquares = useCallback(
    (squares: Float32Array, deltaTime: number) => {
      for (let i = 0; i < squares.length; i++) {
        if (Math.random() < flickerChance * deltaTime) {
          squares[i] = Math.random() * maxOpacity;
        }
      }
    },
    [flickerChance, maxOpacity],
  );

  const calculateFadeMultiplier = useCallback(
    (i: number, j: number, cols: number, rows: number) => {
      if (fadeDirection === 'none') return 1;

      let distance = 0;
      switch (fadeDirection) {
        case 'top-right':
          distance = Math.sqrt(
            Math.pow((cols - 1 - i) / cols, 2) + Math.pow(j / rows, 2)
          );
          break;
        case 'top-left':
          distance = Math.sqrt(
            Math.pow(i / cols, 2) + Math.pow(j / rows, 2)
          );
          break;
        case 'bottom-right':
          distance = Math.sqrt(
            Math.pow((cols - 1 - i) / cols, 2) + Math.pow((rows - 1 - j) / rows, 2)
          );
          break;
        case 'bottom-left':
          distance = Math.sqrt(
            Math.pow(i / cols, 2) + Math.pow((rows - 1 - j) / rows, 2)
          );
          break;
        case 'center':
          const centerX = (cols - 1) / 2;
          const centerY = (rows - 1) / 2;
          distance = Math.sqrt(
            Math.pow((i - centerX) / (cols / 2), 2) + Math.pow((j - centerY) / (rows / 2), 2)
          );
          break;
        default:
          return 1;
      }

      // Enhanced fade control with fadeStart and fadeEnd
      if (distance <= fadeStart) {
        return 1; // Full opacity before fade starts
      } else if (distance >= fadeEnd) {
        return 0; // Complete fade after fadeEnd
      } else {
        // Enhanced fade curve for more dramatic effect
        const fadeRange = fadeEnd - fadeStart;
        const normalizedDistance = (distance - fadeStart) / fadeRange;
        // Use a more aggressive fade curve (exponential)
        const fadeMultiplier = Math.pow(1 - normalizedDistance, 2) * (1 - fadeIntensity * normalizedDistance);
        return Math.max(0, fadeMultiplier);
      }
    },
    [fadeDirection, fadeIntensity, fadeStart, fadeEnd],
  );

  const drawGrid = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      cols: number,
      rows: number,
      squares: Float32Array,
      dpr: number,
    ) => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "transparent";
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const fadeMultiplier = calculateFadeMultiplier(i, j, cols, rows);
          const opacity = squares[i * rows + j] * fadeMultiplier;
          
          if (opacity > 0) {
            ctx.fillStyle = `${memoizedColor}${opacity})`;
            ctx.fillRect(
              i * (squareSize + gridGap) * dpr,
              j * (squareSize + gridGap) * dpr,
              squareSize * dpr,
              squareSize * dpr,
            );
          }
        }
      }
    },
    [memoizedColor, squareSize, gridGap, calculateFadeMultiplier],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let gridParams: ReturnType<typeof setupCanvas>;

    const updateCanvasSize = () => {
      const newWidth = width || container.clientWidth;
      const newHeight = height || container.clientHeight;
      setCanvasSize({ width: newWidth, height: newHeight });
      gridParams = setupCanvas(canvas, newWidth, newHeight);
    };

    updateCanvasSize();

    let lastTime = 0;
    const animate = (time: number) => {
      if (!isInView) return;

      const deltaTime = (time - lastTime) / 1000;
      lastTime = time;

      updateSquares(gridParams.squares, deltaTime);
      drawGrid(
        ctx,
        canvas.width,
        canvas.height,
        gridParams.cols,
        gridParams.rows,
        gridParams.squares,
        gridParams.dpr,
      );
      animationFrameId = requestAnimationFrame(animate);
    };

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });

    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0 },
    );

    intersectionObserver.observe(canvas);

    if (isInView) {
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
    };
  }, [setupCanvas, updateSquares, drawGrid, width, height, isInView]);

  return (
    <div ref={containerRef} className={`w-full h-full overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="pointer-events-none"
        style={{
          width: canvasSize.width,
          height: canvasSize.height,
          maxWidth: '100%',
          maxHeight: '100%'
        }}
      />
    </div>
  );
};

export { FlickeringGrid };