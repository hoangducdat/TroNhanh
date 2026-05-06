// ============================================================
// pages/shared/MessagesPage.tsx — Zalo / iMessage style
// Bubble phải = mình (emerald), trái = đối phương (trắng)
// userId từ AuthData dùng để so sánh senderId
// ============================================================

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import useAuthStore from '../../store/authStore';

/* ── Types ─────────────────────────────────────────────────── */
interface Conversation {
  contactId: number;
  contactUsername: string;
  contactFullName: string;
  contactAvatarUrl: string;
  lastMessage: string;
  lastMessageAt: string;
  isRead: boolean;
}

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  createdAt: string;
  isRead: boolean;
}

interface PinnedRoom {
  id: number;
  title: string;
  price: number;
  imageUrl?: string;
}

/* ── Helpers ────────────────────────────────────────────────── */
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}
function fmtPrice(p: number) {
  if (p >= 1_000_000) return `${(p / 1_000_000).toFixed(1).replace('.0', '')} tr/th`;
  if (p >= 1_000)     return `${(p / 1_000).toFixed(0)}k/th`;
  return `${p}/th`;
}

function AvatarCircle({ url, name, size = 10, color = 'indigo' }: {
  url?: string; name?: string; size?: number; color?: string;
}) {
  const bg = color === 'emerald' ? '#d1fae5' : '#e0e7ff';
  const fg = color === 'emerald' ? '#065f46' : '#3730a3';
  return (
    <div
      className={`w-${size} h-${size} rounded-full overflow-hidden flex items-center justify-center font-bold text-sm flex-shrink-0 border-2 border-white shadow-sm`}
      style={{ background: url ? undefined : bg, color: url ? undefined : fg, width: size * 4, height: size * 4, fontSize: 14 }}
    >
      {url ? <img src={url} alt="" className="w-full h-full object-cover" /> : (name?.[0]?.toUpperCase() ?? '?')}
    </div>
  );
}

/* ── Component ──────────────────────────────────────────────── */
export default function MessagesPage() {
  const { user } = useAuthStore();
  const myId = user?.userId; // AuthData dùng userId, không phải id!

  const [searchParams] = useSearchParams();
  const initUserId = searchParams.get('userId');
  const initRoomId = searchParams.get('roomId');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeContactId, setActiveContactId] = useState<number | null>(
    initUserId ? parseInt(initUserId) : null
  );
  const [messages,    setMessages]    = useState<Message[]>([]);
  const [newMessage,  setNewMessage]  = useState('');
  const [loadingConv, setLoadingConv] = useState(true);
  const [pinnedRoom,  setPinnedRoom]  = useState<PinnedRoom | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLInputElement>(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => { scrollToBottom(); }, [messages]);

  /* Load thông tin phòng ghim */
  useEffect(() => {
    if (!initRoomId) return;
    axiosClient.get(`/api/public/rooms/${initRoomId}`)
      .then(res => {
        const r = res.data.data;
        setPinnedRoom({ id: r.id, title: r.title, price: r.price, imageUrl: r.imageUrls?.[0] });
      }).catch(() => {});
  }, [initRoomId]);

  /* Load conversations */
  const loadConversations = async () => {
    try {
      const res = await axiosClient.get('/api/messages/conversations');
      setConversations(res.data.data ?? []);
    } catch (_) {}
    setLoadingConv(false);
  };

  /* Load messages với contact */
  const loadMessages = async (contactId: number) => {
    try {
      const res = await axiosClient.get(`/api/messages/${contactId}`);
      setMessages(res.data.data ?? []);
      await axiosClient.put(`/api/messages/${contactId}/read`);
    } catch (_) {}
  };

  /* Polling 5s */
  useEffect(() => {
    loadConversations();
    const t = setInterval(() => {
      loadConversations();
      if (activeContactId) loadMessages(activeContactId);
    }, 5000);
    return () => clearInterval(t);
  }, [activeContactId]);

  useEffect(() => {
    if (activeContactId) {
      loadMessages(activeContactId);
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [activeContactId]);

  /* Gửi tin */
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeContactId) return;
    try {
      const res = await axiosClient.post('/api/messages', {
        receiverId: activeContactId,
        content: newMessage,
      });
      setMessages(prev => [...prev, res.data.data]);
      setNewMessage('');
      loadConversations();
    } catch (_) {
      alert('Gửi tin nhắn thất bại');
    }
  };

  const activeContact = conversations.find(c => c.contactId === activeContactId);

  /* ── Render ───────────────────────────────────────────────── */
  return (
    // Chiếm toàn bộ không gian còn lại của NavbarOnlyLayout (flex-1 flex-col)
    <div className="flex-1 flex min-h-0">

      {/* ══════════ LEFT: Danh sách hội thoại ══════════ */}
      <aside className="w-72 xl:w-80 flex-shrink-0 border-r border-zinc-200 flex flex-col bg-white overflow-hidden">

        {/* Sidebar header */}
        <div className="px-5 py-4 border-b border-zinc-100 flex-shrink-0">
          <h1 className="text-lg font-black text-zinc-900 tracking-tight">Tin nhắn</h1>
          <p className="text-[11px] text-zinc-400 mt-0.5 font-medium">
            {conversations.length > 0
              ? `${conversations.length} cuộc trò chuyện`
              : 'Chưa có cuộc trò chuyện'}
          </p>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loadingConv ? (
            <div className="flex justify-center items-center py-12">
              <svg className="w-5 h-5 animate-spin text-zinc-300" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                </svg>
              </div>
              <p className="text-sm font-semibold text-zinc-500">Chưa có tin nhắn</p>
              <p className="text-xs text-zinc-400 mt-1">Tìm phòng và nhắn tin chủ trọ</p>
            </div>
          ) : (
            conversations.map(conv => {
              const active = activeContactId === conv.contactId;
              return (
                <button
                  key={conv.contactId}
                  onClick={() => setActiveContactId(conv.contactId)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left border-b border-zinc-50 transition-colors cursor-pointer
                    ${active ? 'bg-zinc-900' : 'hover:bg-zinc-50'}`}
                >
                  {/* Avatar */}
                  <div
                    className="w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm overflow-hidden border-2"
                    style={{
                      borderColor: active ? '#52525b' : '#e4e4e7',
                      background: conv.contactAvatarUrl ? undefined : (active ? '#3f3f46' : '#e0e7ff'),
                      color: conv.contactAvatarUrl ? undefined : (active ? '#fff' : '#3730a3'),
                    }}
                  >
                    {conv.contactAvatarUrl
                      ? <img src={conv.contactAvatarUrl} alt="" className="w-full h-full object-cover"/>
                      : conv.contactUsername?.[0]?.toUpperCase()}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <p className={`text-sm font-bold truncate ${active ? 'text-white' : 'text-zinc-900'}`}>
                        {conv.contactFullName || conv.contactUsername}
                      </p>
                      <span className={`text-[10px] ml-2 flex-shrink-0 ${active ? 'text-zinc-400' : 'text-zinc-400'}`}>
                        {fmtTime(conv.lastMessageAt)}
                      </span>
                    </div>
                    <p className={`text-xs truncate mt-0.5 ${
                      !conv.isRead
                        ? active ? 'text-zinc-300 font-semibold' : 'text-zinc-800 font-bold'
                        : active ? 'text-zinc-500' : 'text-zinc-400'
                    }`}>
                      {conv.lastMessage}
                    </p>
                  </div>

                  {/* Unread */}
                  {!conv.isRead && !active && (
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0"/>
                  )}
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* ══════════ RIGHT: Khung Chat ══════════ */}
      <div className="flex-1 flex flex-col min-w-0" style={{ background: '#f0f2f5' }}>
        {activeContactId ? (
          <>
            {/* Chat header */}
            <div className="bg-white border-b border-zinc-200 px-5 py-3 flex items-center gap-3 flex-shrink-0 shadow-sm z-10">
              <AvatarCircle
                url={activeContact?.contactAvatarUrl}
                name={activeContact?.contactUsername}
                size={10}
                color="indigo"
              />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-zinc-900 text-sm truncate">
                  {activeContact?.contactFullName || activeContact?.contactUsername || 'Người dùng'}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"/>
                  <p className="text-xs text-emerald-600 font-medium">Đang hoạt động</p>
                </div>
              </div>
            </div>

            {/* ── Messages list ── */}
            <div className="flex-1 overflow-y-auto px-4 md:px-16 py-4 flex flex-col gap-0.5">

              {/* Pinned room card */}
              {pinnedRoom && (
                <div className="flex justify-center mb-4 flex-shrink-0">
                  <Link
                    to={`/rooms/${pinnedRoom.id}`}
                    className="flex items-center gap-3 bg-white border border-zinc-200 rounded-2xl px-4 py-3 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all max-w-sm w-full"
                  >
                    {pinnedRoom.imageUrl ? (
                      <img src={pinnedRoom.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0"/>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-0.5">📌 Phòng quan tâm</p>
                      <p className="text-sm font-bold text-zinc-900 truncate">{pinnedRoom.title}</p>
                      <p className="text-xs font-black text-emerald-600">{fmtPrice(pinnedRoom.price)}</p>
                    </div>
                    <svg className="w-4 h-4 text-zinc-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                    </svg>
                  </Link>
                </div>
              )}

              {/* Empty state */}
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-20">
                  <div className="w-20 h-20 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
                    <svg className="w-10 h-10 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                    </svg>
                  </div>
                  <p className="font-semibold text-zinc-500 text-sm">Hãy bắt đầu cuộc trò chuyện</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  // QUAN TRỌNG: so sánh với userId, không phải id
                  const isMe = String(msg.senderId) === String(myId);

                  const prev = messages[idx - 1];
                  const next = messages[idx + 1];
                  const prevIsMe = prev ? String(prev.senderId) === String(myId) : null;
                  const nextIsMe = next ? String(next.senderId) === String(myId) : null;

                  const isFirst = prevIsMe === null || prevIsMe !== isMe;
                  const isLast  = nextIsMe === null || nextIsMe !== isMe;

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'} ${isFirst ? 'mt-4' : 'mt-0.5'}`}
                    >
                      {/* Avatar — chỉ bên trái, chỉ tin cuối group */}
                      <div className="flex-shrink-0" style={{ width: 36 }}>
                        {!isMe && isLast ? (
                          <AvatarCircle
                            url={activeContact?.contactAvatarUrl}
                            name={activeContact?.contactUsername}
                            size={9}
                            color="indigo"
                          />
                        ) : null}
                      </div>

                      {/* Bubble column */}
                      <div className={`flex flex-col gap-0.5 ${isMe ? 'items-end' : 'items-start'}`}
                           style={{ maxWidth: '65%' }}>

                        {/* Tên — đầu group, bên trái */}
                        {!isMe && isFirst && (
                          <span className="text-[11px] font-bold text-indigo-500 ml-1 mb-0.5">
                            {activeContact?.contactFullName || activeContact?.contactUsername}
                          </span>
                        )}

                        {/* Bubble */}
                        <div
                          className="px-4 py-2.5 text-sm leading-relaxed break-words"
                          style={{
                            background: isMe ? '#25d366' : '#ffffff',
                            color:      isMe ? '#ffffff' : '#111827',
                            borderRadius: isMe
                              ? `18px 18px ${isLast ? '4px' : '18px'} 18px`
                              : `18px 18px 18px ${isLast ? '4px' : '18px'}`,
                            border: isMe ? 'none' : '1px solid #e5e7eb',
                            boxShadow: isMe
                              ? '0 2px 8px rgba(37,211,102,0.3)'
                              : '0 1px 4px rgba(0,0,0,0.08)',
                          }}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>

                        {/* Timestamp — chỉ tin cuối group */}
                        {isLast && (
                          <span
                            className="text-[10px] px-1 font-medium"
                            style={{ color: isMe ? '#6b7280' : '#9ca3af' }}
                          >
                            {fmtTime(msg.createdAt)}
                            {isMe && <span className="ml-1 text-emerald-500">✓</span>}
                          </span>
                        )}
                      </div>

                      {/* Spacer bên phải để giữ bubble không sát cạnh */}
                      {isMe && <div style={{ width: 36 }} className="flex-shrink-0" />}
                    </div>
                  );
                })
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Input bar ── */}
            <div className="bg-white border-t border-zinc-200 px-4 py-3 flex-shrink-0">
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <div className="flex-1 flex items-center bg-zinc-100 rounded-full px-4 py-2.5
                                border-2 border-transparent focus-within:border-emerald-400
                                focus-within:bg-white transition-all">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 bg-transparent outline-none text-sm text-zinc-900 placeholder-zinc-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95 flex-shrink-0 shadow-md disabled:cursor-not-allowed"
                  style={{ background: newMessage.trim() ? '#25d366' : '#d1d5db' }}
                >
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                </button>
              </form>
            </div>
          </>
        ) : (
          /* No conversation selected */
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="w-28 h-28 rounded-3xl bg-white shadow-md flex items-center justify-center mb-6">
              <svg className="w-14 h-14 text-zinc-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
              </svg>
            </div>
            <h3 className="text-xl font-black text-zinc-900 mb-2 tracking-tight">Chọn cuộc trò chuyện</h3>
            <p className="text-zinc-500 text-sm font-light max-w-xs leading-relaxed">
              Chọn một hội thoại ở bên trái để bắt đầu nhắn tin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
