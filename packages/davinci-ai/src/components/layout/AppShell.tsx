import type { ReactNode } from 'react';
import { AppBackground } from '../../foundations/AppBackground';
import { cn } from '../../utils/cn';

export interface AppShellProps {
  header?: ReactNode;
  /** Left rail (`SideNav`). */
  sidebar?: ReactNode;
  /** Floating element anchored at the bottom (e.g. the Ask LEO `Composer`). */
  dock?: ReactNode;
  /** Draw the ambient Graphite light. Default true. */
  ambient?: boolean;
  /** Max content width in px (reference: 1560). */
  maxWidth?: number;
  /** Text of the "skip to content" link. */
  skipLabel?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Page frame: ambient background, header, optional sidebar and a `<main>` landmark with a skip link.
 * Reserves space under the content for a floating dock.
 */
export function AppShell({ header, sidebar, dock, ambient = true, maxWidth = 1560, skipLabel = 'Skip to main content', children, className }: AppShellProps) {
  return (
    <div className={cn('dv-shell', className)}>
      {ambient && <AppBackground />}
      <a href="#dv-main" className="dv-skip">{skipLabel}</a>
      <div className="dv-shell__frame" style={{ maxWidth }}>
        {header}
        <div className="dv-shell__body" data-sidebar={sidebar ? '' : undefined}>
          {sidebar}
          <main id="dv-main" tabIndex={-1} className="dv-shell__main" data-dock={dock ? '' : undefined}>{children}</main>
        </div>
      </div>
      {dock}
    </div>
  );
}
