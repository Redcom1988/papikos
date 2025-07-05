import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Send, MessageCircle, Loader2, X, Minimize2 } from 'lucide-react';
import { usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type SharedData } from '@/types';
import axios from 'axios';

interface User {
    id: number;
    name: string;
    email?: string;
}

interface Message {
    id: number;
    receiver: number;
    sender: number;
    message: string;
    created_at: string | Date;
    updated_at: string | Date;
}

interface MobileChatProps {
    className?: string;
}

export interface MobileChatRef {
    openChatWithUser: (user: User) => void;
}

const MobileChat = forwardRef<MobileChatRef, MobileChatProps>(({ className = '' }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const auth = usePage<SharedData>().props.auth;

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const fetchUsers = async () => {
        if (!auth.user) return;
        
        setIsLoadingUsers(true);
        try {
            // Change this line to use the correct API endpoint
            const response = await axios.get('/api/chat-users');
            if (response.status === 200) {
                setUsers(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const fetchAllUsers = async () => {
        try {
            // Add this function to fetch all users
            const response = await axios.get('/api/users');
            if (response.status === 200) {
                setAllUsers(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch all users:', error);
        }
    };

    const handleSendMessage = async (userId: number) => {
        if (!inputValue.trim()) return;

        setIsSending(true);

        // Declare optimisticMessage here so it's accessible in catch block
        const optimisticMessage = {
            id: Date.now(),
            sender: auth.user.id,
            receiver: userId,
            message: inputValue,
            created_at: new Date(),
            updated_at: new Date(),
        };

        try {
            const payload = {
                message: inputValue,
                receiver: userId,
            };

            setMessages((prev) => [...prev, optimisticMessage]);
            setInputValue('');

            await axios.post('/messages', payload);
            
            // Don't call fetchMessages with loader - just refresh silently
            fetchMessages(userId, false);
        } catch (error) {
            console.error('Failed to send message:', error);
            // Remove the optimistic message on error
            setMessages((prev) => prev.filter(msg => msg.id !== optimisticMessage.id));
        } finally {
            setIsSending(false);
        }
    };

    const fetchMessages = async (userId: number, showLoader = true) => {
        if (showLoader) {
            setIsLoadingMessages(true);
        }
        
        try {
            const response = await axios.get(`/messages/${userId}`);
            if (response.status === 200) {
                setMessages(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            if (showLoader) {
                setIsLoadingMessages(false);
            }
        }
    };

    useEffect(() => {
        if (!selectedUser) return;

        fetchMessages(selectedUser.id, true);

        const interval = setInterval(() => {
            fetchMessages(selectedUser.id, false);
        }, 3000);

        return () => clearInterval(interval);
    }, [selectedUser]);

    useEffect(() => {
        if (isOpen && !isMinimized && users.length === 0) {
            fetchUsers();
        }
    }, [isOpen, isMinimized]);

    // Expose methods to parent components
    useImperativeHandle(ref, () => ({
        openChatWithUser: (user: User) => {
            setIsOpen(true);
            setIsMinimized(false);
            setSelectedUser(user);
            // Add user to users list if not already there
            setUsers(prev => {
                const userExists = prev.some(u => u.id === user.id);
                if (!userExists) {
                    return [...prev, user];
                }
                return prev;
            });
        }
    }));

    if (!auth.user) {
        return null;
    }

    return (
        <>
            {/* Chat Toggle Button */}
            {!isOpen && (
                <div className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 z-50 ${className}`}>
                    <Button
                        onClick={() => setIsOpen(true)}
                        size="icon"
                        className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
                    >
                        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                    </Button>
                </div>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className={`fixed inset-x-4 bottom-4 sm:inset-x-auto sm:bottom-4 sm:right-4 sm:w-80 lg:w-96 lg:bottom-6 lg:right-6 z-50 ${className}`}>
                    <div className={`bg-background border border-border rounded-lg shadow-xl transition-all duration-200 ${
                        isMinimized 
                            ? 'h-12 sm:h-14' 
                            : 'h-[70vh] sm:h-96 lg:h-[500px] max-h-[600px]'
                    }`}>
                        {/* Header */}
                        <div className="flex items-center justify-between p-2 sm:p-3 border-b border-border bg-muted/50 rounded-t-lg">
                            <div className="flex items-center gap-2">
                                <MessageCircle className="w-4 h-4" />
                                <span className="font-medium text-xs sm:text-sm truncate">
                                    {selectedUser ? selectedUser.name : 'Messages'}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setIsMinimized(!isMinimized)}
                                    className="w-6 h-6 sm:w-7 sm:h-7"
                                >
                                    <Minimize2 className="w-3 h-3" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setIsOpen(false);
                                        setIsMinimized(false);
                                        setSelectedUser(null);
                                    }}
                                    className="w-6 h-6 sm:w-7 sm:h-7"
                                >
                                    <X className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>

                        {/* Content */}
                        {!isMinimized && (
                            <>
                                {!selectedUser ? (
                                    /* Users List */
                                    <div className="flex flex-col h-[calc(100%-3rem)]">
                                        <div className="p-2 sm:p-3 border-b border-border">
                                            <h3 className="text-xs sm:text-sm font-medium">Recent Chats</h3>
                                        </div>
                                        <ScrollArea className="flex-1">
                                            {isLoadingUsers ? (
                                                <div className="flex items-center justify-center h-32">
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                </div>
                                            ) : users.length > 0 ? (
                                                <div className="p-2 space-y-1">
                                                    {users.map((user) => (
                                                        <Button
                                                            key={user.id}
                                                            variant="ghost"
                                                            className="w-full justify-start text-left h-auto p-2 sm:p-3"
                                                            onClick={() => setSelectedUser(user)}
                                                        >
                                                            <div>
                                                                <div className="font-medium text-xs sm:text-sm">{user.name}</div>
                                                                <div className="text-xs text-muted-foreground">Click to chat</div>
                                                            </div>
                                                        </Button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center h-32 text-muted-foreground text-xs sm:text-sm">
                                                    No conversations yet
                                                </div>
                                            )}
                                        </ScrollArea>
                                    </div>
                                ) : (
                                    /* Chat Interface */
                                    <div className="flex flex-col h-[calc(100%-3rem)]">
                                        {/* Back Button */}
                                        <div className="p-2 border-b border-border">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSelectedUser(null)}
                                                className="text-xs"
                                            >
                                                ← Back to chats
                                            </Button>
                                        </div>

                                        {/* Messages - takes available space but leaves room for input */}
                                        <div className="flex-1 min-h-0">
                                            <ScrollArea className="h-full p-2 sm:p-3">
                                                {isLoadingMessages ? (
                                                    <div className="flex items-center justify-center h-32">
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {messages.length === 0 ? (
                                                            <div className="text-center text-muted-foreground text-xs sm:text-sm p-4">
                                                                No messages yet. Start the conversation!
                                                            </div>
                                                        ) : (
                                                            messages.map((message) => (
                                                                <div
                                                                    key={message.id}
                                                                    className={`flex ${
                                                                        message.sender === auth.user.id ? 'justify-end' : 'justify-start'
                                                                    }`}
                                                                >
                                                                    <div
                                                                        className={`max-w-[85%] sm:max-w-[80%] px-2 py-1 sm:px-3 sm:py-2 rounded-lg text-xs ${
                                                                            message.sender === auth.user.id
                                                                                ? 'bg-primary text-primary-foreground'
                                                                                : 'bg-muted'
                                                                        } ${
                                                                            // Add subtle opacity for optimistic messages
                                                                            message.id > 1000000000000 ? 'opacity-80' : ''
                                                                        }`}
                                                                    >
                                                                        <p className="break-words">{message.message}</p>
                                                                        <div className="flex items-center justify-between mt-1">
                                                                            <p className="text-xs opacity-70">
                                                                                {new Date(message.created_at).toLocaleTimeString([], {
                                                                                    hour: '2-digit',
                                                                                    minute: '2-digit'
                                                                                })}
                                                                            </p>
                                                                            {/* Show sending indicator for optimistic messages */}
                                                                            {message.sender === auth.user.id && message.id > 1000000000000 && isSending && (
                                                                                <Loader2 className="w-3 h-3 animate-spin opacity-60 ml-1" />
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        )}
                                                        <div ref={messagesEndRef} />
                                                    </div>
                                                )}
                                            </ScrollArea>
                                        </div>

                                        {/* Input - always visible at bottom */}
                                        <div className="flex-shrink-0 p-2 sm:p-3 border-t border-border bg-background">
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    value={inputValue}
                                                    onChange={(e) => setInputValue(e.target.value)}
                                                    placeholder="Type a message..."
                                                    className="text-xs h-8 sm:h-9"
                                                    disabled={isLoadingMessages}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && inputValue.trim() && !isSending && !isLoadingMessages) {
                                                            handleSendMessage(selectedUser.id);
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    onClick={() => handleSendMessage(selectedUser.id)}
                                                    disabled={isSending || inputValue.trim() === '' || isLoadingMessages}
                                                    size="icon"
                                                    className="w-8 h-8 sm:w-9 sm:h-9"
                                                >
                                                    {isSending ? (
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    ) : (
                                                        <Send className="w-3 h-3" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
});

MobileChat.displayName = 'MobileChat';
export default MobileChat;