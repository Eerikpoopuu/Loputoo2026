import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { LoginDialog } from "@/components/LoginDialog";
import { SignupDialog } from "@/components/SignupDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, User, ShieldCheck } from "lucide-react";
import logo from "@/assets/logo.png";

export function Header() {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  const initials = user
    ? `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase()
    : "";

  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-6xl mx-auto flex justify-between items-center h-16 px-4">

        <div className="cursor-pointer px-4 py-2 rounded hover:bg-gray-100 transition-colors" onClick={() => navigate("/")}>
          <img src={logo} alt="Lilleke rohus" className="h-10 w-auto" />
        </div>

        <div className="flex items-center gap-2">
          {isLoggedIn && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  {initials || <User className="h-4 w-4" />}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  Minu tellimused
                </DropdownMenuItem>
                {user.role === "admin" && (
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => { logout(); navigate("/"); }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logi välja
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <LoginDialog />
              <SignupDialog />
            </>
          )}
        </div>

      </div>
    </header>
  );
}
