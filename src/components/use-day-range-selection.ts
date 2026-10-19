"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Selecionar dias arrastando por cima da grelha.
 *
 * Com rato o arrasto começa logo. Com o dedo não pode: um arrasto imediato
 * seria indistinguível de scroll, por isso é preciso carregar e aguentar
 * antes de a seleção arrancar. Só a partir daí é que bloqueamos o scroll.
 */
const TOUCH_HOLD_MS = 320;

export type DayRange = { from: string; to: string };

function order(a: string, b: string): DayRange {
  return a <= b ? { from: a, to: b } : { from: b, to: a };
}

function dayAt(x: number, y: number): string | null {
  const el = document.elementFromPoint(x, y);
  return el?.closest<HTMLElement>("[data-day]")?.dataset.day ?? null;
}

export function useDayRangeSelection() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [range, setRange] = useState<DayRange | null>(null);
  const [drag, setDrag] = useState<DayRange | null>(null);

  const armed = useRef(false);
  const anchor = useRef<string | null>(null);
  const hold = useRef<ReturnType<typeof setTimeout> | null>(null);
  // O arrasto vive também num ref porque o pointerup tem de o ler sem
  // depender de o React já ter re-renderizado entre descer e levantar o dedo.
  const dragRef = useRef<DayRange | null>(null);

  const putDrag = (next: DayRange | null) => {
    dragRef.current = next;
    setDrag(next);
  };

  const cancelHold = () => {
    if (hold.current) clearTimeout(hold.current);
    hold.current = null;
  };

  // Listener nativo e não passivo: o React não garante que o preventDefault
  // de um onTouchMove pegue, e sem ele a página arrasta por baixo do dedo.
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const block = (e: TouchEvent) => {
      if (armed.current) e.preventDefault();
    };
    el.addEventListener("touchmove", block, { passive: false });
    return () => el.removeEventListener("touchmove", block);
  }, []);

  useEffect(() => {
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setRange(null);
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const day = dayAt(e.clientX, e.clientY);
    if (!day) return;

    anchor.current = day;
    const grid = e.currentTarget;

    const arm = () => {
      armed.current = true;
      // Capturar só agora: capturar antes de haver seleção estorvava o scroll.
      grid.setPointerCapture?.(e.pointerId);
      putDrag({ from: day, to: day });
    };

    if (e.pointerType === "touch") {
      // Ainda não armamos: pode ser o início de um scroll.
      cancelHold();
      hold.current = setTimeout(() => {
        arm();
        navigator.vibrate?.(8);
      }, TOUCH_HOLD_MS);
    } else {
      arm();
    }
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!armed.current) {
      // Mexeu antes de aguentar: era scroll, não seleção.
      cancelHold();
      return;
    }
    const day = dayAt(e.clientX, e.clientY);
    if (day && anchor.current) putDrag(order(anchor.current, day));
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    cancelHold();
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    if (armed.current && dragRef.current) {
      setRange(dragRef.current);
    } else if (anchor.current) {
      // Toque curto: vale como um dia só.
      const day = dayAt(e.clientX, e.clientY);
      if (day && day === anchor.current) setRange({ from: day, to: day });
    }

    armed.current = false;
    anchor.current = null;
    putDrag(null);
  }, []);

  const onPointerCancel = useCallback(() => {
    cancelHold();
    armed.current = false;
    anchor.current = null;
    putDrag(null);
  }, []);

  /** Para o teclado: escolher um dia sem arrastar. */
  const selectDay = useCallback((day: string) => {
    setRange((prev) => (prev && prev.from === prev.to ? order(prev.from, day) : { from: day, to: day }));
  }, []);

  const shown = drag ?? range;
  const isSelected = useCallback(
    (iso: string) => !!shown && iso >= shown.from && iso <= shown.to,
    [shown],
  );

  return {
    gridRef,
    range,
    dragging: drag !== null,
    isSelected,
    clear: () => setRange(null),
    selectDay,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel },
  };
}
