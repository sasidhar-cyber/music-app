/**
 * SoundWave Music Experience
 * Adapted for SoundWave Music Engine - Wavy & Squiggly Audio Slider
 */

import React, { useRef, useState, useEffect, useCallback } from 'react';

export function WavySlider({
  value = 0,
  max = 100,
  onChange,
  onChangeEnd,
  isPlaying = false,
  sliderStyle = 'wavy', // 'wavy' | 'squiggly' | 'linear'
  accentColor = '#10b981',
  trackColor = 'rgba(255, 255, 255, 0.15)',
  height = 36,
  disabled = false,
  showTooltip = true,
  formatTime
}) {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(value);
  const [phase, setPhase] = useState(0);
  const [hoverPosition, setHoverPosition] = useState(null);

  const displayValue = isDragging ? dragValue : value;
  const clampedDisplay = Math.max(0, Math.min(max, displayValue));
  const progressRatio = max > 0 ? clampedDisplay / max : 0;

  // Live wave oscillation when playing
  useEffect(() => {
    if (!isPlaying || sliderStyle === 'linear') return;
    let animationFrameId;
    let lastTime = performance.now();

    const animate = (time) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;
      // Wavy/squiggly wave speed
      const speed = sliderStyle === 'squiggly' ? 6 : 4;
      setPhase((prev) => (prev + delta * speed) % (Math.PI * 2));
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, sliderStyle]);

  const getValueFromEvent = useCallback((e) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const offsetX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const ratio = rect.width > 0 ? offsetX / rect.width : 0;
    return ratio * max;
  }, [max]);

  const handlePointerDown = (e) => {
    if (disabled) return;
    setIsDragging(true);
    const newVal = getValueFromEvent(e);
    setDragValue(newVal);
    if (onChange) onChange(newVal);

    const handlePointerMove = (moveEvent) => {
      const updatedVal = getValueFromEvent(moveEvent);
      setDragValue(updatedVal);
      if (onChange) onChange(updatedVal);
    };

    const handlePointerUp = (upEvent) => {
      setIsDragging(false);
      const finalVal = getValueFromEvent(upEvent);
      if (onChangeEnd) onChangeEnd(finalVal);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove);
    window.addEventListener('touchend', handlePointerUp);
  };

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const offsetX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    setHoverPosition({
      x: offsetX,
      value: (offsetX / rect.width) * max
    });
  };

  const handleMouseLeave = () => {
    setHoverPosition(null);
  };

  // Generate SVG Path for Wavy / Squiggly line
  const generatePath = (width, h, endRatio, isFilled) => {
    if (width <= 0) return '';
    const endX = width * endRatio;
    const midY = h / 2;

    if (sliderStyle === 'linear') {
      const startX = isFilled ? 0 : endX;
      const targetX = isFilled ? endX : width;
      return `M ${startX} ${midY} L ${targetX} ${midY}`;
    }

    // SoundWave Wavy / Squiggly waveform
    const amplitude = sliderStyle === 'squiggly' ? 4 : 3;
    const wavelength = sliderStyle === 'squiggly' ? 24 : 32;
    const step = 2;

    const startX = isFilled ? 0 : endX;
    const targetX = isFilled ? endX : width;

    if (startX >= targetX) return '';

    let d = `M ${startX} ${midY + Math.sin((startX / wavelength) * Math.PI * 2 + phase) * amplitude}`;

    for (let x = startX + step; x <= targetX; x += step) {
      const y = midY + Math.sin((x / wavelength) * Math.PI * 2 + phase) * amplitude;
      d += ` L ${x} ${y}`;
    }

    return d;
  };

  const width = containerRef.current ? containerRef.current.offsetWidth : 300;
  const thumbX = width * progressRatio;
  const midY = height / 2;
  const thumbY = sliderStyle !== 'linear'
    ? midY + Math.sin((thumbX / (sliderStyle === 'squiggly' ? 24 : 32)) * Math.PI * 2 + phase) * (sliderStyle === 'squiggly' ? 4 : 3)
    : midY;

  return (
    <div
      ref={containerRef}
      id="soundwave-wavy-slider-container"
      className="relative w-full select-none cursor-pointer py-2 group touch-none"
      onPointerDown={handlePointerDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ height }}
    >
      {/* SVG Canvas for precision waves */}
      <svg
        className="w-full h-full overflow-visible pointer-events-none"
        viewBox={`0 0 ${width || 300} ${height}`}
        preserveAspectRatio="none"
      >
        {/* Unfilled track background */}
        <path
          d={generatePath(width || 300, height, progressRatio, false)}
          fill="none"
          stroke={trackColor}
          strokeWidth={sliderStyle === 'linear' ? 4 : 3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Filled active track */}
        <path
          d={generatePath(width || 300, height, progressRatio, true)}
          fill="none"
          stroke={accentColor}
          strokeWidth={sliderStyle === 'linear' ? 4 : 3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* SoundWave Thumb Pin / Scrubber */}
      <div
        id="soundwave-slider-thumb"
        className={`absolute top-0 pointer-events-none transition-transform duration-75 flex items-center justify-center ${
          isDragging ? 'scale-125' : 'group-hover:scale-110'
        }`}
        style={{
          left: `${progressRatio * 100}%`,
          top: `${thumbY}px`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div
          className="w-4 h-4 rounded-full shadow-lg border-2 border-white transition-all"
          style={{
            backgroundColor: accentColor,
            boxShadow: `0 0 12px ${accentColor}88`
          }}
        />
      </div>

      {/* Hover/Drag Tooltip */}
      {showTooltip && (isDragging || hoverPosition) && (
        <div
          className="absolute -top-7 px-2 py-0.5 rounded bg-slate-900/90 text-white text-[11px] font-mono shadow-md border border-white/10 pointer-events-none transform -translate-x-1/2"
          style={{
            left: `${isDragging ? progressRatio * 100 : ((hoverPosition?.x || 0) / (width || 1)) * 100}%`
          }}
        >
          {formatTime ? formatTime(isDragging ? dragValue : hoverPosition?.value || 0) : Math.round(isDragging ? dragValue : hoverPosition?.value || 0)}
        </div>
      )}
    </div>
  );
}
