/**
 * Modul Generator Invoice Profesional
 * Sinkronisasi Realtime, Canvas Tanda Tangan, Auto-Terbilang, dan Export PDF
 */

let invoiceItems = [
  { id: 1, desc: "Desain UI/UX Mobile App (Figma)", qty: 1, unit: "Paket", price: 6500000 },
  { id: 2, desc: "Slicing Frontend Tailwind & Vue.js", qty: 1, unit: "Paket", price: 4500000 },
  { id: 3, desc: "Revisi Minor & Panduan Dokumentasi", qty: 2, unit: "Sesi", price: 500000 }
];

let signatureCanvas = null;
let signatureCtx = null;
let isDrawing = false;
let hasSignature = false;

function initSignatureCanvas() {
  signatureCanvas = document.getElementById("signaturePad");
  if (!signatureCanvas) return;
  signatureCtx = signatureCanvas.getContext("2d");

  // Atur resolusi internal canvas agar tajam pada layar retina
  const rect = signatureCanvas.getBoundingClientRect();
  signatureCanvas.width = 360;
  signatureCanvas.height = 140;

  signatureCtx.strokeStyle = "#1e293b";
  signatureCtx.lineWidth = 2.5;
  signatureCtx.lineCap = "round";
  signatureCtx.lineJoin = "round";

  function getPos(e) {
    const cRect = signatureCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - cRect.left) * (signatureCanvas.width / cRect.width),
      y: (clientY - cRect.top) * (signatureCanvas.height / cRect.height)
    };
  }

  function startDraw(e) {
    e.preventDefault();
    isDrawing = true;
    const pos = getPos(e);
    signatureCtx.beginPath();
    signatureCtx.moveTo(pos.x, pos.y);
  }

  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);
    signatureCtx.lineTo(pos.x, pos.y);
    signatureCtx.stroke();
    hasSignature = true;
    updateInvoicePreviewSignature();
  }

  function endDraw() {
    isDrawing = false;
  }

  signatureCanvas.addEventListener("mousedown", startDraw);
  signatureCanvas.addEventListener("mousemove", draw);
  signatureCanvas.addEventListener("mouseup", endDraw);
  signatureCanvas.addEventListener("mouseleave", endDraw);

  signatureCanvas.addEventListener("touchstart", startDraw, { passive: false });
  signatureCanvas.addEventListener("touchmove", draw, { passive: false });
  signatureCanvas.addEventListener("touchend", endDraw);
}

function clearSignature() {
  if (!signatureCtx || !signatureCanvas) return;
  signatureCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
  hasSignature = false;
  const previewSig = document.getElementById("previewSignatureImg");
  if (previewSig) {
    previewSig.src = "";
    previewSig.style.display = "none";
  }
}

function updateInvoicePreviewSignature() {
  const previewSig = document.getElementById("previewSignatureImg");
  if (!previewSig || !signatureCanvas || !hasSignature) return;
  previewSig.src = signatureCanvas.toDataURL("image/png");
  previewSig.style.display = "block";
}

function renderItemRows() {
  const container = document.getElementById("invoiceItemsList");
  if (!container) return;

  container.innerHTML = "";
  invoiceItems.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "item-card";
    card.innerHTML = `
      <div class="item-card-header">
        <div class="item-desc-wrapper">
          <label class="item-mini-label">Deskripsi Layanan / Item #${index + 1}</label>
          <input type="text" class="input-field" value="${item.desc}" placeholder="Contoh: Desain UI/UX Mobile App" oninput="updateItem(${item.id}, 'desc', this.value)" />
        </div>
        <button type="button" class="btn-icon btn-danger item-delete-btn" onclick="removeItem(${item.id})" title="Hapus baris item">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
      <div class="item-card-details">
        <div class="detail-field col-qty">
          <label class="item-mini-label">Jumlah</label>
          <input type="number" min="1" class="input-field font-mono text-center" value="${item.qty}" oninput="updateItem(${item.id}, 'qty', this.value)" />
        </div>
        <div class="detail-field col-unit">
          <label class="item-mini-label">Satuan</label>
          <input type="text" class="input-field text-center" value="${item.unit}" placeholder="Paket/Jam" oninput="updateItem(${item.id}, 'unit', this.value)" />
        </div>
        <div class="detail-field col-price">
          <label class="item-mini-label">Harga Satuan (Rp)</label>
          <input type="number" min="0" step="1000" class="input-field font-mono" value="${item.price}" oninput="updateItem(${item.id}, 'price', this.value)" />
        </div>
        <div class="detail-field col-subtotal">
          <label class="item-mini-label text-right">Subtotal</label>
          <div class="item-subtotal-val font-mono font-bold text-right">${formatRupiah(item.qty * item.price)}</div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  if (window.lucide) {
    lucide.createIcons();
  }

  recalculateInvoice();
}

function addItem() {
  const newId = Date.now();
  invoiceItems.push({
    id: newId,
    desc: "Item / Jasa Baru",
    qty: 1,
    unit: "Paket",
    price: 1000000
  });
  renderItemRows();
}

function removeItem(id) {
  if (invoiceItems.length <= 1) {
    alert("Minimal harus ada satu baris item pada invoice.");
    return;
  }
  invoiceItems = invoiceItems.filter(item => item.id !== id);
  renderItemRows();
}

function updateItem(id, field, value) {
  const item = invoiceItems.find(i => i.id === id);
  if (!item) return;

  if (field === "qty" || field === "price") {
    item[field] = parseFloat(value) || 0;
  } else {
    item[field] = value;
  }
  recalculateInvoice();
}

function recalculateInvoice() {
  // Hitung subtotal
  let subtotal = 0;
  invoiceItems.forEach(item => {
    subtotal += (item.qty * item.price);
  });

  const diskonPersen = parseFloat(document.getElementById("invDiskonPersen")?.value || 0);
  const nilaiDiskon = subtotal * (diskonPersen / 100);
  const setelahDiskon = Math.max(0, subtotal - nilaiDiskon);

  const ppnPersen = parseFloat(document.getElementById("invPpnPersen")?.value || 0);
  const nilaiPpn = setelahDiskon * (ppnPersen / 100);

  const pph23Persen = parseFloat(document.getElementById("invPph23Persen")?.value || 0);
  const nilaiPph23 = setelahDiskon * (pph23Persen / 100);

  const totalAkhir = setelahDiskon + nilaiPpn - nilaiPph23;

  // Update elemen form review angka
  if (document.getElementById("calcSubtotal")) document.getElementById("calcSubtotal").textContent = formatRupiah(subtotal);
  if (document.getElementById("calcDiskon")) document.getElementById("calcDiskon").textContent = formatRupiah(nilaiDiskon);
  if (document.getElementById("calcPpn")) document.getElementById("calcPpn").textContent = formatRupiah(nilaiPpn);
  if (document.getElementById("calcPph23")) document.getElementById("calcPph23").textContent = formatRupiah(nilaiPph23);
  if (document.getElementById("calcTotalAkhir")) document.getElementById("calcTotalAkhir").textContent = formatRupiah(totalAkhir);

  syncLivePreview({
    subtotal,
    diskonPersen,
    nilaiDiskon,
    ppnPersen,
    nilaiPpn,
    pph23Persen,
    nilaiPph23,
    totalAkhir
  });
}

function syncLivePreview(calcData) {
  // Ambil nilai dari Form
  const invNumber = document.getElementById("invNumber")?.value || "INV/2026/001";
  const invDate = document.getElementById("invDate")?.value || "-";
  const invDueDate = document.getElementById("invDueDate")?.value || "-";

  const senderName = document.getElementById("senderName")?.value || "Nama Studio / Freelancer";
  const senderContact = document.getElementById("senderContact")?.value || "halo@kreatifstudio.id | +62 812-3456-7890";
  const senderAddress = document.getElementById("senderAddress")?.value || "Jakarta Selatan, Indonesia";

  const clientName = document.getElementById("clientName")?.value || "PT Klien Sejahtera Mandiri";
  const clientContact = document.getElementById("clientContact")?.value || "finance@klien.co.id";
  const clientAddress = document.getElementById("clientAddress")?.value || "Gedung Cyber 2 Lt. 12, Jakarta";

  const bankName = document.getElementById("bankName")?.value || "BCA";
  const bankAccount = document.getElementById("bankAccount")?.value || "123-456-7890";
  const bankHolder = document.getElementById("bankHolder")?.value || "Nama Pemilik Rekening";
  const paymentNotes = document.getElementById("paymentNotes")?.value || "Pembayaran mohon ditransfer sebelum tanggal jatuh tempo.";

  const showMaterai = document.getElementById("toggleMaterai")?.checked;
  const signatoryName = document.getElementById("signatoryName")?.value || senderName;

  // Pasang ke Lembar Preview
  document.getElementById("pInvNumber").textContent = invNumber;
  document.getElementById("pInvDate").textContent = invDate;
  document.getElementById("pInvDueDate").textContent = invDueDate;

  document.getElementById("pSenderName").textContent = senderName;
  document.getElementById("pSenderContact").textContent = senderContact;
  document.getElementById("pSenderAddress").textContent = senderAddress;

  document.getElementById("pClientName").textContent = clientName;
  document.getElementById("pClientContact").textContent = clientContact;
  document.getElementById("pClientAddress").textContent = clientAddress;

  document.getElementById("pBankName").textContent = bankName;
  document.getElementById("pBankAccount").textContent = bankAccount;
  document.getElementById("pBankHolder").textContent = bankHolder;
  document.getElementById("pPaymentNotes").textContent = paymentNotes;
  document.getElementById("pSignatoryName").textContent = signatoryName;

  // Render Table Items di Preview
  const previewItemsTbody = document.getElementById("pItemsTbody");
  if (previewItemsTbody) {
    previewItemsTbody.innerHTML = "";
    invoiceItems.forEach((item, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="text-center font-mono">${idx + 1}</td>
        <td><strong>${item.desc}</strong></td>
        <td class="text-center font-mono">${item.qty} ${item.unit}</td>
        <td class="text-right font-mono">${formatRupiah(item.price)}</td>
        <td class="text-right font-mono font-semibold">${formatRupiah(item.qty * item.price)}</td>
      `;
      previewItemsTbody.appendChild(tr);
    });
  }

  // Render Total Rincian di Preview
  document.getElementById("pSubtotal").textContent = formatRupiah(calcData.subtotal);
  
  const pDiskonRow = document.getElementById("pDiskonRow");
  if (calcData.nilaiDiskon > 0) {
    pDiskonRow.style.display = "table-row";
    document.getElementById("pDiskonLabel").textContent = `Diskon (${calcData.diskonPersen}%)`;
    document.getElementById("pDiskon").textContent = `-${formatRupiah(calcData.nilaiDiskon)}`;
  } else {
    pDiskonRow.style.display = "none";
  }

  const pPpnRow = document.getElementById("pPpnRow");
  if (calcData.nilaiPpn > 0) {
    pPpnRow.style.display = "table-row";
    document.getElementById("pPpnLabel").textContent = `PPN (${calcData.ppnPersen}%)`;
    document.getElementById("pPpn").textContent = `+${formatRupiah(calcData.nilaiPpn)}`;
  } else {
    pPpnRow.style.display = "none";
  }

  const pPph23Row = document.getElementById("pPph23Row");
  if (calcData.nilaiPph23 > 0) {
    pPph23Row.style.display = "table-row";
    document.getElementById("pPph23Label").textContent = `Potongan PPh 23 (${calcData.pph23Persen}%)`;
    document.getElementById("pPph23").textContent = `-${formatRupiah(calcData.nilaiPph23)}`;
  } else {
    pPph23Row.style.display = "none";
  }

  document.getElementById("pTotalAkhir").textContent = formatRupiah(calcData.totalAkhir);

  // Terbilang
  const terbilangTeks = angkaKeTerbilang(calcData.totalAkhir);
  document.getElementById("pTerbilangTeks").textContent = `"${terbilangTeks}"`;

  // Materai Box
  const pMateraiBox = document.getElementById("pMateraiBox");
  if (pMateraiBox) {
    pMateraiBox.style.display = showMaterai ? "flex" : "none";
  }
}

/**
 * Unduh Lembar Invoice sebagai Dokumen PDF berstandar A4 (Pixel-Perfect 1 Halaman)
 */
async function downloadInvoicePDF() {
  const element = document.getElementById("invoiceA4Paper");
  if (!element) return;

  const invNumber = document.getElementById("invNumber")?.value || "Invoice";
  const cleanName = invNumber.replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `${cleanName}_KawanFreelance.pdf`;

  // Tampilkan loading state
  const btn = document.getElementById("btnDownloadInvoice");
  const originalText = btn ? btn.innerHTML : "";
  if (btn) {
    btn.innerHTML = `<i data-lucide="loader" class="animate-spin"></i> Menyiapkan PDF...`;
    if (window.lucide) lucide.createIcons();
    btn.disabled = true;
  }

  // Backup style asli elemen agar visual preview di layar tidak berubah
  const originalShadow = element.style.boxShadow;
  const originalBorder = element.style.border;
  const originalRadius = element.style.borderRadius;

  try {
    // Hilangkan shadow & border preview saat dicetak ke PDF agar bersih & presisi A4
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
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true
    });

    const pdfPageWidth = pdf.internal.pageSize.getWidth();
    const pdfPageHeight = pdf.internal.pageSize.getHeight();
    const imgHeightMm = (canvas.height * pdfPageWidth) / canvas.width;

    if (imgHeightMm <= pdfPageHeight + 2) {
      // 1 halaman penuh proporsional presisi A4
      pdf.addImage(imgData, "JPEG", 0, 0, pdfPageWidth, Math.min(imgHeightMm, pdfPageHeight));
    } else {
      // Multi-halaman bersih jika jumlah item sangat banyak
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
    // TRIGGER "MOMENT OF JOY" DONATION MODAL!
    showDonationModal("invoice");
  } catch (err) {
    console.error("Gagal cetak PDF via html2canvas+jsPDF:", err);
    if (btn) {
      btn.innerHTML = originalText;
      btn.disabled = false;
      if (window.lucide) lucide.createIcons();
    }
    // Fallback cetak langsung
    window.print();
  } finally {
    element.style.boxShadow = originalShadow;
    element.style.border = originalBorder;
    element.style.borderRadius = originalRadius;
  }
}

