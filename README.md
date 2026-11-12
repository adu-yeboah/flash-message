# React FlashMessages 

A modern, lightweight, and fully customizable flash message library for React applications.


##  Features

-  **Lightweight** - Only 3KB gzipped
-  **Fully Customizable** - Custom themes, colors, and positions
-  **Accessible** - ARIA compliant with screen reader support
-  **Responsive** - Works on all devices and screen sizes
-  **Fast** - Optimized performance with React hooks
-  **TypeScript** - Full TypeScript support with type definitions
-  **Animations** - Smooth enter/exit animations
-  **Queue Management** - Handle multiple messages elegantly
-  **Confetti** - Canvas confetti bursts for celebrations

##  Installation

```bash
npm install flashmessage-js
```

```bash
yarn add flashmessage-js
```

```bash
pnpm add flashmessage-js
```

##  Quick Start

### 1. Wrap your app with the provider

```tsx
import { FlashMessageProvider } from 'flashmessage-js';

function App() {
  return (
    <FlashMessageProvider>
      <YourApp />
    </FlashMessageProvider>
  );
}
```

### 2. Use the hook in your components

```tsx
import { useFlashMessage } from 'flashmessage-js';

function MyComponent() {
  const { showFlashMessage } = useFlashMessage();
  
  const handleClick = () => {
    showFlashMessage('Operation successful!', 'success');
  };
  
  return <button onClick={handleClick}>Show Message</button>;
}
```

##  API Reference

### FlashMessageProvider Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `defaultPosition` | `FlashMessagePosition` | `"top"` | Initial position of messages |
| `maxMessages` | `number` | `5` | Maximum number of messages to display |
| `defaultTheme` | `FlashMessageTheme` | Default theme | Custom color theme |

### useFlashMessage Hook

```tsx
const {
  showFlashMessage,    // Show a new message
  dismissFlashMessage, // Dismiss specific message by ID
  clearAllMessages,    // Clear all messages
  position,            // Current position
  setPosition,         // Change position dynamically
  theme,               // Current theme
  setTheme,            // Change theme dynamically
  confetti             // Fire a confetti burst on demand
} = useFlashMessage();
```

### showFlashMessage

```tsx
showFlashMessage(
  message: string,
  type: "success" | "error" | "info" | "warning" | "celebration",
  options?: {
    duration?: number // milliseconds, default: 3000
    confetti?: boolean | ConfettiOptions // celebrate with confetti, see below
    icon?: ReactNode | null // your own icon; `null` hides the icon
    className?: string // extra class for the message element
  }
): string // Returns message ID
```

### Message Types

- `success` - Green success messages
- `error` - Red error messages
- `info` - Blue informational messages
- `warning` - Orange/yellow warning messages
- `celebration` - Purple celebration messages with confetti

##  Custom Icons & Styling

Every message already shows its type's icon (✓ ✕ ℹ ⚠ 🎉). Override it per
message with anything React can render, or hide it:

```tsx
showFlashMessage('Shipped!', 'success', { icon: '🚀' });
showFlashMessage('Deploying', 'info', { icon: <MySpinner /> });
showFlashMessage('No icon please', 'info', { icon: null });
```

Change a whole type's icon (and colors) through the theme:

```tsx
<FlashMessageProvider defaultTheme={{ success: { icon: '🌟' } }}>
```

A per-message `icon` beats the theme icon. Icons pop in with a small spring
animation as each message lands — turn it off with a theme for a quieter look:

```tsx
<FlashMessageProvider defaultTheme={{ iconPop: false }}>
```

For your own CSS, add a class to
the message element and style it:

```tsx
showFlashMessage('Styled', 'info', { className: 'my-toast' });
```

```css
.my-toast { text-transform: uppercase; }
```

##  Confetti

`celebration` messages fire a confetti burst automatically, bursting from the
message itself. Any other type can opt in, and celebrations can opt out:

```tsx
// Celebration fires confetti by default
showFlashMessage('You did it!', 'celebration');

// Turn it off
showFlashMessage('Quiet win', 'celebration', { confetti: false });

// Opt in for any type, with options
showFlashMessage('Goal!', 'success', { confetti: { emojis: ['⚽', '🥅'] } });
```

Make every burst your own through the theme (`ConfettiOptions`):

```tsx
<FlashMessageProvider
  defaultTheme={{
    confetti: { particleCount: 120, colors: ['#ff0000', '#0000ff'] },
  }}
>
```

| Option | Default | Description |
|--------|---------|-------------|
| `particleCount` | `80` | How many particles |
| `angle` | `90` | Direction in degrees (90 = straight up) |
| `spread` | `70` | Width of the fan in degrees |
| `startVelocity` | `28` | Launch speed |
| `gravity` | `1` | How fast particles fall |
| `decay` | `0.93` | Speed kept each frame (lower stops sooner) |
| `drift` | `0` | Constant sideways push (wind) |
| `ticks` | `180` | Lifetime in frames (~60 per second) |
| `scalar` | `1` | Size multiplier |
| `origin` | `{x: 0.5, y: 0.6}` | Burst start, as 0–1 of the viewport |
| `colors` | 6 defaults | CSS colors for the paper pieces |
| `shapes` | all three | `square`, `circle`, `ribbon` |
| `emojis` | `[]` | Use emoji as particles instead of paper |
| `zIndex` | `10000` | CSS z-index of the confetti canvas |
| `respectReducedMotion` | `true` | Skip the effect for reduced-motion users |
| `drawParticle` | — | Draw each particle yourself on the canvas |

Fire confetti without a message from the hook, or anywhere via the exported
helpers:

```tsx
const { confetti } = useFlashMessage();
confetti({ emojis: ['🎂'] }); // Promise resolves when the burst finishes

import { fireConfetti, clearConfetti } from 'flashmessage-js';
fireConfetti({ particleCount: 200 });
clearConfetti(); // stop everything now
```

### Positions

- `top` - Top center
- `bottom` - Bottom center
- `top-left` - Top left corner
- `top-right` - Top right corner
- `bottom-left` - Bottom left corner
- `bottom-right` - Bottom right corner

##  Custom Themes

```tsx
import { useFlashMessage } from 'flashmessage-js';
import type { FlashMessageTheme } from 'flashmessage-js';

function MyComponent() {
  const { setTheme } = useFlashMessage();
  
  const customTheme: FlashMessageTheme = {
    success: {
      bg: "#00d9ff",
      dark: "#00b8d4",
      text: "#000000"
    },
    error: {
      bg: "#ff006e",
      dark: "#d90058",
      text: "#ffffff"
    },
    info: {
      bg: "#8338ec",
      dark: "#6930c3",
      text: "#ffffff"
    },
    warning: {
      bg: "#ffbe0b",
      dark: "#fb8500",
      text: "#000000"
    }
  };
  
  return (
    <button onClick={() => setTheme(customTheme)}>
      Apply Custom Theme
    </button>
  );
}
```

##  Examples

### Basic Usage

```tsx
const { showFlashMessage } = useFlashMessage();

// Success message
showFlashMessage('Data saved successfully!', 'success');

// Error message
showFlashMessage('Failed to save data', 'error');

// Info message
showFlashMessage('New update available', 'info');

// Warning message
showFlashMessage('Your session will expire soon', 'warning');
```

### Custom Duration

```tsx
// Show for 5 seconds
showFlashMessage('Long message', 'info', { duration: 5000 });

// Show indefinitely (manual dismiss only)
showFlashMessage('Manual dismiss', 'success', { duration: 0 });
```

### Form Validation

```tsx
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  
  try {
    await saveData(formData);
    showFlashMessage('Form submitted successfully!', 'success');
  } catch (error) {
    showFlashMessage(error.message, 'error');
  }
}
```

### API Requests with Loading State

```tsx
async function fetchData() {
  const id = showFlashMessage('Loading data...', 'info', { duration: 0 });
  
  try {
    const result = await api.getData();
    dismissFlashMessage(id);
    showFlashMessage('Data loaded successfully!', 'success');
  } catch (error) {
    dismissFlashMessage(id);
    showFlashMessage('Failed to load data', 'error');
  }
}
```

### Change Position Dynamically

```tsx
const { setPosition, showFlashMessage } = useFlashMessage();

<button onClick={() => {
  setPosition('top-right');
  showFlashMessage('Messages now appear top-right', 'info');
}}>
  Move to Top Right
</button>
```

##  Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

##  License

MIT © Adu Yeboah


##  Show your support

Give a  if this project helped you!
