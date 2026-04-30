import { useEffect, useState, useRef } from "react";
import { ChevronLeft } from "lucide-react";
import { useApp } from "@/context/AppContext";
import ChatDetail from "./View/ChatDetail";
import { ConversationItem } from "./View/Conversation/ConversationItem";
import { markReadMessage } from "@/services";
import { ConversationSkeleton } from "./View/Conversation/ConversationSkeleton";
import { CONFIG } from "@/config";
import { useAuthStore, useMessagesStore } from "@/stores";

const INITIAL_DISPLAY_COUNT = CONFIG.ui.chat.initialVisible;
const POLL_INTERVAL_LIST = 10000;  // Poll danh sách hội thoại mỗi 10s
const POLL_INTERVAL_CHAT = 8000;   // Poll tin nhắn trong chat mỗi 8s

// ================= Component: RightHomeScreen =================
const RightHomeScreen = ({ setIsHomeOpen }) => {
  const { user } = useAuthStore();
  const { navigation } = useApp();
  const { isHomeOpen } = navigation;

  const [selectedChat, setSelectedChat] = useState(null);
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY_COUNT);

  const idToken = localStorage.getItem("idToken");

  const {
    messages,
    fetchConversations,
    loading,
    conversations,
    getMessagesByUser,
    addMessageWithUserV2,
  } = useMessagesStore();

  // ================= Reset displayCount khi đóng isHomeOpen =================
  useEffect(() => {
    if (!isHomeOpen) {
      setDisplayCount(INITIAL_DISPLAY_COUNT);
    }
  }, [isHomeOpen]);

  // ================= Fetch conversations lần đầu =================
  useEffect(() => {
    if (!idToken) return;
    fetchConversations();
  }, [idToken]);

  // ================= Polling danh sách hội thoại (chỉ khi đang mở tin nhắn) =================
  useEffect(() => {
    if (!idToken || !isHomeOpen) return;

    const intervalId = setInterval(() => {
      fetchConversations();
    }, POLL_INTERVAL_LIST);

    return () => clearInterval(intervalId);
  }, [idToken, isHomeOpen, fetchConversations]);

  // ================= Chọn chat =================
  const handleSelectChat = async (chat) => {
    setSelectedChat(chat);

    if (!chat?.uid) return;

    // Lấy tin nhắn cả cũ và mới (limit tăng lên 100)
    await getMessagesByUser(chat.uid, null, true);

    if (chat.isRead === false) {
      await markReadMessage(chat.uid);
    }
  };

  // ================= Polling tin nhắn của chat đang mở =================
  useEffect(() => {
    if (!selectedChat?.uid || !isHomeOpen) return;

    const intervalId = setInterval(() => {
      getMessagesByUser(selectedChat.uid, null, true);
    }, POLL_INTERVAL_CHAT);

    return () => clearInterval(intervalId);
  }, [selectedChat?.uid, selectedChat?.with_user, isHomeOpen, getMessagesByUser]);

  // ================= Load more conversations =================
  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + 10);
  };

  // ================= Sắp xếp và lọc conversations =================
  const sortedMessages = conversations
    ?.slice()
    .sort(
      (a, b) =>
        Number(b.latestMessage?.createdAt || 0) -
        Number(a.latestMessage?.createdAt || 0)
    );

  const displayedMessages = sortedMessages.slice(0, displayCount);
  const remainingCount = sortedMessages.length - displayCount;

  const messagesByConversation = selectedChat?.uid
    ? messages[selectedChat.uid] || []
    : [];

  return (
    <>
      {/* ================= Conversation list ================= */}
      <div
        className={`fixed inset-0 flex flex-col transition-transform duration-500 bg-base-100 overflow-hidden
        ${isHomeOpen
            ? selectedChat
              ? "-translate-x-full"
              : "translate-x-0"
            : "translate-x-full"
          }`}
      >
        <div className="relative flex items-center shadow-lg justify-between px-4 py-2 text-base-content">
          <button
            onClick={() => {
              setIsHomeOpen(false);
              setSelectedChat(null);
            }}
            className="btn p-1 border-0 rounded-full hover:bg-base-200 transition cursor-pointer z-10"
          >
            <ChevronLeft size={30} />
          </button>
          <span className="text-sm font-medium text-base-content/60">
            Tin nhắn
          </span>
        </div>

        <div className="flex-1 px-4 py-6 overflow-y-auto space-y-4">
          {loading ? (
            // Hiển thị skeleton khi đang loading
            Array.from({ length: INITIAL_DISPLAY_COUNT }).map((_, idx) => (
              <ConversationSkeleton key={idx} />
            ))
          ) : (
            <>
              {/* Danh sách conversations */}
              {displayedMessages.map((msg) => (
                <ConversationItem
                  key={msg.uid}
                  msg={msg}
                  onSelect={handleSelectChat}
                />
              ))}

              {/* Nút "Xem thêm" */}
              {remainingCount > 0 && (
                <button
                  onClick={handleLoadMore}
                  className="w-full py-3 mt-4 text-sm font-medium text-primary hover:bg-base-200 rounded-lg transition-colors duration-200"
                >
                  Xem thêm {remainingCount} cuộc hội thoại
                </button>
              )}

              {/* Thông báo khi không có conversations */}
              {sortedMessages.length === 0 && (
                <div className="text-center text-base-content/60 py-8">
                  Chưa có cuộc hội thoại nào
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ================= ChatDetail ================= */}
      <ChatDetail
        selectedChat={selectedChat}
        messages={messagesByConversation || []}
        setSelectedChat={setSelectedChat}
      />
    </>
  );
};

export default RightHomeScreen;
