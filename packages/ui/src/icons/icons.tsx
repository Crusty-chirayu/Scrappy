"use client";

import React from "react";

export type IconSize = 16 | 20 | 24 | 32;

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: IconSize;
  className?: string;
  title?: string;
}

export type IconComponent = React.FC<IconProps>;

function createIcon(
  displayName: string,
  paths: React.ReactNode,
  defaultViewBox = "0 0 24 24",
): IconComponent {
  const Icon: IconComponent = ({
    size = 24,
    className = "",
    title,
    ...props
  }) => (
    <svg
      width={size}
      height={size}
      viewBox={defaultViewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : "presentation"}
      className={`inline-block shrink-0 ${className}`}
      {...props}
    >
      {title && <title>{title}</title>}
      {paths}
    </svg>
  );
  Icon.displayName = displayName;
  return Icon;
}

export const CompareIcon = createIcon(
  "CompareIcon",
  <>
    <path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4" />
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <path d="M12 17V7" />
    <path d="m9 10 3-3 3 3" />
    <path d="m15 14-3 3-3-3" />
  </>,
);

export const WatchlistIcon = createIcon(
  "WatchlistIcon",
  <>
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="10" y1="10" x2="14" y2="10" />
  </>,
);

export const AlertIcon = createIcon(
  "AlertIcon",
  <>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    <circle cx="18" cy="5" r="2.5" fill="var(--color-accent)" stroke="none" />
  </>,
);

export const BellIcon = createIcon(
  "BellIcon",
  <>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </>,
);

export const PriceDropIcon = createIcon(
  "PriceDropIcon",
  <>
    <path d="m3 7 6 6 4-4 8 8" />
    <path d="M21 10v7h-7" />
  </>,
);

export const PriceRiseIcon = createIcon(
  "PriceRiseIcon",
  <>
    <path d="m3 17 6-6 4 4 8-8" />
    <path d="M14 7h7v7" />
  </>,
);

export const ExtractIcon = createIcon(
  "ExtractIcon",
  <>
    <path d="M7 4H4v3" />
    <path d="M17 4h3v3" />
    <path d="M20 17v3h-3" />
    <path d="M4 17v3h3" />
    <circle cx="12" cy="12" r="3" />
    <line x1="12" y1="3" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="21" />
  </>,
);

export const VerifiedIcon = createIcon(
  "VerifiedIcon",
  <>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </>,
);

export const FixtureIcon = createIcon(
  "FixtureIcon",
  <>
    <path d="M9 3h6" />
    <path d="M10 3v5l-6 10.5A2 2 0 0 0 5.7 21h12.6a2 2 0 0 0 1.7-2.5L14 8V3" />
    <path d="M8.5 14h7" />
  </>,
);

export const StaleIcon = createIcon(
  "StaleIcon",
  <>
    <circle cx="12" cy="12" r="9" />
    <polyline points="12 7 12 12 15 15" strokeDasharray="2 2" />
    <path d="M4 12a8 8 0 0 1 2-5" />
  </>,
);

export const SearchIcon = createIcon(
  "SearchIcon",
  <>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </>,
);

export const FilterIcon = createIcon(
  "FilterIcon",
  <>
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="7" y1="12" x2="17" y2="12" />
    <line x1="10" y1="18" x2="14" y2="18" />
  </>,
);

export const SortIcon = createIcon(
  "SortIcon",
  <>
    <path d="m7 15 4 4 4-4" />
    <path d="m17 9-4-4-4 4" />
  </>,
);

export const StoreIcon = createIcon(
  "StoreIcon",
  <>
    <path d="m2 7 2-4h16l2 4" />
    <path d="M4 7v13a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V7" />
    <path d="M9 21v-7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v7" />
    <path d="M2 7a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" />
  </>,
);

export const HistoryIcon = createIcon(
  "HistoryIcon",
  <>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l3 3" />
  </>,
);

export const ExportIcon = createIcon(
  "ExportIcon",
  <>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </>,
);

export const SettingsIcon = createIcon(
  "SettingsIcon",
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </>,
);

export const BillingIcon = createIcon(
  "BillingIcon",
  <>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
    <line x1="6" y1="15" x2="10" y2="15" />
  </>,
);

export const UserIcon = createIcon(
  "UserIcon",
  <>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </>,
);

export const ShieldIcon = createIcon(
  "ShieldIcon",
  <>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </>,
);

export const CheckIcon = createIcon(
  "CheckIcon",
  <>
    <polyline points="20 6 9 17 4 12" />
  </>,
);

export const CloseIcon = createIcon(
  "CloseIcon",
  <>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </>,
);

export const ChevronUpIcon = createIcon(
  "ChevronUpIcon",
  <>
    <polyline points="18 15 12 9 6 15" />
  </>,
);

export const ChevronDownIcon = createIcon(
  "ChevronDownIcon",
  <>
    <polyline points="6 9 12 15 18 9" />
  </>,
);

export const ChevronLeftIcon = createIcon(
  "ChevronLeftIcon",
  <>
    <polyline points="15 18 9 12 15 6" />
  </>,
);

export const ChevronRightIcon = createIcon(
  "ChevronRightIcon",
  <>
    <polyline points="9 18 15 12 9 6" />
  </>,
);

export const ExternalLinkIcon = createIcon(
  "ExternalLinkIcon",
  <>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </>,
);

export const CopyIcon = createIcon(
  "CopyIcon",
  <>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </>,
);

export const TrashIcon = createIcon(
  "TrashIcon",
  <>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </>,
);

export const UndoIcon = createIcon(
  "UndoIcon",
  <>
    <path d="M3 7v6h6" />
    <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
  </>,
);

export const PlusIcon = createIcon(
  "PlusIcon",
  <>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </>,
);

export const MinusIcon = createIcon(
  "MinusIcon",
  <>
    <line x1="5" y1="12" x2="19" y2="12" />
  </>,
);

export const MenuIcon = createIcon(
  "MenuIcon",
  <>
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </>,
);

export const KeyboardIcon = createIcon(
  "KeyboardIcon",
  <>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <line x1="6" y1="8" x2="6.01" y2="8" />
    <line x1="10" y1="8" x2="10.01" y2="8" />
    <line x1="14" y1="8" x2="14.01" y2="8" />
    <line x1="18" y1="8" x2="18.01" y2="8" />
    <line x1="6" y1="12" x2="6.01" y2="12" />
    <line x1="18" y1="12" x2="18.01" y2="12" />
    <line x1="7" y1="16" x2="17" y2="16" />
  </>,
);

export const SunIcon = createIcon(
  "SunIcon",
  <>
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </>,
);

export const MoonIcon = createIcon(
  "MoonIcon",
  <>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </>,
);

export const LockIcon = createIcon(
  "LockIcon",
  <>
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </>,
);

export const KeyIcon = createIcon(
  "KeyIcon",
  <>
    <path d="m21 2-2 2m-1.5 1.5L14 9a5 5 0 1 0 3 3l3.5-3.5m0 0 2.5 2.5m-2.5-2.5 2-2" />
    <circle cx="7.5" cy="16.5" r="1.5" />
  </>,
);

export const MailIcon = createIcon(
  "MailIcon",
  <>
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </>,
);

export const CalendarIcon = createIcon(
  "CalendarIcon",
  <>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </>,
);

export const InfoIcon = createIcon(
  "InfoIcon",
  <>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </>,
);

export const WarningIcon = createIcon(
  "WarningIcon",
  <>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </>,
);

export const ErrorIcon = createIcon(
  "ErrorIcon",
  <>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </>,
);

export const ALL_ICONS = {
  compare: CompareIcon,
  watchlist: WatchlistIcon,
  alert: AlertIcon,
  bell: BellIcon,
  "price-drop": PriceDropIcon,
  "price-rise": PriceRiseIcon,
  extract: ExtractIcon,
  verified: VerifiedIcon,
  fixture: FixtureIcon,
  stale: StaleIcon,
  search: SearchIcon,
  filter: FilterIcon,
  sort: SortIcon,
  store: StoreIcon,
  history: HistoryIcon,
  export: ExportIcon,
  settings: SettingsIcon,
  billing: BillingIcon,
  user: UserIcon,
  shield: ShieldIcon,
  check: CheckIcon,
  close: CloseIcon,
  "chevron-up": ChevronUpIcon,
  "chevron-down": ChevronDownIcon,
  "chevron-left": ChevronLeftIcon,
  "chevron-right": ChevronRightIcon,
  "external-link": ExternalLinkIcon,
  copy: CopyIcon,
  trash: TrashIcon,
  undo: UndoIcon,
  plus: PlusIcon,
  minus: MinusIcon,
  menu: MenuIcon,
  keyboard: KeyboardIcon,
  sun: SunIcon,
  moon: MoonIcon,
  lock: LockIcon,
  key: KeyIcon,
  mail: MailIcon,
  calendar: CalendarIcon,
  info: InfoIcon,
  warning: WarningIcon,
  error: ErrorIcon,
} as const;

export type IconName = keyof typeof ALL_ICONS;
