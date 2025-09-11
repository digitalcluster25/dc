import { render, screen } from '@/test-utils';
import { Navigation } from '../navigation';

describe('Navigation Component', () => {
  it('renders logo and brand name', () => {
    render(<Navigation />);

    expect(screen.getByText('DC25')).toBeInTheDocument();
    expect(screen.getByText('DC')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Navigation />);

    expect(screen.getByText('Главная')).toBeInTheDocument();
  });

  it('has correct href for navigation links', () => {
    render(<Navigation />);

    const homeLink = screen.getByRole('link', { name: /главная/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('applies active styles to current page', () => {
    render(<Navigation />);

    const homeLink = screen.getByRole('link', { name: /главная/i });
    expect(homeLink).toHaveClass('text-primary');
  });

  it('has proper accessibility attributes', () => {
    render(<Navigation />);

    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
  });
});
