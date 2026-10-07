/**
 * Modul Generator Kuitansi Resmi Indonesia
 * Lengkap dengan format standar, auto-terbilang, kotak materai Rp 10.000, & export PDF
 */

let kuitansiCanvas = null;
let kuitansiCtx = null;
let isDrawingKuitansi = false;
let hasKuitansiSig = false;

function initKuitansiCanvas() {
  kuitansiCanvas = document.getElementById("kuitansiSignaturePad");
  if (!kuitansiCanvas) return;
  kuitansiCtx = kuitansiCanvas.getContext("2d");

  kuitansiCanvas.width = 320;
  kuitansiCanvas.height = 120;

  kuitansiCtx.strokeStyle = "#1e293b";
  kuitansiCtx.lineWidth = 2.5;
  kuitansiCtx.lineCap = "round";
  kuitansiCtx.lineJoin = "round";

  function getPos(e) {
    const cRect = kuitansiCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - cRect.left) * (kuitansiCanvas.width / cRect.width),
      y: (clientY - cRect.top) * (kuitansiCanvas.height / cRect.height)
    };
  }

  function startDraw(e) {
    e.preventDefault();
    isDrawingKuitansi = true;
    const pos = getPos(e);
    kuitansiCtx.beginPath();
    kuitansiCtx.moveTo(pos.x, pos.y);
  }

  function draw(e) {
    if (!isDrawingKuitansi) return;
    e.preventDefault();
    const pos = getPos(e);
    kuitansiCtx.lineTo(pos.x, pos.y);
    kuitansiCtx.stroke();
    hasKuitansiSig = true;
    updateKuitansiPreviewSig();
  }

  function endDraw() {
    isDrawingKuitansi = false;
  }

  kuitansiCanvas.addEventListener("mousedown", startDraw);
  kuitansiCanvas.addEventListener("mousemove", draw);
  kuitansiCanvas.addEventListener("mouseup", endDraw);
  kuitansiCanvas.addEventListener("mouseleave", endDraw);

  kuitansiCanvas.addEventListener("touchstart", startDraw, { passive: false });
  kuitansiCanvas.addEventListener("touchmove", draw, { passive: false });
  kuitansiCanvas.addEventListener("touchend", endDraw);
}

function clearKuitansiSignature() {
  if (!kuitansiCtx || !kuitansiCanvas) return;
  kuitansiCtx.clearRect(0, 0, kuitansiCanvas.width, kuitansiCanvas.height);
  hasKuitansiSig = false;
  const pSig = document.getElementById("pKuitansiSigImg");
  if (pSig) {
    pSig.src = "";
    pSig.style.display = "none";
  }
}

function updateKuitansiPreviewSig() {
  const pSig = document.getElementById("pKuitansiSigImg");
  if (!pSig || !kuitansiCanvas || !hasKuitansiSig) return;
  pSig.src = kuitansiCanvas.toDataURL("image/png");
  pSig.style.display = "block";
}

function syncKuitansiPreview() {
  const nomor = document.getElementById("ktNomor")?.value || "KUI/2026/001";
  const dari = document.getElementById("ktDari")?.value || "PT Klien Sejahtera Mandiri";
  const jumlah = parseFloat(document.getElementById("ktJumlah")?.value || 0);
  const keperluan = document.getElementById("ktKeperluan")?.value || "Pelunasan Jasa Pembuatan Website & Desain UI/UX Proyek Q4";
  const tempat = document.getElementById("ktTempat")?.value || "Jakarta";
  const tanggal = document.getElementById("ktTanggal")?.value || "-";
  const penerima = document.getElementById("ktPenerima")?.value || "Nama Penerima";
  const showMaterai = document.getElementById("ktToggleMaterai")?.checked;

  // Auto cek jika di atas 5 juta sarankan materai
  const materaiHint = document.getElementById("ktMateraiHint");
  if (materaiHint) {
    if (jumlah >= 5000000) {
      materaiHint.style.display = "block";
    } else {
      materaiHint.style.display = "none";
    }
  }

  const terbilangText = angkaKeTerbilang(jumlah);

  document.getElementById("pKtNomor").textContent = nomor;
  document.getElementById("pKtDari").textContent = dari;
  document.getElementById("pKtJumlahAngka").textContent = formatRupiah(jumlah);
  document.getElementById("pKtTerbilang").textContent = `# ${terbilangText} #`;
  document.getElementById("pKtKeperluan").textContent = keperluan;
  document.getElementById("pKtKotaTanggal").textContent = `${tempat}, ${tanggal}`;
  document.getElementById("pKtPenerima").textContent = penerima;

  const ktMateraiBox = document.getElementById("pKtMateraiBox");
  if (ktMateraiBox) {
    ktMateraiBox.style.display = showMaterai ? "flex" : "none";
  }
}

/**
 * Unduh Lembar Kuitansi sebagai Dokumen PDF berstandar A4 Landscape (Pixel-Perfect 1 Halaman)
 */
async function downloadKuitansiPDF() {
  const element = document.getElementById("kuitansiPaperPreview");
  if (!element) return;

  const nomor = document.getElementById("ktNomor")?.value || "Kuitansi";
  const cleanName = nomor.replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `${cleanName}_KawanFreelance.pdf`;

  const btn = document.getElementById("btnDownloadKuitansi");
  const originalText = btn ? btn.innerHTML : "";
  if (btn) {
    btn.innerHTML = `<i data-lucide="loader" class="animate-spin"></i> Menyiapkan PDF...`;
    if (window.lucide) lucide.createIcons();
    btn.disabled = true;
  }

  const originalShadow = element.style.boxShadow;
  const originalBorder = element.style.border;
  const originalRadius = element.style.borderRadius;

  try {
    element.style.boxShadow = "none";
    element.style.border = "none";
    element.style.borderRadius = "0";

    const canvas = await html2canvas(element, {
      scale: 2.5,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      scrollY: 0,
      scrollX: 0
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.98);
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
      compress: true
    });

    const pdfPageWidth = pdf.internal.pageSize.getWidth();
    const pdfPageHeight = pdf.internal.pageSize.getHeight();
    const imgHeightMm = (canvas.height * pdfPageWidth) / canvas.width;

    if (imgHeightMm <= pdfPageHeight + 2) {
      pdf.addImage(imgData, "JPEG", 0, 0, pdfPageWidth, Math.min(imgHeightMm, pdfPageHeight));
    } else {
      let heightLeft = imgHeightMm;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, pdfPageWidth, imgHeightMm);
      heightLeft -= pdfPageHeight;

      while (heightLeft > 0) {
        position -= pdfPageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, pdfPageWidth, imgHeightMm);
        heightLeft -= pdfPageHeight;
      }
    }

    pdf.save(filename);

    if (btn) {
      btn.innerHTML = originalText;
      btn.disabled = false;
      if (window.lucide) lucide.createIcons();
    }
    showDonationModal("kuitansi");
  } catch (err) {
    console.error("Gagal cetak Kuitansi via html2canvas+jsPDF:", err);
    if (btn) {
      btn.innerHTML = originalText;
      btn.disabled = false;
      if (window.lucide) lucide.createIcons();
    }
    window.print();
  } finally {
    element.style.boxShadow = originalShadow;
    element.style.border = originalBorder;
    element.style.borderRadius = originalRadius;
  }
}

