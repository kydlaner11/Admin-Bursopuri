"use client";
import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import Api from "../api";
import { message, Spin, Input, Button, Select } from "antd"; // Imported Select from antd
import { useRouter } from "next/navigation";

const MenuOptionAdd = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    menuIds: [], // Array untuk multiple selection
    optional: false,
    max: 1,
    choices: [{ name: "", price: "" }],
  });

  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const response = await Api.get("/menus");
        setMenus(response.data.menus);
      } catch (error) {
        console.error("Error fetching menus:", error);
        message.error("Gagal memuat data menu.");
      }
    };

    fetchMenus();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val;
    if (type === "checkbox") {
      val = checked;
    } else {
      val = value;
    }
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  // Handler khusus untuk multiple select dari antd
  const handleMenuSelectChange = (selectedMenuIds) => {
    setFormData((prev) => ({ ...prev, menuIds: selectedMenuIds }));
  };

  const handleChoiceChange = (index, field, value) => {
    const updatedChoices = [...formData.choices];
    updatedChoices[index][field] = value;
    setFormData((prev) => ({ ...prev, choices: updatedChoices }));
  };

  const addChoice = () => {
    setFormData((prev) => ({
      ...prev,
      choices: [...prev.choices, { name: "", price: "" }],
    }));
  };

  const removeChoice = (index) => {
    const updated = [...formData.choices];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, choices: updated }));
  };

  const handleCancel = () => {
    router.push("/menu-option-list");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { title, menuIds, optional, max, choices } = formData;
    // Validasi
    if (
      !title ||
      !menuIds ||
      !Array.isArray(menuIds) ||
      menuIds.length === 0 ||
      choices.some((c) => !c.name || !c.price)
    ) {
      message.error("Mohon lengkapi semua field yang wajib.");
      setLoading(false);
      return;
    }

    // Hanya kirim field name dan price (number) untuk setiap choice
    const cleanedChoices = choices.map(({ name, price }) => ({
      name,
      price: Number(price) // pastikan price adalah number
    }));

    try {
      await Api.post("/menu-option", {
        title,
        optional,
        max : Number(max), // pastikan max adalah number
        choices: cleanedChoices,
        menuIds,
      });
      messageApi.success("Opsi berhasil ditambahkan");
      router.push("/options-list");
    } catch (error) {
      console.error("Gagal menambahkan opsi:", error);
      message.error("Gagal menambahkan opsi. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      {contextHolder}
      <div className="card-body py-40">
        <Spin spinning={loading}>
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="shadow-4 border radius-8 p-20">
                <h6 className="text-md text-primary-light mb-16">Add Menu Option</h6>
                <form onSubmit={handleSubmit}>
                  <div className="mb-20">
                    <label className="form-label">Judul Opsi *</label>
                    <Input
                      size="large"
                      type="text"
                      name="title" // pastikan name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Contoh: Pilihan Minuman"
                    />
                  </div>

                  <div className="mb-20">
                    <label className="form-label">Menu * (Bisa pilih lebih dari satu)</label>
                    <Select
                      size="large"
                      mode="multiple"
                      allowClear
                      style={{ width: '100%' }}
                      placeholder="Pilih menu"
                      value={formData.menuIds}
                      onChange={handleMenuSelectChange}
                      options={menus.map((menu) => ({
                        value: menu.id_menu,
                        label: menu.nama,
                      }))}
                    />
                  </div>

                  <div className="mb-20">
                    <label className="form-label">Wajib Dipilih?</label>
                    <Select
                      size="large"
                      style={{ width: '100%' }}
                      value={formData.optional ? "true" : "false"}
                      onChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          optional: value === "true",
                        }))
                      }
                      options={[
                        { value: "true", label: "Ya" },
                        { value: "false", label: "Tidak" },
                      ]}
                    />
                  </div>

                  <div className="mb-20">
                    <label className="form-label">Max Pilihan *</label>
                    <Input
                      size="large"
                      type="number"
                      name="max" // pastikan name="max"
                      min={1}
                      value={formData.max}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="mb-20">
                    <label className="form-label">Pilihan & Harga *</label>
                    {formData.choices.map((choice, index) => (
                      <div key={index} className="d-flex gap-2 mb-2">
                        <Input
                          size="large"
                          placeholder="Nama Pilihan"
                          value={choice.name}
                          onChange={(e) =>
                            handleChoiceChange(index, "name", e.target.value)
                          }
                        />
                        <Input
                          size="large"
                          type="number"
                          placeholder="Harga"
                          value={choice.price}
                          onChange={(e) =>
                            handleChoiceChange(index, "price", e.target.value)
                          }
                        />
                        {formData.choices.length > 1 && (
                          <Button danger onClick={() => removeChoice(index)}>
                            <Icon icon="mdi:delete" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button type="dashed" onClick={addChoice} className="mt-2">
                      + Tambah Pilihan
                    </Button>
                  </div>

                  <div className="d-flex align-items-center justify-content-center gap-3 mt-4">
                    <button
                      type="button"
                      className="border border-danger-600 bg-hover-danger-200 text-danger-600 text-md px-56 py-11 radius-8"
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary border border-primary-600 text-md px-56 py-12 radius-8"
                      disabled={loading}
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

export default MenuOptionAdd;