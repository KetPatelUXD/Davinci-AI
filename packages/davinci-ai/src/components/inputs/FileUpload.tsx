'use client';
import { useId, useState } from 'react';
import { DropZone, FileTrigger, Button as RACButton, Text } from 'react-aria-components';
import { Icon } from '../../foundations/Icon';
import { IconButton } from '../actions/IconButton';
import { cn } from '../../utils/cn';
import { FieldFoot, type FieldProps } from './shared';

export interface FileUploadProps extends Pick<FieldProps, 'description' | 'className'> {
  label?: string;
  accept?: string[];
  multiple?: boolean;
  /** Controlled file list. */
  files?: File[];
  onFilesChange?: (files: File[]) => void;
  maxFileSizeMB?: number;
  errorMessage?: string;
  isDisabled?: boolean;
}

const fmt = (n: number) => (n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1e3))} KB`);

/** Drop zone with a keyboard-accessible "Browse files" button and a removable file list. */
export function FileUpload({ label = 'Upload files', description, accept, multiple = true, files: controlled, onFilesChange, maxFileSizeMB, errorMessage, isDisabled, className }: FileUploadProps) {
  const [own, setOwn] = useState<File[]>([]);
  const files = controlled ?? own;
  const [tooBig, setTooBig] = useState<string | null>(null);
  const id = useId();
  const set = (next: File[]) => { setOwn(next); onFilesChange?.(next); };
  const add = (list: FileList | File[] | null) => {
    if (!list) return;
    const incoming = Array.from(list);
    const ok = incoming.filter((f) => !maxFileSizeMB || f.size <= maxFileSizeMB * 1e6);
    setTooBig(ok.length < incoming.length ? `Some files exceed ${maxFileSizeMB} MB and were skipped.` : null);
    set(multiple ? [...files, ...ok] : ok.slice(0, 1));
  };
  return (
    <div className={cn('dv-field', className)}>
      <span className="dv-field__label" id={id}>{label}</span>
      <DropZone
        aria-labelledby={id}
        isDisabled={isDisabled}
        className="dv-drop"
        onDrop={async (e) => {
          const items = e.items.filter((i) => i.kind === 'file') as { getFile: () => Promise<File> }[];
          add(await Promise.all(items.map((i) => i.getFile())));
        }}
      >
        <Icon name="upload" size={20} />
        <Text slot="label" className="dv-drop__text">Drag files here or</Text>
        <FileTrigger acceptedFileTypes={accept} allowsMultiple={multiple} onSelect={add}>
          <RACButton className="dv-btn" data-variant="subtle" data-size="sm" isDisabled={isDisabled}>Browse files</RACButton>
        </FileTrigger>
      </DropZone>
      {files.length > 0 && (
        <ul className="dv-filelist" aria-label="Selected files">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className="dv-filelist__item">
              <Icon name="file" size={16} />
              <span className="dv:truncate dv:min-w-0">{f.name}</span>
              <span className="dv-filelist__size">{fmt(f.size)}</span>
              <IconButton label={`Remove ${f.name}`} icon="xmark" variant="ghost" size="sm" onPress={() => set(files.filter((_, j) => j !== i))} />
            </li>
          ))}
        </ul>
      )}
      {description && <p className="dv-field__hint">{description}</p>}
      {(errorMessage ?? tooBig) && <p className="dv-field__error" role="alert"><Icon name="circle-xmark" size={14} /><span>{errorMessage ?? tooBig}</span></p>}
    </div>
  );
}
export { FieldFoot };
