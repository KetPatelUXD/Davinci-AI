---
'@davinci-ai/react': patch
---

Fix horizontal `Divider` having no height (RAC omits `aria-orientation` for horizontal; now styled by `data-orientation`), and scope the range-only `border-radius: 0` rule so the selected day in a single-date `Calendar` stays round. Add Storybook `Internal/Extract*` hosts used to generate the Figma kit.
