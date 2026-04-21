import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { LoginDialog } from "@/components/LoginDialog";
import { SignupDialog } from "@/components/SignupDialog";

export function Header() {

  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-6xl mx-auto flex justify-between items-center h-16 px-4">

        {/* Home */}
        <div
          className="cursor-pointer px-4 py-2 rounded hover:bg-gray-100 transition-colors"
          onClick={() => navigate("/")}
        >
          LILLEÄRI
        </div>

        <div className="flex items-center gap-2">

          {isLoggedIn && user ? (
            <>
              <Button
                variant="outline"
                onClick={() => navigate("/profile")}
              >
                {user.first_name}
              </Button>
              {user.role === "admin" && (
                <Button
                  variant="outline"
                  onClick={() => navigate("/admin")}
                >
                  Admin
                </Button>
              )}
              <Button
                variant="destructive"
                onClick={() => {
                  logout();
                  navigate("/"); }}>
                Logi välja
              </Button>
            </>
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