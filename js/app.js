/**
 * Main Application Orchestrator
 * Navigasi Tab, Konfigurasi Donasi Saweria & Buy Me a Coffee, Modal & Event Listener
 */

// Konfigurasi Default Donasi (Bisa diubah user via menu setting dan disimpan di localStorage)
const DEFAULT_DONATION_CONFIG = {
  saweriaUrl: "https://saweria.co/itsamilitarysecret",
  buymeacoffeeUrl: "https://buymeacoffee.com/itsamilitarysecret",
  authorName: "Developer Independen"
};

let currentDonationConfig = { ...DEFAULT_DONATION_CONFIG };

function loadDonationConfig() {
  const saved = localStorage.getItem("kawan_freelance_donation");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Migrasi jika masih menggunakan URL default lama
      if (parsed.saweriaUrl?.includes("fahmiprasanda")) parsed.saweriaUrl = DEFAULT_DONATION_CONFIG.saweriaUrl;
      if (parsed.buymeacoffeeUrl?.includes("fahmiprasanda")) parsed.buymeacoffeeUrl = DEFAULT_DONATION_CONFIG.buymeacoffeeUrl;
      currentDonationConfig = { ...DEFAULT_DONATION_CONFIG, ...parsed };
    } catch (e) {
      console.warn("Gagal parse config donasi", e);
    }
  }
  updateDonationLinksInDOM();
}

function saveDonationConfig(saweria, bmc) {
  currentDonationConfig.saweriaUrl = saweria || DEFAULT_DONATION_CONFIG.saweriaUrl;
  currentDonationConfig.buymeacoffeeUrl = bmc || DEFAULT_DONATION_CONFIG.buymeacoffeeUrl;
  localStorage.setItem("kawan_freelance_donation", JSON.stringify(currentDonationConfig));
  updateDonationLinksInDOM();
  showToast("Pengaturan link donasi berhasil disimpan!");
}

function updateDonationLinksInDOM() {
  // Update semua tombol Saweria
  document.querySelectorAll(".link-saweria").forEach(el => {
    el.href = currentDonationConfig.saweriaUrl;
  });
  // Update semua tombol Buy Me a Coffee
  document.querySelectorAll(".link-bmc").forEach(el => {
    el.href = currentDonationConfig.buymeacoffeeUrl;
  });

  // Isi input pengaturan jika ada
  const inputSaweria = document.getElementById("cfgSaweriaUrl");
  const inputBmc = document.getElementById("cfgBmcUrl");
  if (inputSaweria) inputSaweria.value = currentDonationConfig.saweriaUrl;
  if (inputBmc) inputBmc.value = currentDonationConfig.buymeacoffeeUrl;
}

// Tab Switching
function switchTab(tabId) {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === tabId);
  });

  document.querySelectorAll(".tab-pane").forEach(pane => {
    pane.classList.toggle("active", pane.id === tabId);
  });

  // Re-render canvas ukuran pas jika berpindah tab
  if (tabId === "tab-invoice") {
    setTimeout(initSignatureCanvas, 100);
  } else if (tabId === "tab-kuitansi") {
    setTimeout(initKuitansiCanvas, 100);
  }

  // Scroll to top of content
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Toast Notifikasi
function showToast(message, duration = 3000) {
  let toast = document.getElementById("appToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "appToast";
    toast.className = "app-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}

// Modal Donasi "Moment of Joy"
function showDonationModal(source = "general") {
  const modal = document.getElementById("donationModal");
  if (!modal) return;

  const titleEl = document.getElementById("donationModalTitle");
  const descEl = document.getElementById("donationModalDesc");

  if (source === "invoice") {
    if (titleEl) titleEl.textContent = "Invoice PDF Siap Dikirim ke Klien! 🎉";
    if (descEl) descEl.textContent = "Invoice profesional Anda sudah selesai tanpa watermark. Kalau tool ini mempermudah proses penagihan Anda hari ini, traktir secangkir kopi yuk untuk dukung pengembangan tool ini!";
  } else if (source === "kuitansi") {
    if (titleEl) titleEl.textContent = "Kuitansi Resmi Berhasil Dibuat! ✨";
    if (descEl) descEl.textContent = "Tanda terima resmi Anda sudah rapi dan siap dicetak/dikirim. Traktir kopi developer di Saweria atau Buy Me a Coffee jika tool ini membantu Anda!";
  } else if (source === "pajak") {
    if (titleEl) titleEl.textContent = "Simulasi Pajak Selesai Dihitung! 📊";
    if (descEl) descEl.textContent = "Anda telah menghemat waktu dan kerumitan regulasi pajak. Merasa terbantu? Traktir kopi developer di Saweria / Buy Me a Coffee!";
  } else {
    if (titleEl) titleEl.textContent = "Dukung KawanFreelance ☕";
    if (descEl) descEl.textContent = "Aplikasi ini 100% gratis, bebas iklan mengganggu, dan menjamin privasi data Anda. Traktir kopi developer agar kami bisa terus menambahkan fitur-fitur baru!";
  }

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeDonationModal() {
  const modal = document.getElementById("donationModal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

// Modal Pengaturan Link Donasi
function openSettingsModal() {
  const modal = document.getElementById("settingsModal");
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeSettingsModal() {
  const modal = document.getElementById("settingsModal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

// Kalkulator Pajak Handler
function initPajakCalculator() {
  const btnHitungFreelance = document.getElementById("btnHitungFreelance");
  const btnHitungTER = document.getElementById("btnHitungTER");

  if (btnHitungFreelance) {
    btnHitungFreelance.addEventListener("click", () => {
      const omzet = parseFloat(document.getElementById("pajakOmzetFreelance")?.value || 0);
      const ptkp = document.getElementById("pajakPtkpFreelance")?.value || "TK/0";
      const kreditPph23 = parseFloat(document.getElementById("pajakKreditPph23")?.value || 0);
      const norma = parseFloat(document.getElementById("pajakNormaPersen")?.value || 50);

      const res = hitungPajakFreelancer(omzet, ptkp, kreditPph23, norma);

      // Render Hasil
      document.getElementById("resOmzetBruto").textContent = formatRupiah(res.omzetTahunan);
      document.getElementById("resNeto").textContent = `${formatRupiah(res.neto)} (${res.normaPersen}%)`;
      document.getElementById("resPtkp").textContent = `${formatRupiah(res.ptkpNominal)} (${res.statusPtkp})`;
      document.getElementById("resPkp").textContent = formatRupiah(res.pkp);
      document.getElementById("resPphTahunan").textContent = formatRupiah(res.pphTerutangTahunan);
      document.getElementById("resEstimasiBulanan").textContent = formatRupiah(res.estimasiBulanan);
      document.getElementById("resKreditPph23").textContent = formatRupiah(res.kreditPPh23);
      document.getElementById("resSisaBayar").textContent = formatRupiah(res.sisaKurangBayar);
      document.getElementById("resTarifEfektif").textContent = `${res.persentaseEfektif.toFixed(2)}%`;

      // Render Rincian Lapisan Tarif Pasal 17
      const bracketList = document.getElementById("resBracketsList");
      if (bracketList) {
        bracketList.innerHTML = "";
        if (res.rincianBrackets.length === 0) {
          bracketList.innerHTML = `<div class="text-muted text-sm italic">Penghasilan Anda di bawah PTKP, tidak ada PPh terutang (Nihil).</div>`;
        } else {
          res.rincianBrackets.forEach(b => {
            const item = document.createElement("div");
            item.className = "bracket-item";
            item.innerHTML = `
              <span class="text-sm font-medium text-slate-700">${b.label}</span>
              <span class="font-mono text-sm text-slate-900 font-semibold">${formatRupiah(b.pajak)}</span>
            `;
            bracketList.appendChild(item);
          });
        }
      }

      const hasilContainer = document.getElementById("hasilPajakFreelance");
      if (hasilContainer) {
        hasilContainer.style.display = "block";
        hasilContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
  }

  if (btnHitungTER) {
    btnHitungTER.addEventListener("click", () => {
      const bruto = parseFloat(document.getElementById("terGajiBruto")?.value || 0);
      const ptkp = document.getElementById("terPtkp")?.value || "TK/0";

      const res = hitungPPh21TER(bruto, ptkp);

      document.getElementById("resTerKategori").textContent = `Kategori ${res.kategoriTER} (${res.statusPtkp})`;
      document.getElementById("resTerTarif").textContent = `${(res.tarifPersen).toFixed(2)}%`;
      document.getElementById("resTerPotongan").textContent = formatRupiah(res.potonganPajak);
      document.getElementById("resTerTHP").textContent = formatRupiah(res.takeHomePay);

      const hasilContainer = document.getElementById("hasilPajakTER");
      if (hasilContainer) {
        hasilContainer.style.display = "block";
        hasilContainer.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
  }
}

// Inisialisasi Tanggal Default
function initDefaultDates() {
  const today = new Date();
  const options = { day: "numeric", month: "long", year: "numeric" };
  const formattedToday = today.toLocaleDateString("id-ID", options);

  const dueDate = new Date();
  dueDate.setDate(today.getDate() + 14);
  const formattedDueDate = dueDate.toLocaleDateString("id-ID", options);

  const invDateEl = document.getElementById("invDate");
  const invDueDateEl = document.getElementById("invDueDate");
  const ktTanggalEl = document.getElementById("ktTanggal");

  if (invDateEl && !invDateEl.value) invDateEl.value = formattedToday;
  if (invDueDateEl && !invDueDateEl.value) invDueDateEl.value = formattedDueDate;
  if (ktTanggalEl && !ktTanggalEl.value) ktTanggalEl.value = formattedToday;
}

// Pasang Event Listeners ke Input Form Invoice & Kuitansi
function initFormSyncListeners() {
  // Semua input di form invoice memicu sinkronisasi
  const invoiceInputs = document.querySelectorAll("#invoiceFormSection input, #invoiceFormSection textarea, #invoiceFormSection select");
  invoiceInputs.forEach(el => {
    el.addEventListener("input", recalculateInvoice);
    el.addEventListener("change", recalculateInvoice);
  });

  // Semua input di form kuitansi memicu sinkronisasi
  const kuitansiInputs = document.querySelectorAll("#kuitansiFormSection input, #kuitansiFormSection textarea, #kuitansiFormSection select");
  kuitansiInputs.forEach(el => {
    el.addEventListener("input", syncKuitansiPreview);
    el.addEventListener("change", syncKuitansiPreview);
  });
}

// Copy Tanda Tangan dari Invoice ke Kuitansi
function copySignatureToKuitansi() {
  if (!signatureCanvas || !hasSignature) {
    alert("Silakan buat tanda tangan di tab Invoice terlebih dahulu.");
    return;
  }
  const imgData = signatureCanvas.toDataURL("image/png");
  const img = new Image();
  img.onload = () => {
    if (kuitansiCtx && kuitansiCanvas) {
      kuitansiCtx.clearRect(0, 0, kuitansiCanvas.width, kuitansiCanvas.height);
      kuitansiCtx.drawImage(img, 0, 0, kuitansiCanvas.width, kuitansiCanvas.height);
      hasKuitansiSig = true;
      updateKuitansiPreviewSig();
      showToast("Tanda tangan berhasil disalin ke Kuitansi!");
    }
  };
  img.src = imgData;
}

document.addEventListener("DOMContentLoaded", () => {
  loadDonationConfig();
  initDefaultDates();
  renderItemRows();
  initSignatureCanvas();
  initKuitansiCanvas();
  syncKuitansiPreview();
  initPajakCalculator();
  initFormSyncListeners();

  // Tab buttons
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  // Modal close when clicking outside backdrop
  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-backdrop")) {
      closeDonationModal();
      closeSettingsModal();
    }
  });

  // Settings Save Form
  const settingsForm = document.getElementById("settingsForm");
  if (settingsForm) {
    settingsForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const s = document.getElementById("cfgSaweriaUrl")?.value.trim();
      const b = document.getElementById("cfgBmcUrl")?.value.trim();
      saveDonationConfig(s, b);
      closeSettingsModal();
    });
  }

  // Lucide Icons init
  if (window.lucide) {
    lucide.createIcons();
  }
});
