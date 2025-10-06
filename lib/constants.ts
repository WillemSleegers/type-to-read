// Default reading settings
export const DEFAULT_WPM = 300
export const DEFAULT_FONT_SIZE = 60

// WPM constraints
export const MIN_WPM = 100
export const MAX_WPM = 1000
export const WPM_STEP = 50

// Font size constraints
export const MIN_FONT_SIZE = 24
export const MAX_FONT_SIZE = 120
export const FONT_SIZE_STEP = 4

// Punctuation delay multipliers
export const SENTENCE_END_DELAY = 2.5
export const COMMA_DELAY = 1.5
export const LONG_WORD_DELAY = 1.3
export const VERY_LONG_WORD_DELAY = 1.5
export const SHORT_WORD_DELAY = 0.8

// Word length thresholds
export const LONG_WORD_THRESHOLD = 8
export const VERY_LONG_WORD_THRESHOLD = 12
export const SHORT_WORD_THRESHOLD = 3

// Default welcome text
export const DEFAULT_TEXT = `Welcome to Type to Read! This is a typing practice app that lets you learn to type while reading content you actually want to read. Start typing the text you see, and watch your speed and accuracy improve. The more you type, the better you get. Try loading your own text to practice typing while learning something new. Happy typing!`

// Sample texts for the text input dialog
export const SAMPLE_TEXTS = [
  {
    title: "Quick Practice",
    text: `The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet, making it perfect for quick typing practice.`,
  },
  {
    title: "The Art of Touch Typing",
    text: `Touch typing is the ability to type without looking at the keyboard. It's a skill that can dramatically increase your productivity and reduce strain on your hands and wrists. The key is muscle memory. By practicing consistently, your fingers learn where each key is located. Start slowly, focusing on accuracy rather than speed. Speed will come naturally as your muscle memory develops. Remember, every expert typist started as a beginner. With regular practice, you can achieve typing speeds of 60 words per minute or more.`,
  },
  {
    title: "The Power of Practice",
    text: `Deliberate practice is the key to mastery in any skill, and typing is no exception. Unlike mindless repetition, deliberate practice involves focused attention on improving specific aspects of your performance. When you practice typing, pay attention to your mistakes. Which keys do you frequently miss? Which finger movements feel awkward? By identifying and addressing these weak points, you'll improve much faster than if you simply type without thinking. Track your progress over time and celebrate small improvements.`,
  },
  {
    title: "Reading While Typing",
    text: `Type to Read combines two valuable skills: typing and reading comprehension. As you type, you're not just mechanically copying characters. You're actively engaging with the content, processing its meaning, and reinforcing your understanding. This dual engagement can actually improve retention compared to passive reading. The act of typing each word forces you to pay closer attention to the text. You'll find that you remember more of what you read when you've typed it out. It's a win-win for your typing skills and your learning.`,
  },
]
