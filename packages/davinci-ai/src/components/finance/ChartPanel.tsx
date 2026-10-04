import type { ReactNode } from 'react';
import { Card, type CardProps } from '../layout/Card';
import { cn } from '../../utils/cn';

export interface ChartPanelProps extends Omit<CardProps, 'children'> {
  /** Range selector (`TimeRangeSelector`) shown top-right. */
  rangeSelector?: ReactNode;
  /** Optional legend row between header and chart. */
  legend?: ReactNode;
  /** Key figures under the chart (e.g. open/high/low/volume). */
  footer?: ReactNode;
  /** The chart. */
  children: ReactNode;
}

/** Shell for a chart: header (title, range selector), legend slot, chart slot, footer stats. */
export function ChartPanel({ rangeSelector, legend, footer, children, title, actions, className, ...rest }: ChartPanelProps) {
  return (
    <Card {...rest} title={title} actions={<>{actions}{rangeSelector}</>} className={cn('dv-chartpanel', className)}>
      {legend && <div className="dv-chartpanel__legend">{legend}</div>}
      <div className="dv-chartpanel__chart">{children}</div>
      {footer && <div className="dv-chartpanel__foot">{footer}</div>}
    </Card>
  );
}
