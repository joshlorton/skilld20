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

export function IconWand({ size = 16 }: IconProps) {
  return (
    <svg {...shared} width={size} height={size}>
      <path d="M3 13l7-7" />
      <path d="M12 1.5v3M10.5 3h3" />
      <path d="M13.8 6v1.6M13 6.8h1.6" />
    </svg>
  );
}

export function IconIngot({ size = 16 }: IconProps) {
  return (
    <svg {...shared} width={size} height={size}>
      <rect x="2.3" y="5" width="11.4" height="6" rx="0.6" />
      <path d="M2.3 8h11.4" />
    </svg>
  );
}

export function IconBolt({ size = 16 }: IconProps) {
  return (
    <svg {...shared} width={size} height={size}>
      <path d="M9 1.5L4.5 9h3L6.5 14.5l6-8.5h-3z" />
    </svg>
  );
}

export function IconBrain({ size = 16 }: IconProps) {
  return (
    <svg {...shared} width={size} height={size}>
      <path d="M8 3c-.6-.9-2.4-.9-2.9.2-1 0-1.8.8-1.7 1.8-.8.4-1.1 1.5-.6 2.2-.5.7-.2 1.8.6 2.2C3.3 10.4 4 11.2 5 11.2c.2.7 1 1.1 1.7.9" />
      <path d="M8 3c.6-.9 2.4-.9 2.9.2 1 0 1.8.8 1.7 1.8.8.4 1.1 1.5.6 2.2.5.7.2 1.8-.6 2.2-.1 1-.8 1.8-1.8 1.8-.2.7-1 1.1-1.7.9" />
      <path d="M8 3v9.1" />
    </svg>
  );
}

export function IconHourglass({ size = 16 }: IconProps) {
  return (
    <svg {...shared} width={size} height={size}>
      <path d="M4 1.5h8M4 14.5h8M4 1.5l4 6.5-4 6.5M12 1.5l-4 6.5 4 6.5" />
    </svg>
  );
}

export function IconHammer({ size = 16 }: IconProps) {
  return (
    <svg {...shared} width={size} height={size}>
      <rect x="3.5" y="2" width="9" height="3.4" rx="0.5" />
      <path d="M8 5.4v8.6" />
    </svg>
  );
}

export function IconBook({ size = 16 }: IconProps) {
  return (
    <svg {...shared} width={size} height={size}>
      <path d="M8 4.2C6.6 3.3 4.6 3 2.5 3.4v9c2.1-.4 4.1-.1 5.5.8" />
      <path d="M8 4.2c1.4-.9 3.4-1.2 5.5-.8v9c-2.1-.4-4.1-.1-5.5.8" />
    </svg>
  );
}
