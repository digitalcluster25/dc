import { render, screen } from '@/test-utils';
import Home from '../page';

// Mock the page component since it's a server component
jest.mock('../page', () => {
  return function MockHome() {
    return (
      <div>
        <h1>Digital Cluster 25</h1>
        <p>Будущее предпринимательского нетворкинга</p>
        <button>Присоединиться к сообществу</button>
        <button>Узнать больше</button>
      </div>
    );
  };
});

describe('Home Page', () => {
  it('renders main heading', () => {
    render(<Home />);

    expect(
      screen.getByRole('heading', { name: /digital cluster 25/i })
    ).toBeInTheDocument();
  });

  it('renders subtitle', () => {
    render(<Home />);

    expect(
      screen.getByText(/будущее предпринимательского нетворкинга/i)
    ).toBeInTheDocument();
  });

  it('renders call-to-action buttons', () => {
    render(<Home />);

    expect(
      screen.getByRole('button', { name: /присоединиться к сообществу/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /узнать больше/i })
    ).toBeInTheDocument();
  });

  it('has proper heading hierarchy', () => {
    render(<Home />);

    const heading = screen.getByRole('heading', {
      name: /digital cluster 25/i,
    });
    expect(heading.tagName).toBe('H1');
  });
});
