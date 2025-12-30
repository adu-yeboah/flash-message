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
  setTheme            // Change theme dynamically
} = useFlashMessage();
```

### showFlashMessage

```tsx
showFlashMessage(
  message: string,
  type: "success" | "error" | "info" | "warning",
  options?: {
    duration?: number // milliseconds, default: 3000
  }
): string // Returns message ID
```

### Message Types

- `success` - Green success messages
- `error` - Red error messages
- `info` - Blue informational messages
- `warning` - Orange/yellow warning messages

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
