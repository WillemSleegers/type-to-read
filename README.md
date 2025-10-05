# Type to Read

A typing practice app that lets you improve your typing speed and accuracy while reading content you actually want to read.

## Features

- **Real-time Typing Feedback**: See your mistakes highlighted as you type
- **Live Metrics**: Track your WPM (Words Per Minute), accuracy, and error count
- **Custom Content**: Load your own text from:
  - Direct paste
  - File upload (.txt, .md)
  - URL extraction (automatically extracts readable content from web pages)
  - Sample texts
- **Scrolling Window**: Only 3 lines visible at a time, smoothly scrolls as you type
- **Dark Mode**: Automatic theme switching based on system preferences
- **Character-by-Character Highlighting**:
  - Green for correct characters
  - Red for errors
  - Current character highlighted with pulse animation
- **Customizable Settings**: Adjust font size, toggle punctuation and capitalization

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## How to Use

1. **Start Typing**: Click on the text area or just start typing
2. **Watch Your Stats**: See your WPM and accuracy update in real-time
3. **Track Errors**: Mistakes are highlighted in red
4. **Load New Text**: Click the text icon to load custom content
5. **Adjust Settings**: Click the settings icon to customize font size and other options
6. **Restart**: Click the restart button to start over with the current text

## Settings

- **Font Size**: Adjust text size from 16px to 48px
- **Highlight Errors**: Toggle error highlighting on/off
- **Include All Punctuation**: Toggle whether to include apostrophes, quotes, and special characters
- **Include Capitalization**: Toggle whether to preserve capitalization or convert to lowercase
- **Dark/Light Mode**: Toggle theme manually or use system setting

## Technology Stack

- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI
- **Typography**: Geist Sans & Geist Mono fonts
- **Theme**: next-themes for dark mode support
- **Content Extraction**: Mozilla Readability for URL text extraction

## Project Structure

```
/app
  /api/extract       # API endpoint for extracting text from URLs
  layout.tsx         # Root layout with metadata
  page.tsx           # Main page component
  globals.css        # Global styles
/components
  /ui                # Reusable UI components (buttons, dialogs, etc.)
  typing-reader.tsx  # Main typing component
  text-input-dialog.tsx # Dialog for loading custom text
  theme-toggle.tsx   # Dark/light mode toggle
  theme-provider.tsx # Theme context provider
/lib
  constants.ts       # App constants and sample texts
  storage.ts         # LocalStorage utilities
  utils.ts           # Utility functions
```

## Features in Detail

### Typing Metrics

- **WPM Calculation**: Based on standard 5-character word length, calculated from correctly typed characters
- **Accuracy**: Percentage of correctly typed characters vs total typed
- **Error Tracking**: Count of all incorrect keystrokes

### Text Input Options

1. **Paste**: Directly paste any text you want to practice with
2. **File Upload**: Upload .txt or .md files
3. **URL**: Enter a URL to extract readable content from web articles
4. **Samples**: Choose from built-in sample texts about typing and learning

## Local Storage

The app saves your preferences locally:
- Font size
- Error highlighting preference
- Sound effects setting

## License

MIT

## Credits

Built with inspiration from typing trainers and speed reading apps. Combines the best of both worlds to make typing practice more engaging and educational.
