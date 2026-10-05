import type { Meta, StoryObj } from '@storybook/react-vite';
import { Composer } from '../components/chat/Composer';
import { ChatThread } from '../components/chat/ChatThread';
import { ChatMessage } from '../components/chat/ChatMessage';
import { MessageActions } from '../components/chat/MessageActions';
import { StreamingText } from '../components/chat/StreamingText';
import { SuggestedPrompts } from '../components/chat/SuggestedPrompts';
import { ReasoningBlock, ToolUseBlock, CitationChip, ArtifactPanel, CodeBlock, Prose } from '../components/chat/Blocks';

/** Internal hosts for `scripts/figma-extract.mjs` (Chat). Not documentation. */
const meta = { title: 'Internal/Extract Chat', parameters: { layout: 'centered', docs: { disable: true } }, tags: ['!autodocs'] } satisfies Meta;
export default meta;
type S = StoryObj<typeof meta>;
const Col = ({ children, w = 640 }: { children: React.ReactNode; w?: number }) => <div style={{ display: 'grid', gap: 20, width: w, padding: 8, justifyItems: 'stretch' }}>{children}</div>;
const W = ({ id, children }: { id: string; children: React.ReactNode }) => <div id={id}>{children}</div>;
const ctx = [{ id: 'nsc1', label: 'NSC1' }];
const modes = [{ id: 'markets', label: 'Markets' }, { id: 'news', label: 'News' }];

export const ComposerFull: S = { render: () => (<Col w={720}>
  <W id="default"><Composer onSubmit={() => {}} contexts={ctx} modes={modes} onAttach={() => {}} onTools={() => {}} /></W>
  <W id="filled"><Composer onSubmit={() => {}} contexts={ctx} modes={modes} onAttach={() => {}} onTools={() => {}} defaultValue="Compare diesel cracks vs last month and flag anything unusual in the freight market this week." /></W>
  <W id="streaming"><Composer onSubmit={() => {}} contexts={ctx} modes={modes} onAttach={() => {}} onTools={() => {}} isStreaming onStop={() => {}} /></W>
</Col>) };
export const ChatThreadFull: S = { render: () => <div style={{ width: 760, height: 360 }}><ChatThread aria-label="Conversation with LEO"><ChatMessage role="user" text="Why did North Sea crude rise today?">Why did North Sea crude rise today?</ChatMessage><ChatMessage role="assistant"><Prose><p>North Sea Crude M1 rose <strong>+1.42%</strong> to 84.62.</p></Prose></ChatMessage></ChatThread></div> };
export const ChatMessageFull: S = { render: () => (<Col w={720}>
  <W id="user"><ChatMessage role="user" text="Why did North Sea crude rise today?" onEdit={() => {}}>Why did North Sea crude rise today?</ChatMessage></W>
  <W id="assistant"><ChatMessage role="assistant" trace={<ReasoningBlock summary="Thought for 4 s">Looked at the programme revision.</ReasoningBlock>} actions={<MessageActions copyText="x" />}><Prose><p>North Sea Crude M1 rose <strong>+1.42%</strong> to 84.62 as loading programmes were trimmed.</p></Prose></ChatMessage></W>
</Col>) };
export const StreamingTextFull: S = { render: () => (<Col>
  <W id="streaming"><StreamingText text="Streaming text reveals progressively with a cursor." isStreaming /></W>
  <W id="done"><StreamingText text="Streaming text reveals progressively with a cursor." /></W>
</Col>) };
export const MessageActionsFull: S = { render: () => <Col w={260}><MessageActions copyText="x" onRetry={() => {}} feedback={null} onFeedback={() => {}} /></Col> };
export const SuggestedPromptsFull: S = { render: () => <Col w={720}><SuggestedPrompts prompts={['Why did crude rise?', 'Compare cracks', 'Summarise news']} onSelect={() => {}} /></Col> };
export const ProseFull: S = { render: () => <Col><Prose><h3>Drivers</h3><p>North Sea Crude M1 rose <strong>+1.42%</strong> to 84.62.</p><ul><li>Programme cut of ~4%</li><li>Firmer diesel cracks</li></ul><table><thead><tr><th>Market</th><th>Change</th></tr></thead><tbody><tr><td>NSC1</td><td>+1.42%</td></tr><tr><td>ULS</td><td>+0.64%</td></tr></tbody></table></Prose></Col> };
export const CodeBlockFull: S = { render: () => (<Col>
  <W id="default"><CodeBlock language="json" code={'{\n  "code": "NSC1",\n  "range": "1M"\n}'} /></W>
</Col>) };
export const ReasoningBlockFull: S = { render: () => (<Col w={560}>
  <W id="default"><ReasoningBlock summary="Thought for 4 s">Looked at the programme revision, product cracks and freight.</ReasoningBlock></W>
  <W id="expanded"><ReasoningBlock summary="Thought for 4 s" defaultExpanded>Looked at the programme revision, product cracks and freight.</ReasoningBlock></W>
  <W id="streaming"><ReasoningBlock summary="" isStreaming /></W>
</Col>) };
export const ToolUseBlockFull: S = { render: () => (<Col w={560}>
  <W id="running"><ToolUseBlock name="Search assessments" status="running" /></W>
  <W id="success"><ToolUseBlock name="Search assessments" summary="NSC1, 30 days">Returned 30 daily points.</ToolUseBlock></W>
  <W id="error"><ToolUseBlock name="Fetch news" status="error">Request timed out.</ToolUseBlock></W>
  <W id="expanded"><ToolUseBlock name="Search assessments" summary="NSC1, 30 days" defaultExpanded>Returned 30 daily points.</ToolUseBlock></W>
</Col>) };
export const CitationChipFull: S = { render: () => <Col w={120}><CitationChip n={1} title="Fictional Wire: loading programme revised" href="#" /></Col> };
export const ArtifactPanelFull: S = { render: () => <div style={{ width: 520, height: 300 }}><ArtifactPanel title="NSC1 vs peers" type="Table" onClose={() => {}}><Prose><p>Larger outputs open in a side panel with their own scroll.</p></Prose></ArtifactPanel></div> };
