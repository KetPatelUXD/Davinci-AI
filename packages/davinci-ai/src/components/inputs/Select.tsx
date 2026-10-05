'use client';
import { forwardRef } from 'react';
import {
  Select as RACSelect, SelectValue, Button as RACButton, ListBox, ListBoxItem, Tag, TagGroup, TagList, ComboBox as RACComboBox, Input, Group, Text,
  type SelectProps as RACSelectProps, type ComboBoxProps as RACComboBoxProps, type Key,
} from 'react-aria-components';
import { Icon, renderIcon, type IconRef } from '../../foundations/Icon';
import { cn } from '../../utils/cn';
import { ThemedPopover } from '../overlays/Popover';
import { FieldFoot, FieldLabel, type FieldProps } from './shared';

export interface OptionItem {
  id: string;
  label: string;
  description?: string;
  icon?: IconRef;
  isDisabled?: boolean;
}

function Options({ items }: { items: OptionItem[] }) {
  return (
    <ListBox className="dv-listbox" items={items} renderEmptyState={() => <div className="dv-listbox__empty">No results</div>}>
      {(o) => (
        <ListBoxItem id={o.id} textValue={o.label} isDisabled={o.isDisabled} className="dv-select__option">
          {({ isSelected }) => (
            <>
              {renderIcon(o.icon)}
              <span className="dv-select__option-text">
                <Text slot="label" className="dv-select__option-label">{o.label}</Text>
                {o.description && <Text slot="description" className="dv-select__option-desc">{o.description}</Text>}
              </span>
              {isSelected && <Icon name="check" size={14} className="dv-select__option-check" />}
            </>
          )}
        </ListBoxItem>
      )}
    </ListBox>
  );
}

export interface SelectProps extends Omit<RACSelectProps<OptionItem>, 'className' | 'children' | 'items' | 'selectionMode'>, FieldProps {
  items: OptionItem[];
  placeholder?: string;
}

/** Pick one option from a list (collapsed by default). Type-ahead, arrow keys and screen-reader announcements included. */
export const Select = forwardRef<HTMLDivElement, SelectProps>(function Select({ label, description, errorMessage, isOptional, size, items, placeholder = 'Select…', className, ...rest }, ref) {
  return (
    <RACSelect {...rest} ref={ref} placeholder={placeholder} className={cn('dv-field dv-select', className)} data-size={size}>
      <FieldLabel label={label} isRequired={rest.isRequired} isOptional={isOptional} />
      <RACButton className="dv-input dv-select__trigger">
        <SelectValue className="dv-select__value" />
        <Icon name="chevron-down" size={16} className="dv-select__chevron" />
      </RACButton>
      <FieldFoot description={description} errorMessage={errorMessage} />
      <ThemedPopover matchTriggerWidth><Options items={items} /></ThemedPopover>
    </RACSelect>
  );
});

export interface ComboBoxProps extends Omit<RACComboBoxProps<OptionItem>, 'className' | 'children' | 'items'>, FieldProps {
  items: OptionItem[];
  placeholder?: string;
}

/** Type to filter, then choose (autocomplete). Use `Select` when the list is short. */
export function ComboBox({ label, description, errorMessage, isOptional, size, items, placeholder = 'Search…', className, ...rest }: ComboBoxProps) {
  return (
    <RACComboBox {...rest} items={items} className={cn('dv-field dv-combo-box', className)} data-size={size}>
      <FieldLabel label={label} isRequired={rest.isRequired} isOptional={isOptional} />
      <Group className="dv-input">
        <Input className="dv-input__el" placeholder={placeholder} />
        <RACButton className="dv-input__action" aria-label="Show suggestions"><Icon name="chevron-down" size={16} /></RACButton>
      </Group>
      <FieldFoot description={description} errorMessage={errorMessage} />
      <ThemedPopover matchTriggerWidth><Options items={items} /></ThemedPopover>
    </RACComboBox>
  );
}

export interface MultiSelectProps extends Omit<FieldProps, 'size'> {
  items: OptionItem[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (ids: string[]) => void;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  isDisabled?: boolean;
  isRequired?: boolean;
  isInvalid?: boolean;
  name?: string;
  'aria-label'?: string;
}

/** Choose several options; selected values appear as removable tags under the field. */
export function MultiSelect({ label, description, errorMessage, isOptional, size, items, value, defaultValue, onChange, placeholder = 'Select…', className, ...rest }: MultiSelectProps) {
  const controlled = value !== undefined;
  const toSet = (v?: string[]) => new Set<Key>(v ?? []);
  return (
    <RACSelect
      {...rest}
      selectionMode="multiple"
      {...(controlled ? { value: [...toSet(value)] } : { defaultValue: [...toSet(defaultValue)] })}
      onChange={(keys) => onChange?.((keys as Key[]).map(String))}
      placeholder={placeholder}
      className={cn('dv-field dv-multi-select', className)}
      data-size={size}
    >
      <FieldLabel label={label} isRequired={rest.isRequired} isOptional={isOptional} />
      <RACButton className="dv-input dv-select__trigger">
        <SelectValue className="dv-select__value">
          {({ selectedItems, isPlaceholder, defaultChildren }) => (isPlaceholder ? defaultChildren : `${selectedItems.filter(Boolean).length} selected`)}
        </SelectValue>
        <Icon name="chevron-down" size={16} className="dv-select__chevron" />
      </RACButton>
      <FieldFoot description={description} errorMessage={errorMessage} />
      <ThemedPopover matchTriggerWidth><Options items={items} /></ThemedPopover>
      <SelectedTags items={items} value={value} defaultValue={defaultValue} onChange={onChange} controlled={controlled} />
    </RACSelect>
  );
}

function SelectedTags({ items, value, defaultValue, onChange, controlled }: { items: OptionItem[]; value?: string[]; defaultValue?: string[]; onChange?: (ids: string[]) => void; controlled: boolean }) {
  // Tags render the controlled value; when uncontrolled they mirror the first render only (use `value` for live tags).
  const ids = (controlled ? value : defaultValue) ?? [];
  if (!ids.length) return null;
  const selected = ids.map((id) => items.find((i) => i.id === id)).filter(Boolean) as OptionItem[];
  return (
    <TagGroup aria-label="Selected" onRemove={(keys) => onChange?.(ids.filter((i) => !keys.has(i)))} className="dv-multi-select__tag-group">
      <TagList className="dv-multi-select__tag-list" items={selected}>
        {(o) => (
          <Tag id={o.id} textValue={o.label} className="dv-chip">
            {({ allowsRemoving }) => (<>{o.label}{allowsRemoving && <RACButton slot="remove" className="dv-chip__remove" aria-label={`Remove ${o.label}`}><Icon name="xmark" size={12} /></RACButton>}</>)}
          </Tag>
        )}
      </TagList>
    </TagGroup>
  );
}

