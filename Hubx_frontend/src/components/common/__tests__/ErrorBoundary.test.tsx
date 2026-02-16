import { render, screen } from '@testing-library/react';
import { ErrorBoundary, ErrorFallback } from '../ErrorBoundary';

// Component that throws an error for testing
function ThrowError() {
    throw new Error('Test error');
}

// Component that works fine
function WorkingComponent() {
    return <div>Working Component</div>;
}

describe('ErrorBoundary', () => {
    // Suppress console.error for these tests since we're intentionally throwing errors
    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterAll(() => {
        (console.error as jest.Mock).mockRestore();
    });

    it('should render children when there is no error', () => {
        render(
            <ErrorBoundary>
                <WorkingComponent />
            </ErrorBoundary>
        );

        expect(screen.getByText('Working Component')).toBeInTheDocument();
    });

    it('should render error UI when child component throws', () => {
        render(
            <ErrorBoundary>
                <ThrowError />
            </ErrorBoundary>
        );

        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        expect(screen.getByText('Test error')).toBeInTheDocument();
    });

    it('should render custom fallback when provided', () => {
        const customFallback = <div>Custom Error UI</div>;

        render(
            <ErrorBoundary fallback={customFallback}>
                <ThrowError />
            </ErrorBoundary>
        );

        expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
    });

    it('should call onError callback when error occurs', () => {
        const onError = jest.fn();

        render(
            <ErrorBoundary onError={onError}>
                <ThrowError />
            </ErrorBoundary>
        );

        expect(onError).toHaveBeenCalled();
        expect(onError.mock.calls[0][0].message).toBe('Test error');
    });
});

describe('ErrorFallback', () => {
    it('should render default error message', () => {
        render(<ErrorFallback />);
        expect(screen.getByText('Failed to load')).toBeInTheDocument();
    });

    it('should render custom error message', () => {
        render(<ErrorFallback message="Custom error message" />);
        expect(screen.getByText('Custom error message')).toBeInTheDocument();
    });

    it('should render retry button when onRetry is provided', () => {
        const onRetry = jest.fn();
        render(<ErrorFallback onRetry={onRetry} />);

        const retryButton = screen.getByRole('button', { name: /retry/i });
        expect(retryButton).toBeInTheDocument();
    });

    it('should not render retry button when onRetry is not provided', () => {
        render(<ErrorFallback />);

        const retryButton = screen.queryByRole('button', { name: /retry/i });
        expect(retryButton).not.toBeInTheDocument();
    });
});
