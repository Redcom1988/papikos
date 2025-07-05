import { Head, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, MessageCircle, Loader2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type BreadcrumbItem, type SharedData } from '@/types';
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

interface MessagesProps {
    users: User[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Messages',
        href: '/messages',
    },
];

export default function Messages({ users }: MessagesProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const auth = usePage<SharedData>().props.auth;

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

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

        // Initial fetch with loader
        fetchMessages(selectedUser.id, true);

        // Set up polling for new messages (without loader for background updates)
        const interval = setInterval(() => {
            fetchMessages(selectedUser.id, false);
        }, 2000);

        return () => clearInterval(interval);
    }, [selectedUser]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Messages" />
            
            <div className="flex h-[90vh] w-full overflow-hidden">
                {/* Sidebar - Users */}
                <div className="w-1/4 border-r p-4 space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        Users
                    </h2>
                    <ScrollArea className="h-[calc(100vh-12rem)]">
                        <div className="space-y-2">
                            {users.map((user) => (
                                <Button
                                    key={user.id}
                                    variant={selectedUser?.id === user.id ? 'default' : 'ghost'}
                                    className="w-full justify-start"
                                    onClick={() => setSelectedUser(user)}
                                >
                                    {user.name}
                                </Button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Chat area */}
                <div className="flex flex-col w-3/4">
                    {selectedUser ? (
                        <>
                            {/* Header */}
                            <div className="border-b p-4 bg-background shadow-sm">
                                <h2 className="text-lg font-semibold">{selectedUser.name}</h2>
                                <p className="text-sm text-muted-foreground">Online</p>
                            </div>

                            {/* Messages area */}
                            <ScrollArea className="flex-1 overflow-y-auto p-4">
                                {isLoadingMessages ? (
                                    <div className="flex items-center justify-center h-full">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                            <span>Loading messages...</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {messages.map((message) => (
                                            <div
                                                key={message.id}
                                                className={`flex ${
                                                    message.sender === auth.user.id ? 'justify-end' : 'justify-start'
                                                }`}
                                            >
                                                <div
                                                    className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                                                        message.sender === auth.user.id
                                                            ? 'bg-primary text-primary-foreground rounded-br-none'
                                                            : 'bg-muted rounded-bl-none'
                                                    } ${
                                                        // Add subtle opacity for optimistic messages
                                                        message.id > 1000000000000 ? 'opacity-80' : ''
                                                    }`}
                                                >
                                                    <p>{message.message}</p>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <p className={`text-xs ${
                                                            message.sender === auth.user.id 
                                                                ? 'text-primary-foreground/70' 
                                                                : 'text-muted-foreground'
                                                        }`}>
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
                                        ))}
                                        <div ref={messagesEndRef} />
                                    </div>
                                )}
                            </ScrollArea>

                            {/* Input area */}
                            <div className="border-t p-4">
                                <div className="flex items-center gap-2">
                                    <Input
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        placeholder="Type a message..."
                                        className="rounded-full px-4 py-2"
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
                                        className="rounded-full"
                                    >
                                        {isSending ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <Send className="h-5 w-5" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                                <p className="text-lg font-medium mb-2">Select a user to start chatting</p>
                                <p className="text-sm">Choose someone from the list to begin your conversation</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}