import { render, screen } from '@testing-library/react';
import { StatCard, StatCardSkeleton } from '../StatCard';
import { DashboardStat } from '@/types/teacher';

describe('StatCard', () => {
    const mockStat: DashboardStat = {
        id: 'earnings',
        title: 'TOTAL EARNINGS',
        value: '₹11.3k',
        subValue: '+300',
        lastMonthValue: '₹11k',
        trend: 'up',
        theme: 'green',
    };

    it('should render stat title', () => {
        render(<StatCard stat={mockStat} />);
        expect(screen.getByText('TOTAL EARNINGS')).toBeInTheDocument();
    });

    it('should render stat value', () => {
        render(<StatCard stat={mockStat} />);
        expect(screen.getByText('₹11.3k')).toBeInTheDocument();
    });

    it('should render sub value', () => {
        render(<StatCard stat={mockStat} />);
        expect(screen.getByText('+300')).toBeInTheDocument();
    });

    it('should render last month value', () => {
        render(<StatCard stat={mockStat} />);
        expect(screen.getByText('₹11k')).toBeInTheDocument();
    });

    it('should render last month label', () => {
        render(<StatCard stat={mockStat} />);
        expect(screen.getByText('LAST MONTH')).toBeInTheDocument();
    });

    it('should apply correct theme classes for green theme', () => {
        const { container } = render(<StatCard stat={mockStat} />);
        const card = container.firstChild as HTMLElement;

        expect(card).toHaveClass('border-[#4ade80]');
    });

    it('should apply correct theme classes for orange theme', () => {
        const orangeStat = { ...mockStat, theme: 'orange' as const };
        const { container } = render(<StatCard stat={orangeStat} />);
        const card = container.firstChild as HTMLElement;

        expect(card).toHaveClass('border-[#fb923c]');
    });

    it('should apply correct theme classes for purple theme', () => {
        const purpleStat = { ...mockStat, theme: 'purple' as const };
        const { container } = render(<StatCard stat={purpleStat} />);
        const card = container.firstChild as HTMLElement;

        expect(card).toHaveClass('border-[#d8b4fe]');
    });

    it('should apply correct theme classes for yellow theme', () => {
        const yellowStat = { ...mockStat, theme: 'yellow' as const };
        const { container } = render(<StatCard stat={yellowStat} />);
        const card = container.firstChild as HTMLElement;

        expect(card).toHaveClass('border-[#facc15]');
    });

    it('should have hover effect classes', () => {
        const { container } = render(<StatCard stat={mockStat} />);
        const card = container.firstChild as HTMLElement;

        expect(card).toHaveClass('hover:shadow-md');
        expect(card).toHaveClass('transition-shadow');
    });
});

describe('StatCardSkeleton', () => {
    it('should render skeleton loader', () => {
        const { container } = render(<StatCardSkeleton />);
        const skeleton = container.firstChild as HTMLElement;

        expect(skeleton).toHaveClass('animate-pulse');
    });

    it('should have correct height', () => {
        const { container } = render(<StatCardSkeleton />);
        const skeleton = container.firstChild as HTMLElement;

        expect(skeleton).toHaveClass('h-[200px]');
    });

    it('should render placeholder elements', () => {
        const { container } = render(<StatCardSkeleton />);

        // Should have multiple placeholder divs
        const placeholders = container.querySelectorAll('.bg-gray-200');
        expect(placeholders.length).toBeGreaterThan(0);
    });
});
