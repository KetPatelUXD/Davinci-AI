import './styles/index.css';

// Foundations
export * from './foundations/ThemeProvider';
export * from './foundations/AppBackground';
export * from './foundations/Icon';
export { BUILTIN_ICONS } from './foundations/icons/builtin';
export * from './foundations/DaVinciLogo';
export * from './foundations/Typography';
export * from './foundations/FocusRing';
export { useSpotlight, useCountUp, usePrefersReducedMotion, useElementSize } from './utils/hooks';
export { formatNumber, formatPercent, formatSigned } from './utils/format';
export { cn } from './utils/cn';

// Actions & inputs
export * from './components/actions/Button';
export * from './components/actions/IconButton';
export * from './components/actions/ButtonGroup';
export * from './components/actions/Link';
export * from './components/actions/ToggleButton';
export * from './components/actions/SegmentedControl';
export * from './components/actions/SideToggle';
export * from './components/actions/PillTabs';
export * from './components/inputs/Checkbox';
export * from './components/inputs/RadioGroup';
export * from './components/inputs/Switch';
export * from './components/inputs/TextField';
export * from './components/inputs/NumberField';
export * from './components/inputs/Select';
export * from './components/inputs/Date';
export * from './components/inputs/Slider';
export * from './components/inputs/FileUpload';
export * from './components/inputs/FormField';
export type { FieldProps, InputSize } from './components/inputs/shared';

// Display
export * from './components/display/Badge';
export * from './components/display/Chip';
export * from './components/display/DeltaPill';
export * from './components/display/CodeChip';
export * from './components/display/Avatar';
export * from './components/display/Kbd';
export * from './components/display/Divider';
export * from './components/display/Tooltip';
export * from './components/display/Skeleton';
export * from './components/display/Spinner';
export * from './components/display/Progress';
export * from './components/display/EmptyState';
export * from './components/display/Callout';

// Navigation
export * from './components/navigation/AppHeader';
export * from './components/navigation/PageHeader';
export * from './components/navigation/SideNav';
export * from './components/navigation/Tabs';
export * from './components/navigation/Breadcrumbs';
export * from './components/navigation/Pagination';
export * from './components/navigation/Stepper';
export * from './components/navigation/Menu';
export * from './components/navigation/CommandPalette';

// Overlays & feedback
export * from './components/overlays/Popover';
export * from './components/overlays/Dialog';
export * from './components/overlays/Drawer';
export * from './components/overlays/Toast';
export * from './components/overlays/Alert';

// Layout
export * from './components/layout/Card';
export * from './components/layout/Panel';
export * from './components/layout/AccentTile';
export * from './components/layout/Stack';
export * from './components/layout/Toolbar';
export * from './components/layout/SplitPane';
export * from './components/layout/ScrollArea';
export * from './components/layout/Disclosure';
export * from './components/layout/AppShell';

// Data
export * from './components/data/Table';
export * from './components/data/List';

// Finance
export * from './components/finance/Sparkline';
export * from './components/finance/PriceChange';
export * from './components/finance/DayRange';
export * from './components/finance/Stat';
export * from './components/finance/QuoteCard';
export * from './components/finance/PriceChart';
export * from './components/finance/DonutChart';
export * from './components/finance/TimeRangeSelector';
export * from './components/finance/MarketPulse';
export * from './components/finance/FilterBar';
export * from './components/finance/ChartPanel';
export * from './components/finance/Watchlist';
export * from './components/finance/News';
export * from './components/finance/ArticleView';
export * from './components/finance/OrderTicket';
export * from './components/finance/TickerTape';

// Chat / AI
export * from './components/chat/ChatThread';
export * from './components/chat/ChatMessage';
export * from './components/chat/StreamingText';
export * from './components/chat/MessageActions';
export * from './components/chat/Composer';
export * from './components/chat/SuggestedPrompts';
export * from './components/chat/Blocks';

export { compileTheme, validateTheme } from './theme';
export type { ThemeConfig, CompiledTheme } from './theme';
