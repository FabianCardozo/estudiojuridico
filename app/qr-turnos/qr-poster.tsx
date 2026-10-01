"use client";

import { Download, Printer } from "lucide-react";
import { useEffect, useState } from "react";
import QRCode from "qrcode";

type Props = { name: string; specialty: string; hasPhoto: boolean; license: string; phone: string; address: string; bookingPath:string; bookingCode:string };

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  start: number,
  min: number,
) {
  let size = start;
  while (size > min) {
    ctx.font = `800 ${size}px Arial, sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) return size;
    size -= 2;
  }
  return min;
}

export default function QrPoster({ name, specialty, hasPhoto, license, phone, address, bookingPath, bookingCode }: Props) {
  const [busy, setBusy] = useState(false);
  const [qrDataUrl,setQrDataUrl]=useState("");
  useEffect(()=>{QRCode.toDataURL(`${window.location.origin}${bookingPath}`,{width:1200,margin:2,errorCorrectionLevel:"H",color:{dark:"#081a31",light:"#ffffff"}}).then(setQrDataUrl)},[bookingPath]);

  async function downloadA4() {
    setBusy(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 2480;
      canvas.height = 3508;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#f7f1e4";
      ctx.fillRect(0, 0, 2480, 3508);
      ctx.fillStyle = "#081a31";
      ctx.fillRect(0, 0, 2480, 920);
      ctx.fillStyle = "#4d1728";
      ctx.fillRect(0, 2920, 2480, 588);
      ctx.strokeStyle = "#d8b15c";
      ctx.lineWidth = 22;
      ctx.strokeRect(42, 42, 2396, 3424);
      ctx.fillStyle = "#d8b15c";
      ctx.fillRect(0, 875, 2480, 18);
      ctx.fillRect(0, 2905, 2480, 18);
      ctx.font = "700 115px Georgia, serif";
      ctx.fillStyle = "#d8b15c";
      ctx.fillText("⚖", 180, 185);
      ctx.fillText("⚖", 2300, 185);

      ctx.textAlign = "center";
      ctx.fillStyle = "#f4d785";
      ctx.font = "900 126px Arial, sans-serif";
      ctx.fillText("¿NECESITÁS UN ABOGADO?", 1240, 260);
      ctx.fillStyle = "#ffffff";
      ctx.font = "600 74px Arial, sans-serif";
      ctx.fillText("Agendá una entrevista con", 1240, 405);
      const nameSize = fitText(ctx, name, 2200, 120, 62);
      ctx.font = `800 ${nameSize}px Arial, sans-serif`;
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0,0,0,.55)";
      ctx.shadowBlur = 16;
      ctx.fillText(name, 1240, 565);
      ctx.shadowBlur = 0;
      ctx.font = "700 50px Arial, sans-serif";
      ctx.fillStyle = "#e6c878";
      ctx.fillText(specialty.toUpperCase(), 1240, 685);
      ctx.font = "500 42px Arial, sans-serif";
      ctx.fillStyle = "#d5deea";
      ctx.fillText("ATENCIÓN PROFESIONAL · CONFIDENCIALIDAD · COMPROMISO", 1240, 790);

      const qr = await loadImage(qrDataUrl);
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(49,46,129,.22)";
      ctx.shadowBlur = 40;
      ctx.fillRect(170, 1050, 1120, 1120);
      ctx.shadowBlur = 0;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(qr, 225, 1105, 1010, 1010);
      ctx.imageSmoothingEnabled = true;

      ctx.fillStyle = "#172033";
      ctx.font = "900 57px Arial, sans-serif";
      ctx.fillText("ESCANEÁ EL CÓDIGO", 730, 2290);
      ctx.font = "700 43px Arial, sans-serif";
      ctx.fillStyle = "#9b7430";
      ctx.fillText("y solicitá una entrevista", 730, 2360);
      ctx.font = "500 38px Arial, sans-serif";
      ctx.fillStyle = "#64748b";
      ctx.fillText(
        "Completá tus datos y disponibilidad.",
        730,
        2440,
      );

      ctx.fillStyle = "#163a63";
      ctx.font = "900 62px Arial, sans-serif";
      ctx.fillText("TU PROBLEMA MERECE SER ESCUCHADO", 1240, 2610);
      ctx.font = "600 43px Arial, sans-serif";
      ctx.fillStyle = "#4b5563";
      ctx.fillText("Recibí orientación jurídica clara, confidencial y comprometida.", 1240, 2700);
      ctx.fillStyle = "#6d2638";
      ctx.font = "800 46px Arial, sans-serif";
      ctx.fillText("Da el primer paso: solicitá una entrevista.", 1240, 2785);

      if (hasPhoto) {
        try {
          const photo = await loadImage(`/api/profile/photo?code=${bookingCode}&v=${Date.now()}`);
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(1440, 1040, 820, 1120, 52);
          ctx.clip();
          const ratio = Math.max(820 / photo.width, 1120 / photo.height);
          const width = photo.width * ratio,
            height = photo.height * ratio;
          ctx.drawImage(
            photo,
            1850 - width / 2,
            1600 - height / 2,
            width,
            height,
          );
          ctx.restore();
          ctx.strokeStyle = "#d8b15c";
          ctx.lineWidth = 22;
          ctx.strokeRect(1428, 1028, 844, 1144);
        } catch {
          /* El cartel sigue siendo válido sin foto. */
        }
      }

      const finalNameSize = fitText(ctx, name, 2180, 96, 54);
      ctx.font = `800 ${finalNameSize}px Arial, sans-serif`;
      ctx.fillStyle = "#ffffff";
      ctx.fillText(name, 1240, 3070);
      const specialtySize = fitText(ctx, specialty, 2050, 55, 38);
      ctx.font = `700 ${specialtySize}px Arial, sans-serif`;
      ctx.fillStyle = "#f4d785";
      ctx.fillText(specialty, 1240, 3170);
      const contact = [license && `M.P. ${license}`, phone && `WhatsApp ${phone}`, address].filter(Boolean).join("  ·  ");
      if (contact) {
        const contactSize = fitText(ctx, contact, 2100, 38, 28);
        ctx.font = `700 ${contactSize}px Arial, sans-serif`;
        ctx.fillStyle = "#ffffff";
        ctx.fillText(contact, 1240, 3270);
      }
      ctx.font = "500 34px Arial, sans-serif";
      ctx.fillStyle = "#d9dce4";
      ctx.fillText(
        "Solicitud confidencial · El envío no confirma automáticamente el turno",
        1240,
        3395,
      );

      const link = document.createElement("a");
      link.download = "cartel-QR-entrevistas-A4.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
    {qrDataUrl?<img src={qrDataUrl} alt={`Código QR individual de ${name}`}/>:<div className="qr-loading">Generando código QR…</div>}
    <div className="qr-download-actions">
      <button type="button" onClick={downloadA4} disabled={busy||!qrDataUrl}>
        <Download />
        {busy ? "Preparando A4…" : "Descargar cartel A4 vertical"}
      </button>
      <button
        type="button"
        className="secondary"
        onClick={() => window.print()}
      >
        <Printer />
        Imprimir en A4
      </button>
    </div>
    </>
  );
}
