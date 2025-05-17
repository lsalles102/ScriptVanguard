import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Verificar a sessão atual quando o componente monta
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking auth session:", error);
          setUser(null);
        } else if (data && data.session) {
          const { data: userData } = await supabase.auth.getUser();
          setUser(userData.user);
          
          // Verificar se o usuário é admin
          if (userData.user?.user_metadata?.role === 'admin') {
            setIsAdmin(true);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Unexpected error checking auth:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Inscrever-se em mudanças de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          const { data } = await supabase.auth.getUser();
          setUser(data.user);
          
          // Verificar se o usuário é admin
          if (data.user?.user_metadata?.role === 'admin') {
            setIsAdmin(true);
          }
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setIsAdmin(false);
        }
      }
    );

    checkSession();

    // Limpar o listener quando o componente desmonta
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin
  };
}
