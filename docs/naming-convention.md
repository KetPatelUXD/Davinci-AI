# Naming convention (React ⇄ Storybook ⇄ manifest ⇄ Figma)

One vocabulary, used everywhere, so a designer's Figma layer, a developer's DOM node and an agent's reading of either are the same thing. `pnpm check:naming` enforces the code side; the Figma audit enforces the file side (see `docs/figma-kit.md`).

## 1. Components
- PascalCase, full words, singular: `Button`, `SegmentedControl`, `OrderTicket`. No abbreviations (`Btn`, `Seg`, `Cal`).
- The same name is used for: the React export, the Figma component set, the manifest key (`components.json`), the Storybook title (`Category/Component`) and the CSS block.

## 2. Parts (the elements inside a component)
- Every element that carries styling or meaning is a **part** with a PascalCase name from the manifest `anatomy` (`Label`, `IconStart`, `Thumb`, `Option`, `Field`, `Error`).
- CSS class: `dv-{component}__{part}`, kebab-case of the same names: `Button/Label` → `.dv-button__label`, `SegmentedControl/Thumb` → `.dv-segmented-control__thumb`.
- Root element: `dv-{component}` (kebab-case of the component name). One block per component; a component never uses another component's block.
- Figma layer name = the PascalCase part name. Converting layer name ⇄ class is mechanical (PascalCase ⇄ kebab-case); no lookup table.
- Parts are flat: one level, hyphenated when compound (`option-label`, `file-list-item`), never nested (`option__label`).
- Repeated parts keep the part name (`Option`, `Row`); do not number them in code. In Figma, instances inside a component are named by the part, not "Frame 12".
- Modifiers use data attributes (below), **not** `--modifier` classes.

## 3. Props (one word per idea)
| Idea | Prop | Notes |
|---|---|---|
| Visual style | `variant` | `solid`, `subtle`, `ghost`, `outline`… |
| Colour meaning | `intent` | `primary`, `brand`, `positive`, `negative`, `warning`, `info`, `neutral`, `destructive`. Replaces `tone`, `status`, `kind`. |
| Size | `size` | `sm` `md` `lg` `xl` (components that need more say so). |
| Layout direction | `orientation` | `horizontal` / `vertical`. Replaces `dir`, `direction`, `layout` (when it means direction). |
| Boolean state | `isX` | `isDisabled`, `isSelected`, `isLoading`, `isInvalid`, `isReadOnly`, `isOpen`. |
| Optional slot | `slotName` | `iconStart`, `iconEnd`, `icon`, `prefix`, `suffix`, `actions`. |
| Text content | `label`, `title`, `description`, `hint`, `error` | `children` only for free content. |
| Market side | `side` | `buy` / `sell`. Finance only. |
| Sign of a change | `trend` (attribute only) | `up` / `down` / `flat`. Replaces `dir`. |
| Lifecycle | `status` | `pending` `running` `success` `error`; `complete` `current` `upcoming` (Stepper). Not a colour word. |
| Content type | `type` | e.g. `ArtifactPanel type="Table"`. Replaces `kind`. |

New props must reuse this table; if an idea is missing, add a row here first.

## 4. Data attributes (what the DOM exposes)
- Mirror the props one to one: `data-variant`, `data-intent`, `data-size`, `data-orientation`, `data-full`.
- Interaction and state use React Aria's names: `data-disabled`, `data-selected`, `data-invalid`, `data-pressed`, `data-hovered`, `data-focus-visible`, `data-open`, `data-loading`.
- Allowed domain attributes are listed in `scripts/check-naming.mjs` (`ALLOWED_DATA`). Anything else fails the check.
- Banned: `data-tone`, `data-state`, `data-dir`, `data-kind`. `data-status` is allowed only for lifecycle; `data-current` is React Aria's current-page marker.
- `ThemeProvider direction` (`standard` / `inverted`) is the one domain exception to the `orientation` rule.

## 5. Figma mapping
| React | Figma |
|---|---|
| Component | Component set, same name, on the page for its category |
| `variant`, `intent`, `size`, `orientation` | VARIANT property, same name, same values |
| interaction state (not a prop) | VARIANT property `state`: `default`, `hovered`, `pressed`, `focus-visible`, `disabled`, `selected`, `invalid`, `loading`, `read-only` |
| `isX` boolean that changes look | VARIANT property named after the data attribute (`selected=true`) |
| Optional slot `iconStart` | INSTANCE_SWAP `iconStart` plus BOOLEAN `hasIconStart` |
| Text prop | TEXT property named like the prop (`label`, `title`, `hint`) |
| Part | Layer named exactly as the part (PascalCase) |
| Variant name | `prop=value, prop=value` in the order variant, intent, size, state |

## 6. Storybook and examples
- Story title: `Category/Component` (exactly the manifest category and name). Story export names are PascalCase and describe the variant: `Solid`, `SubtleDisabled`, `WithIcons`.
- Controls use the prop names above; no story-only prop names.
- Example pages compose only library components; page regions are named by role in code comments and in Figma (`Page/Header`, `Page/Sidebar`, `Page/Content`).

## 7. Enforcement
- `pnpm check:naming` (part of `pnpm lint`): block names equal the component name, part pattern, data-attribute allow-list, banned prop names.
- Unit test (renders every component): the `dv-*` parts in the DOM equal the manifest `anatomy` parts.
- Figma audit: layer, property and variant names equal the manifest; no default layer names.
