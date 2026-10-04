import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within } from 'storybook/test';
import { Menu, ContextMenu } from './Menu';
import { CommandPalette } from './CommandPalette';
import { Button } from '../actions/Button';
import { IconButton } from '../actions/IconButton';
import { Card } from '../layout/Card';

const items = [
  { id: 'open', label: 'Open assessment', icon: 'chart-line', shortcut: '⏎' },
  { id: 'alert', label: 'Create alert…', icon: 'bell' },
  { id: 'more', label: 'Export', icon: 'download', children: [{ id: 'csv', label: 'CSV' }, { id: 'xlsx', label: 'Excel' }] },
  { id: 'sep', type: 'separator' as const },
  { id: 'rm', label: 'Remove from watchlist', icon: 'trash', destructive: true },
];

const meta = { title: 'Components/Navigation/Menu', component: Menu, args: { trigger: <Button variant="subtle" iconEnd="chevron-down">Actions</Button>, items }, decorators: [(S) => <div style={{ minHeight: 320 }}><S /></div>], parameters: { docs: { components: ["Menu", "ContextMenu", "CommandPalette"], description: { component: 'Action menu (`Dropdown`). **Keyboard:** Enter/Space/↓ opens, arrows move, → opens submenus, type-ahead, Esc closes and returns focus. `ContextMenu` opens on right-click, long-press, Menu key or Shift+F10 – always offer the same actions elsewhere. `CommandPalette` is ⌘K / Ctrl+K.' } } } } satisfies Meta<typeof Menu>;
export default meta;
type S = StoryObj<typeof meta>;

export const Default: S = {};
export const Open: S = { play: async ({ canvasElement }) => { await userEvent.click(within(canvasElement).getByRole('button')); } };
export const KebabTrigger: S = { args: { trigger: <IconButton label="Actions for North Sea Crude M1" icon="ellipsis-vertical" variant="ghost" />, 'aria-label': 'Row actions' } };
export const Context: S = { render: () => (<ContextMenu items={items}><Card style={{ width: 360 }}>Right-click, long-press or press Shift+F10 on this card.</Card></ContextMenu>) };
export const Palette: S = {
  render: () => (<CommandPalette isOpen onRun={() => {}} commands={[{ id: 'm', label: 'Go to Markets', icon: 'chart-line', group: 'Navigate', shortcut: 'G M' }, { id: 'w', label: 'Go to Watchlists', icon: 'list', group: 'Navigate' }, { id: 'a', label: 'New alert', icon: 'bell', group: 'Create', shortcut: 'N' }, { id: 't', label: 'Toggle theme', icon: 'moon', group: 'Preferences' }]} />),
  parameters: { layout: 'fullscreen' },
};
