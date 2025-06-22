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
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium">{owner.name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium">{owner.name}</h4>
                    <p className="text-sm text-gray-600 mb-3">Owner</p>
                    
                    <div className="mb-4">
                        <h5 className="font-medium mb-2">Overview</h5>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            {description}
                        </p>
                    </div>
                </div>
                <div className="flex space-x-2 flex-shrink-0">
                    <button 
                        onClick={onMessageClick}
                        className="w-10 h-10 border border-gray-300 rounded-full hover:bg-gray-50 flex items-center justify-center transition-colors"
                        title="Send message"
                    >
                        <span className="text-blue-600">💬</span>
                    </button>
                    <button 
                        onClick={onCallClick}
                        className="w-10 h-10 border border-gray-300 rounded-full hover:bg-gray-50 flex items-center justify-center transition-colors"
                        title="Call owner"
                    >
                        <span className="text-blue-600">📞</span>
                    </button>
                </div>
            </div>
        </div>
    );
}