import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  setIsAuthenticated: (isAuth: boolean) => void;
  authenticated: boolean;
}

const Navbar: React.FC<NavbarProps> = ({
  setIsAuthenticated,
  authenticated,
}) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsAuthenticated(false);
    navigate("/");
  };

  return (
    <nav className="flex justify-between items-center py-3 px-4 w-full">
      <h1 className="text-primary-foreground text-xl font-semibold flex items-center gap-2">
        <EventLogo />
        <span>SaskPolytech Events</span>
      </h1>

      {authenticated && (
        <Button
          variant="secondary"
          className="font-medium text-sm"
          onClick={handleLogout}
        >
          Logout
        </Button>
      )}
    </nav>
  );
};

const EventLogo = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-primary-foreground"
  >
    <path d="M10 4H14V6H10V4Z" fill="currentColor" />
    <path d="M4 8H20V10H4V8Z" fill="currentColor" />
    <path d="M8 10L8 20H6L6 10H8Z" fill="currentColor" />
    <path d="M18 10V20H16V10H18Z" fill="currentColor" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M2 4C2 2.89543 2.89543 2 4 2H20C21.1046 2 22 2.89543 22 4V20C22 21.1046 21.1046 22 20 22H4C2.89543 22 2 21.1046 2 20V4ZM4 4H20V20H4V4Z"
      fill="currentColor"
    />
  </svg>
);

export default Navbar;
