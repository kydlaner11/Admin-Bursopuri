"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Spin, message } from "antd";
import Api from "../api";

const StockEdit = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const menuId = searchParams.get("id");

  const [jumlah, setJumlah] = useState("");
  const [loading, setLoading] = useState(true);
  const [menuName, setMenuName] = useState("");
  const [messageApi, contextHolder] = message.useMessage();
  const [action, setAction] = useState("restock"); // "restock" atau "reduce"
  const [error, setError] = useState(""); // State for validation error

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await Api.get(`/menus/${menuId}`);
        setMenuName(res.data.menu.nama);
      } catch (error) {
        console.error("Gagal mengambil data menu:", error);
        message.error("Gagal mengambil data menu");
      } finally {
        setLoading(false);
      }
    };

    if (menuId) {
      fetchMenu();
    } else {
      setLoading(false);
    }
  }, [menuId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!jumlah || isNaN(jumlah) || jumlah <= 0) {
      setError("Masukkan jumlah stok yang valid dan lebih dari 0");
      message.error("Masukkan jumlah stok yang valid dan lebih dari 0");
      setLoading(false);
      return;
    }

    try {
      let res;
      if (action === "restock") {
        res = await Api.put(`/menus/${menuId}/restock`, { jumlah: parseInt(jumlah) });
      } else {
        res = await Api.put(`/menus/${menuId}/reduce-stock`, { jumlah: parseInt(jumlah) });
      }
      messageApi.success(res.data.message || "Stok berhasil diperbarui");
      router.push("/menu-stock");
    } catch (error) {
      console.error("Gagal update stok:", error);
      message.error("Gagal memperbarui stok");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/menu-stock");
  };

  return (
    <div className="card">
      {contextHolder}
      <div className="card-body py-40">
        <Spin spinning={loading}>
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="shadow-4 border radius-8 p-20">
                <h6 className="text-md text-primary-light mb-16">
                  Restock Menu: {menuName}
                </h6>
                <form onSubmit={handleSubmit}>
                  <div className="mb-20">
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Pilih Aksi <span className="text-danger-600">*</span>
                    </label>
                    <select
                      className="form-control radius-8 mb-12"
                      value={action}
                      onChange={(e) => setAction(e.target.value)}
                      disabled={loading}
                      required
                    >
                      <option value="restock">Tambah Stok</option>
                      <option value="reduce">Kurangi Stok</option>
                    </select>
                    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
                      Jumlah <span className="text-danger-600">*</span>
                    </label>
                    <input
                      type="number"
                      className={`form-control radius-8${error ? ' is-invalid' : ''}`}
                      value={jumlah}
                      onChange={(e) => setJumlah(e.target.value)}
                      min={1}
                      placeholder="Masukkan jumlah stok"
                      required
                    />
                    {error && <div className="text-danger text-xs mt-1">{error}</div>}
                  </div>
                  <div className="d-flex justify-content-center gap-3">
                    <button
                      type="button"
                      className="border border-danger-600 bg-hover-danger-200 text-danger-600 text-md px-56 py-11 radius-8"
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn border border-600 text-md px-56 py-12 radius-8"
                      disabled={loading}
                        style={{ 
                        backgroundColor: '#7C0000', 
                        borderColor: '#7C0000',
                        color: 'white'
                      }}
                    >
                      {loading ? "Saving..." : "Save"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </Spin>
      </div>
    </div>
  );
};

export default StockEdit;
