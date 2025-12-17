# capacitor-canvas-plugin

Native canvas plugin for handwriting input with Apple Pencil support

## Install

```bash
npm install capacitor-canvas-plugin
npx cap sync
```

## API

<docgen-index>

* [`openCanvas(...)`](#opencanvas)
* [`clearCanvas()`](#clearcanvas)
* [`hasContent()`](#hascontent)
* [Interfaces](#interfaces)

</docgen-index>

<docgen-api>
<!--Update the source file JSDoc comments and rerun docgen to update the docs below-->

Canvas plugin interface for handwriting input

### openCanvas(...)

```typescript
openCanvas(options?: OpenCanvasOptions | undefined) => Promise<CanvasResult>
```

Opens the native fullscreen canvas for drawing.
Returns when user submits (with image) or minimizes (without image).

| Param         | Type                                                            |
| ------------- | --------------------------------------------------------------- |
| **`options`** | <code><a href="#opencanvasoptions">OpenCanvasOptions</a></code> |

**Returns:** <code>Promise&lt;<a href="#canvasresult">CanvasResult</a>&gt;</code>

--------------------


### clearCanvas()

```typescript
clearCanvas() => Promise<void>
```

Clears the preserved canvas state (called on new conversation).

--------------------


### hasContent()

```typescript
hasContent() => Promise<HasContentResult>
```

Checks if there's unsaved content on the canvas.

**Returns:** <code>Promise&lt;<a href="#hascontentresult">HasContentResult</a>&gt;</code>

--------------------


### Interfaces


#### CanvasResult

Result returned from canvas operations

| Prop             | Type                                                   | Description                                                   |
| ---------------- | ------------------------------------------------------ | ------------------------------------------------------------- |
| **`action`**     | <code>'submitted' \| 'minimized' \| 'cancelled'</code> | Action taken by user                                          |
| **`imageData`**  | <code>string</code>                                    | Base64 PNG image data (only present if action is 'submitted') |
| **`hasContent`** | <code>boolean</code>                                   | Whether canvas has content (for minimize case)                |


#### OpenCanvasOptions

Options for opening the canvas

| Prop                  | Type                | Description                                      |
| --------------------- | ------------------- | ------------------------------------------------ |
| **`backgroundColor`** | <code>string</code> | Background color for the canvas (default: white) |


#### HasContentResult

Response from hasContent method

| Prop             | Type                 |
| ---------------- | -------------------- |
| **`hasContent`** | <code>boolean</code> |

</docgen-api>
