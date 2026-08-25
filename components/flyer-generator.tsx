"use client";

import Image from "next/image";
import { Download, LayoutGrid, RefreshCw, Share2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { formatGuarani } from "@/lib/format";
import type { Product } from "@/lib/types";

type FlyerTheme = "liz" | "thai";

type Props = {
  products: Product[];
  catalogName: string;
  catalogSubtitle: string;
  theme: FlyerTheme;
};

const flyerSize = { width: 1080, height: 1920 };

export function FlyerGenerator({ products, catalogName, catalogSubtitle, theme }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string>();
  const [flyerFile, setFlyerFile] = useState<File>();
  const [generating, setGenerating] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  async function createFlyer() {
    const published = products.filter((product) => product.status === "published" && product.image_url);
    if (published.length < 4) {
      alert("Necesitás al menos 4 productos publicados para crear el flyer.");
      return;
    }

    setGenerating(true);
    try {
      const selected = shuffle(published).slice(0, 4);
      const file = await renderFlyer(selected, catalogName, catalogSubtitle, theme);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setFlyerFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } catch (error) {
      alert(error instanceof Error ? error.message : "No se pudo crear el flyer.");
    } finally {
      setGenerating(false);
    }
  }

  async function shareFlyer() {
    if (!flyerFile) return;
    const catalogUrl = window.location.origin;
    const shareData = {
      title: `${catalogName} · Catálogo`,
      text: `Mirá nuestros productos y el catálogo completo:\n${catalogUrl}`,
      url: catalogUrl,
      files: [flyerFile]
    };

    setSharing(true);
    try {
      await navigator.clipboard?.writeText(catalogUrl).catch(() => undefined);
      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [flyerFile] }))) {
        await navigator.share(shareData);
      } else {
        downloadFlyer(flyerFile);
        await navigator.clipboard?.writeText(catalogUrl);
        alert("El flyer fue descargado y el enlace del catálogo fue copiado.");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      downloadFlyer(flyerFile);
      alert("El flyer fue descargado. Podés subirlo a tu Estado y pegar el enlace del catálogo.");
    } finally {
      setSharing(false);
    }
  }

  return <>
    <button type="button" className="flyer-trigger" onClick={createFlyer} disabled={generating}>
      <LayoutGrid size={19}/> {generating ? "Creando flyer…" : "Crear flyer"}
    </button>

    {previewUrl && flyerFile && <div className="flyer-backdrop" role="dialog" aria-modal="true" aria-label="Vista previa del flyer">
      <section className="flyer-dialog">
        <header className="flyer-dialog-head"><div><span className="eyebrow">LISTO PARA COMPARTIR</span><h2>Tu flyer</h2></div><button type="button" onClick={() => setPreviewUrl(undefined)} aria-label="Cerrar"><X/></button></header>
        <div className="flyer-preview"><Image src={previewUrl} alt="Flyer con cuatro productos" fill sizes="420px" unoptimized/></div>
        <p className="flyer-help">En el menú de compartir elegí <strong>WhatsApp</strong> y después <strong>Mi estado</strong>. El enlace del catálogo también queda copiado.</p>
        <div className="flyer-dialog-actions">
          <button type="button" className="flyer-secondary" onClick={createFlyer} disabled={generating}><RefreshCw size={17}/> Otros productos</button>
          <button type="button" className="flyer-secondary" onClick={() => downloadFlyer(flyerFile)}><Download size={17}/> Descargar</button>
          <button type="button" className="flyer-share" onClick={shareFlyer} disabled={sharing}><Share2 size={18}/> {sharing ? "Abriendo…" : "Compartir en mi Estado"}</button>
        </div>
      </section>
    </div>}
  </>;
}

function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[other]] = [copy[other], copy[index]];
  }
  return copy;
}

async function renderFlyer(products: Product[], catalogName: string, subtitle: string, theme: FlyerTheme) {
  const canvas = document.createElement("canvas");
  canvas.width = flyerSize.width;
  canvas.height = flyerSize.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Tu navegador no permite crear el flyer.");

  const palette = theme === "thai"
    ? { top: "#0d0b08", bottom: "#251b0e", accent: "#d9b765", card: "#fffaf0", ink: "#17120b", soft: "#715f3d" }
    : { top: "#f8effa", bottom: "#eee2f2", accent: "#6b3477", card: "#ffffff", ink: "#35243b", soft: "#806e85" };
  const background = context.createLinearGradient(0, 0, flyerSize.width, flyerSize.height);
  background.addColorStop(0, palette.top);
  background.addColorStop(1, palette.bottom);
  context.fillStyle = background;
  context.fillRect(0, 0, flyerSize.width, flyerSize.height);

  context.textAlign = "center";
  context.fillStyle = palette.accent;
  context.font = "700 34px Arial, sans-serif";
  context.fillText("NUESTRA SELECCIÓN", 540, 100);
  context.fillStyle = theme === "thai" ? "#fffaf0" : palette.ink;
  context.font = "700 76px Georgia, serif";
  context.fillText(catalogName, 540, 190);
  context.fillStyle = theme === "thai" ? "#d7c9ab" : palette.soft;
  context.font = "400 32px Arial, sans-serif";
  context.fillText(subtitle, 540, 245);

  const cardWidth = 454;
  const cardHeight = 610;
  const gap = 34;
  const startX = (flyerSize.width - cardWidth * 2 - gap) / 2;
  const startY = 310;

  for (let index = 0; index < products.length; index++) {
    const product = products[index];
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = startX + column * (cardWidth + gap);
    const y = startY + row * (cardHeight + gap);
    drawRoundedRect(context, x, y, cardWidth, cardHeight, 34);
    context.fillStyle = palette.card;
    context.fill();

    await drawProductImage(context, product.image_url, x, y, cardWidth, 410, 34, palette.bottom);
    context.textAlign = "left";
    context.fillStyle = palette.ink;
    context.font = "700 38px Georgia, serif";
    const lines = wrapText(context, product.name, cardWidth - 52, 2);
    lines.forEach((line, lineIndex) => context.fillText(line, x + 26, y + 466 + lineIndex * 44));
    context.fillStyle = palette.accent;
    context.font = "800 36px Arial, sans-serif";
    context.fillText(formatGuarani(product.price), x + 26, y + 575);
  }

  const catalogUrl = window.location.origin.replace(/^https?:\/\//, "");
  context.textAlign = "center";
  context.fillStyle = theme === "thai" ? "#fffaf0" : palette.ink;
  context.font = "700 47px Georgia, serif";
  context.fillText("Mirá todos nuestros productos", 540, 1690);
  context.fillStyle = palette.accent;
  drawRoundedRect(context, 150, 1740, 780, 92, 46);
  context.fill();
  context.fillStyle = "#ffffff";
  context.font = "700 31px Arial, sans-serif";
  context.fillText(catalogUrl, 540, 1798);
  context.fillStyle = theme === "thai" ? "#d7c9ab" : palette.soft;
  context.font = "400 24px Arial, sans-serif";
  context.fillText("Abrí el enlace y consultanos directamente", 540, 1870);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
  if (!blob) throw new Error("No se pudo guardar el flyer.");
  return new File([blob], `flyer-${Date.now()}.jpg`, { type: "image/jpeg" });
}

async function drawProductImage(context: CanvasRenderingContext2D, url: string, x: number, y: number, width: number, height: number, radius: number, fallback: string) {
  drawRoundedRect(context, x, y, width, height, radius);
  context.save();
  context.clip();
  context.fillStyle = fallback;
  context.fillRect(x, y, width, height);
  try {
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) throw new Error("Imagen no disponible");
    const bitmap = await createImageBitmap(await response.blob());
    const scale = Math.max(width / bitmap.width, height / bitmap.height);
    const drawWidth = bitmap.width * scale;
    const drawHeight = bitmap.height * scale;
    context.drawImage(bitmap, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
    bitmap.close();
  } catch {
    context.fillStyle = "#ffffff";
    context.font = "700 26px Arial, sans-serif";
    context.textAlign = "center";
    context.fillText("Producto", x + width / 2, y + height / 2);
  }
  context.restore();
}

function drawRoundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  const r = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + width, y, x + width, y + height, r);
  context.arcTo(x + width, y + height, x, y + height, r);
  context.arcTo(x, y + height, x, y, r);
  context.arcTo(x, y, x + width, y, r);
  context.closePath();
}

function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (context.measureText(test).width <= maxWidth || !current) current = test;
    else { lines.push(current); current = word; }
  }
  if (current) lines.push(current);
  if (lines.length > maxLines) {
    const trimmed = lines.slice(0, maxLines);
    while (context.measureText(`${trimmed[maxLines - 1]}…`).width > maxWidth) trimmed[maxLines - 1] = trimmed[maxLines - 1].slice(0, -1);
    trimmed[maxLines - 1] += "…";
    return trimmed;
  }
  return lines;
}

function downloadFlyer(file: File) {
  const url = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
