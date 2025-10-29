import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Activity } from "lucide-react";

const EDGE_FUNCTION_URL = "https://jjtvugsixtauuwyyzkoc.supabase.co/functions/v1/imacx-login";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Monitor session state
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate("/", { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleIMACXLogin = useCallback(async (imacxId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imacx_id: imacxId }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Authentication failed");
      }

      const result = await response.json();

      if (!result.session?.access_token) {
        throw new Error("Invalid session response");
      }

      const { error: sessionError } = await supabase.auth.setSession({
        access_token: result.session.access_token,
        refresh_token: result.session.refresh_token || result.session.access_token,
      });

      if (sessionError) throw sessionError;

      toast({
        title: "Authentication successful",
        description: "Welcome back!",
      });

      navigate("/", { replace: true });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.name === "AbortError"
            ? "Request timeout. Please try again."
            : err.message
          : "Authentication failed";

      setError(errorMessage);
      toast({
        title: "Authentication Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [navigate, toast]);

  useEffect(() => {
    const imacxId = searchParams.get("imacx_id");

    if (!imacxId) {
      setError("Missing IMACX ID. Please access this app via IMACX.");
      toast({
        title: "Missing IMACX ID",
        description: "Please access this app via IMACX.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    handleIMACXLogin(imacxId);
  }, [searchParams, handleIMACXLogin, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary to-background">
      <div className="text-center space-y-3 max-w-md px-4">
        {isLoading ? (
          <>
            <Activity className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Authenticating via IMACX...</p>
          </>
        ) : (
          <>
            <div className="text-destructive text-sm">{error}</div>
            <p className="text-muted-foreground">
              Unable to authenticate. Please contact admin.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Auth;