import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    lastPage: number;
    onPageChange: (page: number) => void;
    showPages?: number;
}

export default function Pagination({ 
    currentPage, 
    lastPage, 
    onPageChange, 
    showPages = 5 
}: PaginationProps) {
    if (lastPage <= 1) return null;

    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
    let endPage = Math.min(lastPage, startPage + showPages - 1);
    
    if (endPage - startPage + 1 < showPages) {
        startPage = Math.max(1, endPage - showPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    return (
        <div className="flex justify-center items-center space-x-2">
            {/* Previous Button */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground bg-card border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
            </button>

            {/* Page Numbers */}
            <div className="flex space-x-1">
                {pages.map(page => (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            page === currentPage
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground bg-card border border-border hover:bg-muted'
                        }`}
                    >
                        {page}
                    </button>
                ))}
            </div>

            {/* Next Button */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === lastPage}
                className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground bg-card border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
            </button>
        </div>
    );
}