import { Controls, Description, Primary, Stories, Subtitle, Title, useOf } from '@storybook/addon-docs/blocks';
import manifest from '../../../packages/davinci-ai/dist/components.json';

type Entry = {
  name: string;
  category: string;
  import: string;
  whenToUse?: string;
  whenNotToUse?: string;
  states: string[];
  related: string[];
  accessibility: { keyboard: string | null; aria: string | null; notes: string[]; wcag: string };
};
const components = (manifest as unknown as { components: Record<string, Entry> }).components;

const box = { padding: '16px 18px', borderRadius: 14, border: '1px solid rgba(128,128,128,.25)', margin: '8px 0' } as const;

/** Auto docs page: title, description, primary story, controls, **accessibility notes from components.json**, all stories. */
export function DocsPage() {
  const { preparedMeta } = useOf('meta', ['meta']) as { preparedMeta: { component?: { displayName?: string; name?: string }; parameters?: { docs?: { components?: string[] } } } };
  const names = preparedMeta.parameters?.docs?.components ?? [preparedMeta.component?.displayName ?? preparedMeta.component?.name ?? ''];
  const entries = names.map((n) => components[n]).filter(Boolean) as Entry[];
  return (
    <>
      <Title />
      <Subtitle />
      <Description />
      <Primary />
      <Controls />
      {entries.length > 0 && (
        <section aria-label="Accessibility and usage notes">
          <h2>Accessibility &amp; usage</h2>
          {entries.map((e) => (
            <div key={e.name} style={box}>
              <h3 style={{ marginTop: 0 }}>{e.name}</h3>
              <p style={{ margin: '4px 0' }}><code>{e.import}</code></p>
              {e.whenToUse && <p style={{ margin: '4px 0' }}><b>Use when:</b> {e.whenToUse}</p>}
              {e.whenNotToUse && <p style={{ margin: '4px 0' }}><b>Don’t use when:</b> {e.whenNotToUse}</p>}
              <p style={{ margin: '4px 0' }}><b>Keyboard:</b> {e.accessibility.keyboard ?? 'No interaction (presentational) or standard browser behaviour.'}</p>
              <p style={{ margin: '4px 0' }}><b>ARIA / semantics:</b> {e.accessibility.aria ?? 'Native element semantics.'}</p>
              {e.accessibility.notes.length > 0 && <ul>{e.accessibility.notes.map((n) => <li key={n}>{n}</li>)}</ul>}
              <p style={{ margin: '4px 0' }}><b>States:</b> {e.states.join(' · ')}</p>
              {e.related.length > 0 && <p style={{ margin: '4px 0' }}><b>Related:</b> {e.related.join(', ')}</p>}
              <p style={{ margin: '4px 0', opacity: 0.8 }}>{e.accessibility.wcag}</p>
            </div>
          ))}
        </section>
      )}
      <Stories />
    </>
  );
}
