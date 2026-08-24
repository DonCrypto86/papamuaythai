"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Share2, X } from "lucide-react";
import type { Category, Product } from "@/lib/types";
import { formatGuarani, whatsappUrl } from "@/lib/format";
import { createClient } from "@/lib/supabase/client";
import { TENANT_SLUG } from "@/lib/tenant";

const filters: readonly ["todos" | Category, string][] = [
  ["todos", "Todo"], ["entradas", "Aperitivos"], ["fideos_arroz", "Fideos y arroz"], ["currys_sopas", "Currys y sopas"],
  ["pescados", "Pescados"], ["especialidades", "Especialidades"], ["postres", "Postres"], ["bebidas", "Bebidas"],
];

function WhatsAppIcon({ size = 22 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M27.3 4.6A15.5 15.5 0 0 0 2.9 23.3L.7 31l7.9-2.1A15.5 15.5 0 0 0 27.3 4.6Z" fill="currentColor"/><path d="M22.7 18.9c-.4-.2-2.4-1.2-2.8-1.3-.4-.1-.7-.2-1 .2-.3.4-1.1 1.3-1.4 1.6-.2.3-.5.3-.9.1-2.5-1.2-4.1-2.2-5.7-5-.4-.7.4-.7 1.2-2.3.1-.3.1-.6 0-.8-.1-.2-1-2.4-1.3-3.3-.4-.9-.8-.8-1-.8H9c-.4 0-.8.1-1.2.6-.4.5-1.6 1.6-1.6 3.9s1.7 4.5 1.9 4.8c.2.3 3.3 5.1 8.1 7.1 3 1.3 4.2 1.4 5.7 1.2.9-.1 2.4-1 2.7-1.9.3-.9.3-1.7.2-1.9-.1-.2-.5-.3-.9-.5Z" fill="white"/></svg>;
}

export function Catalog({ products }: { products: Product[] }) {
  const [active, setActive] = useState<"todos" | Category>("todos");
  const [sort, setSort] = useState<"none" | "asc" | "desc">("none");
  const [selected, setSelected] = useState<Product | null>(null);
  const [sharing, setSharing] = useState(false);
  useEffect(() => {
    const productId = new URLSearchParams(window.location.search).get("producto");
    if (productId) setSelected(products.find((item) => item.id === productId) ?? null);
  }, [products]);

  useEffect(() => {
    const storagePrefix = `${TENANT_SLUG}-`;
    const lastVisit = Number(localStorage.getItem(`${storagePrefix}last-visit`) || 0);
    if (Date.now() - lastVisit < 30 * 60 * 1000) return;

    let visitorId = localStorage.getItem(`${storagePrefix}visitor-id`);
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem(`${storagePrefix}visitor-id`, visitorId);
    }

    createClient().rpc("record_page_visit", { tenant_slug: TENANT_SLUG, new_visitor_id: visitorId }).then(({ error }) => {
      if (!error) localStorage.setItem(`${storagePrefix}last-visit`, String(Date.now()));
    });
  }, []);

  async function shareProduct(product: Product) {
    const url = `${window.location.origin}${window.location.pathname}?producto=${encodeURIComponent(product.id)}`;
    const text = `${product.name}\n${formatGuarani(product.price)}\n${url}`;
    setSharing(true);
    try {
      const response = await fetch(product.image_url);
      const blob = await response.blob();
      const extension = blob.type.includes("png") ? "png" : blob.type.includes("webp") ? "webp" : "jpg";
      const file = new File([blob], `${product.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.${extension}`, { type: blob.type || "image/jpeg" });
      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        await navigator.share({ title: product.name, text, url, files: [file] });
      } else if (navigator.share) {
        await navigator.share({ title: product.name, text, url });
      } else {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
      }
    } finally {
      setSharing(false);
    }
  }
  const shown = useMemo(() => {
    const result = products.filter((item) => active === "todos" || item.category === active);
    return sort === "none" ? result : [...result].sort((a, b) => sort === "asc" ? a.price - b.price : b.price - a.price);
  }, [products, active, sort]);
  const filterButton = ([value, label]: (typeof filters)[number]) => <button key={value} className={active === value ? "active" : ""} onClick={() => setActive(value)}>{label}</button>;
  const priceButton = <button className={`price-sort ${sort !== "none" ? "active" : ""}`} onClick={() => setSort(sort === "none" ? "asc" : sort === "asc" ? "desc" : "none")}>Precio {sort === "asc" ? <ArrowUp size={14}/> : sort === "desc" ? <ArrowDown size={14}/> : <ArrowUpDown size={14}/>}</button>;
  const cards = (items: Product[]) => <div className="grid">{items.map((item) => <article className="card" key={item.id}>
    <button className={`image-wrap product-image-button${item.category === "bebidas" ? " beverage-image" : ""}`} onClick={() => setSelected(item)} aria-label={`Ver ${item.name}`}><Image src={item.image_url} alt={item.name} fill quality={95} sizes="(max-width: 640px) 55vw, (max-width: 1100px) 38vw, 30vw"/></button>
    <div className="card-body"><div className="meta">{item.reference}</div><h3>{item.name}</h3>{item.short_note && <p className="details">{item.short_note}</p>}{item.sizes && <p className="details product-variants">{item.sizes}</p>}<div className="price">{item.sizes ? `Desde ${formatGuarani(item.price)}` : formatGuarani(item.price)}</div><a className="whatsapp" href={whatsappUrl(item.name, item.reference, item.price)} target="_blank" rel="noreferrer"><WhatsAppIcon size={17}/> Consultar</a></div>
  </article>)}</div>;

  return <>
    <header className="thai-header"><div className="shell thai-nav">
      <a href="#inicio" className="thai-wordmark"><Image src="/brand/papa-muay-thai-logo.webp" width={58} height={58} alt="Papa Muay Thai Resort"/><span>PAPA MUAY THAI</span></a>
      <div className="thai-nav-actions"><a className="thai-wendelo-credit" href="https://wendelo.online" target="_blank" rel="noreferrer"><Image src="/brand/wendelo-mark.png" width={20} height={18} alt=""/><span>Producto de <strong>wendelo.online</strong></span></a><a className="thai-whatsapp-icon" href={whatsappUrl()} target="_blank" rel="noreferrer" aria-label="Contactar por WhatsApp"><WhatsAppIcon size={24}/></a></div>
    </div></header>
    <section className="thai-hero" id="inicio"><iframe className="thai-lottie" src="https://lottie.host/embed/fdb17424-90e1-4a09-a0af-2a0b2bf5a086/2GTPVvQX4C.lottie" title="Animación decorativa" aria-hidden="true" tabIndex={-1}/><div className="shell"><span className="eyebrow">Cocina tailandesa</span><h1>Sabores de Tailandia,<br/><em>más cerca.</em></h1><p>Explorá el menú y consultá directamente por WhatsApp.</p><a className="primary" href="#menu">Ver menú</a></div></section>
    <main className="shell catalog thai-catalog" id="menu"><div className="catalog-heading"><div><span className="eyebrow">Nuestro menú</span><h2>Elegí tu favorito</h2></div><span className="count">{shown.length} productos</span></div><div className="filters thai-filters"><div className="thai-filter-row">{filters.slice(0, 4).map(filterButton)}</div><div className="thai-filter-row">{filters.slice(4).map(filterButton)}{priceButton}</div></div>{active === "todos" && sort === "none" ? <div className="category-groups">{filters.slice(1).map(([value, label]) => { const items = products.filter((item) => item.category === value); return items.length ? <section className="category-section" key={value}><div className="category-title"><h3>{label}</h3><span>{items.length} productos</span></div>{cards(items)}</section> : null; })}</div> : cards(shown)}</main>
    <section className="thai-cta"><div className="shell"><span>¿Querés hacer un pedido?</span><h2>Escribinos por WhatsApp</h2><a href={whatsappUrl()} target="_blank" rel="noreferrer"><WhatsAppIcon/> Consultar</a></div></section>
    <footer className="thai-footer shell"><span className="thai-footer-brand"><Image src="/brand/papa-muay-thai-logo.webp" width={48} height={48} alt="Papa Muay Thai Resort"/><strong>PAPA MUAY THAI</strong></span><a href="https://wendelo.online" target="_blank" rel="noreferrer"><Image src="/brand/wendelo-mark.png" width={20} height={18} alt=""/> Producto de wendelo.online</a></footer>
    {selected && <div className="product-lightbox" role="dialog" aria-modal="true" onClick={() => setSelected(null)}><div className="lightbox-panel" onClick={(event) => event.stopPropagation()}><button className="lightbox-close" onClick={() => setSelected(null)} aria-label="Cerrar"><X/></button><div className="lightbox-image"><Image src={selected.image_url} alt={selected.name} fill sizes="95vw"/></div><div className="lightbox-caption"><strong>{selected.name}</strong><span>{formatGuarani(selected.price)}</span></div><div className="lightbox-actions"><button className="lightbox-status-share" type="button" onClick={() => shareProduct(selected)} disabled={sharing}><Share2 size={18}/> {sharing ? "Preparando…" : "Compartir en mi Estado"}</button><a className="lightbox-share" href={whatsappUrl(selected.name, selected.reference, selected.price)} target="_blank" rel="noreferrer"><WhatsAppIcon size={18}/> Consultar</a></div></div></div>}
  </>;
}
