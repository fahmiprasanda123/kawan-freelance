/**
 * Logika Kalkulator Pajak Indonesia (PPh 21 TER 2024 & NPPN Freelancer 50%)
 * Sesuai PP 58/2023, PMK 168/2023, dan UU HPP
 */

const DATA_PTKP = {
  "TK/0": { nominal: 54000000, terKategori: "A", label: "Tidak Kawin - Tanpa Tanggungan (TK/0)" },
  "TK/1": { nominal: 58500000, terKategori: "A", label: "Tidak Kawin - 1 Tanggungan (TK/1)" },
  "K/0":  { nominal: 58500000, terKategori: "A", label: "Kawin - Tanpa Tanggungan (K/0)" },
  "TK/2": { nominal: 63000000, terKategori: "B", label: "Tidak Kawin - 2 Tanggungan (TK/2)" },
  "K/1":  { nominal: 63000000, terKategori: "B", label: "Kawin - 1 Tanggungan (K/1)" },
  "TK/3": { nominal: 67500000, terKategori: "B", label: "Tidak Kawin - 3 Tanggungan (TK/3)" },
  "K/2":  { nominal: 67500000, terKategori: "B", label: "Kawin - 2 Tanggungan (K/2)" },
  "K/3":  { nominal: 72000000, terKategori: "C", label: "Kawin - 3 Tanggungan (K/3)" },
};

// Bracket TER A (Maksimal penghasilan bruto dan tarif)
const TABEL_TER_A = [
  { max: 5400000, tarif: 0.00 },
  { max: 5650000, tarif: 0.0025 },
  { max: 5950000, tarif: 0.005 },
  { max: 6300000, tarif: 0.0075 },
  { max: 6750000, tarif: 0.01 },
  { max: 7500000, tarif: 0.0125 },
  { max: 8550000, tarif: 0.015 },
  { max: 9650000, tarif: 0.0175 },
  { max: 10050000, tarif: 0.02 },
  { max: 10350000, tarif: 0.0225 },
  { max: 10700000, tarif: 0.025 },
  { max: 11050000, tarif: 0.03 },
  { max: 11600000, tarif: 0.035 },
  { max: 12500000, tarif: 0.04 },
  { max: 13750000, tarif: 0.05 },
  { max: 15100000, tarif: 0.06 },
  { max: 16950000, tarif: 0.07 },
  { max: 19750000, tarif: 0.08 },
  { max: 24150000, tarif: 0.09 },
  { max: 26450000, tarif: 0.10 },
  { max: 28000000, tarif: 0.11 },
  { max: 30050000, tarif: 0.12 },
  { max: 32400000, tarif: 0.13 },
  { max: 35400000, tarif: 0.14 },
  { max: 39100000, tarif: 0.15 },
  { max: 43850000, tarif: 0.16 },
  { max: 47800000, tarif: 0.17 },
  { max: 51400000, tarif: 0.18 },
  { max: 56300000, tarif: 0.19 },
  { max: 62200000, tarif: 0.20 },
  { max: 68600000, tarif: 0.21 },
  { max: 77500000, tarif: 0.22 },
  { max: 89000000, tarif: 0.23 },
  { max: 103000000, tarif: 0.24 },
  { max: 125000000, tarif: 0.25 },
  { max: 157000000, tarif: 0.26 },
  { max: 206000000, tarif: 0.27 },
  { max: 337000000, tarif: 0.28 },
  { max: 454000000, tarif: 0.29 },
  { max: 550000000, tarif: 0.30 },
  { max: 695000000, tarif: 0.31 },
  { max: 910000000, tarif: 0.32 },
  { max: 1400000000, tarif: 0.33 },
  { max: Infinity, tarif: 0.34 }
];

const TABEL_TER_B = [
  { max: 6200000, tarif: 0.00 },
  { max: 6500000, tarif: 0.0025 },
  { max: 6850000, tarif: 0.005 },
  { max: 7300000, tarif: 0.0075 },
  { max: 9200000, tarif: 0.01 },
  { max: 10750000, tarif: 0.015 },
  { max: 11250000, tarif: 0.02 },
  { max: 11600000, tarif: 0.025 },
  { max: 12600000, tarif: 0.03 },
  { max: 13600000, tarif: 0.04 },
  { max: 14950000, tarif: 0.05 },
  { max: 16400000, tarif: 0.06 },
  { max: 18450000, tarif: 0.07 },
  { max: 21850000, tarif: 0.08 },
  { max: 26000000, tarif: 0.09 },
  { max: 27700000, tarif: 0.10 },
  { max: 29350000, tarif: 0.11 },
  { max: 31450000, tarif: 0.12 },
  { max: 33950000, tarif: 0.13 },
  { max: 37100000, tarif: 0.14 },
  { max: 41100000, tarif: 0.15 },
  { max: 45800000, tarif: 0.16 },
  { max: 49500000, tarif: 0.17 },
  { max: 53800000, tarif: 0.18 },
  { max: 58500000, tarif: 0.19 },
  { max: 64000000, tarif: 0.20 },
  { max: 71000000, tarif: 0.21 },
  { max: 80000000, tarif: 0.22 },
  { max: 93000000, tarif: 0.23 },
  { max: 109000000, tarif: 0.24 },
  { max: 129000000, tarif: 0.25 },
  { max: 163000000, tarif: 0.26 },
  { max: 211000000, tarif: 0.27 },
  { max: 374000000, tarif: 0.28 },
  { max: 459000000, tarif: 0.29 },
  { max: 555000000, tarif: 0.30 },
  { max: 704000000, tarif: 0.31 },
  { max: 957000000, tarif: 0.32 },
  { max: 1405000000, tarif: 0.33 },
  { max: Infinity, tarif: 0.34 }
];

const TABEL_TER_C = [
  { max: 6600000, tarif: 0.00 },
  { max: 6950000, tarif: 0.0025 },
  { max: 7350000, tarif: 0.005 },
  { max: 7800000, tarif: 0.0075 },
  { max: 8850000, tarif: 0.01 },
  { max: 10700000, tarif: 0.015 },
  { max: 11500000, tarif: 0.02 },
  { max: 12500000, tarif: 0.03 },
  { max: 13900000, tarif: 0.04 },
  { max: 15300000, tarif: 0.05 },
  { max: 16950000, tarif: 0.06 },
  { max: 19300000, tarif: 0.07 },
  { max: 22800000, tarif: 0.08 },
  { max: 26600000, tarif: 0.09 },
  { max: 28100000, tarif: 0.10 },
  { max: 30100000, tarif: 0.11 },
  { max: 32600000, tarif: 0.12 },
  { max: 35400000, tarif: 0.13 },
  { max: 38900000, tarif: 0.14 },
  { max: 43100000, tarif: 0.15 },
  { max: 47400000, tarif: 0.16 },
  { max: 51200000, tarif: 0.17 },
  { max: 55800000, tarif: 0.18 },
  { max: 60600000, tarif: 0.19 },
  { max: 66200000, tarif: 0.20 },
  { max: 73050000, tarif: 0.21 },
  { max: 82200000, tarif: 0.22 },
  { max: 95600000, tarif: 0.23 },
  { max: 113400000, tarif: 0.24 },
  { max: 134400000, tarif: 0.25 },
  { max: 169500000, tarif: 0.26 },
  { max: 221000000, tarif: 0.27 },
  { max: 390000000, tarif: 0.28 },
  { max: 463000000, tarif: 0.29 },
  { max: 561000000, tarif: 0.30 },
  { max: 709000000, tarif: 0.31 },
  { max: 965000000, tarif: 0.32 },
  { max: 1419000000, tarif: 0.33 },
  { max: Infinity, tarif: 0.34 }
];

function cariTarifTER(kategori, brutoBulanan) {
  let tabel = TABEL_TER_A;
  if (kategori === "B") tabel = TABEL_TER_B;
  if (kategori === "C") tabel = TABEL_TER_C;

  for (const item of tabel) {
    if (brutoBulanan <= item.max) {
      return item.tarif;
    }
  }
  return 0.34;
}

/**
 * Menghitung PPh 21 Pasal 17 Progresif berdasarkan UU Harmonisasi Peraturan Perpajakan (HPP)
 */
function hitungPPhPasal17(pkp) {
  if (pkp <= 0) return { total: 0, rincian: [] };

  const brackets = [
    { limit: 60000000, rate: 0.05, label: "Lapisan 1 (0 s.d 60 Jt) @ 5%" },
    { limit: 190000000, rate: 0.15, label: "Lapisan 2 (> 60 s.d 250 Jt) @ 15%" },
    { limit: 250000000, rate: 0.25, label: "Lapisan 3 (> 250 s.d 500 Jt) @ 25%" },
    { limit: 4500000000, rate: 0.30, label: "Lapisan 4 (> 500 Jt s.d 5 M) @ 30%" },
    { limit: Infinity, rate: 0.35, label: "Lapisan 5 (> 5 Miliar) @ 35%" }
  ];

  let sisa = pkp;
  let totalPajak = 0;
  const rincian = [];

  for (const b of brackets) {
    if (sisa <= 0) break;
    const dasarKenaPajak = Math.min(sisa, b.limit);
    const pajakBagian = dasarKenaPajak * b.rate;
    totalPajak += pajakBagian;
    rincian.push({
      label: b.label,
      dasar: dasarKenaPajak,
      rate: b.rate,
      pajak: pajakBagian
    });
    sisa -= dasarKenaPajak;
  }

  return { total: totalPajak, rincian };
}

/**
 * Perhitungan Pajak Freelancer dengan NPPN (Norma Penghitungan Penghasilan Neto 50%)
 */
function hitungPajakFreelancer(omzetTahunan, statusPtkp, sudahPotongPPh23 = 0, normaPersen = 50) {
  const ptkpData = DATA_PTKP[statusPtkp] || DATA_PTKP["TK/0"];
  const ptkpNominal = ptkpData.nominal;

  const rasioNorma = normaPersen / 100;
  const neto = omzetTahunan * rasioNorma;
  const pkp = Math.max(0, neto - ptkpNominal);

  const hasilPasal17 = hitungPPhPasal17(pkp);
  const pphTerutang = hasilPasal17.total;
  const sisaBayar = Math.max(0, pphTerutang - sudahPotongPPh23);
  const lebihBayar = sudahPotongPPh23 > pphTerutang ? sudahPotongPPh23 - pphTerutang : 0;

  return {
    omzetTahunan,
    normaPersen,
    neto,
    ptkpNominal,
    statusPtkp,
    pkp,
    rincianBrackets: hasilPasal17.rincian,
    pphTerutangTahunan: pphTerutang,
    estimasiBulanan: pphTerutang / 12,
    kreditPPh23: sudahPotongPPh23,
    sisaKurangBayar: sisaBayar,
    lebihBayar: lebihBayar,
    persentaseEfektif: omzetTahunan > 0 ? (pphTerutang / omzetTahunan) * 100 : 0
  };
}

/**
 * Perhitungan PPh 21 TER Karyawan / Pegawai Tidak Tetap Bulanan
 */
function hitungPPh21TER(brutoBulanan, statusPtkp) {
  const ptkpData = DATA_PTKP[statusPtkp] || DATA_PTKP["TK/0"];
  const kategori = ptkpData.terKategori;
  const tarif = cariTarifTER(kategori, brutoBulanan);
  const potongan = brutoBulanan * tarif;
  const takeHomePay = brutoBulanan - potongan;

  return {
    brutoBulanan,
    statusPtkp,
    kategoriTER: kategori,
    tarifPersen: tarif * 100,
    potonganPajak: potongan,
    takeHomePay: takeHomePay
  };
}
