import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/use-auth";
import { User, Mail } from "lucide-react";

export default function Profile() {

  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  if (!user) return null;

  return (
    <>
      <Header />

      <div className="min-h-screen flex justify-center pt-24 px-4 bg-gradient-to-br from-pink-50 via-purple-50 to-fuchsia-50">

        <div className="w-full max-w-md rounded-2xl bg-white shadow-lg p-6">

          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
              <User className="text-white h-6 w-6" />
            </div>

            <div>
              <h1 className="text-xl font-semibold">
                {user.first_name} {user.last_name}
              </h1>

            </div>
          </div>


        </div>

      </div>
    </>
  );
}