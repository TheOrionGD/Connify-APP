import React, { useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence, PanInfo } from 'motion/react';
import { ChevronLeft, ChevronRight, RotateCcw, Sparkles } from 'lucide-react';

export interface CardSwipeDeckProps<T extends { id: string | number }> {
  items: T[];
  renderCard: (item: T, isTop: boolean, index: number) => React.ReactNode;
  onCardSwiped?: (direction: 'left' | 'right', item: T, index: number) => void;
  stackHeight?: string;
  badgeText?: string;
}

export function CardSwipeDeck<T extends { id: string | number }>({
  items,
  renderCard,
  onCardSwiped,
  stackHeight = "h-[420px]",
  badgeText = "Swipe cards or use arrows"
}: CardSwipeDeckProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState<number[]>([]);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (currentIndex >= items.length) return;
    const currentItem = items[currentIndex];
    setHistory(prev => [...prev, currentIndex]);
    if (onCardSwiped) {
      onCardSwiped(direction, currentItem, currentIndex);
    }
    setCurrentIndex(prev => prev + 1);
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setHistory([]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prevIdx = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    setCurrentIndex(prevIdx);
  };

  const visibleCount = 3;
  const activeItems = items.slice(currentIndex, currentIndex + visibleCount);
  const isFinished = currentIndex >= items.length;

  return (
    <div className="w-full flex flex-col items-center select-none">
      
      {/* Control Bar & Progress with High Contrast */}
      <div className="w-full max-w-md flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold text-rose-400 bg-rose-500/15 px-3 py-1 rounded-full border border-rose-500/30 flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3 h-3 text-rose-400" />
            <span>{Math.min(currentIndex + 1, items.length)} of {items.length}</span>
          </span>
          <span className="text-xs text-slate-300 font-medium hidden sm:inline">{badgeText}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className="p-2.5 bg-[#12141d] hover:bg-white/10 disabled:opacity-30 text-white rounded-xl border border-white/15 shadow-sm transition-all cursor-pointer"
            title="Undo swipe"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleSwipe('left')}
            disabled={isFinished}
            className="p-2.5 bg-[#12141d] hover:bg-white/10 disabled:opacity-30 text-white rounded-xl border border-white/15 shadow-sm transition-all cursor-pointer"
            title="Previous / Left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleSwipe('right')}
            disabled={isFinished}
            className="p-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-30 text-white rounded-xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
            title="Next / Right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Swipe Stack Deck Viewport */}
      <div className={`relative w-full max-w-md ${stackHeight} flex items-center justify-center`}>
        {isFinished ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full h-full bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 flex flex-col items-center justify-center text-center space-y-4 text-slate-900"
          >
            <div className="w-16 h-16 bg-rose-50 rounded-2xl border border-rose-200 flex items-center justify-center text-rose-600 shadow-sm">
              <Sparkles className="w-8 h-8" />
            </div>
            <h4 className="text-2xl font-extrabold text-slate-900 font-display">Deck Completed</h4>
            <p className="text-xs text-slate-600 max-w-xs leading-relaxed font-medium">
              You have explored all items in this section. Reset the stack to review them again.
            </p>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold font-mono rounded-xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>RESTART STACK</span>
            </button>
          </motion.div>
        ) : (
          activeItems.map((item, stackIdx) => {
            const isTop = stackIdx === 0;
            const absoluteIdx = currentIndex + stackIdx;

            return (
              <React.Fragment key={String(item.id)}>
                <SwipeableCard
                  isTop={isTop}
                  stackIndex={stackIdx}
                  onSwipe={(dir) => handleSwipe(dir)}
                >
                  {renderCard(item, isTop, absoluteIdx)}
                </SwipeableCard>
              </React.Fragment>
            );
          }).reverse()
        )}
      </div>

      {/* Dot Indicators */}
      <div className="flex items-center gap-1.5 mt-6">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrentIndex(idx);
              setHistory(items.slice(0, idx).map((_, i) => i));
            }}
            className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
              idx === currentIndex
                ? 'w-7 bg-rose-500 shadow-[0_0_10px_#e11d48]'
                : idx < currentIndex
                ? 'w-2.5 bg-rose-300'
                : 'w-2.5 bg-white/20 hover:bg-white/40'
            }`}
          />
        ))}
      </div>

    </div>
  );
}

interface SwipeableCardProps {
  children: React.ReactNode;
  isTop: boolean;
  stackIndex: number;
  onSwipe: (direction: 'left' | 'right') => void;
}

function SwipeableCard({ children, isTop, stackIndex, onSwipe }: SwipeableCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-18, 18]);
  const opacity = useTransform(x, [-200, -120, 0, 120, 200], [0.4, 0.9, 1, 0.9, 0.4]);

  const rightTagOpacity = useTransform(x, [20, 100], [0, 1]);
  const leftTagOpacity = useTransform(x, [-20, -100], [0, 1]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      onSwipe('right');
    } else if (info.offset.x < -100) {
      onSwipe('left');
    }
  };

  const translateY = stackIndex * 14;
  const scale = 1 - stackIndex * 0.05;
  const zIndex = 30 - stackIndex;

  return (
    <motion.div
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        opacity: isTop ? opacity : 1 - stackIndex * 0.15,
        zIndex,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        transformOrigin: 'bottom center',
      }}
      animate={{
        y: translateY,
        scale,
        transition: { type: 'spring', stiffness: 300, damping: 25 },
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      whileTap={isTop ? { cursor: 'grabbing' } : undefined}
      className={`w-full h-full select-none cursor-grab touch-none ${!isTop ? 'pointer-events-none' : ''}`}
    >
      {/* Visual Swipe Feedback Labels */}
      {isTop && (
        <>
          <motion.div
            style={{ opacity: rightTagOpacity }}
            className="absolute top-6 left-6 z-50 pointer-events-none px-3.5 py-1.5 bg-emerald-500 text-white font-tech font-extrabold text-xs tracking-wider rounded-xl border-2 border-white shadow-2xl -rotate-12"
          >
            APPROVE / NEXT
          </motion.div>
          <motion.div
            style={{ opacity: leftTagOpacity }}
            className="absolute top-6 right-6 z-50 pointer-events-none px-3.5 py-1.5 bg-rose-500 text-white font-tech font-extrabold text-xs tracking-wider rounded-xl border-2 border-white shadow-2xl rotate-12"
          >
            DISMISS / PASS
          </motion.div>
        </>
      )}

      {children}
    </motion.div>
  );
}
export default CardSwipeDeck;
