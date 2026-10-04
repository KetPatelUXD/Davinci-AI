import type { Meta, StoryObj } from '@storybook/react-vite';
import { Icon, IconProvider, createIconMap } from './Icon';
import { BUILTIN_ICONS } from './icons/builtin';
import { DaVinciLogo, LeoMark } from './DaVinciLogo';
import { Heading, Text, NumberText, DisplayNumber } from './Typography';
import { AppBackground } from './AppBackground';
import { FocusRing } from './FocusRing';
import { ThemeProvider, DensityProvider, useTheme } from './ThemeProvider';
import { Button } from '../components/actions/Button';
import { Card } from '../components/layout/Card';
import { Col, Row, Section } from '../stories/helpers';

const meta = { title: 'Foundations/Primitives', parameters: { docs: { components: ["ThemeProvider", "DensityProvider", "AppBackground", "Icon", "IconProvider", "DaVinciLogo", "LeoMark", "Heading", "Text", "Label", "NumberText", "DisplayNumber", "VisuallyHidden", "FocusRing"] }, layout: 'padded' } } satisfies Meta;
export default meta;
type S = StoryObj<typeof meta>;

export const Logo: S = { render: () => (<Row gap={32}><DaVinciLogo size={72} /><DaVinciLogo variant="lockup" size={72} /><LeoMark size={48} /></Row>) };
export const Typography: S = {
  render: () => (
    <Col gap={20}>
      <Heading level={1} variant="title">Page title 20/600</Heading>
      <Heading variant="section">Section heading 15/600</Heading>
      <Heading variant="card">Card title 16/400 secondary</Heading>
      <Text>Base 13 dense – the default for data-heavy screens.</Text>
      <Text variant="comfortable">Comfortable 14 – sparse forms.</Text>
      <Text variant="small" tone="muted">Small 12 muted</Text>
      <Text variant="overline" tone="secondary">Overline 11</Text>
      <Row gap={32} align="end"><DisplayNumber value="84.62" unit="USD" size={64} /><DisplayNumber value="261.35" size={42} /><NumberText strong>1,234,567.89</NumberText></Row>
    </Col>
  ),
};
export const IconGallery: S = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
      {Object.keys(BUILTIN_ICONS).map((n) => (<div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}><Icon name={n} size={18} /><code>{n}</code></div>))}
    </div>
  ),
};
export const IconSwap: S = {
  render: () => (
    <IconProvider icons={createIconMap([{ iconName: 'chart-line', icon: [512, 512, [], 'f001', 'M64 64h32v352h352v32H64V64zm96 256l96-128 80 80 112-160 24 17-136 192-80-80-80 104z'] }])}>
      <Row><Icon name="chart-line" size={24} /><span>← rendered from a registered Font Awesome-style definition</span></Row>
    </IconProvider>
  ),
};
export const FocusRings: S = { render: () => (<Row><FocusRing><button className="dv-btn" data-variant="subtle" style={{ outline: 'none' }}>Keyboard focus shows the ring</button></FocusRing><Button>Tab to me</Button></Row>) };
export const Ambient: S = { parameters: { layout: 'fullscreen' }, render: () => (<div style={{ position: 'relative', height: 420, overflow: 'hidden' }}><AppBackground position="absolute" /><div style={{ position: 'relative', padding: 32 }}><Card title="Graphite ambient light" style={{ width: 360 }}>Soft top-left glow plus one slow diagonal beam.</Card></div></div>) };
function Theme() { const t = useTheme(); return <Text>Theme <b>{t.theme}</b> · density <b>{t.density}</b> · locale <b>{t.locale}</b></Text>; }
export const Providers: S = {
  render: () => (
    <Col>
      <Section title="Nested light theme"><ThemeProvider theme="light" canvas style={{ padding: 16, borderRadius: 16 }}><Theme /><Card title="Light inside dark" style={{ width: 280, marginTop: 12 }}>Nested providers scope tokens.</Card></ThemeProvider></Section>
      <Section title="DensityProvider"><DensityProvider density="compact"><Row><Button size="sm">Compact sm</Button><Button>Compact md</Button></Row></DensityProvider></Section>
    </Col>
  ),
};
