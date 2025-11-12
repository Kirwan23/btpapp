import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supabaseConfigured, setSupabaseConfigured] = useState<boolean>(isSupabaseConfigured);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured) {
      const hasLS =
        typeof window !== "undefined" &&
        !!localStorage.getItem("VITE_SUPABASE_URL") &&
        !!localStorage.getItem("VITE_SUPABASE_ANON_KEY");
      setSupabaseConfigured(hasLS);
    }

    const already = localStorage.getItem("ACCESS_CODE_OK") === "1";
    if (already) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = async () => {
    if (!supabaseConfigured || !supabase) {
      setError("Supabase n'est pas configuré. Ajoutez vos identifiants avant de continuer.");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const nowIso = new Date().toISOString();
      const { data, error } = await supabase
        .from("access_codes")
        .select("*")
        .eq("code", code)
        .eq("is_active", true)
        .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        setError("Code invalide ou expiré.");
        return;
      }

      await supabase.from("access_codes").update({ used_at: new Date().toISOString() }).eq("code", code);

      localStorage.setItem("ACCESS_CODE_OK", "1");
      navigate("/dashboard");
    } catch (e: any) {
      setError(e?.message || "Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError(null);

    if (!supabaseConfigured || !supabase) {
      setError("Supabase n'est pas configuré. Ajoutez vos identifiants avant de continuer.");
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError("Veuillez saisir une adresse email et un mot de passe.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
      });

      if (signUpError) {
        throw signUpError;
      }

      const generatedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const { error: insertError } = await supabase.from("access_codes").insert({
        code: generatedCode,
        is_active: true,
      });

      if (insertError) {
        throw insertError;
      }

      setIsRegistering(false);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setError(`Compte créé ! Un code d'accès vous a été généré : ${generatedCode}`);
    } catch (e: any) {
      setError(e?.message || "Erreur lors de la création du compte.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isRegistering ? "Créer un compte" : "Connexion"}</CardTitle>
          <CardDescription>
            {isRegistering
              ? "Inscrivez-vous pour obtenir un code d'accès"
              : "Entrez votre code d'accès pour continuer"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!supabaseConfigured && (
            <div className="p-3 rounded border border-yellow-500/30 bg-yellow-500/10 text-sm">
              Supabase n'est pas configuré. Ajoutez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans votre environnement
              (ou stockez-les dans localStorage via la console).
            </div>
          )}
          {isRegistering ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemple@domaine.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="********"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button className="w-full" onClick={handleRegister} disabled={loading}>
                {loading ? "Création..." : "Créer un compte"}
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setIsRegistering(false)} disabled={loading}>
                Retour à la connexion par code
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Entrez votre code"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button className="w-full" onClick={handleLogin} disabled={loading || !code}>
                {loading ? "Vérification..." : "Se connecter"}
              </Button>
              <Button variant="ghost" className="w-full" onClick={() => setIsRegistering(true)} disabled={loading}>
                Créer un compte
              </Button>
              <p className="text-xs text-muted-foreground">
                Astuce: vous pouvez préremplir Supabase via localStorage.setItem("VITE_SUPABASE_URL","..."); setItem("VITE_SUPABASE_ANON_KEY","...")
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


