// src/config/navigation.js
// SATU-SATUNYA tempat untuk menambah / mengubah menu sidebar.
//
// Tipe item:
//   - link         : menu biasa  { label, href, icon, roles }
//   - group-title  : judul grup  { type: 'group-title', label, roles }
//   - dropdown     : punya `children` (submenu)
//
// `roles` kosong / tidak diisi  => terlihat oleh semua role.
// Submenu tanpa `roles` mewarisi `roles` dari parent.

export const NAV_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/",
    icon: "hugeicons:border-full",
    roles: ["admin"],
  },
  {
    id: "terima-pesanan",
    label: "Terima Pesanan",
    href: "/terima-pesanan",
    icon: "hugeicons:border-full",
    roles: ["admin"],
  },
  {
    id: "orders",
    label: "Pesanan",
    href: "/orders",
    icon: "hugeicons:sending-order",
    roles: ["kepala_dapur"],
  },
  {
    id: "order-history",
    label: "Riwayat Pesanan",
    href: "/order-history",
    icon: "hugeicons:brochure",
    roles: ["admin", "kepala_dapur"],
  },

  { id: "title-kelola", type: "group-title", label: "Kelola", roles: ["admin"] },

  {
    id: "menu-management",
    label: "Kelola Menu",
    icon: "hugeicons:invoice-03",
    roles: ["admin"],
    children: [
      { label: "Menu", href: "/menu-list", dot: "text-primary-600" },
      { label: "Pilihan Menu", href: "/options-list", dot: "text-warning-main" },
      { label: "Kategori Menu", href: "/category-list", dot: "text-success-main" },
      // Contoh membuka untuk role lain: tambahkan roles di level submenu
      // (parent juga harus mengizinkan role tsb).
      { label: "Stok Menu", href: "/menu-stock", dot: "text-warning-main" },
    ],
  },
  {
    id: "media-management",
    label: "Kelola Media",
    icon: "hugeicons:image-composition",
    roles: ["admin"],
    children: [{ label: "Banner", href: "/banner-list", dot: "text-primary-600" }],
  },
  {
    id: "user-management",
    label: "User Management",
    icon: "hugeicons:user-settings-01",
    roles: ["admin"],
    children: [
      { label: "All Users", href: "/users", dot: "text-info-main" },
      { label: "User Roles", href: "/user-roles", dot: "text-danger-main" },
    ],
  },
];

// ---------- helpers ----------

const canSee = (roles, role) => !roles || roles.length === 0 || roles.includes(role);

/** Filter menu (rekursif) berdasarkan role user. */
export function filterNavByRole(items, role) {
  return items
    .filter((item) => canSee(item.roles, role))
    .map((item) => {
      if (!item.children) return item;
      const children = item.children
        .map((c) => ({ ...c, roles: c.roles ?? item.roles }))
        .filter((c) => canSee(c.roles, role));
      return { ...item, children };
    })
    // dropdown tanpa anak yang terlihat disembunyikan
    .filter((item) => !item.children || item.children.length > 0);
}

/** Flatten semua route -> [{ href, roles }] */
function flattenRoutes(items = NAV_ITEMS) {
  return items.flatMap((item) => {
    if (item.children) {
      return item.children
        .filter((c) => c.href)
        .map((c) => ({ href: c.href, roles: c.roles ?? item.roles ?? [] }));
    }
    return item.href ? [{ href: item.href, roles: item.roles ?? [] }] : [];
  });
}

/** Role yang boleh membuka sebuah path (dipakai sebagai route guard otomatis). */
export function getRolesForPath(pathname) {
  const match = flattenRoutes().find((r) => r.href === pathname);
  return match ? match.roles : [];
}