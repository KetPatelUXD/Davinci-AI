import type { Meta, StoryObj } from '@storybook/react-vite';
import { ButtonGroup } from './ButtonGroup';
import { Button } from './Button';
import { Link } from './Link';
import { ToggleButton } from './ToggleButton';
import { Col, Row, Section } from '../../stories/helpers';

const meta = { title: 'Components/Actions/ButtonGroup, Link, ToggleButton', component: ButtonGroup, parameters: { docs: { components: ["ButtonGroup", "Link", "ToggleButton"], description: { component: 'Small action primitives. `ButtonGroup` is a labelled `role="group"`; `Link` navigates (use `Button` for actions); `ToggleButton` exposes `aria-pressed`.' } } } } satisfies Meta<typeof ButtonGroup>;
export default meta;
type S = StoryObj<typeof meta>;

export const Group: S = {
  args: { 'aria-label': 'Chart actions' },
  render: (a) => (<Col><ButtonGroup {...a}><Button variant="subtle">Export</Button><Button variant="subtle">Share</Button></ButtonGroup><ButtonGroup {...a} attached><Button variant="ghost">1D</Button><Button variant="ghost">1W</Button><Button variant="ghost">1M</Button></ButtonGroup></Col>),
};
export const Links: S = {
  args: { 'aria-label': 'x' },
  render: () => (<Row><Link href="#docs">Read the docs</Link><Link href="https://example.com" external>External link</Link><Link href="#inherit" tone="inherit">Inherited colour</Link></Row>),
};
export const Toggles: S = {
  args: { 'aria-label': 'x' },
  render: () => (<Section title="Toggle buttons"><Row><ToggleButton>Pin</ToggleButton><ToggleButton defaultSelected iconStart="star">Starred</ToggleButton><ToggleButton isDisabled>Disabled</ToggleButton></Row></Section>),
};
