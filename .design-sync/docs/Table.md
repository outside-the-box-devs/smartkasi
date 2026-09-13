---
category: Table & List
---

# Table

Table displays structured data in rows and columns with consistent dimensionality. It supports rich cell content, sorting, selection, pagination, and column management through a composable plugin system. Use Table for data sets with uniform structure; for simpler or inconsistent data, consider a list or card layout instead.

**Import:** `import {Table} from '@astryxdesign/core/Table';`

## Anatomy

| Element | Required | Description |
|---|---|---|
| Column Header | Yes | Displays titles, sorting controls, and bulk selection. |
| Body Rows | Yes | Rows with consistent data structure. |
| Footer | No | Displays summary or totals. |
| Top Bar | No | Contains title, toolbar, and filters. |
| Bottom Bar | No | Contains pagination controls. |
| Support Panels | No | Displays row details in a side panel. |

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `T[]` | — | Array of data items to render as rows. T must extend Record<string, unknown> (use `interface MyRow extends Record<string, unknown>` for custom types). |
| `columns` | `TableColumn<T>[]` | — | Column definitions: each column has {key, header, width?, align?, renderCell?}. The `header` field sets the column heading text. If omitted, columns are auto-generated from data object keys. The `width` field is typed as `ColumnWidth` (not a number); use `proportional(n)` or `pixel(n)` helpers imported from `@astryxdesign/core/Table`. Example: `width: pixel(120)` for 120px fixed, `width: proportional(1)` for flex distribution. |
| `idKey` | `(keyof T & string) | ((item: T) => string | number)` | — | Row key for React reconciliation. Pass a property name string or a function. Falls back to row index if omitted. |
| `density` | `'compact' | 'balanced' | 'spacious'` | `'balanced'` | Row density controlling cell padding and font size. |
| `dividers` | `'rows' | 'columns' | 'grid' | 'none'` | `'rows'` | Divider style rendered between cells. |
| `isStriped` | `boolean` | `false` | Applies a background wash to even-numbered rows. |
| `hasHover` | `boolean` | `false` | Applies a hover highlight background to rows on pointer devices. |
| `verticalAlign` | `'middle' | 'top' | 'bottom'` | `'middle'` | Vertical alignment for body row cells. Controls `vertical-align` on the `<td>` elements. |
| `textOverflow` | `'wrap' | 'truncate'` | `'wrap'` | How body cell text behaves when it exceeds the column width. 'wrap' lets text wrap and the row grow taller; 'truncate' clips with an ellipsis (default-rendered cells show a tooltip on hover when truncated). Header cells always truncate. |
| `plugins` | `Record<string, TablePlugin<T>>` | — | Named plugins that extend table behavior via the transform pipeline. Converted to an ordered array internally. |
| `rowIndexStart` | `number` | `1` | ARIA row index (1-based) for the first rendered body row. The row ordinal is an accessibility concern independent of any visible index column, so setting this (or rowCount) makes the table emit aria-rowindex on body rows and aria-rowcount on the table. For a paginated/windowed view, pass the offset of the first visible row (e.g. (page - 1) * pageSize + 1) so aria-rowindex reflects position in the full dataset. Data-driven mode only. |
| `rowCount` | `number` | — | Total number of body rows across all pages/windows, used for aria-rowcount so assistive tech can announce "row X of Y" against the full dataset. When omitted but rowIndexStart is set (windowed view with an unknown total), aria-rowcount is set to -1 per the ARIA unknown-count convention. Data-driven mode only. |
| `children` | `ReactNode` | — | Children mode: render TableRow/TableCell directly instead of using data-driven rendering. |
| `xstyle` | `StyleXStyles` | — | StyleX styles for layout customization (margins, positioning, sizing). Must be a stylex.create() value: not an inline style object like style={{}}. |

## Best practices

- **Do:** Use density and divider variants to match the information density and scanning needs of your data.
- **Do:** Compose rich cell content with Astryx components like Badge, StatusDot, and Avatar via renderCell.
- **Do:** Set explicit width on every column using proportional() or pixel(). proportional(1) gives equal flex distribution with a 120px minimum that prevents columns from collapsing on narrow viewports. Omitting width skips the minimum.
- **Do:** Use the data-driven API from React Server Components: proportional(), pixel(), and column definitions without function props are server-safe. Columns using renderCell (or any function prop) need the table wrapped in a "use client" component, since functions cannot cross the server-client boundary.
- **Don't:** Use a table for data without consistent columns. Use a list or card layout for heterogeneous content.
- **Don't:** Enable every plugin at once. Add only the features your use case requires to keep the interface focused.
- **Don't:** Omit width on text-heavy columns; without an explicit proportional() width they have no minimum and can squish to near-zero on mobile.

## Canonical defaults

```json
{
  "data": [
    {
      "name": "Alice Chen",
      "role": "Engineer",
      "status": "Active"
    },
    {
      "name": "Bob Smith",
      "role": "Designer",
      "status": "Active"
    },
    {
      "name": "Carol Wu",
      "role": "PM",
      "status": "Away"
    }
  ],
  "columns": [
    {
      "key": "name",
      "header": "Name"
    },
    {
      "key": "role",
      "header": "Role"
    },
    {
      "key": "status",
      "header": "Status"
    }
  ]
}
```

## Theming

- `astryx-base-table`
- `astryx-table`
- `astryx-table-scroll-wrapper`
- `astryx-table-header`
- `astryx-table-body`
- `astryx-table-footer`
- `astryx-table-row`
- `astryx-table-cell` — varies by: density
- `astryx-table-header-cell` — varies by: density
