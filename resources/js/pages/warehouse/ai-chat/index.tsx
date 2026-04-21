import type { PageProps } from '@inertiajs/core';
import { useForm } from '@inertiajs/react';
import { Send, Bot, User } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';

interface Message {
    id: number;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

interface ChatProps extends PageProps {
    auth: {
        user: {
            role: string;
        };
    };
}

export default function AiChat({ auth }: ChatProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            role: 'assistant',
            content: 'Halo! Saya adalah asisten AI untuk Warehouse Management System. Anda dapat bertanya tentang:\n\n- Stok produk\n- Produk dengan stok rendah\n- Daftar supplier\n- Transaksi terbaru\n- Kategori produk\n\nSilakan ajukan pertanyaan Anda!',
            timestamp: new Date().toISOString(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { post } = useForm();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!input.trim() || isLoading) {
return;
}

        const userMessage: Message = {
            id: Date.now(),
            role: 'user',
            content: input,
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/ai-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '',
                },
                body: JSON.stringify({ message: input }),
            });

            const data = await response.json();

            const assistantMessage: Message = {
                id: Date.now(),
                role: 'assistant',
                content: data.response || 'Maaf, terjadi kesalahan. Silakan coba lagi.',
                timestamp: new Date().toISOString(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            const errorMessage: Message = {
                id: Date.now(),
                role: 'assistant',
                content: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="p-6 space-y-6 h-[calc(100vh-120px)]">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">AI Chat</h1>
                <p className="text-muted-foreground">
                    Tanyakan tentang data gudang
                </p>
            </div>

            <Card className="flex flex-col h-full">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                        <Bot className="h-5 w-5" />
                        Warehouse Assistant
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex gap-3 ${
                                    message.role === 'user' ? 'flex-row-reverse' : ''
                                }`}
                            >
                                <div
                                    className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                        message.role === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted'
                                    }`}
                                >
                                    {message.role === 'user' ? (
                                        <User className="h-4 w-4" />
                                    ) : (
                                        <Bot className="h-4 w-4" />
                                    )}
                                </div>
                                <div
                                    className={`flex-1 max-w-[80%] ${
                                        message.role === 'user'
                                            ? 'text-right'
                                            : ''
                                    }`}
                                >
                                    <div
                                        className={`inline-block rounded-lg px-4 py-2 text-sm whitespace-pre-wrap ${
                                            message.role === 'user'
                                                ? 'bg-primary text-primary-foreground'
                                                : 'bg-muted'
                                        }`}
                                    >
                                        {message.content}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formatTime(message.timestamp)}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                    <Bot className="h-4 w-4" />
                                </div>
                                <div className="bg-muted rounded-lg px-4 py-2">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Tanyakan tentang data gudang..."
                            disabled={isLoading}
                            className="flex-1"
                        />
                        <Button type="submit" disabled={isLoading || !input.trim()}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

AiChat.layout = (page: React.ReactNode) => (
    <AppLayout breadcrumbs={[{ title: 'AI Chat', href: '/ai-chat' }]}>
        {page}
    </AppLayout>
);
