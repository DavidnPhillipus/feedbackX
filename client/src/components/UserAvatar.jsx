import { getAvatarHue, getInitials } from "../utils/avatar";

export default function UserAvatar({
  src,
  name,
  username,
  size = 40,
  className = "",
  alt,
}) {
  const label = alt || name || username || "User";
  const style = { width: size, height: size, minWidth: size, minHeight: size };

  if (src) {
    return (
      <img
        src={src}
        alt={label}
        className={`fx-avatar ${className}`.trim()}
        style={style}
      />
    );
  }

  const initials = getInitials(name, username);
  const hue = getAvatarHue(username || name || initials);

  return (
    <div
      className={`fx-avatar fx-avatar--placeholder ${className}`.trim()}
      style={{ ...style, background: `hsl(${hue}, 52%, 42%)` }}
      aria-label={label}
      role="img"
    >
      {initials}
    </div>
  );
}
