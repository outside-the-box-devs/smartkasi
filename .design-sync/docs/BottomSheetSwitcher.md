---
category: Overlay
---

# Bottom Sheet Switcher

Coordinates a multi-step bottom-sheet flow in one shared dialog; set activeSheet to a nested BottomSheet's sheetId to open or switch steps, and to null to close.

**Import:** `import {BottomSheetSwitcher} from '@astryxdesign/core/BottomSheet';`

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `activeSheet` | `string | null` | — | ID of the interactive BottomSheet, or null when the flow should close. Match a nested BottomSheet's unique sheetId; the previous sheet may remain visually present and inert while the new sheet enters, simultaneously align downward behind a shorter step, then fade away. |
| `onActiveSheetChange` | `(activeSheet: string | null) => void` | — | Called with null when the active sheet dismisses according to its purpose. Child BottomSheets may use purpose='form' or purpose='required' to limit implicit dismissal while flow controls can still use the same state setter to switch sheets or close the flow. |
| `hasScrim` | `boolean` | `true` | Whether the shared dialog is modal. true uses showModal() once for one native ::backdrop, focus trap, scroll lock, and click-to-dismiss when the active BottomSheet has purpose='info'. false uses show() with no backdrop and leaves the page interactive; avoid transformed, contained, or clipping ancestors because the non-modal dialog remains in its containing context. |
| `children` | `ReactNode` | — | BottomSheets identified by unique sheetId values. |

## Best practices

- **Do:** Use when each step depends on the previous one and only one step needs attention at a time.
- **Don't:** Don't split information across sheets when people need to compare it; use a full-page layout that keeps the relevant content visible together instead.

## Canonical defaults

```json
{
  "activeSheet": null,
  "children": [
    {
      "__element": "BottomSheet",
      "props": {
        "sheetId": "details",
        "label": "Setup details",
        "height": "hug"
      },
      "children": {
        "__element": "Section",
        "props": {
          "padding": 4
        },
        "children": {
          "__element": "VStack",
          "props": {
            "gap": 2
          },
          "children": [
            {
              "__element": "Heading",
              "props": {
                "level": 3
              },
              "children": "Setup details"
            },
            {
              "__element": "Text",
              "props": {
                "type": "body"
              },
              "children": "Add the essential information for this setup."
            },
            {
              "__element": "Text",
              "props": {
                "type": "supporting"
              },
              "children": "You can review these details before saving."
            }
          ]
        }
      }
    },
    {
      "__element": "BottomSheet",
      "props": {
        "sheetId": "preferences",
        "label": "Choose preferences",
        "height": "hug"
      },
      "children": {
        "__element": "Section",
        "props": {
          "padding": 4
        },
        "children": {
          "__element": "VStack",
          "props": {
            "gap": 2
          },
          "children": [
            {
              "__element": "Heading",
              "props": {
                "level": 3
              },
              "children": "Choose preferences"
            },
            {
              "__element": "Text",
              "props": {
                "type": "body"
              },
              "children": "Select how this setup should behave."
            },
            {
              "__element": "Text",
              "props": {
                "type": "supporting"
              },
              "children": "Notifications can be sent immediately, daily, or weekly."
            },
            {
              "__element": "Text",
              "props": {
                "type": "supporting"
              },
              "children": "You can update these preferences later."
            }
          ]
        }
      }
    },
    {
      "__element": "BottomSheet",
      "props": {
        "sheetId": "confirm",
        "label": "Confirm setup",
        "height": "hug"
      },
      "children": {
        "__element": "Section",
        "props": {
          "padding": 4
        },
        "children": {
          "__element": "VStack",
          "props": {
            "gap": 2
          },
          "children": [
            {
              "__element": "Heading",
              "props": {
                "level": 3
              },
              "children": "Confirm setup"
            },
            {
              "__element": "Text",
              "props": {
                "type": "body"
              },
              "children": "Everything is ready to save."
            }
          ]
        }
      }
    }
  ]
}
```
