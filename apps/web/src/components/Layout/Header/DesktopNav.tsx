const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
    ? 'bg-primary-100 text-primary-700'
    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
  }`;

export const DesktopNav = () => {
  return (
    <nav className="hidden md:flex items-center space-x-1" aria-label="Main navigation">
    </nav>
  );
};

export { navLinkClass };
export default DesktopNav;
