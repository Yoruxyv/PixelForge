# PixelForge Frontend Design System

This document defines the visual and interaction foundation for PixelForge. It
is intentionally narrower than a component catalog: tokens and rules live here,
while feature-specific UI remains with its owning feature.

## Product direction

PixelForge is a creative image-processing workstation. The interface should
make the active image and the current task more prominent than marketing copy,
decoration, or AI branding.

The intended flow is:

```text
upload -> process or edit -> inspect or compare -> export
```

[Squoosh](https://squoosh.app/) is the primary reference for image-first
workspace structure, compact controls, and a direct input/output relationship.
[Clipdrop](https://clipdrop.co/) is used only for clear tool naming and
discovery. PixelForge does not copy either product's branding or visual style.

## Design principles

1. **Image first.** Once an image is selected, it becomes the dominant visual.
2. **Task first.** Controls, progress, comparison, and export remain near the
   image and appear in workflow order.
3. **Restrained identity.** Pink and violet may support the brand, but the
   working canvas uses quiet neutral surfaces and one primary accent.
4. **State is part of the design.** Empty, invalid, loading, processing,
   complete, expired, disabled, and restored states must be intentional.
5. **Feature ownership remains visible.** Shared presentation may standardize a
   proven pattern; it must not absorb unique feature behavior.

## Token source

The executable tokens live in
`frontend/src/shared/styles/design-system.css` and are imported once by
`frontend/src/index.css`. Tailwind v4 exposes them through semantic utilities.

Prefer semantic classes such as:

```text
bg-pf-canvas        text-pf-ink           border-pf-line
bg-pf-surface       text-pf-ink-muted     text-pf-accent
rounded-pf-control  rounded-pf-panel       shadow-pf-panel
font-display        font-sans              font-mono
max-w-pf-content    max-w-pf-workspace     px-pf-gutter
```

Do not add arbitrary hex colors, shadows, radii, or transition curves when a
token already expresses the intended role.

## Color and surfaces

| Role | Token | Value | Use |
|---|---|---:|---|
| Canvas | `pf-canvas` | `#f4f5f7` | Application and workspace background |
| Surface | `pf-surface` | `#ffffff` | Primary controls and panels |
| Subtle surface | `pf-surface-subtle` | `#eceff3` | Secondary grouping and inactive areas |
| Strong surface | `pf-surface-strong` | `#dfe4eb` | Selected tracks and strong separation |
| Inverse surface | `pf-surface-inverse` | `#1b2230` | High-contrast controls and image chrome |
| Primary text | `pf-ink` | `#1b2230` | Headings and primary UI text |
| Muted text | `pf-ink-muted` | `#5d6778` | Supporting copy and metadata |
| Subtle text | `pf-ink-subtle` | `#7b8595` | Tertiary labels, never essential low-contrast text |
| Accent | `pf-accent` | `#5658b9` | Primary actions, selection, and active navigation |
| Focus | `pf-focus` | `#3f67cf` | Keyboard focus only |

Success, warning, and danger each have foreground and soft-surface tokens. They
are semantic states, not additional brand accents. Avoid large decorative
gradients, repeated glass panels, and glow effects in workspaces.

Use elevation only when it explains stacking:

- `shadow-pf-card`: a control or small selectable surface;
- `shadow-pf-panel`: a workspace panel above the canvas;
- `shadow-pf-float`: a popover or modal above application content.

## Typography

PixelForge uses Outfit with system fallbacks. It is loaded in
`frontend/index.html`; the application remains usable if the remote font cannot
load.

| Role | Utility | Guidance |
|---|---|---|
| Product display | `font-display text-pf-display` | Landing identity only; one display heading per page |
| Page title | `font-display text-pf-title` | Tool and workspace titles |
| Section heading | `font-display text-pf-heading` | Panel and content hierarchy |
| Body | `font-sans text-pf-body` | Instructions and longer copy; keep near 65 characters |
| Supporting | `font-sans text-pf-small` | Metadata, descriptions, and helper text |
| Label | `font-sans text-pf-label` | Short UI labels; sentence case by default |
| Data | `font-mono tabular-nums` | Dimensions, percentages, file sizes, timers, and coordinates |

Use weights 400, 500, 600, 700, and 800 deliberately. Reserve 800 for product
identity and major page titles. Avoid all-caps labels except compact technical
markers where scanning benefits.

## Spacing, radii, and layout

Use the existing 4px Tailwind spacing rhythm. The semantic layout tokens are:

- `pf-gutter`: responsive page edge spacing;
- `pf-panel`: responsive panel padding;
- `pf-section`: separation between major page regions.

Radius roles are intentionally tighter than the pre-redesign UI:

- `rounded-pf-control` — 8px for buttons, inputs, and compact controls;
- `rounded-pf-card` — 12px for small grouped content;
- `rounded-pf-panel` — 16px for control or preview panels;
- `rounded-pf-shell` — 20px for the outer workspace only.

Do not use pills for ordinary buttons, tabs, cards, or labels. A full radius is
reserved for circular controls, genuine status dots, toggles, and tags whose
shape communicates their function.

Layout widths:

- `max-w-pf-prose` — 42rem for readable documentation or explanatory copy;
- `max-w-pf-content` — 72rem for landing and discovery content;
- `max-w-pf-workspace` — 90rem for image workspaces.

## Interaction states

Every interactive component must define the states it can reach.

| State | Required treatment |
|---|---|
| Resting | Clear role, readable label, and sufficient contrast |
| Hover | Small color or border shift; never the only indication of availability |
| Active/pressed | Subtle `translateY(1px)` or scale reduction plus color feedback |
| Selected | Accent foreground or border and a persistent non-motion indicator |
| Disabled | Preserve readable text, lower emphasis, block interaction, and use `cursor-not-allowed` |
| Focus | Global 3px focus outline with 3px offset; component styles may refine but never remove it |
| Loading | Preserve layout dimensions, name the current action, and expose status politely to assistive technology |
| Error | Inline danger surface, direct explanation, and a recovery action when one exists |
| Empty | Explain what belongs in the region and present the next useful action without decorative filler |
| Success | Put the result, verified metadata, and export action first; no celebratory decoration |

Quota, expired-result, and provider-failure states remain distinct because their
recovery actions differ. Do not collapse them into a generic error card.

## Motion

Motion must explain state or spatial change.

```text
instant:   80ms   pointer feedback
fast:     160ms   hover and compact controls
standard: 240ms   panel and state transitions
slow:     360ms   modal or substantial spatial transition
```

Use `ease-pf-standard` for ordinary transitions and `ease-pf-emphasized` when
an element enters or leaves a layer. Prefer opacity and transform. Do not add
cinematic scrolling, decorative parallax, continuous glow, or animation that
delays processing work.

The application-level Framer Motion configuration respects the user's reduced
motion preference. The CSS fallback also minimizes animations and transitions
under `prefers-reduced-motion: reduce`.

## Responsive contract

The breakpoints are verification widths, not separate products.

### Approximately 375px

- Single-column flow with at least 16px page gutters.
- Preview and primary action appear before secondary explanation.
- Controls use at least a 44px target size.
- Filenames and metadata wrap or truncate without horizontal page overflow.
- Dialogs fit the viewport and keep their actions visible.

### Approximately 768px

- Use 24px gutters where space allows.
- Two columns are allowed only when both the image and controls remain usable.
- Tool discovery may use two columns; active work remains image-led.

### Approximately 1024px

- Workspaces may use a compact control rail beside a larger preview.
- Keep controls near the image; do not create a generic dashboard sidebar.
- Navigation exposes categories without hiding the active route.

### Approximately 1440px

- Cap the workspace at 90rem and content at 72rem.
- Let the preview gain space while control widths remain readable and stable.
- Avoid stretching paragraphs, forms, or marketing cards across the viewport.

Never use `overflow-x-hidden` to conceal a broken layout.

## Accessibility contract

- Native semantics come before ARIA.
- All controls must be keyboard operable and visibly focused.
- Errors and processing status must be announced when their state changes.
- Text and interactive boundaries must meet WCAG AA contrast.
- Meaningful images require descriptive alternative text; decorative images use
  empty alternative text.
- Dialogs must manage focus, support Escape, and restore focus on close.
- Color is never the only indication of selected, invalid, or successful state.

## Ownership and adoption

Design tokens and cross-feature visual rules belong in `shared/styles`. Feature
controls, copy, validation, and workflow states remain feature-owned. A visual
pattern may become shared only after multiple independent consumers prove the
same responsibility.

Phase 05 establishes the foundation. Later phases adopt it in order:

1. app shell, landing, upload, and shared workspace;
2. AI tools;
3. editing, optimization, and utility tools;
4. responsive, accessibility, and state hardening.

Do not restyle a future-phase screen opportunistically while adopting a token.
