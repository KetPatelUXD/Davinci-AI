import type { Meta, StoryObj } from '@storybook/react-vite';

/** Landing page of the Storybook. The animated cover lives in `public/cover.html` (served at `cover.html`). */
function Cover() {
  return <iframe src="cover.html" title="DaVinci.AI cover" style={{ display: 'block', width: '100%', height: '100vh', border: 0, background: '#060607' }} />;
}

const meta = {
  title: 'Cover',
  component: Cover,
  parameters: { layout: 'fullscreen', a11y: { test: 'todo' } },
  tags: ['!autodocs'],
} satisfies Meta<typeof Cover>;
export default meta;
type S = StoryObj<typeof meta>;

export const Default: S = { name: 'DaVinci.AI' };
