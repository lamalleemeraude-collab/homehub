"use client";

import { type ReactNode, useState } from "react";

type TouchButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  ariaLabel?: string;
};

export function TouchButton({
  children,
  onClick,
  className = "",
  disabled = false,
  ariaLabel,
}: TouchButtonProps) {
  const [flash, setFlash] = useState(false);

  function handleClick() {
    if (disabled) return;
    setFlash(true);
    setTimeout(() => setFlash(false), 150);
    onClick?.();
  }

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={handleClick}
      className={`touch-target ${flash ? "press-flash" : ""} ${className}`}
    >
      {children}
    </button>
  );
}
