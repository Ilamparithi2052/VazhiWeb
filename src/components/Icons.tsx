import type { JSX } from 'react';

type P = { className?: string };
const S = ({ className, children }: P & { children: React.ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const icons: Record<string, (p: P) => JSX.Element> = {
  temple: (p) => (
    <S {...p}>
      <path d="M12 3 L15 7 H9 Z" />
      <path d="M8.5 10 H15.5 L14 7 H10 Z" />
      <path d="M7 13 H17 L15.5 10 H8.5 Z" />
      <path d="M5.5 16 H18.5 L17 13 H7 Z" />
      <path d="M4 21 H20 L18.5 16 H5.5 Z" />
    </S>
  ),
  fort: (p) => (
    <S {...p}>
      <path d="M4 21 V9 h2 V7 h2 v2 h2 V7 h2 v2 h2 V7 h2 v2 h2 V7 h2 v2 h2 v12" />
      <path d="M4 21 H20" />
      <path d="M10 21 v-4 a2 2 0 0 1 4 0 v4" />
    </S>
  ),
  cave: (p) => (
    <S {...p}>
      <path d="M3 21 C3 11 7 5 12 5 C17 5 21 11 21 21" />
      <path d="M8.5 21 C8.5 15 10 12 12 12 C14 12 15.5 15 15.5 21" />
      <path d="M3 21 H21" />
    </S>
  ),
  city: (p) => (
    <S {...p}>
      <path d="M4 21 V10 l4-2.5 V21" />
      <path d="M8 21 V5 l5-2 v18" />
      <path d="M13 21 V9 l4 2 v10" />
      <path d="M17 21 h4 v-9 l-4 1.5" />
      <path d="M2.5 21 H21.5" />
    </S>
  ),
  sculpture: (p) => (
    <S {...p}>
      <circle cx="12" cy="7" r="3" />
      <path d="M9.5 10 C8 12 8 15 9 17" />
      <path d="M14.5 10 C16 12 16 15 15 17" />
      <path d="M9 17 h6" />
      <path d="M7 21 h10" />
      <path d="M12 17 v4" />
    </S>
  ),
  inscription: (p) => (
    <S {...p}>
      <rect x="5" y="3.5" width="14" height="17" rx="1.5" />
      <path d="M8.5 8 h7" />
      <path d="M8.5 11.5 h7" />
      <path d="M8.5 15 h4.5" />
    </S>
  ),
  sacred: (p) => (
    <S {...p}>
      <path d="M12 3.5 C13.8 6.5 16 7.6 16 10.5 a4 4 0 0 1-8 0 C8 7.6 10.2 6.5 12 3.5 Z" />
      <path d="M12 14.5 V18" />
      <path d="M8.5 21 h7" />
      <path d="M9.8 18 h4.4" />
    </S>
  ),
  unesco: (p) => (
    <S {...p}>
      <path d="M4 9 L12 4 L20 9" />
      <path d="M5 9.5 H19" />
      <path d="M7 9.5 V16" />
      <path d="M11 9.5 V16" />
      <path d="M15 9.5 V16" />
      <path d="M5 16 H19" />
      <path d="M4 19.5 H20" />
    </S>
  ),
  history: (p) => (
    <S {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5 V12 l3.5 2" />
    </S>
  ),
  architecture: (p) => (
    <S {...p}>
      <path d="M4 20 V8.5 L12 4 l8 4.5 V20" />
      <path d="M2.5 20 H21.5" />
      <path d="M9 20 v-5.5 a3 3 0 0 1 6 0 V20" />
    </S>
  ),
  art: (p) => (
    <S {...p}>
      <path d="M7 21 V9" />
      <path d="M17 21 V9" />
      <path d="M7 9 C7 5.5 9.3 3.5 12 3.5 C14.7 3.5 17 5.5 17 9" />
      <path d="M10 21 v-6" />
      <path d="M14 21 v-6" />
      <path d="M10 15 h4" />
    </S>
  ),
  food: (p) => (
    <S {...p}>
      <path d="M6 3.5 v7 a2.5 2.5 0 0 0 5 0 v-7" />
      <path d="M8.5 3.5 V8" />
      <path d="M8.5 13.5 V21" />
      <path d="M16.5 3.5 C15 6 14.5 9 15.5 11.5 C16 12.6 16.5 13 16.5 13 V21" />
      <path d="M19 3.5 C18 6 17.8 9 18.6 11.5" />
    </S>
  ),
  nature: (p) => (
    <S {...p}>
      <path d="M12 21 C12 13 12 7 12 4" />
      <path d="M12 12 C12 9 9.5 7 6.5 7 C6.5 10.5 9 12.5 12 12 Z" />
      <path d="M12 9 C12 6.5 14.5 4.8 17.5 4.8 C17.5 8 15 9.5 12 9 Z" />
      <path d="M12 16 C12 13.8 14.3 12.2 17 12.2 C17 15.2 14.6 16.5 12 16 Z" />
    </S>
  ),
  religion: (p) => (
    <S {...p}>
      <path d="M12 3 v6.5" />
      <path d="M8.5 6.5 h7" />
      <circle cx="12" cy="14.5" r="5.5" />
      <path d="M12 12 v5" />
    </S>
  ),
  fest: (p) => (
    <S {...p}>
      <path d="M5 21 C5 14 8 9 12 9 C16 9 19 14 19 21" />
      <path d="M12 9 V5.5" />
      <path d="M10 3.5 h4" />
      <path d="M8.5 21 C8.5 16.5 10 13.5 12 13.5 C14 13.5 15.5 16.5 15.5 21" />
    </S>
  ),
  literature: (p) => (
    <S {...p}>
      <path d="M12 6.5 C10 4.8 7 4.5 4 5.5 V18 C7 17 10 17.3 12 19 C14 17.3 17 17 20 18 V5.5 C17 4.5 14 4.8 12 6.5 Z" />
      <path d="M12 6.5 V19" />
    </S>
  ),
  archaeology: (p) => (
    <S {...p}>
      <path d="M4 20 h6" />
      <path d="M7 20 v-3" />
      <path d="M5.5 17 h3" />
      <path d="M13 4 l7 7" />
      <path d="M13 4 l-1.5 4.5 L16 10 Z" />
      <path d="M15.5 6.5 L20 11" />
    </S>
  ),
};

export const ui = {
  search: (p: P) => (
    <S {...p}><circle cx="11" cy="11" r="6.5" /><path d="M20.5 20.5 L16 16" /></S>
  ),
  bookmark: (p: P) => (
    <S {...p}><path d="M6.5 4 h11 v16.5 L12 16.8 6.5 20.5 Z" /></S>
  ),
  pin: (p: P) => (
    <S {...p}>
      <path d="M12 21 C12 21 5.5 14.6 5.5 9.8 a6.5 6.5 0 0 1 13 0 C18.5 14.6 12 21 12 21 Z" />
      <circle cx="12" cy="9.8" r="2.2" />
    </S>
  ),
  arrow: (p: P) => (
    <S {...p}><path d="M4 12 h15" /><path d="M13.5 6 L19.5 12 L13.5 18" /></S>
  ),
  arrowUpRight: (p: P) => (
    <S {...p}><path d="M6.5 17.5 L17.5 6.5" /><path d="M8 6.5 h9.5 V16" /></S>
  ),
  chevronL: (p: P) => (
    <S {...p}><path d="M14.5 5.5 L8 12 L14.5 18.5" /></S>
  ),
  chevronR: (p: P) => (
    <S {...p}><path d="M9.5 5.5 L16 12 L9.5 18.5" /></S>
  ),
  mail: (p: P) => (
    <S {...p}><rect x="3.5" y="5.5" width="17" height="13" rx="1.5" /><path d="M4 7 l8 6 8-6" /></S>
  ),
  globe: (p: P) => (
    <S {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12 h17" />
      <path d="M12 3.5 C14.5 6 15.8 8.8 15.8 12 C15.8 15.2 14.5 18 12 20.5 C9.5 18 8.2 15.2 8.2 12 C8.2 8.8 9.5 6 12 3.5 Z" />
    </S>
  ),
  sun: (p: P) => (
    <S {...p}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5 v2.5 M12 19 v2.5 M4.3 4.3 l1.8 1.8 M17.9 17.9 l1.8 1.8 M2.5 12 h2.5 M19 12 h2.5 M4.3 19.7 l1.8-1.8 M17.9 6.1 l1.8-1.8" />
    </S>
  ),
  moon: (p: P) => (
    <S {...p}>
      <path d="M20.5 14.5 A8.5 8.5 0 0 1 9.5 3.5 a8.5 8.5 0 1 0 11 11 Z" />
    </S>
  ),
  user: (p: P) => (
    <S {...p}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20.5 C5.5 16.5 8.5 14.5 12 14.5 C15.5 14.5 18.5 16.5 19.5 20.5" />
    </S>
  ),
  chevronD: (p: P) => (
    <S {...p}><path d="M5.5 9.5 L12 16 L18.5 9.5" /></S>
  ),
  close: (p: P) => (
    <S {...p}><path d="M6 6 L18 18 M18 6 L6 18" /></S>
  ),
  layers: (p: P) => (
    <S {...p}>
      <path d="M12 3.5 L21 8.5 L12 13.5 L3 8.5 Z" />
      <path d="M4.5 12.5 L12 16.7 L19.5 12.5" />
      <path d="M4.5 16 L12 20.2 L19.5 16" />
    </S>
  ),
};
