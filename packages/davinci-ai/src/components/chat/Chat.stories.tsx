import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within } from 'storybook/test';
import { Composer } from './Composer';
import { ChatThread } from './ChatThread';
import { ChatMessage } from './ChatMessage';
import { MessageActions } from './MessageActions';
import { StreamingText } from './StreamingText';
import { SuggestedPrompts } from './SuggestedPrompts';
import { ReasoningBlock, ToolUseBlock, CitationChip, ArtifactPanel, CodeBlock, Prose } from './Blocks';
import { Col, Section } from '../../stories/helpers';

const meta = {
  title: 'Components/Chat/Composer',
  component: Composer,
  args: { onSubmit: () => {}, contexts: [{ id: 'nsc1', label: 'NSC1' }], modes: [{ id: 'markets', label: 'Markets' }, { id: 'news', label: 'News' }] },
  decorators: [(S) => <div style={{ width: 720, paddingTop: 80 }}><S /></div>],
  parameters: { docs: { components: ["Composer", "ChatThread", "ChatMessage", "MessageActions", "StreamingText", "SuggestedPrompts", "Prose", "CodeBlock", "ReasoningBlock", "ToolUseBlock", "CitationChip", "ArtifactPanel"], description: { component: 'Ask LEO composer – **two rows** on floating glass, radius 26. Row 1: LEO mark + auto-growing input. Row 2: attach, tools, removable context chip, mode menu, ⌘L hint, round `on` send button (turns into Stop while streaming).\n\n**Keyboard:** Enter sends, Shift+Enter newline, ⌘/Ctrl+L focuses, focus returns after send. Suggested prompts float above while the composer is focused. IME composition never sends.' } } },
} satisfies Meta<typeof Composer>;
export default meta;
type S = StoryObj<typeof meta>;

export const Default: S = {};
export const WithSuggestions: S = { args: { suggestions: ['Why did North Sea crude rise today?', 'Compare diesel cracks vs last month', 'Summarise freight news'] }, play: async ({ canvasElement }) => { await userEvent.click(within(canvasElement).getByRole('textbox')); } };
export const Streaming: S = { args: { isStreaming: true, onStop: () => {} } };
export const Filled: S = { args: { defaultValue: 'Compare diesel cracks vs last month and flag anything unusual in the freight market this week.' } };

export const Conversation: S = {
  decorators: [(S) => <div style={{ width: 760, height: 620 }}><S /></div>],
  parameters: { layout: 'centered' },
  render: () => (
    <ChatThread aria-label="Conversation with LEO" announcement="LEO replied">
      <ChatMessage role="user" text="Why did North Sea crude rise today?" onEdit={() => {}}>Why did North Sea crude rise today?</ChatMessage>
      <ChatMessage
        role="assistant"
        trace={<><ReasoningBlock summary="Thought for 4 s">Looked at the programme revision, product cracks and freight.</ReasoningBlock><ToolUseBlock name="Search assessments" summary="NSC1, 30 days">Returned 30 daily points.</ToolUseBlock></>}
        actions={<MessageActions copyText="North Sea crude rose 1.42%" />}
      >
        <Prose>
          <p>North Sea Crude M1 rose <strong>+1.42%</strong> to 84.62 as loading programmes were trimmed <CitationChip n={1} title="Fictional Wire: loading programme revised" href="#" />.</p>
          <h3>Drivers</h3>
          <ul><li>Programme cut of ~4%</li><li>Firmer diesel cracks</li></ul>
          <table><thead><tr><th>Market</th><th>Change</th></tr></thead><tbody><tr><td>NSC1</td><td>+1.42%</td></tr><tr><td>ULS</td><td>+0.64%</td></tr></tbody></table>
        </Prose>
      </ChatMessage>
    </ChatThread>
  ),
};
function PartsDemo() {
  const [fb, setFb] = useState<'up' | 'down' | null>(null);
  return (
      <Col gap={28}>
        <Section title="StreamingText"><StreamingText text="Streaming text reveals progressively with a cursor that respects reduced motion." isStreaming /></Section>
        <Section title="SuggestedPrompts"><SuggestedPrompts prompts={['Why did crude rise?', 'Compare cracks', 'Summarise news']} onSelect={() => {}} /></Section>
        <Section title="Reasoning (streaming) and tool states"><Col gap={8}><ReasoningBlock summary="" isStreaming /><ToolUseBlock name="Search assessments" status="running" /><ToolUseBlock name="Fetch news" status="error">Request timed out.</ToolUseBlock></Col></Section>
        <Section title="MessageActions"><MessageActions copyText="x" onRetry={() => {}} feedback={fb} onFeedback={setFb} /></Section>
        <Section title="CodeBlock"><CodeBlock language="json" code={'{\n  "code": "NSC1",\n  "range": "1M"\n}'} /></Section>
      </Col>
  );
}
export const Parts: S = {
  decorators: [(S) => <div style={{ width: 640 }}><S /></div>],
  render: () => <PartsDemo />,
};
export const Artifact: S = { decorators: [(S) => <div style={{ width: 520, height: 320 }}><S /></div>], render: () => (<ArtifactPanel title="NSC1 vs peers" type="Table" onClose={() => {}}><Prose><p>Larger outputs open in a side panel with their own scroll.</p></Prose></ArtifactPanel>) };
