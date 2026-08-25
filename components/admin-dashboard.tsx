"use client";

import Image from "next/image";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { Eye, EyeOff, LogOut, Pencil, Plus, Trash2, Upload, Users, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatGuarani } from "@/lib/format";
import type { Product } from "@/lib/types";
import { FlyerGenerator } from "@/components/flyer-generator";

export function AdminDashboard({ initialProducts, username, tenantId, tenantSlug }: { initialProducts: Product[]; username: string; tenantId: string; tenantSlug: string }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [editing, setEditing] = useState<Product | null | undefined>();
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const bulkFileRef = useRef<HTMLInputElement>(null);

  async function toggle(product: Product) {
    const status = product.status === "published" ? "hidden" : "published";
    const { error } = await createClient().from("products").update({ status }).eq("id", product.id).eq("tenant_id", tenantId);
    if (!error) setProducts(products.map((p) => p.id === product.id ? { ...p, status } : p));
  }
  async function remove(product: Product) {
    if (!confirm(`¿Seguro que querés eliminar “${product.name}”?`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("products").delete().eq("id", product.id).eq("tenant_id", tenantId);
    if (!error) setProducts(products.filter((p) => p.id !== product.id));
  }
  async function signOut() { await createClient().auth.signOut(); router.push("/admin/login"); router.refresh(); }
  async function uploadPhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    if (!confirm(`¿Crear ${files.length} productos ocultos a partir de estas fotos?`)) {
      event.target.value = "";
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    const supabase = createClient();
    const created: Product[] = [];
    const failed: string[] = [];

    for (const [index, file] of files.entries()) {
      try {
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const storagePath = `${tenantSlug}/bulk/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from("product-images").upload(storagePath, file, { cacheControl: "31536000", upsert: false });
        if (uploadError) throw uploadError;
        const imageUrl = supabase.storage.from("product-images").getPublicUrl(storagePath).data.publicUrl;
        const filename = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
        const reference = `PEND-${Date.now().toString(36).toUpperCase()}-${String(index + 1).padStart(2, "0")}`;
        const { data, error } = await supabase.from("products").insert({
          tenant_id: tenantId,
          name: filename || `Producto ${index + 1}`,
          brand: "Papa Muay Thai",
          reference,
          price: 0,
          category: "entradas",
          sizes: "",
          color: "",
          short_note: "",
          image_url: imageUrl,
          status: "hidden",
          is_new: false,
          is_offer: false
        }).select().single();
        if (error) {
          await supabase.storage.from("product-images").remove([storagePath]);
          throw error;
        }
        created.push(data as Product);
      } catch (error) {
        failed.push(`${file.name}: ${error instanceof Error ? error.message : "Error"}`);
      }
      setUploadProgress(index + 1);
    }

    if (created.length) setProducts((current) => [...created.reverse(), ...current]);
    if (failed.length) alert(`${created.length} productos creados. ${failed.length} fotos no pudieron subirse.\n\n${failed.join("\n")}`);
    else alert(`${created.length} productos fueron creados como ocultos. Ya podés editarlos.`);
    event.target.value = "";
    setUploading(false);
  }

  return <main className="admin-shell">
    <header className="admin-header"><div className="admin-brand"><strong>PAPA MUAY THAI</strong><small>Administración</small></div><button className="ghost" onClick={signOut}><LogOut size={17}/> Salir</button></header>
    <div className="admin-title"><div><span className="eyebrow">@{username}</span><h1>Mis productos</h1><p>{products.length} productos en total</p></div><div className="admin-title-actions"><input ref={bulkFileRef} className="bulk-upload-input" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={uploadPhotos}/><FlyerGenerator products={products} catalogName="Papa Muay Thai" catalogSubtitle="Sabores de Tailandia, más cerca" theme="thai"/><button className="import" onClick={() => bulkFileRef.current?.click()} disabled={uploading}><Upload size={19}/> {uploading ? `Subiendo ${uploadProgress}…` : "Subir varias fotos"}</button><button className="add" onClick={() => setEditing(null)}><Plus size={19}/> Agregar producto</button></div></div>
    <VisitorAnalytics tenantId={tenantId} />
    <div className="product-list">{products.map((p) => <article className="admin-product" key={p.id}><div className="thumb"><Image src={p.image_url} fill alt="" sizes="72px" /></div><div className="admin-product-info"><span className={`status ${p.status}`}>{p.status === "published" ? "Publicado" : "Oculto"}</span><h2>{p.name}</h2><p>{formatGuarani(p.price)} · {p.category}</p></div><div className="admin-actions"><button onClick={() => setEditing(p)} aria-label="Editar"><Pencil size={17}/></button><button onClick={() => toggle(p)} aria-label={p.status === "published" ? "Ocultar" : "Publicar"}>{p.status === "published" ? <EyeOff size={17}/> : <Eye size={17}/>}</button><button className="danger" onClick={() => remove(p)} aria-label="Eliminar"><Trash2 size={17}/></button></div></article>)}</div>
    {editing !== undefined && <ProductModal product={editing} tenantId={tenantId} tenantSlug={tenantSlug} busy={busy} setBusy={setBusy} close={() => setEditing(undefined)} saved={(product) => { setProducts(editing ? products.map(p => p.id === product.id ? product : p) : [product, ...products]); setEditing(undefined); }} />}
    <footer className="admin-footer"><span>Producto de</span><Image src="/brand/wendelo-mark.png" alt="WENDELO" width={28} height={25}/></footer>
  </main>;
}

type AnalyticsPeriod = "24h" | "7d" | "30d";

function VisitorAnalytics({ tenantId }: { tenantId: string }) {
  const [period, setPeriod] = useState<AnalyticsPeriod>("7d");
  const [visits, setVisits] = useState<Array<{ visitor_id: string; visited_at: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    createClient().from("page_visits").select("visitor_id, visited_at").eq("tenant_id", tenantId).gte("visited_at", since).then(({ data }) => {
      setVisits((data ?? []) as Array<{ visitor_id: string; visited_at: string }>);
      setLoading(false);
    });
  }, [tenantId]);

  const periodHours = period === "24h" ? 24 : period === "7d" ? 7 * 24 : 30 * 24;
  const threshold = Date.now() - periodHours * 60 * 60 * 1000;
  const visitorCount = new Set(visits.filter((visit) => new Date(visit.visited_at).getTime() >= threshold).map((visit) => visit.visitor_id)).size;

  return <section className="visitor-analytics" aria-label="Visitantes del sitio">
    <div className="visitor-total"><Users aria-hidden="true"/><div><span>Visitantes</span><strong>{loading ? "—" : visitorCount}</strong></div></div>
    <div className="analytics-periods" role="group" aria-label="Período de visitantes">
      {([['24h', '24 horas'], ['7d', '7 días'], ['30d', '30 días']] as const).map(([value, label]) => <button type="button" key={value} className={period === value ? "active" : ""} onClick={() => setPeriod(value)}>{label}</button>)}
    </div>
  </section>;
}

function ProductModal({ product, tenantId, tenantSlug, close, saved, busy, setBusy }: { product: Product | null; tenantId: string; tenantSlug: string; close: () => void; saved: (p: Product) => void; busy: boolean; setBusy: (b: boolean) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); const form = new FormData(e.currentTarget); const supabase = createClient();
    try {
      let image_url = product?.image_url ?? "";
      const file = fileRef.current?.files?.[0];
      if (file) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${tenantSlug}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("product-images").upload(path, file, { cacheControl: "31536000", upsert: false });
        if (error) throw error;
        image_url = supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
      }
      if (!image_url) throw new Error("Elegí una imagen.");
      const payload = { tenant_id: tenantId, name:String(form.get("name")), brand:String(form.get("brand")), reference:String(form.get("reference")), price:Number(form.get("price")), category:String(form.get("category")), sizes:String(form.get("sizes") ?? ""), color:String(form.get("color") ?? ""), short_note:String(form.get("short_note") ?? ""), status:String(form.get("status")), is_new:form.get("is_new") === "on", is_offer:form.get("is_offer") === "on", image_url };
      const query = product ? supabase.from("products").update(payload).eq("id", product.id).eq("tenant_id", tenantId).select().single() : supabase.from("products").insert(payload).select().single();
      const { data, error } = await query; if (error) throw error; saved(data as Product);
    } catch (error) { alert(error instanceof Error ? error.message : "No se pudo guardar."); } finally { setBusy(false); }
  }
  return <div className="modal-backdrop"><div className="modal"><div className="modal-head"><div><span className="eyebrow">Producto</span><h2>{product ? "Editar producto" : "Agregar producto"}</h2></div><button onClick={close}><X/></button></div><form className="product-form" onSubmit={submit}><label className="upload"><Upload/><span>{product ? "Cambiar imagen" : "Elegir imagen"}</span><small>JPG, PNG o WebP</small><input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" required={!product}/></label><div className="form-grid"><label>Nombre<input name="name" defaultValue={product?.name} required /></label><label>Marca<input name="brand" defaultValue={product?.brand ?? "Papa Muay Thai"} required /></label><label>Referencia<input name="reference" defaultValue={product?.reference} required /></label><label>Precio en Gs.<input name="price" type="number" min="0" step="1000" defaultValue={product?.price} required /></label><label>Categoría<select name="category" defaultValue={product?.category ?? "entradas"}><option value="entradas">Aperitivos</option><option value="fideos_arroz">Fideos y arroz</option><option value="currys_sopas">Currys y sopas</option><option value="pescados">Pescados</option><option value="especialidades">Especialidades</option><option value="postres">Postres</option><option value="bebidas">Bebidas</option></select></label><label>Estado<select name="status" defaultValue={product?.status ?? "published"}><option value="published">Publicado</option><option value="hidden">Oculto</option></select></label><label>Variantes y precios<input name="sizes" defaultValue={product?.sizes}/></label><label>Detalle opcional<input name="color" defaultValue={product?.color}/></label><label className="wide">Descripción corta<input name="short_note" defaultValue={product?.short_note}/></label></div><div className="checks"><label><input name="is_new" type="checkbox" defaultChecked={product?.is_new}/> Nuevo</label><label><input name="is_offer" type="checkbox" defaultChecked={product?.is_offer}/> Oferta</label></div><button className="save" disabled={busy}>{busy ? "Guardando…" : "Guardar producto"}</button></form></div></div>;
}
