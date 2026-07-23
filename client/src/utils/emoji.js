export const CHAT_EMOJIS = [
  "👍", "👎", "❤️", "🔥", "✨", "💡", "🎨", "💻",
  "🐛", "✅", "❌", "❓", "‼️", "👀", "🙌", "🎉",
  "😂", "😊", "😅", "🤔", "👏", "💬", "📝", "🔗",
  "⚠️", "🚀", "⭐", "💯", "🙏", "😍", "😮", "😢",
];

export function isEmojiOnly(text) {
  const value = text?.trim();
  if (!value) return false;
  return /^[\p{Extended_Pictographic}\p{Emoji_Component}\s]+$/u.test(value);
}
