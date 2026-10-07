# DaVinci.AI – what it is and why it matters

For product managers and business stakeholders. No technical background needed.

## In one paragraph

DaVinci.AI is a shared kit of ready-made screen parts (buttons, forms, tables, charts, market widgets, AI chat) with one consistent look, built for data-heavy financial products. Teams assemble screens from these parts instead of designing and building each piece again. The look, accessibility and behaviour are decided once and apply everywhere.

## What you get today

- **133 ready-made components**: forms and inputs (25), market and finance widgets (19), display elements (16), layout (13), AI chat (12), navigation (11), and more.
- **Finance-specific pieces**: price and change indicators, watchlists, quote cards, order ticket, price charts, news list, ticker tape, market pulse.
- **AI assistant pieces**: chat thread, message actions, reasoning and tool-use blocks, citations, a prompt composer, an artifact panel.
- **Dark and light modes**, with dark as the default experience. Also a colour-blind-safe mode and a red-up/green-down switch for markets with the opposite convention.
- **A complete design file in Figma** that matches the code piece by piece.
- **A working Markets dashboard example** to show how a real page is assembled.
- **A living catalogue (Storybook)** where anyone can see every component, every variant and every state, and try it.

## Business value

| Value | How the system delivers it |
|---|---|
| **Faster delivery** | Teams compose screens from tested parts rather than building from scratch. A new feature starts from existing pieces. |
| **Consistency** | One look and one set of behaviours across products. Customers see one product family. |
| **Accessibility built in** | Contrast, keyboard use, screen-reader labels and touch-target sizes are checked automatically on every component. This reduces the risk of accessibility complaints and supports regulatory expectations such as WCAG 2.2 AA. |
| **Design and engineering stay aligned** | The Figma file and the code come from the same source. Designers and developers talk about the same named things. |
| **Rebranding is cheap** | The brand colour is one setting. A command generates a new theme and checks that it still meets accessibility contrast rules. |
| **AI-assisted development** | The library ships a machine-readable description of every component and rules for AI coding assistants, so generated screens use the right parts and follow the rules from the first attempt. |
| **Lower long-term cost** | Fixing something once fixes it everywhere. Less duplicated work and fewer one-off variants to maintain. |

## How a team uses it

1. Install the package and switch on the theme (the setup guide, `INSTALL.md`, takes about 10 minutes).
2. Build screens by combining components. Do not create custom-styled lookalikes.
3. If a needed component is missing, it is added to the library first, so every team benefits.
4. Check the result in dark and light.

## What it does not do yet

Be aware of these when planning:

- **Not published yet.** It is a version 0.1.0 package shared as a file. A private registry is planned. Until then, rollout needs a coordinator.
- **React only.** Teams on other frameworks (for example Angular) would need extra work: wrapping the React components or porting them.
- **No very-large-table support yet.** Tables with many thousands of rows need work (virtual scrolling) and an AG Grid theme is not built.
- **Limited chart types.** Price charts, sparklines and donuts exist; comparison charts and candlesticks do not.
- **One visual style (Graphite).**

## How to measure whether it pays off

The repository does not contain adoption or time-saving data, so these are suggestions, not results:

- Time from design hand-off to a working screen, before and after.
- Share of screens built entirely from library components.
- Number of accessibility defects per release.
- Number of custom components that were promoted into the library.
- Time to apply a brand change across a product.

## Suggested next steps for a product owner

1. Pick one pilot product and one or two teams.
2. Decide how the package is distributed (private registry).
3. Prioritise the gaps above against upcoming roadmap needs (large tables, charts, other frameworks).
4. Agree who owns the library: who reviews additions and decides what gets promoted.

## Terms

- **Design system:** the shared set of design rules and ready-made parts.
- **Component:** one reusable piece of screen, such as a button or a table.
- **Token:** a named design value, such as "brand colour" or "card corner radius". Change it once and everything using it updates.
- **Storybook:** the browsable catalogue of components.
- **Accessibility (WCAG 2.2 AA):** an international standard so people with disabilities can use the product.
