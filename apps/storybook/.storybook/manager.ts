import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming/create';

/** Branded Storybook chrome: DaVinci.AI lockup, Graphite dark palette, violet accent. */
const theme = create({
  base: 'dark',
  brandTitle: 'DaVinci.AI',
  brandUrl: './',
  brandImage: 'davinci-lockup.svg',
  brandTarget: '_self',
  colorPrimary: '#A78BFA',
  colorSecondary: '#A78BFA',
  appBg: '#0B0B0D',
  appContentBg: '#060607',
  appPreviewBg: '#060607',
  appBorderColor: 'rgba(255,255,255,0.09)',
  appBorderRadius: 12,
  fontBase: "'Inter Variable', Inter, system-ui, sans-serif",
  textColor: '#F5F5F6',
  textMutedColor: '#ABABB3',
  barBg: '#0B0B0D',
  barTextColor: '#ABABB3',
  barSelectedColor: '#F4F4F6',
  inputBg: '#131315',
  inputBorder: '#75757D',
  inputTextColor: '#F5F5F6',
});

addons.setConfig({ theme });
