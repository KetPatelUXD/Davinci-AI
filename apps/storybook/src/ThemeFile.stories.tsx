import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge, Button, Card, Checkbox, IconButton, PriceChange, SegmentedControl, Stat, Switch, TextField, ThemeProvider, useTheme, type ThemeConfig } from '@davinci-ai/react';
import teal from '../../../packages/davinci-ai/assets/themes/teal.theme.json';
import sky from '../../../packages/davinci-ai/assets/themes/sky.theme.json';
import amber from '../../../packages/davinci-ai/assets/themes/amber.theme.json';

const THEMES: Record<string, ThemeConfig | undefined> = { default: undefined, teal: teal as ThemeConfig, sky: sky as ThemeConfig, amber: amber as ThemeConfig };
const spark = [41, 43, 42, 46, 45, 49, 48, 52, 51, 55];

function Preview({ sample }: { sample: keyof typeof THEMES }) {
  const { theme } = useTheme();
  return (
    <ThemeProvider theme={theme} themeConfig={THEMES[sample]} canvas style={{ display: 'block', padding: 24, borderRadius: 28, width: 760 }}>
      <div style={{ display: 'grid', gap: 16 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button iconStart="plus">New alert</Button>
          <Button variant="subtle" iconStart="filter">Filters</Button>
          <Button variant="ghost">Cancel</Button>
          <IconButton label="Refresh" icon="rotate-right" />
          <Badge intent="brand">Brand</Badge>
          <Badge intent="positive">Positive</Badge>
          <Badge intent="negative">Negative</Badge>
        </div>
        <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
          <Stat title="Sample index" value={84.62} decimals={2} series={spark} delta={{ value: 1.42, context: '1D' }} />
          <Card title="Settings">
            <div style={{ display: 'grid', gap: 12 }}>
              <TextField label="Alert name" defaultValue="Index above 85" />
              <Switch defaultSelected>Email me</Switch>
              <Checkbox defaultSelected>Include weekends</Checkbox>
              <SegmentedControl aria-label="Range" defaultValue="1m" options={[{ id: '1w', label: '1W' }, { id: '1m', label: '1M' }, { id: '1y', label: '1Y' }]} />
              <PriceChange percent={-0.86} />
            </div>
          </Card>
        </div>
      </div>
    </ThemeProvider>
  );
}

const meta = {
  title: 'Foundations/Theme file',
  component: Preview,
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'A theme file (`davinci.theme.json`) applied with `<ThemeProvider themeConfig={…}>`. Switch the sample, then flip the Theme toolbar between dark and light. Step-by-step instructions: **Guides → Theming → Change the theme step by step**.' } },
  },
  args: { sample: 'default' },
  argTypes: { sample: { control: 'inline-radio', options: Object.keys(THEMES) } },
} satisfies Meta<typeof Preview>;
export default meta;
type S = StoryObj<typeof meta>;

export const Default: S = {};
export const Teal: S = { args: { sample: 'teal' } };
export const Sky: S = { args: { sample: 'sky' } };
export const Amber: S = { args: { sample: 'amber' } };
