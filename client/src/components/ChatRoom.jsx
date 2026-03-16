import "../css/ChatRoom.css";
import { useEffect, useState, useRef } from "react";
import { getInvites, getPostById, getRoomMessages, postRoomMessage } from "../services/mockApi";
import { FiUser, FiMoreHorizontal } from 'react-icons/fi';
import PostModal from "./PostModal";

export default function ChatRoom({ room, onClose }) {
  const [invites, setInvites] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const chatsRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    getInvites()
      .then((data) => {
        if (mounted) setInvites(data);
      })
      .catch(() => {})
      .finally(() => {});
    return () => (mounted = false);
  }, []);

  useEffect(() => {
    if (!room) return;
    let mounted = true;
    // load existing messages for selected room
    getRoomMessages(room.id).then((msgs) => {
      if (mounted) setMessages(msgs);
    });
    return () => (mounted = false);
  }, [room]);

  // scroll to bottom whenever messages change
  useEffect(() => {
    if (chatsRef.current) {
      chatsRef.current.scrollTop = chatsRef.current.scrollHeight;
    }
  }, [messages]);

  const handleAccept = (inv) => {
    // simply remove the invite - user chose not to view details
    setInvites((prev) => prev.filter((i) => i.id !== inv.id));
  };

  const handleViewInvite = (inv) => {
    // when user wants to inspect before accepting
    getPostById(inv.postId).then((post) => {
      if (post) setSelectedPost(post);
    });
  };

  const handleDecline = (id) => {
    setInvites((prev) => prev.filter((i) => i.id !== id));
  };

  const closeModal = () => setSelectedPost(null);

  const sendMessage = () => {
    if ((!newMessage.trim() && !fileInputRef.current?.files?.length) || !room) return;

    let msgObj = {
      sender: "You",
      text: newMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    // handle attached file if any
    if (fileInputRef.current && fileInputRef.current.files.length > 0) {
      const file = fileInputRef.current.files[0];
      const url = URL.createObjectURL(file);
      msgObj = { ...msgObj, fileUrl: url, fileName: file.name };
      // clear file input
      fileInputRef.current.value = null;
    }

    postRoomMessage(room.id, msgObj).then((m) => {
      setMessages((prev) => [...prev, m]);
      setNewMessage("");

      // simulate a reply from another user after a delay
      setTimeout(() => {
        const reply = {
          sender: room.name || "Member",
          text: "Thanks for the update!",
          timestamp: new Date().toISOString(),
        };
        postRoomMessage(room.id, reply).then((r) => {
          setMessages((prev) => [...prev, r]);
        });
      }, 1000);
    });
  };

  return (
    <div id="chatroom-container">
      {room ? (
        <div className="chat-panel">
          <header className="bar">
            <div className="room-info">
              {onClose && (
                <button className="back-button" onClick={onClose}>
                  ←
                </button>
              )}
              <div className="room-profile">
                <img src={room.avatar} alt="room avatar" />
              </div>
              <span>{room.name}</span>
            </div>
            <div className="room-actions">
              <button className="icon-button" title="View profile">
                <FiUser size={20} color="#fff" />
              </button>
              <button className="icon-button" title="Settings">
                <FiMoreHorizontal size={20} color="#fff" />
              </button>
            </div>
          </header>
          <main className="chats" ref={chatsRef}>
            {messages.map((m) => (
              <div key={m.id} className="message">
                <strong>{m.sender}: </strong>
                <span>{m.text}</span>
                {m.fileUrl && (
                  <div className="attachment">
                    {m.fileUrl.match(/\.(jpeg|jpg|png|gif)$/i) ? (
                      <img
                        src={m.fileUrl}
                        alt={m.fileName || "attachment"}
                        className="attachment-img"
                      />
                    ) : (
                      <a href={m.fileUrl} download={m.fileName}>
                        {m.fileName || "Download file"}
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </main>
          <footer className="bottom-bar">
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: "none" }}
              onChange={() => {}}
            />
            <button
              type="button"
              className="attach-button"
              onClick={() => fileInputRef.current?.click()}
            >
              📎
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message"
            />
            <button onClick={sendMessage} className="send-button">
              Send
            </button>
          </footer>
        </div>
      ) : (
        <div className="invite-panel">
          <h4>Invites</h4>
          {invites.length === 0 ? (
            <p>No invitations</p>
          ) : (
            invites.map((inv) => (
              <div key={inv.id} className="invite-details">
                <div
                  className="invite-profile clickable"
                  onClick={() => handleViewInvite(inv)}
                >
                  {inv.title ? inv.title.charAt(0) : "?"}
                </div>
                <div className="invite-info">
                  <h4
                    className="invite-title clickable"
                    onClick={() => handleViewInvite(inv)}
                  >
                    {inv.title}
                  </h4>
                  <p className="invite-about"> {inv.about}</p>
                  <button
                    className="accept-button"
                    onClick={() => handleAccept(inv)}
                  >
                    Accept
                  </button>
                  <button
                    className="decline-button"
                    onClick={() => handleDecline(inv.id)}
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {selectedPost && (
        <PostModal post={selectedPost} onClose={closeModal} />
      )}
    </div>
  );
}
