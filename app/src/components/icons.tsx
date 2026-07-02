interface IconProps {
  size?: number;
}

const shared = {
  viewBox: '0 0 16 16',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.3,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function IconSave({ size = 14 }: IconProps) {
  return (
    <svg {...shared} width={size} height={size}>
      <path d="M2 2.8c0-.4.4-.8.8-.8h8.7L14 4.9v8.3c0 .4-.4.8-.8.8H2.8c-.4 0-.8-.4-.8-.8z" />
      <rect x="4.4" y="2" width="5.2" height="3.6" />
      <rect x="3.8" y="9" width="8.4" height="4" />
    </svg>
  );
}

export function IconCancel({ size = 14 }: IconProps) {
  return (
    <svg {...shared} width={size} height={size}>
      <path d="M4 4.2v3.4h3.4" />
      <path d="M4.6 7.8A5 5 0 1 0 5.8 4" />
    </svg>
  );
}

export function IconDelete({ size = 14 }: IconProps) {
  return (
    <svg {...shared} width={size} height={size}>
      <path d="M3 4.2h10" />
      <path d="M5.6 4.2V2.9c0-.4.3-.7.7-.7h3.4c.4 0 .7.3.7.7v1.3" />
      <path d="M4.2 4.2l.6 8.6c0 .5.4.9.9.9h4.6c.5 0 .9-.4.9-.9l.6-8.6" />
      <path d="M6.6 6.6v4.8M9.4 6.6v4.8" />
    </svg>
  );
}

export function IconNewFile({ size = 14 }: IconProps) {
  return (
    <svg {...shared} width={size} height={size}>
      <path d="M4.2 2h5l2.8 2.8v9.2H4.2z" />
      <path d="M9.2 2v2.8H12" />
      <path d="M8 7.6v4M6 9.6h4" />
    </svg>
  );
}
