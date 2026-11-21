// Helper format & tanggal untuk halaman finance.
// Tanggal bisnis memakai WIB (UTC+7), sama dengan backend.

export const BRAND = "#7C0000";

export const rupiah = (v) => {
  const n = Number(v ?? 0);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(n) ? n : 0);
};

export const num = (v) => {
  const n = Number(v ?? 0);
  return new Intl.NumberFormat("id-ID").format(Number.isFinite(n) ? n : 0);
};

export const compact = (v) =>
  new Intl.NumberFormat("id-ID", { notation: "compact", maximumFractionDigits: 1 }).format(
    Number(v || 0)
  );

const toKey = (d) => d.toISOString().slice(0, 10);

// "YYYY-MM-DD" hari ini di WIB
export const todayWIB = () => toKey(new Date(Date.now() + 7 * 3600 * 1000));

export const addDays = (key, n) => {
  const d = new Date(`${key}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return toKey(d);
};

export const monthStart = (key = todayWIB()) => `${key.slice(0, 8)}01`;

// "2026-11-21..." -> "21/11/2026"
export const fmtDate = (iso) => {
  const [y, m, d] = String(iso).slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
};

// "2026-11-21" -> "21/11"
export const fmtShort = (iso) => {
  const [, m, d] = String(iso).slice(0, 10).split("-");
  return `${d}/${m}`;
};

const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
export const dayName = (key) => DAYS[new Date(`${key}T00:00:00.000Z`).getUTCDay()];

export const errMsg = (e) =>
  e?.response?.data?.message || e?.message || "Terjadi kesalahan";

// Kunci anti-input-ganda: satu kunci per "niat menyimpan", diganti setelah berhasil
export const newKey = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `k-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

// Warna & ikon kanal (selaras dengan tombol panggilan di dashboard pemesanan)
export const CHANNEL_ORDER = ["DEPOT", "GOJEK", "GRAB", "SHOPEE"];
export const CHANNEL_META = {
  DEPOT: { icon: "mdi:storefront", color: BRAND },
  GOJEK: { icon: "mdi:motorbike", color: "#00AA13" },
  GRAB: { icon: "mdi:car-hatchback", color: "#007A3D" },
  SHOPEE: { icon: "mdi:shopping", color: "#EE4D2D" },
};

export const WALLET_LABEL = { BUSINESS: "Usaha", FAMILY: "Keluarga" };

// Props InputNumber untuk rupiah: tampil 1.250.000, nilai tetap angka
export const moneyInputProps = {
  min: 0,
  precision: 0,
  controls: false,
  style: { width: "100%" },
  formatter: (v) => `${v ?? ""}`.replace(/\B(?=(\d{3})+(?!\d))/g, "."),
  parser: (v) => (v ? v.replace(/\./g, "") : ""),
};