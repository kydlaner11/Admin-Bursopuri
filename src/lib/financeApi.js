import Api from "@/api";

// Semua endpoint finance. Response backend: { ok, data } -> kita kembalikan data-nya saja.
// Perhitungan uang selalu dari backend; frontend hanya menampilkan.
const BASE = "/api/v1/finance";

const get = (path, params) => Api.get(`${BASE}${path}`, { params }).then((r) => r.data.data);
const post = (path, body) => Api.post(`${BASE}${path}`, body).then((r) => r.data.data);
const patch = (path, body) => Api.patch(`${BASE}${path}`, body).then((r) => r.data.data);

export const financeApi = {
  dashboard: (params) => get("/dashboard", params),

  channels: () => get("/channels"),

  accounts: () => get("/accounts"),
  categories: (wallet) => get("/categories", wallet ? { wallet } : undefined),

  sales: (params) => get("/sales", params),
  salesSummary: (params) => get("/sales/summary", params),
  createSale: (body) => post("/sales", body),
  updateSale: (id, body) => patch(`/sales/${id}`, body),
  voidSale: (id, reason) => post(`/sales/${id}/void`, { reason }),

  expenses: (params) => get("/expenses", params),
  createExpense: (body) => post("/expenses", body),
  incomes: (params) => get("/incomes", params),
  createIncome: (body) => post("/incomes", body),
  voidTransaction: (id, reason) => post(`/transactions/${id}/void`, { reason }),

  transfers: (params) => get("/transfers", params),
  createTransfer: (body) => post("/transfers", body),
  voidTransfer: (groupId, reason) => post(`/transfers/${groupId}/void`, { reason }),

  obligations: (params) => get("/obligations", params),
};