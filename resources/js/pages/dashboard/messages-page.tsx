import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import axios from 'axios';
import { Loader2, MessageCircle, Send, User } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

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
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Messages', href: '/dashboard/messages' },
];

export default function Messages({ users }: MessagesProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [inputValue, setInputValue] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const auth = usePage<SharedData>().props.auth;

    const scrollToBottom = useCallback(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    const handleSendMessage = async (userId: number) => {
        if (!inputValue.trim()) return;

        setIsSending(true);

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
            
            fetchMessages(userId, false);
        } catch (error) {
            console.error('Failed to send message:', error);
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
        }, 2000);

        return () => clearInterval(interval);
    }, [selectedUser]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Messages" />
            
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Messages</h1>
                        <p className="text-muted-foreground">
                            Communicate with tenants and inquirers
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex gap-6 h-[calc(100vh-12rem)]">
                    {/* Users List */}
                    <div className="w-[28rem] bg-card border rounded-lg p-6 flex flex-col">
                        <div className="flex items-center gap-2 mb-4">
                            <User className="w-5 h-5 text-muted-foreground" />
                            <h2 className="text-lg font-semibold">Contacts</h2>
                            <Badge variant="secondary" className="ml-auto">
                                {users.length}
                            </Badge>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto">
                            <div className="space-y-2">
                                {users.length > 0 ? (
                                    users.map((user) => (
                                        <div
                                            key={user.id}
                                            onClick={() => setSelectedUser(user)}
                                            className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                                                selectedUser?.id === user.id
                                                    ? 'bg-accent border-accent-foreground/20 shadow-sm'
                                                    : 'hover:bg-accent/50 border-transparent'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                                                    <User className="w-6 h-6 text-muted-foreground" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-base mb-1">{user.name}</h4>
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold mb-2">No contacts yet</h3>
                                        <p className="text-muted-foreground text-sm">
                                            You haven't started any conversations.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 bg-card border rounded-lg flex flex-col min-w-0">
                        {selectedUser ? (
                            <>
                                {/* Chat Header */}
                                <div className="border-b p-4 bg-muted/30 flex-shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                                            <User className="w-5 h-5 text-muted-foreground" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-semibold truncate">{selectedUser.name}</h3>
                                            <p className="text-sm text-muted-foreground truncate">
                                                {selectedUser.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Messages Area */}
                                <div 
                                    ref={messagesContainerRef}
                                    className="flex-1 overflow-y-auto p-4"
                                >
                                    {isLoadingMessages ? (
                                        <div className="flex items-center justify-center h-full">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Loader2 className="h-5 w-5 animate-spin" />
                                                <span>Loading messages...</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {messages.length > 0 ? (
                                                messages.map((message) => (
                                                    <div
                                                        key={message.id}
                                                        className={`flex ${
                                                            message.sender === auth.user.id ? 'justify-end' : 'justify-start'
                                                        }`}
                                                    >
                                                        <div
                                                            className={`max-w-[70%] rounded-lg p-3 ${
                                                                message.sender === auth.user.id
                                                                    ? 'bg-primary text-primary-foreground'
                                                                    : 'bg-muted/50 border'
                                                            } ${
                                                                message.id > 1000000000000 ? 'opacity-80' : ''
                                                            }`}
                                                        >
                                                            <p className="text-sm break-words">{message.message}</p>
                                                            <div className="flex items-center justify-between mt-2">
                                                                <p className={`text-xs ${
                                                                    message.sender === auth.user.id 
                                                                        ? 'text-primary-foreground/60' 
                                                                        : 'text-muted-foreground'
                                                                }`}>
                                                                    {new Date(message.created_at).toLocaleTimeString([], {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </p>
                                                                {message.sender === auth.user.id && message.id > 1000000000000 && isSending && (
                                                                    <Loader2 className="w-3 h-3 animate-spin text-primary-foreground/60 ml-2" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-12">
                                                    <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                                    <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
                                                    <p className="text-muted-foreground">
                                                        Start a conversation with {selectedUser.name}
                                                    </p>
                                                </div>
                                            )}
                                            <div ref={messagesEndRef} />
                                        </div>
                                    )}
                                </div>

                                {/* Input Area */}
                                <div className="border-t p-4 bg-muted/20 flex-shrink-0">
                                    <div className="flex items-center gap-3">
                                        <Input
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            placeholder={`Type a message to ${selectedUser.name}...`}
                                            className="flex-1"
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
                                        >
                                            {isSending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Send className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                                    <h3 className="text-lg font-semibold mb-2">Select a contact</h3>
                                    <p className="text-muted-foreground">
                                        Choose someone from your contacts to start chatting
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}