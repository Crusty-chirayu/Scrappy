
export interface PriceTagProps {
  pricePaise: number;
  originalPricePaise?: number;
  currency?: string;
  isLowestPrice?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function formatCurrencyPaise(paise: number, currency = "INR"): string {
  const amount = paise / 100;
  if (currency === "INR") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

const sizeClasses = {
  sm: { price: "text-sm", orig: "text-xs", badge: "text-[10px]" },
  md: { price: "text-base font-semibold", orig: "text-xs", badge: "text-xs" },
  lg: { price: "text-2xl font-bold tracking-tight", orig: "text-sm", badge: "text-xs" },
};

export function PriceTag({
  pricePaise,
  originalPricePaise,
  currency = "INR",
  isLowestPrice = false,
  size = "md",
  className = "",
}: PriceTagProps) {
  const formattedPrice = formatCurrencyPaise(pricePaise, currency);
  const formattedOriginal = originalPricePaise ? formatCurrencyPaise(originalPricePaise, currency) : null;

  const hasDiscount = originalPricePaise && originalPricePaise > pricePaise;
  const discountPercent = hasDiscount
    ? Math.round(((originalPricePaise - pricePaise) / originalPricePaise) * 100)
    : 0;

  const sizes = sizeClasses[size];

  return (
    <div className={`inline-flex items-baseline gap-2 font-mono tabular-nums ${className}`}>
      <span className={`text-[#D6DBE3] ${sizes.price}`}>{formattedPrice}</span>

      {formattedOriginal && hasDiscount && (
        <span className={`text-[#5B677C] line-through ${sizes.orig}`} aria-label={`Original price ${formattedOriginal}`}>
          {formattedOriginal}
        </span>
      )}

      {hasDiscount && discountPercent > 0 && (
        <span
          className={`inline-flex items-center px-1.5 py-0.5 rounded-[2px] bg-[#2FBF8A]/15 text-[#2FBF8A] font-semibold font-sans ${sizes.badge}`}
        >
          -{discountPercent}%
        </span>
      )}

      {isLowestPrice && (
        <span
          className={`inline-flex items-center px-1.5 py-0.5 rounded-[2px] bg-[#C6F135]/15 text-[#C6F135] font-semibold font-sans tracking-wide uppercase ${sizes.badge}`}
        >
          Lowest
        </span>
      )}
    </div>
  );
}
