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
* [`addListener('canvasMinimized' | 'canvasSubmitted' | 'canvasCancelled', ...)`](#addlistenercanvasminimized--canvassubmitted--canvascancelled-)
* [`removeAllListeners()`](#removealllisteners)
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


### addListener('canvasMinimized' | 'canvasSubmitted' | 'canvasCancelled', ...)

```typescript
addListener(eventName: 'canvasMinimized' | 'canvasSubmitted' | 'canvasCancelled', listenerFunc: (event: CanvasResult) => void) => Promise<any>
```

Add listener for canvas events (pencil-initiated actions)

| Param              | Type                                                                      |
| ------------------ | ------------------------------------------------------------------------- |
| **`eventName`**    | <code>'canvasMinimized' \| 'canvasSubmitted' \| 'canvasCancelled'</code>  |
| **`listenerFunc`** | <code>(event: <a href="#canvasresult">CanvasResult</a>) =&gt; void</code> |

**Returns:** <code>Promise&lt;any&gt;</code>

--------------------


### removeAllListeners()

```typescript
removeAllListeners() => Promise<void>
```

Remove all listeners for canvas events

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

| Prop                    | Type                                 | Description                                                             |
| ----------------------- | ------------------------------------ | ----------------------------------------------------------------------- |
| **`backgroundColor`**   | <code>string</code>                  | Background color for the canvas (default: white)                        |
| **`presentationStyle`** | <code>'sheet' \| 'fullScreen'</code> | Presentation style for iOS (default: sheet)                             |
| **`showGrabber`**       | <code>boolean</code>                 | Show the drag indicator/grabber on iOS sheets (default: true)           |
| **`allowMediumDetent`** | <code>boolean</code>                 | Allow medium detent on iOS sheets for half-screen mode (default: false) |


#### HasContentResult

Response from hasContent method

| Prop             | Type                 |
| ---------------- | -------------------- |
| **`hasContent`** | <code>boolean</code> |

</docgen-api>
