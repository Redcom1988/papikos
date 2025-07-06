import { MessageCircle } from 'lucide-react';
import { IconButton } from '@/components/ui/icon-button';

interface OwnerCardProps {
    owner: {
        id: number;
        name: string;
        email: string;
        phone?: string;
        avatar?: string;
    };
    onMessageClick: () => void;
}

export default function OwnerCard({ 
    owner, 
    onMessageClick, 
}: OwnerCardProps) {
    return (
        <div className="bg-muted/50 border border-border rounded-lg p-6">
            <div className="flex items-center space-x-4">
                {/* Owner Avatar */}
                <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                        {owner.avatar ? (
                            <img 
                                src={owner.avatar} 
                                alt={owner.name}
                                className="w-16 h-16 rounded-full object-cover"
                            />
                        ) : (
                            <span className="text-xl font-semibold text-muted-foreground">
                                {owner.name.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                </div>

                {/* Owner Info */}
                <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-semibold text-foreground">{owner.name}</h4>
                    <p className="text-sm text-muted-foreground">{owner.email}</p>
                    <p className="text-sm text-muted-foreground">{owner.phone}</p>
                </div>

                {/* Message Button */}
                <div className="flex-shrink-0">
                    <IconButton
                        onClick={onMessageClick}
                        title="Send message"
                        size="xl"
                        className="transition-all duration-200 hover:scale-105"
                    >
                        <MessageCircle className="w-5 h-5 transition-all duration-200 text-foreground hover:text-primary hover:drop-shadow-lg" />
                    </IconButton>
                </div>
            </div>
        </div>
    );
}