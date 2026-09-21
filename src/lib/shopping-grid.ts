export type ShoppingGridLayout = {
  cols: number;
  rows: number;
  emojiClass: string;
  labelClass: string;
  gapClass: string;
  paddingClass: string;
};

/** Adapte colonnes + tailles pour tenir sans scroll sur tablette. */
export function getShoppingGridLayout(count: number): ShoppingGridLayout {
  if (count <= 4) {
    return {
      cols: 2,
      rows: Math.ceil(count / 2),
      emojiClass: "text-5xl sm:text-6xl",
      labelClass: "text-lg sm:text-xl md:text-2xl",
      gapClass: "gap-2 sm:gap-3",
      paddingClass: "p-2 sm:p-3",
    };
  }
  if (count <= 6) {
    return {
      cols: 3,
      rows: Math.ceil(count / 3),
      emojiClass: "text-4xl sm:text-5xl",
      labelClass: "text-base sm:text-lg md:text-xl",
      gapClass: "gap-2",
      paddingClass: "p-2",
    };
  }
  if (count <= 9) {
    return {
      cols: 3,
      rows: Math.ceil(count / 3),
      emojiClass: "text-3xl sm:text-4xl",
      labelClass: "text-sm sm:text-base md:text-lg",
      gapClass: "gap-1.5 sm:gap-2",
      paddingClass: "p-1.5 sm:p-2",
    };
  }
  if (count <= 12) {
    return {
      cols: 4,
      rows: Math.ceil(count / 4),
      emojiClass: "text-2xl sm:text-3xl",
      labelClass: "text-sm sm:text-base",
      gapClass: "gap-1.5",
      paddingClass: "p-1.5",
    };
  }
  if (count <= 16) {
    return {
      cols: 4,
      rows: Math.ceil(count / 4),
      emojiClass: "text-xl sm:text-2xl",
      labelClass: "text-xs sm:text-sm",
      gapClass: "gap-1",
      paddingClass: "p-1",
    };
  }
  if (count <= 20) {
    return {
      cols: 5,
      rows: Math.ceil(count / 5),
      emojiClass: "text-lg sm:text-xl",
      labelClass: "text-xs sm:text-sm",
      gapClass: "gap-1",
      paddingClass: "p-1",
    };
  }

  const cols = 6;
  return {
    cols,
    rows: Math.ceil(count / cols),
    emojiClass: "text-base sm:text-lg",
    labelClass: "text-[10px] sm:text-xs",
    gapClass: "gap-1",
    paddingClass: "p-0.5 sm:p-1",
  };
}
