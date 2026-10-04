import type { Meta, StoryObj } from '@storybook/react-vite';
import { MarketsDashboard } from './MarketsDashboard';

const meta = {
  title: 'Examples/Markets dashboard',
  component: MarketsDashboard,
  parameters: { layout: 'fullscreen', docs: { description: { component: 'Pixel-match of the Graphite reference screen (`reference/davinci-ai-reference.html`), built **only** from library components with fictional sample data.' } } },
  args: { rise: false },
  tags: ['!autodocs'],
} satisfies Meta<typeof MarketsDashboard>;
export default meta;
type S = StoryObj<typeof meta>;

export const Dark: S = { globals: { theme: 'dark' } };
export const Light: S = { globals: { theme: 'light' } };
