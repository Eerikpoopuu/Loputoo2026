import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

export function GoogleAuthHandler() {
  const { login } = useAuth();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user?.app_metadata?.provider === "google") {
          const email = session.user.email!;
          const auth_uid = session.user.id;
          const fullName: string = session.user.user_metadata?.full_name || session.user.user_metadata?.name || "";
          const parts = fullName.split(" ");

          const res = await fetch("/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, auth_uid, first_name: parts[0] || "", last_name: parts.slice(1).join(" ") || "" }),
          });
          const data = await res.json();

          if (res.ok) {
            login(
              { id: auth_uid, first_name: parts[0] || "", last_name: parts.slice(1).join(" ") || "", role: data.role || "user" },
              data.access_token
            );
          }
          await supabase.auth.signOut();
        }
      }
    );
    return () => subscription.unsubscribe();
  }, [login]);

  return null;
}
