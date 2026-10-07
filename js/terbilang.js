/**
 * Mengonversi angka nominal Rupiah menjadi teks terbilang Bahasa Indonesia
 * Contoh: 1500000 -> "Satu Juta Lima Ratus Ribu Rupiah"
 */
function angkaKeTerbilang(nilai) {
  if (isNaN(nilai) || nilai === null || nilai === undefined) return "";
  nilai = Math.floor(Math.abs(nilai));
  if (nilai === 0) return "Nol Rupiah";

  const satuan = [
    "", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan",
    "Sepuluh", "Sebelas"
  ];

  function bilang(n) {
    if (n < 12) {
      return satuan[n];
    } else if (n < 20) {
      return bilang(n - 10) + " Belas";
    } else if (n < 100) {
      return bilang(Math.floor(n / 10)) + " Puluh " + bilang(n % 10);
    } else if (n < 200) {
      return "Seratus " + bilang(n - 100);
    } else if (n < 1000) {
      return bilang(Math.floor(n / 100)) + " Ratus " + bilang(n % 100);
    } else if (n < 2000) {
      return "Seribu " + bilang(n - 1000);
    } else if (n < 1000000) {
      return bilang(Math.floor(n / 1000)) + " Ribu " + bilang(n % 1000);
    } else if (n < 1000000000) {
      return bilang(Math.floor(n / 1000000)) + " Juta " + bilang(n % 1000000);
    } else if (n < 1000000000000) {
      return bilang(Math.floor(n / 1000000000)) + " Miliar " + bilang(n % 1000000000);
    } else if (n < 1000000000000000) {
      return bilang(Math.floor(n / 1000000000000)) + " Triliun " + bilang(n % 1000000000000);
    }
    return "";
  }

  const hasil = bilang(nilai).replace(/\s+/g, " ").trim();
  return (hasil ? hasil + " Rupiah" : "Nol Rupiah");
}

function formatRupiah(angka) {
  if (angka === null || angka === undefined || isNaN(angka)) return "Rp 0";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(angka);
}
