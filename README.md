# Flash Message JS

A simple and lightweight flash message library for React applications, styled with CSS.

## Installation

Install the package via npm:

```sh
npm install flashmessage-js
```

or via yarn:

```sh
yarn add flashmessage-js
```

## Usage

### 1. Wrap Your App with `FlashProvider`

```tsx
import React from 'react';
import { FlashMessageProvider } from 'flash-message-js';
import App from './App';

const Root = () => {
  return (
    <FlashMessageProvider>
      <App />
    </FlashMessageProvider>
  );
};

export default Root;
```

### 2. Use the Flash Message Hook

```tsx
import React from 'react';
import { useFlashMessage } from 'flash-message-js';

const MyComponent = () => {
  const { showFlashMessage } = useFlashMessage();

  return (
    <button onClick={() => showFlashMessage('This is a flash message!', 'success')}>
      Show Message
    </button>
  );
};

export default MyComponent;
```

### 3. Customize Tailwind Styles (Optional)

To customize the flash message appearance, extend your Tailwind CSS configuration:

```css
@layer components {
  .flash-message {
    @apply fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg;
  }
}
```

## Props

The `showMessage` function supports:

| Parameter | Type   | Description |
|-----------|--------|-------------|
| message  | string | The message text to display |
| type     | 'success' \| 'error' \| 'info' | Message type (affects styling) |
| duration | number | (Optional) Time in milliseconds before disappearing |

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests on [GitHub](https://github.com/adu-yeboah/flash-message).

## License

This project is licensed under the ISC License.
