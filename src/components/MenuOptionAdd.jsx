"use client";
import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import Api from "../api";
import { message, Spin, Input, Button, Select, ConfigProvider } from "antd"; // Imported Select from antd
import { useRouter } from "next/navigation";
import { formatToIDRCurrency } from "../utils/formatCurrency";

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
  const [errors, setErrors] = useState({}); // State for validation errors

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
    router.push("/options-list");
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = "Judul opsi wajib diisi.";
    if (!formData.menuIds || !Array.isArray(formData.menuIds) || formData.menuIds.length === 0) newErrors.menuIds = "Menu wajib dipilih minimal satu.";
    if (!formData.max || isNaN(formData.max) || Number(formData.max) < 1) newErrors.max = "Max pilihan wajib diisi dan minimal 1.";
    if (!formData.choices || formData.choices.length === 0) newErrors.choices = "Minimal satu pilihan harus diisi.";
    else {
      formData.choices.forEach((c, idx) => {
        if (!c.name) {
          if (!newErrors.choices) newErrors.choices = [];
          newErrors.choices[idx] = "Nama pilihan wajib diisi.";
        } else if (!/^.+$/.test(c.name)) {
          if (!newErrors.choices) newErrors.choices = [];
          newErrors.choices[idx] = "Nama pilihan tidak valid.";
        }
        if (!c.price && c.price !== 0) {
          if (!newErrors.choices) newErrors.choices = [];
          newErrors.choices[idx] = (newErrors.choices[idx] ? newErrors.choices[idx] + ' ' : '') + "Harga wajib diisi.";
        } else if (!/^\d+$/.test(String(c.price))) {
          if (!newErrors.choices) newErrors.choices = [];
          newErrors.choices[idx] = (newErrors.choices[idx] ? newErrors.choices[idx] + ' ' : '') + "Harga harus berupa angka.";
        }
      });
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0 || (validationErrors.choices && validationErrors.choices.some(Boolean))) {
      message.error("Mohon lengkapi semua field dengan benar.");
      setLoading(false);
      return;
    }

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
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#7C0000',
            },
          }}
        >
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
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Contoh: Pilihan Minuman"
                      className={errors.title ? 'is-invalid' : ''}
                    />
                    {errors.title && <div className="text-danger text-xs mt-1">{errors.title}</div>}
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
                      className={errors.menuIds ? 'is-invalid' : ''}
                    />
                    {errors.menuIds && <div className="text-danger text-xs mt-1">{errors.menuIds}</div>}
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
                      name="max"
                      min={1}
                      value={formData.max}
                      onChange={handleInputChange}
                      className={errors.max ? 'is-invalid' : ''}
                    />
                    {errors.max && <div className="text-danger text-xs mt-1">{errors.max}</div>}
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
                          className={errors.choices && errors.choices[index] ? 'is-invalid' : ''}
                        />
                        <Input
                          size="large"
                          type="text"
                          placeholder="Harga"
                          value={choice.price !== '' ? formatToIDRCurrency(Number(String(choice.price).replace(/[^\d]/g, ''))) : ''}
                          onChange={e => {
                            const rawValue = e.target.value.replace(/[^\d]/g, '');
                            handleChoiceChange(index, "price", rawValue);
                          }}
                          className={errors.choices && errors.choices[index] ? 'is-invalid' : ''}
                        />
                        {formData.choices.length > 1 && (
                          <Button danger onClick={() => removeChoice(index)}>
                            <Icon icon="mdi:delete" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {errors.choices && Array.isArray(errors.choices) && errors.choices.map((err, idx) => err && (
                      <div key={idx} className="text-danger text-xs mb-1">{err}</div>
                    ))}
                    {typeof errors.choices === 'string' && <div className="text-danger text-xs mb-1">{errors.choices}</div>}
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
        </ConfigProvider>
      </div>
    </div>
  );
};

export default MenuOptionAdd;