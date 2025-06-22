import { MessageCircle, Phone } from 'lucide-react';

interface Owner {
    id: number;
    name: string;
    phone: string;
}

interface OwnerCardProps {
    owner: Owner;
    description: string;
    onMessageClick?: () => void;
    onCallClick?: () => void;
    className?: string;
}

export default function OwnerCard({ 
    owner, 
    description, 
    onMessageClick, 
    onCallClick,
    className = ""
}: OwnerCardProps) {
    return (
        <div className={`mb-8 ${className}`}>
            <div className="flex items-start space-x-4">
                {/* Owner Avatar */}
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-foreground font-medium">{owner.name.charAt(0)}</span>
                </div>
                
                {/* Owner Info */}
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground">{owner.name}</h4>
                    <p className="text-sm text-muted-foreground mb-3">Owner</p>
                    
                    <div className="mb-4">
                        <h5 className="font-medium text-foreground mb-2">Overview</h5>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {description}
                        </p>
                    </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-2 flex-shrink-0">
                    <button 
                        onClick={onMessageClick}
                        className="w-10 h-10 border border-border rounded-full hover:bg-muted flex items-center justify-center transition-colors"
                        title="Send message"
                    >
                        <MessageCircle className="w-4 h-4 text-primary" />
                    </button>
                    <button 
                        onClick={onCallClick}
                        className="w-10 h-10 border border-border rounded-full hover:bg-muted flex items-center justify-center transition-colors"
                        title="Call owner"
                    >
                        <Phone className="w-4 h-4 text-primary" />
                    </button>
                </div>
            </div>
        </div>
    );
}