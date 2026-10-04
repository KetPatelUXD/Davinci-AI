'use client';
import { Slider as RACSlider, SliderTrack, SliderThumb, SliderOutput, Label, type SliderProps as RACSliderProps } from 'react-aria-components';
import { cn } from '../../utils/cn';

interface BaseSliderProps<T> extends Omit<RACSliderProps<T>, 'className' | 'children'> {
  /** Visible label (required unless `aria-label`). */
  label?: string;
  /** Hide the numeric output. */
  hideOutput?: boolean;
  className?: string;
}

export type SliderProps = BaseSliderProps<number>;

/** Single-value slider. Arrow keys ±step, PageUp/PageDown ±10 steps, Home/End min/max. */
export function Slider({ label, hideOutput, className, ...rest }: SliderProps) {
  return (
    <RACSlider {...rest} className={cn('dv-slider', className)}>
      <div className="dv-slider__head">
        {label && <Label className="dv-field__label">{label}</Label>}
        {!hideOutput && <SliderOutput className="dv-slider__out dv:tabular-nums" />}
      </div>
      <SliderTrack className="dv-slider__track">
        {({ state }) => (
          <>
            <div className="dv-slider__fill" style={{ width: `${state.getThumbPercent(0) * 100}%` }} />
            <SliderThumb className="dv-slider__thumb" />
          </>
        )}
      </SliderTrack>
    </RACSlider>
  );
}

export type RangeSliderProps = BaseSliderProps<number[]> & { thumbLabels?: [string, string] };

/** Two-thumb range slider (e.g. price band). Each thumb has its own accessible name. */
export function RangeSlider({ label, hideOutput, thumbLabels = ['Minimum', 'Maximum'], className, ...rest }: RangeSliderProps) {
  return (
    <RACSlider {...rest} className={cn('dv-slider', className)}>
      <div className="dv-slider__head">
        {label && <Label className="dv-field__label">{label}</Label>}
        {!hideOutput && <SliderOutput className="dv-slider__out dv:tabular-nums">{({ state }) => state.values.map((_, i) => state.getThumbValueLabel(i)).join(' – ')}</SliderOutput>}
      </div>
      <SliderTrack className="dv-slider__track">
        {({ state }) => (
          <>
            <div className="dv-slider__fill" style={{ left: `${state.getThumbPercent(0) * 100}%`, width: `${(state.getThumbPercent(1) - state.getThumbPercent(0)) * 100}%` }} />
            <SliderThumb index={0} aria-label={thumbLabels[0]} className="dv-slider__thumb" />
            <SliderThumb index={1} aria-label={thumbLabels[1]} className="dv-slider__thumb" />
          </>
        )}
      </SliderTrack>
    </RACSlider>
  );
}
