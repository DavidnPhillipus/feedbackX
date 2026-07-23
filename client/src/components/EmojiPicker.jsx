import { useEffect, useRef, useState } from "react";
import { FiSmile } from "react-icons/fi";
import { CHAT_EMOJIS } from "../utils/emoji";

export default function EmojiPicker({ onSelect, disabled = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const close = (event) => {
      if (!ref.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const pick = (emoji) => {
    onSelect(emoji);
    setOpen(false);
  };

  return (
    <div className="fx-emoji-picker" ref={ref}>
      <button
        type="button"
        className={`fx-chatwin__emoji${open ? " active" : ""}`}
        onClick={() => setOpen((value) => !value)}
        disabled={disabled}
        title="Add emoji"
        aria-label="Add emoji"
        aria-expanded={open}
      >
        <FiSmile size={18} />
      </button>

      {open && (
        <div className="fx-emoji-picker__panel" role="listbox" aria-label="Emoji picker">
          {CHAT_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="fx-emoji-picker__item"
              onClick={() => pick(emoji)}
              aria-label={`Insert ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
