export const useNavigate = jest.fn(() => jest.fn());
export const useParams = jest.fn(() => ({}));
export const useLocation = jest.fn(() => ({ pathname: '/', search: '', hash: '', state: null }));
export const useSearchParams = jest.fn(() => [new URLSearchParams(), jest.fn()]);
export const Link = ({ children, to, ...props }: { children: React.ReactNode; to: string; [key: string]: any }) => (
  <a href={to} {...props}>{children}</a>
);
export const NavLink = Link;
export const Navigate = ({ to }: { to: string }) => <div data-testid="navigate" data-to={to} />;
export const Outlet = () => <div data-testid="outlet" />;
export const BrowserRouter = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const MemoryRouter = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const Routes = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const Route = () => null;
