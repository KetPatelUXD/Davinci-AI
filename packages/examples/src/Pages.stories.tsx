import type { ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ChatPanel, DenseOrderForm, NewsPage, SparseSettingsForm, WatchlistPage } from './Pages';

const meta = { title: 'Examples/Pages', parameters: { layout: 'fullscreen' }, tags: ['!autodocs'] } satisfies Meta;
export default meta;
type S = StoryObj<typeof meta>;

const pad = { decorators: [(Story: () => ReactElement) => <div style={{ padding: 24, display: 'grid', placeItems: 'start center' }}><Story /></div>] };

export const WatchlistDark: S = { render: () => <WatchlistPage />, globals: { theme: 'dark' } };
export const WatchlistLight: S = { render: () => <WatchlistPage />, globals: { theme: 'light' } };
export const DenseOrderFormDark: S = { render: () => <DenseOrderForm />, globals: { theme: 'dark', density: 'compact' }, ...pad };
export const DenseOrderFormLight: S = { render: () => <DenseOrderForm />, globals: { theme: 'light', density: 'compact' }, ...pad };
export const SparseSettingsFormDark: S = { render: () => <SparseSettingsForm />, globals: { theme: 'dark' }, ...pad };
export const SparseSettingsFormLight: S = { render: () => <SparseSettingsForm />, globals: { theme: 'light' }, ...pad };
export const NewsDark: S = { render: () => <NewsPage />, globals: { theme: 'dark' } };
export const NewsLight: S = { render: () => <NewsPage />, globals: { theme: 'light' } };
export const ChatDark: S = { render: () => <ChatPanel />, globals: { theme: 'dark' } };
export const ChatLight: S = { render: () => <ChatPanel />, globals: { theme: 'light' } };
