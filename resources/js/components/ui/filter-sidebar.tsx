import type { FilterSidebarProps } from '@/types';
import { NO_LIMIT_PRICE } from '@/constants';
import { Input } from './input';
import { Button } from './button';
import Tag from './tag';
import { Checkbox } from './checkbox'

export default function FilterSidebar({ 
    variant = 'simple',
    facilities,
    selectedFacilities,
    onFacilityToggle,
    minPrice = 0,
    maxPrice = NO_LIMIT_PRICE,
    onPriceRangeChange,
    isAvailable = false,
    onIsAvailableToggle,
    onClearFilters
}: FilterSidebarProps) {

    const handleIsAvailableToggle = (checked: boolean) => {
        onIsAvailableToggle?.(checked);
    };

    const handleMinPriceChange = (value: string) => {
        const numValue = value === '' ? 0 : parseInt(value.replace(/\D/g, ''), 10);
        onPriceRangeChange?.(numValue, maxPrice);
    };

    const handleMaxPriceChange = (value: string) => {
        const numValue = value === '' ? NO_LIMIT_PRICE : parseInt(value.replace(/\D/g, ''), 10);    
        onPriceRangeChange?.(minPrice, numValue);
    };

    const formatPriceInput = (value: number) => {
        if (value === 0) return '';
        if (value >= NO_LIMIT_PRICE) return '';
        return new Intl.NumberFormat('id-ID').format(value);
    };

    if (variant === 'simple') {
        return (
            <div className="bg-card border border-border p-6 rounded-lg shadow-sm">
                <h3 className="font-semibold text-card-foreground mb-4">Price Range</h3>

                <div className="space-y-3 mb-6">
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Minimum Price
                        </label>
                        <Input
                            type="text"
                            placeholder="0"
                            value={formatPriceInput(minPrice)}
                            onChange={(e) => handleMinPriceChange(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Maximum Price
                        </label>
                        <Input
                            type="text"
                            placeholder="No limit"
                            value={formatPriceInput(maxPrice)}
                            onChange={(e) => handleMaxPriceChange(e.target.value)}
                        />
                    </div>
                </div>
                
                <h3 className="font-semibold text-card-foreground mb-4">Facilities</h3>
                
                <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                        {facilities.slice(0, 8).map((facility) => (
                            <Tag
                                key={`facility-${facility.id}`}
                                variant={selectedFacilities.includes(facility.name) ? 'selected' : 'outline'}
                                onClick={() => onFacilityToggle(facility.name)}
                                icon={facility.icon ? <span className="text-xs">{facility.icon}</span> : undefined}
                            >
                                {facility.name}
                            </Tag>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Complex variant
    return (
        <div className="bg-card border border-border p-6 rounded-lg shadow-sm sticky top-24">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-card-foreground">Filters</h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearFilters}
                >
                    Clear all
                </Button>
            </div>

            <div className="mb-6">
                <h4 className="font-medium text-card-foreground mb-3">Price Range</h4>
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Minimum Price
                        </label>
                        <Input
                            type="text"
                            placeholder="0"
                            value={formatPriceInput(minPrice)}
                            onChange={(e) => handleMinPriceChange(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Maximum Price
                        </label>
                        <Input
                            type="text"
                            placeholder="No limit"
                            value={formatPriceInput(maxPrice)}
                            onChange={(e) => handleMaxPriceChange(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <h4 className="font-medium text-card-foreground mb-3">Facilities</h4>
                <div className="max-h-48 overflow-y-auto">
                    <div className="flex flex-wrap gap-2">
                        {facilities.map(facility => (
                            <Tag
                                key={`facility-${facility.id}`}
                                variant={selectedFacilities.includes(facility.name) ? 'selected' : 'outline'}
                                onClick={() => onFacilityToggle(facility.name)}
                                icon={facility.icon ? <span className="text-xs">{facility.icon}</span> : undefined}
                            >
                                {facility.name}
                            </Tag>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <h4 className="font-medium text-card-foreground mb-3">Status</h4>
                <div className="space-y-2">
                    <label className="flex items-center cursor-pointer">
                        <Checkbox
                            checked={isAvailable}
                            onCheckedChange={handleIsAvailableToggle}
                        />
                        <span className="ml-3 text-sm text-muted-foreground">
                            Available for rent
                        </span>
                    </label>
                </div>
            </div>
        </div>
    );
}