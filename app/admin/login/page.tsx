"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      const username = String(form.get("username") ?? "").trim().toLowerCase();
      const email = username === "thorsten"
        ? (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "thorsten@login.wendelo.local")
        : "";
      if (!email) throw new Error("Usuario no configurado");
      // Passwords must be sent exactly as entered; unlike email addresses they
      // must never be trimmed or otherwise normalized.
      const password = String(form.get("password") ?? "");
      const { error } = await createClient().auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push("/admin"); router.refresh();
    } catch (cause) {
      const rawMessage = cause instanceof Error ? cause.message : "Error desconocido";
      const message = rawMessage.toLowerCase();
      if (message.includes("fetch") || message.includes("network")) {
        setError("No se pudo conectar con Supabase. Revisá tu conexión e intentá nuevamente.");
      } else if (message.includes("email not confirmed")) {
        setError("La cuenta todavía no fue confirmada en Supabase.");
      } else if (message.includes("invalid login credentials")) {
        setError("Usuario o contraseña incorrectos.");
      } else if (message.includes("usuario no configurado")) {
        setError("Este usuario todavía no está configurado.");
      } else if (message.includes("rate limit") || message.includes("too many")) {
        setError("Demasiados intentos. Esperá unos minutos y volvé a intentar.");
      } else {
        setError(`Error de acceso: ${rawMessage}`);
      }
      setLoading(false);
    }
  }
  return <main className="login-page"><form className="login-card" onSubmit={submit}><div className="admin-brand"><strong>Papa Muay Thai</strong><small>Administración</small></div><h1>Bienvenido</h1><p>Ingresá para administrar el menú.</p><label>Usuario<input name="username" type="text" inputMode="text" autoComplete="username" autoCapitalize="none" autoCorrect="off" spellCheck={false} defaultValue="thorsten" required /></label><label>Contraseña<input name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" autoCapitalize="none" autoCorrect="off" spellCheck={false} required /></label><label className="show-password"><input type="checkbox" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} /> Mostrar contraseña</label>{error && <div className="form-error">{error}</div>}<button disabled={loading}>{loading ? "Ingresando…" : "Ingresar"}</button><a href="/">← Volver al menú</a></form></main>;
}
