import type { HeroRoom } from '@/types';
import RoomImage from './room-image';

interface HeroSectionProps {
    room: HeroRoom | null;
    totalProperties: number;
    totalOwners: number;
}

export default function HeroSection({ room, totalProperties, totalOwners }: HeroSectionProps) {
    return (
        <section className="bg-background py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative h-128 rounded-lg overflow-hidden">
                    {room ? (
                        <RoomImage
                            src={room.primary_image}
                            alt={`Featured room: ${room.title}`}
                            className="h-full w-full"
                            objectFit="cover"
                            loadingSize="lg"
                        />
                    ) : (
                        <div className="bg-muted h-full"></div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/40"></div>
                    
                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Find the Perfect Temporary<br />
                            Housing for You
                        </h1>
                    </div>
                    
                    <div className="absolute bottom-6 left-6">
                        <h3 className="text-2xl font-bold text-white">
                            We are Here<br />
                            For You.
                        </h3>
                    </div>
                    
                    <div className="absolute right-6 bottom-6 space-y-4">
                        <div className="text-right">
                            <div className="text-4xl font-bold text-white">
                                {totalProperties.toLocaleString()}+
                            </div>
                            <div className="text-white/80">
                                {totalProperties === 1 ? 'Property Available' : 'Properties Available'}
                            </div>
                        </div>
                        
                        <div className="text-right">
                            <div className="text-4xl font-bold text-white">
                                {totalOwners.toLocaleString()}+
                            </div>
                            <div className="text-white/80">
                                {totalOwners === 1 ? 'Total Owner' : 'Total Owners'}
                            </div>
                        </div>
                    </div>
                    
                    {!room && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-muted-foreground/20 rounded-lg mx-auto mb-4"></div>
                                <h1 className="text-4xl font-bold text-foreground mb-4">
                                    Find the Perfect Temporary<br />
                                    Housing for You
                                </h1>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}