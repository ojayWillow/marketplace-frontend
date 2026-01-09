import React from 'react';

export const useNavigate = jest.fn(() => jest.fn());
export const useParams = jest.fn(() => ({}));
export const useLocation = jest.fn(() => ({ pathname: '/', search: '', hash: '', state: null }));
export const useSearchParams = jest.fn(() => [new URLSearchParams(), jest.fn()]);

export const Link = ({ children, to, ...props }: { children: React.ReactNode; to: string; [key: string]: unknown }) => (
  React.createElement('a', { href: to, ...props }, children)
);

export const NavLink = Link;

export const Navigate = ({ to }: { to: string }) => (
  React.createElement('div', { 'data-testid': 'navigate', 'data-to': to })
);

export const Outlet = () => React.createElement('div', { 'data-testid': 'outlet' });

export const BrowserRouter = ({ children }: { children: React.ReactNode }) => (
  React.createElement(React.Fragment, null, children)
);

export const MemoryRouter = ({ children }: { children: React.ReactNode }) => (
  React.createElement(React.Fragment, null, children)
);

export const Routes = ({ children }: { children: React.ReactNode }) => (
  React.createElement(React.Fragment, null, children)
);

export const Route = () => null;
