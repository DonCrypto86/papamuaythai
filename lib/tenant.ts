export const TENANT_SLUG = process.env.NEXT_PUBLIC_TENANT_SLUG || "papamuaythai";

export async function getTenantId(supabase: any) {
  const { data, error } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", TENANT_SLUG)
    .eq("status", "active")
    .single();
  if (error || !data) return null;
  return data.id as string;
}
