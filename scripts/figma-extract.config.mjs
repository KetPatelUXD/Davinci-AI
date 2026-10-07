/**
 * What to render for each component when extracting the Figma spec.
 *   story  Storybook story id used as the rendering host
 *   args   Storybook URL args that switch optional slots on (so every part exists in the DOM)
 *   root   selector of the component root (its `dv-{block}` class)
 *   axes   data-attributes to vary (mirror the VARIANT props of the manifest)
 *   states React Aria state attributes to force: default hovered pressed focus-visible disabled selected invalid
 */
/** Sets which option of a segmented track is selected (1-based), moves the thumb, and applies the interaction state to the options. */
function SEG_APPLY(indexExpr) {
  return `const opts = [...el.querySelectorAll('.dv-segmented-control__option')]; const sel = (${indexExpr}) - 1; const root = el.classList.contains('dv-segmented-control') ? el : el.querySelector('.dv-segmented-control');
  opts.forEach((o, i) => { for (const a of ['data-hovered', 'data-focus-visible', 'data-disabled']) o.removeAttribute(a); if (i === sel) o.setAttribute('data-selected', 'true'); else o.removeAttribute('data-selected'); });
  const th = el.querySelector('.dv-segmented-control__thumb'); const so = opts[sel]; if (th) th.style.display = 'none'; root.removeAttribute('data-ready'); /* before JS runs the selected option paints the on-fill itself: robust in Figma (no animated thumb) */
  if (state === 'hovered') opts[sel === 0 ? 1 : 0].setAttribute('data-hovered', 'true');
  if (state === 'focus-visible') so.setAttribute('data-focus-visible', 'true');
  if (state === 'disabled') opts.forEach((o) => o.setAttribute('data-disabled', 'true'));`;
}


/** Field-like inputs: sample instances per state live in the Extract story (wrapper ids = state roots). */
const FIELD_STATES = ['default', 'hovered', 'focus-visible', 'disabled', 'read-only', 'invalid'];
function field(story, rootCls, states, o = {}) {
  const own = ['invalid', 'disabled', 'read-only', 'selected', 'indeterminate'].filter((x) => states.includes(x));
  return {
    story, root: `#default ${rootCls}`, axes: o.axes ?? { size: ['sm', 'md', 'lg'] }, states,
    stateRoots: Object.fromEntries(own.map((x) => [x, `#${x} ${rootCls}`])),
    force: o.force ?? { hovered: ['.dv-input', 'data-hovered'], 'focus-visible': ['.dv-input', 'data-focus-within'] },
    ...(o.extra ?? {}),
  };
}

/** TEXT / INSTANCE_SWAP / BOOLEAN property links per layer name (manifest prop names). */
const FIELD_LINKS = { Label: { text: 'label' }, Hint: { text: 'description' }, Message: { text: 'errorMessage' }, Value: { text: 'placeholder' }, Prefix: { text: 'prefix' }, Suffix: { text: 'suffix' }, Icon: { swap: 'iconStart', vis: 'hasIconStart' } };

export const targets = {
  Button: {
    story: 'internal-extract--button-full', root: '.dv-button',
    axes: { variant: ['solid', 'subtle', 'ghost'], intent: ['primary', 'neutral', 'brand', 'positive', 'negative', 'destructive'], size: ['sm', 'md', 'lg', 'xl'] },
    states: ['default', 'hovered', 'pressed', 'focus-visible', 'disabled'],
  },
  IconButton: {
    story: 'internal-extract--icon-button-full', root: '.dv-icon-button',
    axes: { variant: ['subtle', 'ghost', 'solid'], size: ['sm', 'md', 'lg'] },
    states: ['default', 'hovered', 'pressed', 'focus-visible', 'disabled'],
  },
  ButtonGroup: {
    story: 'internal-extract--button-group-full', root: '.dv-button-group',
    axes: { attached: ['false', 'true'] }, noAttr: ['attached'], instances: { '.dv-button': 'Button' },
    apply: "if (combo.attached === 'true') el.setAttribute('data-attached', 'true'); else el.removeAttribute('data-attached');",
  },
  Link: {
    story: 'internal-extract--link-full', root: '.dv-link',
    axes: { intent: ['inherit', 'brand'] }, states: ['default', 'hovered', 'focus-visible', 'disabled'],
    rename: { IconEnd: 'ExternalIcon' },
  },
  ToggleButton: {
    story: 'internal-extract--toggle-button-full', root: '.dv-toggle-button',
    axes: { size: ['sm', 'md', 'lg', 'xl'] }, states: ['default', 'hovered', 'pressed', 'focus-visible', 'selected', 'disabled'],
    rename: { IconStart: 'Icon' },
  },
  SegmentedControl: {
    story: 'internal-extract--segmented-control-full', root: '.dv-segmented-control',
    axes: { size: ['sm', 'md', 'lg'], selected: ['1', '2', '3'] }, noAttr: ['selected'], states: ['default', 'hovered', 'focus-visible', 'disabled'],
    apply: SEG_APPLY('combo.selected'),
  },
  SideToggle: {
    story: 'internal-extract--side-toggle-full', root: '.dv-segmented-control', fixRootWidth: true,
    axes: { size: ['sm', 'md', 'lg'], value: ['buy', 'sell'] }, noAttr: ['value'], states: ['default', 'hovered', 'focus-visible'],
    apply: SEG_APPLY("(combo.value === 'sell' ? 2 : 1)"),
  },
  PillTabs: {
    story: 'internal-extract--pill-tabs-full', root: '.dv-pill-tabs', fixRootWidth: true,
    axes: { size: ['sm', 'md', 'lg'], selected: ['1', '2', '3'] }, noAttr: ['size', 'selected'], instances: { '.dv-segmented-control': 'SegmentedControl' }, rename: { SegmentedControl: 'TabList' },
    apply: "const sc = el.querySelector('.dv-segmented-control'); sc.setAttribute('data-size', combo.size); sc.setAttribute('data-selected-index', combo.selected);",
  },
  Checkbox: field('internal-extract--checkbox-full', '.dv-checkbox', ['default', 'hovered', 'focus-visible', 'selected', 'indeterminate', 'disabled', 'invalid'], { axes: {}, force: {} }),
  CheckboxGroup: field('internal-extract--checkbox-group-full', '.dv-checkbox-group', ['default', 'invalid', 'disabled'], { axes: { orientation: ['vertical', 'horizontal'] }, force: {}, extra: { instances: { '.dv-checkbox': 'Checkbox' } } }),
  RadioGroup: field('internal-extract--radio-group-full', '.dv-radio-group', ['default', 'hovered', 'focus-visible', 'selected', 'disabled', 'invalid'], { axes: {}, force: { hovered: ['.dv-radio-group__radio', 'data-hovered'], 'focus-visible': ['.dv-radio-group__radio', 'data-focus-visible'] } }),
  Switch: field('internal-extract--switch-full', '.dv-switch', ['default', 'hovered', 'focus-visible', 'selected', 'disabled'], { axes: {}, force: {} }),
  SwitchRow: field('internal-extract--switch-row-full', '.dv-switch-row', ['default', 'selected', 'disabled'], { axes: {}, force: {}, extra: { instances: { '.dv-switch': 'Switch' } } }),
  TextField: field('internal-extract--text-field-full', '.dv-text-field', FIELD_STATES),
  TextArea: field('internal-extract--text-area-full', '.dv-text-area', FIELD_STATES),
  PasswordField: field('internal-extract--password-field-full', '.dv-password-field', ['default', 'focus-visible', 'invalid', 'disabled']),
  SearchField: field('internal-extract--search-field-full', '.dv-search-field', ['default', 'hovered', 'focus-visible', 'disabled']),
  NumberField: field('internal-extract--number-field-full', '.dv-number-field', ['default', 'hovered', 'focus-visible', 'disabled', 'invalid']),
  PriceField: field('internal-extract--price-field-full', '.dv-price-field', ['default', 'focus-visible', 'invalid', 'disabled']),
  Select: field('internal-extract--select-full', '.dv-select', ['default', 'hovered', 'focus-visible', 'disabled', 'invalid'], { force: { hovered: ['.dv-select__trigger', 'data-hovered'], 'focus-visible': ['.dv-select__trigger', 'data-focus-visible'] } }),
  ComboBox: field('internal-extract--combo-box-full', '.dv-combo-box', ['default', 'focus-visible', 'disabled', 'invalid']),
  MultiSelect: field('internal-extract--multi-select-full', '.dv-multi-select', ['default', 'focus-visible', 'disabled'], { force: { 'focus-visible': ['.dv-select__trigger', 'data-focus-visible'] } }),
  DatePicker: field('internal-extract--date-picker-full', '.dv-date-picker', ['default', 'focus-visible', 'disabled', 'invalid'], { force: { 'focus-visible': ['.dv-dateinput', 'data-focus-within'] } }),
  DateRangePicker: field('internal-extract--date-range-picker-full', '.dv-date-range-picker', ['default', 'focus-visible', 'disabled', 'invalid'], { force: { 'focus-visible': ['.dv-dateinput', 'data-focus-within'] } }),
  TimeField: field('internal-extract--time-field-full', '.dv-time-field', ['default', 'focus-visible', 'disabled', 'invalid'], { force: { 'focus-visible': ['.dv-dateinput', 'data-focus-within'] } }),
  Calendar: { story: 'internal-extract--calendar-full', root: '#default .dv-calendar', axes: {}, states: ['default'], instances: { '.dv-icon-button': 'IconButton' } },
  RangeCalendar: { story: 'internal-extract--range-calendar-full', root: '#default .dv-range-calendar', axes: {}, states: ['default'], instances: { '.dv-icon-button': 'IconButton' } },
  Slider: field('internal-extract--slider-full', '.dv-slider', ['default', 'hovered', 'focus-visible', 'dragging', 'disabled'], { axes: {}, extra: { stateRoots: { disabled: '#disabled .dv-slider' } }, force: { hovered: ['.dv-slider__thumb', 'data-hovered'], 'focus-visible': ['.dv-slider__thumb', 'data-focus-visible'], dragging: ['.dv-slider__thumb', 'data-dragging'] } }),
  RangeSlider: field('internal-extract--range-slider-full', '.dv-range-slider', ['default', 'focus-visible', 'dragging', 'disabled'], { axes: {}, extra: { stateRoots: { disabled: '#disabled .dv-range-slider' } }, force: { 'focus-visible': ['.dv-slider__thumb', 'data-focus-visible'], dragging: ['.dv-slider__thumb', 'data-dragging'] } }),
  FileUpload: field('internal-extract--file-upload-full', '.dv-file-upload', ['default', 'drop-target', 'disabled', 'invalid'], { axes: {}, force: { 'drop-target': ['.dv-file-upload__drop-zone', 'data-drop-target'] }, extra: { instances: { '.dv-button': 'Button' } } }),
  FormField: field('internal-extract--form-field-full', '.dv-form-field', ['default', 'invalid'], { axes: {}, force: {} }),
  Form: { story: 'internal-extract--form-full', root: '#default .dv-form', axes: { layout: ['dense', 'sparse'] }, states: ['default'], instances: { '.dv-form-field': 'FormField' } },
  Fieldset: { story: 'internal-extract--fieldset-full', root: '#default .dv-fieldset', axes: {}, states: ['default'], instances: { '.dv-form-field': 'FormField' } },
};
// property links (applied after the table so the helper stays readable)
const L = (names, links) => { for (const n of names) targets[n].links = links; };
L(['TextField', 'TextArea', 'PasswordField', 'SearchField', 'NumberField', 'PriceField', 'ComboBox', 'Select', 'DatePicker', 'DateRangePicker', 'TimeField', 'MultiSelect', 'FormField', 'CheckboxGroup', 'RadioGroup'], FIELD_LINKS);
targets.Checkbox.links = { Title: { text: 'label' }, Hint: { text: 'description' } };
targets.Switch.links = { Label: { text: 'label' } };
targets.SwitchRow.links = { Title: { text: 'title' }, Hint: { text: 'hint' } };
targets.Slider.links = { Label: { text: 'label' }, Output: { vis: 'showOutput' } };
targets.RangeSlider.links = { Label: { text: 'label' }, Output: { vis: 'showOutput' } };
targets.FileUpload.links = { Label: { text: 'label' }, Hint: { text: 'description' }, Message: { text: 'errorMessage' } };
targets.Fieldset.links = { Legend: { text: 'legend' }, Hint: { text: 'description' } };
targets.Calendar.links = {}; targets.RangeCalendar.links = {}; targets.Form.links = {};

/** Instances in one Extract story (wrapper ids = state roots), no variant axes. */
function states(story, rootCls, list, o = {}) {
  return { story, root: `#${list[0]} ${rootCls}`, axes: o.axes ?? {}, states: list, stateRoots: Object.fromEntries(list.map((x) => [x, `#${x} ${rootCls}`])), ...(o.extra ?? {}) };
}
const simple = (story, root, o = {}) => ({ story: `internal-extract-display--${story}`, root, axes: o.axes ?? {}, states: o.states ?? ['default'], ...(o.extra ?? {}) });
const D = (s) => `internal-extract-display--${s}`;
const INTENTS = ['neutral', 'brand', 'positive', 'negative', 'warning', 'info'];

Object.assign(targets, {
  Badge: simple('badge-full', '.dv-badge', { axes: { variant: ['subtle', 'solid', 'outline'], intent: INTENTS, size: ['sm', 'md'] } }),
  Chip: simple('chip-full', '.dv-chip', { extra: { instances: { '.dv-icon-button': 'IconButton' } } }),
  DeltaPill: states(D('delta-pill-full'), '.dv-delta-pill', ['up', 'down', 'flat']),
  CodeChip: simple('code-chip-full', '.dv-code-chip'),
  Avatar: simple('avatar-full', '.dv-avatar', { axes: { size: ['sm', 'md', 'lg'] } }),
  AvatarGroup: simple('avatar-group-full', '.dv-avatar-group', { axes: { size: ['sm', 'md', 'lg'] }, extra: { instances: { '.dv-avatar': 'Avatar' } } }),
  Kbd: simple('kbd-full', '.dv-kbd'),
  Divider: { story: D('divider-full'), root: '#h .dv-divider', axes: { orientation: ['horizontal', 'vertical'] }, states: ['default'], stateRoots: {}, apply: "el.setAttribute('data-orientation', combo.orientation);" },
  Tooltip: simple('tooltip-full', '.dv-tooltip'),
  Skeleton: simple('skeleton-full', '.dv-skeleton'),
  Spinner: simple('spinner-full', '.dv-spinner', { axes: { size: ['sm', 'md', 'lg'] }, extra: { rename: { Group: 'Ring' } } }),
  ProgressBar: states(D('progress-bar-full'), '.dv-progress-bar', ['default', 'indeterminate'], { axes: { intent: INTENTS } }),
  ProgressCircle: states(D('progress-circle-full'), '.dv-progress-circle', ['default', 'indeterminate'], { axes: { intent: INTENTS }, extra: { rename: { Group: 'Ring', Spin: 'Ring' } } }),
  Meter: states(D('meter-full'), '.dv-progress-bar', ['default', 'warning', 'critical']),
  EmptyState: simple('empty-state-full', '.dv-empty-state', { extra: { instances: { '.dv-button': 'Button' } } }),
  Callout: states(D('callout-full'), '.dv-callout', INTENTS, { extra: { stateAs: 'intent', instances: { '.dv-button': 'Button' } } }),
});
targets.Badge.links = { Label: { text: 'children' } };
targets.Callout.links = { Title: { text: 'title' } };
targets.EmptyState.links = { Title: { text: 'title' }, Description: { text: 'description' } };

const SH = (x) => `internal-extract-shell--${x}`;
const stateInst = (story, root, list, extra = {}) => states(story, root, list, { extra });
Object.assign(targets, {
  AppHeader: { story: SH('app-header-full'), root: '.dv-app-header', axes: {}, states: ['default'], fixRootWidth: true, instances: { '.dv-icon-button': 'IconButton', '.dv-user-chip': 'UserChip' } },
  UserChip: { story: SH('user-chip-full'), root: '.dv-user-chip', axes: {}, states: ['default', 'hovered', 'focus-visible'], instances: { '.dv-avatar': 'Avatar' } },
  PageHeader: { story: SH('page-header-full'), root: '.dv-page-header', axes: {}, states: ['default'], fixRootWidth: true, instances: { '.dv-button': 'Button' } },
  SideNav: stateInst(SH('side-nav-full'), '.dv-side-nav', ['default', 'collapsed']),
  Tabs: { story: SH('tabs-full'), root: '.dv-tabs', axes: { orientation: ['horizontal', 'vertical'] }, states: ['default'], fixRootWidth: true },
  Breadcrumbs: { story: SH('breadcrumbs-full'), root: '.dv-breadcrumbs', axes: {}, states: ['default'] },
  Pagination: { story: SH('pagination-full'), root: '.dv-pagination', axes: {}, states: ['default'], instances: { '.dv-icon-button': 'IconButton' }, names: { '[aria-label="Previous page"]': 'Previous', '[aria-label="Next page"]': 'Next' } },
  Stepper: { story: SH('stepper-full'), root: '.dv-stepper', axes: { orientation: ['horizontal', 'vertical'] }, states: ['default'] },
  Menu: { story: SH('menu-full'), root: '.dv-popover', open: '#open-trigger', axes: {}, states: ['default'], names: { '.dv-menu': 'List' } },
  CommandPalette: { story: SH('command-palette-full'), root: '.dv-command-palette', axes: {}, states: ['default'] },
  Popover: { story: SH('popover-full'), root: '.dv-popover', axes: {}, states: ['default'], instances: {} },
  Dialog: { story: SH('dialog-full'), root: '.dv-dialog__modal', fixRootWidth: true, names: { '.dv-dialog': 'Content' }, axes: { size: ['sm', 'md', 'lg'] }, states: ['default'], instances: { '.dv-icon-button': 'IconButton', '.dv-button': 'Button', '.dv-text-field': 'TextField' } },
  ConfirmDialog: { story: SH('confirm-dialog-full'), root: '.dv-dialog__modal', fixRootWidth: true, names: { '.dv-dialog': 'Content' }, rename: { Header: 'Title' }, axes: {}, states: ['default'], instances: { '.dv-icon-button': 'IconButton', '.dv-button': 'Button' } },
  Drawer: { story: SH('drawer-full'), root: '.dv-drawer', axes: {}, states: ['default'], names: { '.dv-dialog': 'Dialog' }, instances: { '.dv-icon-button': 'IconButton', '.dv-button': 'Button' } },
  Alert: states(SH('alert-full'), '.dv-alert', INTENTS, { extra: { stateAs: 'intent', instances: { '.dv-icon-button': 'IconButton' } } }),
  Banner: states(SH('banner-full'), '.dv-banner', INTENTS, { extra: { stateAs: 'intent', fixRootWidth: true, instances: { '.dv-icon-button': 'IconButton', '.dv-button': 'Button' } } }),
  InlineMessage: states(SH('inline-message-full'), '.dv-inline-message', INTENTS, { extra: { stateAs: 'intent' } }),
  Card: { story: SH('card-full'), root: '.dv-card', axes: {}, states: ['default'], instances: { '.dv-icon-button': 'IconButton' } },
  Panel: { story: SH('panel-full'), root: '.dv-panel', axes: {}, states: ['default'] },
  AccentTile: { story: SH('accent-tile-full'), root: '.dv-accent-tile', axes: { intent: INTENTS }, states: ['default', 'hovered', 'focus-visible'] },
  Toolbar: { story: SH('toolbar-full'), root: '.dv-toolbar', axes: {}, states: ['default'], instances: { '.dv-icon-button': 'IconButton' } },
  SplitPane: { story: SH('split-pane-full'), root: '.dv-split-pane', axes: {}, states: ['default', 'hovered', 'focus-visible', 'dragging'], fixRootWidth: true, instances: { '.dv-panel': 'Panel' }, names: { '.dv-split-pane__pane': 'Pane' }, force: { hovered: ['.dv-split-pane__handle', 'data-hovered'], 'focus-visible': ['.dv-split-pane__handle', 'data-focus-visible'], dragging: ['.dv-split-pane__handle', 'data-dragging'] } },
  ScrollArea: { story: SH('scroll-area-full'), root: '.dv-scroll-area', axes: {}, states: ['default'] },
  Disclosure: stateInst(SH('disclosure-full'), '.dv-disclosure', ['default', 'expanded']),
  Accordion: { story: SH('accordion-full'), root: '.dv-accordion', axes: {}, states: ['default'], instances: { '.dv-disclosure': 'Disclosure' } },
  CollapsibleSection: stateInst(SH('collapsible-section-full'), '.dv-collapsible-section', ['default', 'expanded']),
  Table: { story: SH('table-full'), root: '.dv-table', axes: {}, states: ['default'], fixRootWidth: true },
  TableToolbar: { story: SH('table-toolbar-full'), root: '.dv-table__toolbar', axes: {}, states: ['default'], fixRootWidth: true, instances: { '.dv-segmented-control': 'SegmentedControl', '.dv-search-field': 'SearchField' } },
  AssetCell: { story: SH('asset-cell-full'), root: '.dv-asset-cell', axes: {}, states: ['default'] },
  RowActions: { story: SH('row-actions-full'), root: '.dv-row-actions', axes: {}, states: ['default'] },
  List: { story: SH('list-full'), root: '.dv-list', axes: {}, states: ['default'], instances: { '.dv-badge': 'Badge' } },
  TreeView: { story: SH('tree-view-full'), root: '.dv-tree-view', axes: {}, states: ['default'] },
  DescriptionList: stateInst(SH('description-list-full'), '.dv-description-list', ['inline', 'stacked'], { stateAs: 'layout' }),
});

targets.ToastProvider = { story: SH('toast-provider-full'), root: '.dv-toast-provider__toast', axes: {}, states: INTENTS, stateRoots: Object.fromEntries(INTENTS.map((i) => [i, `.dv-toast-provider__toast[data-intent="${i}"]`])), stateAs: 'intent', instances: { '.dv-icon-button': 'IconButton' } };

Object.assign(targets, {
  Stack: states(SH('stack-full'), '.dv-stack', ['vertical', 'horizontal'], { extra: { stateAs: 'orientation', instances: { '.dv-panel': 'Panel' } } }),
  Grid: { story: SH('grid-full'), root: '.dv-grid', axes: {}, states: ['default'], fixRootWidth: true, instances: { '.dv-panel': 'Panel' } },
  AppShell: { story: SH('app-shell-full'), root: '.dv-app-shell', axes: {}, states: ['default'], fixRootWidth: true, instances: { '.dv-app-header': 'AppHeader', '.dv-side-nav': 'SideNav', '.dv-page-header': 'PageHeader' } },
});

const FN = (x) => `internal-extract-finance--${x}`;
Object.assign(targets, {
  Sparkline: states(FN('sparkline-full'), '.dv-sparkline', ['mono', 'up', 'down'], { extra: { stateAs: 'intent' } }),
  PriceChange: states(FN('price-change-full'), '.dv-price-change', ['up', 'down', 'flat']),
  PriceFlash: { story: FN('price-flash-full'), root: '.dv-price-flash', axes: {}, states: ['default'] },
  DayRange: states(FN('day-range-full'), '.dv-day-range', ['marker', 'bar'], { extra: { stateAs: 'variant' } }),
  Stat: states(FN('stat-full'), '.dv-stat', ['sm', 'md', 'lg'], { extra: { stateAs: 'size', instances: { '.dv-sparkline': 'Sparkline', '.dv-delta-pill': 'DeltaPill' } } }),
  QuoteCard: { story: FN('quote-card-full'), root: '.dv-quote-card', axes: {}, states: ['default'], fixRootWidth: true, instances: { '.dv-price-chart': 'PriceChart', '.dv-time-range-selector': 'TimeRangeSelector', '.dv-delta-pill': 'DeltaPill', '.dv-day-range': 'DayRange' } },
  PriceChart: { story: FN('price-chart-full'), root: '.dv-price-chart', axes: {}, states: ['default'], fixRootWidth: true },
  DonutChart: { story: FN('donut-chart-full'), root: '.dv-donut-chart', axes: {}, states: ['default'], instances: { '.dv-chart-legend': 'ChartLegend' } },
  ChartLegend: { story: FN('chart-legend-full'), root: '.dv-chart-legend', axes: {}, states: ['default'] },
  TimeRangeSelector: { story: FN('time-range-selector-full'), root: '.dv-time-range-selector', axes: { size: ['sm', 'md', 'lg'] }, states: ['default'], instances: {} },
  MarketPulse: { story: FN('market-pulse-full'), root: '.dv-market-pulse', axes: {}, states: ['default'], fixRootWidth: true },
  FilterBar: { story: FN('filter-bar-full'), root: '.dv-filter-bar', axes: {}, states: ['default'], fixRootWidth: true, instances: { '.dv-button': 'Button' } },
  ChartPanel: { story: FN('chart-panel-full'), root: '.dv-chart-panel', axes: {}, states: ['default'], fixRootWidth: true, instances: { '.dv-price-chart': 'PriceChart', '.dv-time-range-selector': 'TimeRangeSelector' } },
  Watchlist: { story: FN('watchlist-full'), root: '.dv-watchlist', axes: {}, states: ['default'], fixRootWidth: true, instances: { '.dv-watchlist__row': 'WatchlistRow' } },
  WatchlistRow: { story: FN('watchlist-row-full'), root: '.dv-watchlist__row', axes: {}, states: ['default', 'hovered', 'selected', 'focus-visible'], fixRootWidth: true, instances: { '.dv-code-chip': 'CodeChip', '.dv-sparkline': 'Sparkline', '.dv-price-change': 'PriceChange' } },
  NewsList: { story: FN('news-list-full'), root: '.dv-news-list', axes: {}, states: ['default'], fixRootWidth: true },
  ArticleView: { story: FN('article-view-full'), root: '.dv-article-view', axes: {}, states: ['default'], fixRootWidth: true, instances: { '.dv-button': 'Button', '.dv-badge': 'Badge' } },
  NewsItem: { story: FN('news-item-full'), root: '.dv-news-list__item', axes: {}, states: ['default'], fixRootWidth: true },
  OrderTicket: states(FN('order-ticket-full'), '.dv-order-ticket', ['buy', 'sell'], { extra: { stateAs: 'side', fixRootWidth: true, instances: { '.dv-segmented-control': 'SegmentedControl', '.dv-switch-row': 'SwitchRow', '.dv-number-field': 'NumberField', '.dv-price-field': 'PriceField', '.dv-select': 'Select', '.dv-button': 'Button', '.dv-panel': 'Panel' } } }),
  TickerTape: { story: FN('ticker-tape-full'), root: '.dv-ticker-tape', axes: {}, states: ['default'], fixRootWidth: true },
});

targets.DayRange = { story: FN('day-range-full'), root: '#marker .dv-day-range', axes: {}, states: ['marker', 'bar'], stateRoots: { marker: '#marker .dv-day-range', bar: '#bar .dv-day-range__bar' }, stateAs: 'variant' };
targets.TimeRangeSelector = { story: FN('time-range-selector-full'), root: '.dv-segmented-control', axes: { size: ['sm', 'md', 'lg'] }, states: ['default', 'hovered', 'focus-visible', 'disabled'], apply: SEG_APPLY('3') };

const TRS = { '.dv-segmented-control': 'TimeRangeSelector' };
Object.assign(targets.DayRange, { names: { 'i': 'Marker' } });
Object.assign(targets.ChartLegend, { names: { 'i': 'Swatch', '.dv-chart-legend__row > b': 'Value', '.dv-chart-legend__row > span:first-of-type': 'Label' } });
Object.assign(targets.QuoteCard, { names: { '.dv-quote-card__top > div:first-child': 'Heading', '.dv-quote-card__stats > div': 'Stat' }, instances: { ...targets.QuoteCard.instances, ...TRS } });
Object.assign(targets.DonutChart, { names: { '.dv-donut-chart__center > div': 'Content' } });
Object.assign(targets.OrderTicket, { names: { '.dv-order-ticket__summary > div': 'Row' } });
Object.assign(targets.MarketPulse, { instances: { '.dv-delta-pill': 'DeltaPill' } });
Object.assign(targets.ChartPanel, { instances: { ...targets.ChartPanel.instances, ...TRS } });
Object.assign(targets.Stat, { names: {} });
targets.Sparkline.rename = { SparklineIcon: 'Plot' }; targets.PriceChart.rename = { PriceChartIcon: 'Plot' };

Object.assign(targets.QuoteCard, { instances: { ...targets.QuoteCard.instances, '.dv-day-range__bar': 'DayRange' } });

targets.DonutChart.rename = { RingIcon: 'Plot' };

Object.assign(targets.MarketPulse, { instances: { '.dv-delta-pill': 'DeltaPill', '.dv-accent-tile': 'AccentTile' } });

Object.assign(targets.OrderTicket, { instances: { '.dv-switch-row': 'SwitchRow', '.dv-segmented-control': 'SegmentedControl', '.dv-number-field': 'NumberField', '.dv-price-field': 'PriceField', '.dv-select': 'Select', '.dv-button': 'Button' } });
Object.assign(targets.NewsList, { instances: { '.dv-news-list__item': 'NewsItem' } });
Object.assign(targets.NewsItem, { instances: { '.dv-badge': 'Badge' } });
Object.assign(targets.TickerTape, { instances: { '.dv-code-chip': 'CodeChip', '.dv-price-change': 'PriceChange', '.dv-icon-button': 'IconButton' } });

Object.assign(targets.Table, { instances: { '.dv-asset-cell': 'AssetCell', '.dv-code-chip': 'CodeChip', '.dv-price-change': 'PriceChange', '.dv-row-actions': 'RowActions', '.dv-table__toolbar': 'TableToolbar' } });

Object.assign(targets.Table, { names: { '.dv-table__table': 'Grid', 'thead > tr': 'HeaderRow', 'tbody': 'Body' } });

const CH = (x) => `internal-extract-chat--${x}`;
Object.assign(targets, {
  Composer: states(CH('composer-full'), '.dv-composer', ['default', 'filled', 'streaming'], { extra: { fixRootWidth: true, instances: { '.dv-icon-button': 'IconButton', '.dv-button': 'Button', '.dv-chip': 'Chip' } } }),
  ChatThread: { story: CH('chat-thread-full'), root: '.dv-chat-thread', axes: {}, states: ['default'], fixRootWidth: true },
  ChatMessage: states(CH('chat-message-full'), '.dv-chat-message', ['user', 'assistant'], { extra: { stateAs: 'role', fixRootWidth: true, instances: { '.dv-icon-button': 'IconButton', '.dv-message-actions': 'MessageActions', '.dv-reasoning-block': 'ReasoningBlock', '.dv-avatar': 'Avatar', '.dv-prose': 'Prose' } } }),
  StreamingText: states(CH('streaming-text-full'), '.dv-streaming-text', ['streaming', 'done']),
  MessageActions: { story: CH('message-actions-full'), root: '.dv-message-actions', axes: {}, states: ['default'], instances: { '.dv-icon-button': 'IconButton' } },
  SuggestedPrompts: { story: CH('suggested-prompts-full'), root: '.dv-suggested-prompts', axes: {}, states: ['default'], fixRootWidth: true },
  Prose: { story: CH('prose-full'), root: '.dv-prose', axes: {}, states: ['default'], fixRootWidth: true },
  CodeBlock: states(CH('code-block-full'), '.dv-code-block', ['default'], { extra: { instances: { '.dv-icon-button': 'IconButton' } } }),
  ReasoningBlock: states(CH('reasoning-block-full'), '.dv-reasoning-block', ['default', 'expanded', 'streaming']),
  ToolUseBlock: states(CH('tool-use-block-full'), '.dv-tool-use-block', ['running', 'success', 'error', 'expanded'], { extra: { stateAs: 'status' } }),
  CitationChip: { story: CH('citation-chip-full'), root: '.dv-citation-chip', axes: {}, states: ['default'] },
  ArtifactPanel: { story: CH('artifact-panel-full'), root: '.dv-artifact-panel', axes: {}, states: ['default'], fixRootWidth: true, instances: { '.dv-icon-button': 'IconButton', '.dv-prose': 'Prose' } },
});

targets.ReasoningBlock = states(CH('reasoning-block-full'), '.dv-tool-use-block', ['default', 'expanded', 'streaming'], { extra: { rename: { Trigger: 'Trigger' } } });

Object.assign(targets.Composer, { names: { '.dv-composer__context > span': 'Label' } });

Object.assign(targets.MultiSelect, { instances: { '.dv-chip': 'Chip' } });
