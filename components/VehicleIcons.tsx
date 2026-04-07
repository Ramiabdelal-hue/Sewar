export const MotorcycleIcon = ({ className = "w-20 h-20" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="45" r="12" stroke="#003399" strokeWidth="3" fill="#ddeeff"/>
    <circle cx="80" cy="45" r="12" stroke="#003399" strokeWidth="3" fill="#ddeeff"/>
    <circle cx="20" cy="45" r="5" fill="#003399"/>
    <circle cx="80" cy="45" r="5" fill="#003399"/>
    <path d="M20 45 L35 25 L55 25 L65 35 L80 35" stroke="#003399" strokeWidth="3" strokeLinecap="round"/>
    <path d="M55 25 L60 15 L70 15 L72 25" stroke="#003399" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M35 25 L40 18 L52 18" stroke="#003399" strokeWidth="2" strokeLinecap="round"/>
    <path d="M65 35 L75 30 L80 35" stroke="#003399" strokeWidth="2" strokeLinecap="round"/>
    <rect x="60" y="13" width="12" height="5" rx="2" fill="#3399ff" opacity="0.6"/>
  </svg>
);

export const CarIcon = ({ className = "w-20 h-20" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="30" width="100" height="22" rx="4" fill="#ddeeff" stroke="#003399" strokeWidth="2.5"/>
    <path d="M25 30 L35 12 L85 12 L95 30" fill="#b8d4ff" stroke="#003399" strokeWidth="2.5" strokeLinejoin="round"/>
    <circle cx="30" cy="52" r="9" fill="#ddeeff" stroke="#003399" strokeWidth="2.5"/>
    <circle cx="30" cy="52" r="4" fill="#003399"/>
    <circle cx="90" cy="52" r="9" fill="#ddeeff" stroke="#003399" strokeWidth="2.5"/>
    <circle cx="90" cy="52" r="4" fill="#003399"/>
    <rect x="38" y="15" width="18" height="13" rx="2" fill="#7ab8ff" opacity="0.7"/>
    <rect x="62" y="15" width="18" height="13" rx="2" fill="#7ab8ff" opacity="0.7"/>
    <rect x="10" y="36" width="12" height="6" rx="2" fill="#ffdd44" opacity="0.9"/>
    <rect x="98" y="36" width="12" height="6" rx="2" fill="#ff4444" opacity="0.9"/>
  </svg>
);

export const TruckIcon = ({ className = "w-20 h-20" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 140 65" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="20" width="80" height="35" rx="3" fill="#ddeeff" stroke="#003399" strokeWidth="2.5"/>
    <path d="M85 28 L105 28 L118 40 L118 55 L85 55 Z" fill="#b8d4ff" stroke="#003399" strokeWidth="2.5" strokeLinejoin="round"/>
    <rect x="88" y="30" width="18" height="14" rx="2" fill="#7ab8ff" opacity="0.7"/>
    <circle cx="25" cy="55" r="9" fill="#ddeeff" stroke="#003399" strokeWidth="2.5"/>
    <circle cx="25" cy="55" r="4" fill="#003399"/>
    <circle cx="65" cy="55" r="9" fill="#ddeeff" stroke="#003399" strokeWidth="2.5"/>
    <circle cx="65" cy="55" r="4" fill="#003399"/>
    <circle cx="105" cy="55" r="9" fill="#ddeeff" stroke="#003399" strokeWidth="2.5"/>
    <circle cx="105" cy="55" r="4" fill="#003399"/>
    <rect x="5" y="26" width="14" height="8" rx="2" fill="#ffdd44" opacity="0.9"/>
    <rect x="118" y="40" width="10" height="7" rx="2" fill="#ff4444" opacity="0.9"/>
    <line x1="85" y1="20" x2="85" y2="55" stroke="#003399" strokeWidth="2"/>
  </svg>
);
