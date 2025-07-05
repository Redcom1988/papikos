import { MessageCircle, Phone } from 'lucide-react';

interface OwnerCardProps {
    owner: {
        id: number;
        name: string;
        email: string;
        phone?: string;
        avatar?: string;
    };
    description?: string;
    onMessageClick: () => void;
    onCallClick: () => void;
}

export default function OwnerCard({ 
    owner, 
    description, 
    onMessageClick, 
    onCallClick 
}: OwnerCardProps) {
    return (
        <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start space-x-4">
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
                    <h4 className="text-lg font-semibold text-foreground mb-1">{owner.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{owner.email}</p>
                    
                    {description && (
                        <p className="text-sm text-foreground mb-4 leading-relaxed">
                            {description}
                        </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                        <button 
                            onClick={onMessageClick}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md shadow-sm hover:bg-primary/90 transition-colors"
                            title="Send message"
                        >
                            <MessageCircle className="w-4 h-4" />
                            Message
                        </button>
                        
                        {owner.phone && (
                            <button 
                                onClick={onCallClick}
                                className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-md shadow-sm hover:bg-muted transition-colors"
                                title="Call owner"
                            >
                                <Phone className="w-4 h-4" />
                                Call
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}