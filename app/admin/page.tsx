import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin-dashboard";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import { getTenantId, TENANT_SLUG } from "@/lib/tenant";

export default async function AdminPage() {
  if (!isSupabaseConfigured()) return <SetupNotice />;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const tenantId = await getTenantId(supabase);
  if (!tenantId) redirect("/admin/login?error=access");
  const { data: membership } = await supabase.from("tenant_users").select("username").eq("tenant_id", tenantId).eq("user_id", user.id).maybeSingle();
  if (!membership) redirect("/admin/login?error=access");
  const { data } = await supabase.from("products").select("*").eq("tenant_id", tenantId).order("created_at", { ascending: false });
  return <AdminDashboard initialProducts={(data ?? []) as Product[]} username={membership.username} tenantId={tenantId} tenantSlug={TENANT_SLUG} />;
}

function SetupNotice() {
  return <main className="admin-shell setup"><div className="admin-brand"><strong>Papa Muay Thai</strong><small>Administración</small></div><div className="panel"><span className="eyebrow">Configuración inicial</span><h1>Conectá Supabase</h1><p>Agregá las dos variables indicadas en <code>.env.example</code>. Después, el acceso privado y los productos quedarán disponibles aquí.</p><a href="/">Volver al menú</a></div></main>;
}
