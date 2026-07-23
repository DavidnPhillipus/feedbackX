import { useState, useEffect } from "react";
import ChatsContainer from "../components/ChatsContainer";
import ChatRoom from "../components/ChatRoom";
import { useChat } from "../context/ChatContext";
import { useSearchParams } from "react-router-dom";

function useIsMobile(breakpoint = 520) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= breakpoint : false
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);

  return isMobile;
}

export default function FeedbackRooms() {
  const { activeRoom, selectRoom, openPostFeedbackRoom } = useChat();
  const [searchParams, setSearchParams] = useSearchParams();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const isMobile = useIsMobile();

  const postId = searchParams.get("post");

  useEffect(() => {
    if (!postId) return;

    let cancelled = false;
    openPostFeedbackRoom(Number(postId))
      .then(() => {
        if (cancelled) return;
        setMobileShowChat(true);
        setSearchParams({}, { replace: true });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [postId, openPostFeedbackRoom, setSearchParams]);

  const handleSelect = (room) => {
    selectRoom(room);
    setSettingsOpen(false);
    setMobileShowChat(true);
  };

  const handleClose = () => {
    selectRoom(null);
    setMobileShowChat(false);
    setSettingsOpen(false);
  };

  const showChatPanel = !isMobile || mobileShowChat;

  return (
    <div className="fx-chatwin">
      <div
        className={[
          "fx-chatwin__layout",
          isMobile && mobileShowChat && activeRoom ? "fx-chatwin__layout--mobile-chat" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <ChatsContainer
          selectedRoom={activeRoom}
          onSelect={handleSelect}
          hiddenOnMobile={isMobile && mobileShowChat && !!activeRoom}
        />
        {showChatPanel && (
          <ChatRoom
            room={activeRoom}
            onClose={isMobile ? handleClose : undefined}
            settingsOpen={settingsOpen}
            onToggleSettings={() => setSettingsOpen((v) => !v)}
          />
        )}
      </div>
    </div>
  );
}
