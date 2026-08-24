import { Catalog } from "@/components/catalog";
import { demoProducts } from "@/lib/demo-products";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";
import { getTenantId } from "@/lib/tenant";

export default async function Home() {
  let products: Product[] = demoProducts;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const tenantId = await getTenantId(supabase);
    const { data } = tenantId ? await supabase.from("products").select("*").eq("tenant_id", tenantId).eq("status", "published").order("created_at", { ascending: false }) : { data: null };
    if (data) products = data as Product[];
  }
  return <Catalog products={products} />;
}
