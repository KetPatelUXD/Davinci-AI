import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within } from 'storybook/test';
import { Dialog, ConfirmDialog } from './Dialog';
import { Drawer } from './Drawer';
import { Popover } from './Popover';
import { ToastProvider, useToast } from './Toast';
import { Alert, Banner, InlineMessage } from './Alert';
import { Button } from '../actions/Button';
import { TextField } from '../inputs/TextField';
import { Col, Row } from '../../stories/helpers';

function ToastButtons() {
  const { show } = useToast();
  return (
    <Row>
      <Button variant="subtle" onPress={() => show({ title: 'Order placed', description: 'Buy 25,000 bbl NSC1 @ 84.60', intent: 'positive' })}>Success toast</Button>
      <Button variant="subtle" onPress={() => show({ title: 'Connection lost', description: 'Retrying…', intent: 'warning', timeout: 0, action: { label: 'Retry', onPress: () => {} } })}>Sticky warning</Button>
    </Row>
  );
}

const meta = { title: 'Components/Overlays/Dialog', component: Dialog, args: { title: 'Dialog' }, parameters: { docs: { components: ["Dialog", "ConfirmDialog", "Drawer", "Popover", "ToastProvider", "Alert", "Banner", "InlineMessage"], description: { component: 'Overlays use **glass** surfaces. Dialogs trap and restore focus, close on Esc, and inert the page. Toasts live in a polite live region and never steal focus. Popovers/menus/tooltips inherit the active theme even though they render in a portal.' } } } } satisfies Meta<typeof Dialog>;
export default meta;
type S = StoryObj<typeof meta>;

export const Default: S = {
  args: { title: 'Rename watchlist', description: 'Names are visible to teammates you share with.', trigger: <Button>Rename…</Button>, footer: <><Button variant="subtle" slot="close">Cancel</Button><Button slot="close">Save</Button></>, children: <TextField label="Name" defaultValue="Core energy desk" /> },
};
export const OpenDialog: S = { ...Default, play: async ({ canvasElement }) => { await userEvent.click(within(canvasElement).getByRole('button', { name: 'Rename…' })); } };
export const Confirm: S = { render: () => (<ConfirmDialog trigger={<Button intent="destructive">Delete alert</Button>} title="Delete this alert?" description="You will stop receiving notifications for NSC1 above 85.00." intent="destructive" confirmLabel="Delete" onConfirm={() => {}} />) };
export const Sheet: S = { render: () => (<Drawer title="Assessment details" trigger={<Button variant="subtle">Open drawer</Button>} footer={<Button slot="close">Done</Button>}><p>Methodology, timestamps and fictional sample notes.</p></Drawer>) };
export const Pop: S = { render: () => (<div style={{ minHeight: 240 }}><Popover aria-label="Alert details" trigger={<Button variant="subtle">Details</Button>} arrow><Col gap={8}><b>Alert rule</b><span>Notify when NSC1 crosses 85.00.</span></Col></Popover></div>) };
export const Toasts: S = { render: () => <ToastProvider><ToastButtons /></ToastProvider> };
export const Messages: S = {
  render: () => (<Col width={560}><Alert intent="negative" title="Could not save">Check your connection and try again.</Alert><Alert intent="positive" title="Saved" onDismiss={() => {}}>Your changes are live.</Alert><Banner intent="info" dismissible title="Maintenance tonight 22:00–23:00.">Pricing remains available.</Banner><InlineMessage intent="warning">Prices are 15 minutes delayed.</InlineMessage></Col>),
};
