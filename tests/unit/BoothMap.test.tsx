import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import BoothMap from '../../src/pages/map/BoothMap';

// Mock Google Maps API Loader
vi.mock('@react-google-maps/api', () => ({
  useJsApiLoader: () => ({ isLoaded: true }),
  GoogleMap: ({ children }: any) => <div data-testid="google-map">{children}</div>,
  MarkerF: ({ onClick }: any) => <div data-testid="map-marker" onClick={onClick} />
}));

describe('BoothMap Component', () => {
  it('renders without crashing and displays the default booth', () => {
    render(
      <MemoryRouter>
        <BoothMap />
      </MemoryRouter>
    );

    expect(screen.getByText('Find My Booth')).toBeInTheDocument();
    expect(screen.getByText('Govt. Primary School, Shivpur')).toBeInTheDocument();
  });

  it('renders the map container when loaded', () => {
    render(
      <MemoryRouter>
        <BoothMap />
      </MemoryRouter>
    );

    expect(screen.getByTestId('google-map')).toBeInTheDocument();
  });

  it('filters booths when clicking a filter button', () => {
    render(
      <MemoryRouter>
        <BoothMap />
      </MemoryRouter>
    );
    
    // Click '👩 Women\'s Queue' filter
    fireEvent.click(screen.getByText('👩 Women\'s Queue'));

    // Should still show the map
    expect(screen.getByTestId('google-map')).toBeInTheDocument();
  });
});
