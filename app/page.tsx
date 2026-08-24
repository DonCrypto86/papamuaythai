import { Catalog } from "@/components/catalog";
import { demoProducts } from "@/lib/demo-products";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

export default async function Home() {
  let products: Product[] = demoProducts;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase.from("products").select("*").eq("status", "published").order("created_at", { ascending: false });
    if (data) products = data as Product[];
  }
  return <Catalog products={products} />;
}
