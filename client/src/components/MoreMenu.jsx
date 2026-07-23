import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { FiMoreHorizontal } from "react-icons/fi";

export default function MoreMenu({ items, buttonClassName = "fx-more-menu__trigger" }) {
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

  const closeMenu = () => setOpen(false);

  return (
    <div className="fx-more-menu" ref={ref}>
      <button
        type="button"
        className={buttonClassName}
        aria-label="More options"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <FiMoreHorizontal size={20} />
      </button>

      {open && (
        <div className="fx-more-menu__dropdown" role="menu">
          {items.map((item) => {
            if (item.hidden) return null;

            const content = (
              <>
                {item.icon ? <item.icon size={18} aria-hidden="true" /> : null}
                <span>{item.label}</span>
              </>
            );

            if (item.to) {
              return (
                <NavLink
                  key={item.label}
                  to={item.to}
                  className={`fx-more-menu__item${item.danger ? " fx-more-menu__item--danger" : ""}`}
                  role="menuitem"
                  onClick={closeMenu}
                >
                  {content}
                </NavLink>
              );
            }

            return (
              <button
                key={item.label}
                type="button"
                className={`fx-more-menu__item${item.danger ? " fx-more-menu__item--danger" : ""}`}
                role="menuitem"
                onClick={() => {
                  closeMenu();
                  item.onClick?.();
                }}
              >
                {content}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
