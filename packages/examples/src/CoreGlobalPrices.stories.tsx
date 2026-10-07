import type { Meta, StoryObj } from '@storybook/react-vite';
import { CoreGlobalPrices } from './CoreGlobalPrices';

const meta = {
  title: 'Examples/Core – Global prices',
  component: CoreGlobalPrices,
  parameters: { layout: 'fullscreen', docs: { description: { component: 'A rebuild of a Core product page (price tiles, news, key assessments table, chart, deals, commentary and reports), built **only** from library components with fictional sample data.' } } },
  tags: ['!autodocs'],
} satisfies Meta<typeof CoreGlobalPrices>;
export default meta;
type S = StoryObj<typeof meta>;

export const Dark: S = { globals: { theme: 'dark' } };
export const Light: S = { globals: { theme: 'light' } };
