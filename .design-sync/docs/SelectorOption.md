---
category: Data Input
---

# Selector Option

**Import:** `import {SelectorOption} from '@astryxdesign/core/Selector';`

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `ReactNode` | — | Primary label text for the item. |
| `icon` | `IconType` | — | Icon displayed before the label. See `astryx docs icons` for valid semantic names. |
| `description` | `ReactNode` | — | Secondary description text displayed below the label. |
| `layout` | `'stacked' | 'inline'` | `'stacked'` | How the label and description sit together. 'stacked' puts the description on its own line; 'inline' keeps both on one line so the row fits a fixed-height host. Inside a Selector trigger the trigger's padding sizes itself to whichever layout you pick, so both land on the 4px rhythm; an InputGroup pins the row height and forces 'inline'. |
| `endContent` | `ReactNode` | — | Additional content rendered after the label and description. |
