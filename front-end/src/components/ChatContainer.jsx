import React, { useState, useEffect, useRef } from 'react';

// --- Re-integrated Chat Functionality (Local State Simulation) ---
const getRoleStyle = (role) => {
    const styles = {
        'Manager': { bg: 'bg-blue-500', text: 'text-blue-300' },
        'Supervisor': { bg: 'bg-green-500', text: 'text-green-300' },
        'Admin': { bg: 'bg-purple-500', text: 'text-purple-300' },
        'Quality Controller': { bg: 'bg-yellow-500', text: 'text-yellow-300' },
        'default': { bg: 'bg-gray-500', text: 'text-gray-300' }
    };
    return styles[role] || styles['default'];
};

const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    // Timestamp is now an ISO string
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ChatModal = ({ isOpen, onClose, userRole }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const chatWindowRef = useRef(null);
    const CHAT_STORAGE_KEY = 'role-based-chat-messages';

    // Effect to load messages from localStorage and listen for changes
    useEffect(() => {
        if (!isOpen) return;

        const loadMessages = () => {
            const storedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
            setMessages(storedMessages ? JSON.parse(storedMessages) : []);
        };
        
        loadMessages();

        // Listen for updates from other tabs to simulate real-time chat
        const handleStorageChange = (event) => {
            if (event.key === CHAT_STORAGE_KEY) {
                loadMessages();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [isOpen]);

    useEffect(() => {
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        const messageText = newMessage.trim();
        if (!messageText) return;

        const newMessageObj = {
            id: Date.now(), // Using timestamp for a simple unique ID
            text: messageText,
            role: userRole,
            timestamp: new Date().toISOString()
        };
        
        const updatedMessages = [...messages, newMessageObj];
        setMessages(updatedMessages);
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updatedMessages));
        setNewMessage('');
    };

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-2xl h-[90vh] flex flex-col bg-gray-800 text-white shadow-2xl rounded-2xl border border-gray-700">
                <div className="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
                    <div>
                        <h1 className="text-xl font-bold">Team Alerts & Chat</h1>
                        <p className="text-sm text-gray-400">Chatting as: <span className="font-semibold">{userRole}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <div ref={chatWindowRef} className="flex-1 p-6 overflow-y-auto space-y-4">
                    {messages.length === 0 && <div className="text-center text-gray-500">No messages yet.</div>}
                    {messages.map(msg => {
                        const isSentByCurrentUser = msg.role === userRole;
                        const roleStyle = getRoleStyle(msg.role);
                        return (
                             <div key={msg.id} className={`flex items-start gap-3 max-w-lg ${isSentByCurrentUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-white ${roleStyle.bg}`}>{msg.role?.charAt(0)}</div>
                                <div className={`flex flex-col ${isSentByCurrentUser ? 'items-end' : 'items-start'}`}>
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className={`font-bold ${roleStyle.text}`}>{msg.role}</span>
                                        <span className="text-gray-500">{formatTimestamp(msg.timestamp)}</span>
                                    </div>
                                    <div className={`mt-1 p-3 rounded-2xl ${isSentByCurrentUser ? 'bg-blue-600 rounded-br-none' : 'bg-gray-700 rounded-bl-none'}`}>
                                        <p className="text-white leading-snug">{msg.text}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div className="p-4 border-t border-gray-700">
                    <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
                        <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder={`Type as ${userRole}...`} className="flex-1 bg-gray-700 border border-gray-600 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 rounded-lg"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg></button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const ChatIcon = ({ onClick }) => (
    <button onClick={onClick} className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg z-40 transition-transform hover:scale-110">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
    </button>
);

const ChatContainer = ({ role }) => {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const LAST_READ_KEY = 'last-read-timestamp';

    useEffect(() => {
        // Load initial unread count
        const lastRead = localStorage.getItem(LAST_READ_KEY) || '0';
        const messages = JSON.parse(localStorage.getItem('role-based-chat-messages') || '[]');
        const newCount = messages.filter(msg => msg.timestamp > lastRead && msg.role !== role).length;
        setUnreadCount(newCount);

        // Listen for new messages
        const handleStorage = (e) => {
            if (e.key === 'role-based-chat-messages' && !isChatOpen) {
                const messages = JSON.parse(e.newValue || '[]');
                const lastRead = localStorage.getItem(LAST_READ_KEY) || '0';
                const newCount = messages.filter(msg => msg.timestamp > lastRead && msg.role !== role).length;
                setUnreadCount(newCount);
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [role, isChatOpen]);

    const handleOpenChat = () => {
        setIsChatOpen(true);
        setUnreadCount(0);
        localStorage.setItem(LAST_READ_KEY, new Date().toISOString());
    };

    return (
        <>
            <div className="relative">
                <ChatIcon onClick={handleOpenChat} />
                {unreadCount > 0 && (
                    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
                        {unreadCount}
                    </div>
                )}
            </div>
            <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} userRole={role} />
        </>
    );
};

export default ChatContainer;

