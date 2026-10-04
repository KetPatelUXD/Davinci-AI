import { useId, type SVGProps } from 'react';
import { cn } from '../utils/cn';

export interface DaVinciLogoProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  /** `mark` = symbol only; `lockup` = symbol + "DaVinci.AI" wordmark. */
  variant?: 'mark' | 'lockup';
  /** Height in px (width follows the aspect ratio). */
  size?: number;
  /** Accessible name; the mark is announced as an image. Set `decorative` when adjacent text already says "DaVinci.AI". */
  title?: string;
  decorative?: boolean;
}

/** DaVinci.AI mark: a rounded square and circle sharing a base (Vitruvian proportion) with a four-point AI spark. */
export function DaVinciLogo({ variant = 'mark', size = 32, title = 'DaVinci.AI', decorative, className, ...rest }: DaVinciLogoProps) {
  const id = useId().replace(/:/g, '');
  const w = variant === 'lockup' ? (size * 760) / 240 : size;
  return (
    <svg
      className={cn('dv-logo', className)}
      viewBox={variant === 'lockup' ? '0 0 760 240' : '0 0 240 240'}
      width={w}
      height={size}
      {...(decorative ? { 'aria-hidden': true } : { role: 'img', 'aria-label': title })}
      {...rest}
    >
      <defs>
        <linearGradient id={`${id}-g`} x1="29" y1="30" x2="211" y2="212" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3CCBF4" />
          <stop offset=".5" stopColor="#A78BFA" />
          <stop offset="1" stopColor="#FFA24C" />
        </linearGradient>
        <linearGradient id={`${id}-t`} x1="560" y1="0" x2="720" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#A78BFA" />
          <stop offset="1" stopColor="#FFA24C" />
        </linearGradient>
      </defs>
      <g fill="none" stroke={`url(#${id}-g)`} strokeWidth="7" strokeLinejoin="round">
        <circle cx="120" cy="121" r="91" />
        <rect x="45" y="62" width="150" height="150" rx="7" />
      </g>
      <path d="M120 81Q125.5 115.5 160 121Q125.5 126.5 120 161Q114.5 126.5 80 121Q114.5 115.5 120 81Z" fill={`url(#${id}-g)`} />
      {variant === 'lockup' && (
        <text x="248" y="152" fontFamily="Inter, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif" fontSize="96" fontWeight="600" letterSpacing="-2.5" fill="currentColor">
          DaVinci<tspan fill={`url(#${id}-t)`}>.AI</tspan>
        </text>
      )}
    </svg>
  );
}

/** LEO mark: speech bubble with the AI spark, used by the Ask LEO composer. */
export function LeoMark({ size = 24, className, ...rest }: { size?: number } & Omit<SVGProps<SVGSVGElement>, 'children'>) {
  const id = useId().replace(/:/g, '');
  return (
    <svg className={cn('dv-logo', className)} viewBox="0 0 240 240" width={size} height={size} aria-hidden="true" {...rest}>
      <defs>
        <linearGradient id={`${id}-l`} x1="0" y1="0" x2="240" y2="240" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3CCBF4" />
          <stop offset=".5" stopColor="#A78BFA" />
          <stop offset="1" stopColor="#FFA24C" />
        </linearGradient>
      </defs>
      <path d="M72 42H168Q198 42 198 72V156Q198 186 168 186H112L66 222 76 186H72Q42 186 42 156V72Q42 42 72 42Z" fill="none" stroke={`url(#${id}-l)`} strokeWidth="14" strokeLinejoin="round" />
      <path d="M120 78C124 104 130 110 154 114 130 118 124 124 120 150 116 124 110 118 86 114 110 110 116 104 120 78Z" fill={`url(#${id}-l)`} />
    </svg>
  );
}
