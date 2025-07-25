"use client";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useState, useEffect } from "react";
import Api from "../api";
import { message, Spin, Upload, Switch, Tooltip, ConfigProvider } from "antd";
import { useRouter } from "next/navigation";
import { PlusOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { formatToIDRCurrency } from "../utils/formatCurrency";

const MenuAddLayer = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nama: "",
    deskripsi: "",
    harga: "",
    kategori: "",
    image: "",
    status_stok: false,
    jumlah_stok: null,
    tersedia: true,
  });
  const [categories, setCategories] = useState([]); // State for categories
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [errors, setErrors] = useState({}); // State for validation errors

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await Api.get("/categories");
        setCategories(response.data.menu);
        console.log("Categories fetched:", response.data.menu);
      } catch (error) {
        console.error("Error fetching categories:", error);
        message.error("Gagal memuat kategori.");
      }
    };

    fetchCategories();
  }, []);

  // Update tersedia status when status_stok or jumlah_stok changes
  useEffect(() => {
    // If status_stok is true and jumlah_stok is 0, set tersedia to false
    // Otherwise, keep tersedia as true
    if (formData.status_stok && formData.jumlah_stok === 0) {
      setFormData(prev => ({ ...prev, tersedia: false }));
    } else {
      setFormData(prev => ({ ...prev, tersedia: true }));
    }
  }, [formData.status_stok, formData.jumlah_stok]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStockInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle numeric input for jumlah_stok
    if (name === 'jumlah_stok') {
      const numberValue = value === '' ? null : parseInt(value, 10);
      setFormData((prev) => ({
        ...prev,
        [name]: numberValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleStockToggle = (checked) => {
    setFormData((prev) => ({
      ...prev,
      status_stok: checked,
      // Reset jumlah_stok to null when stock tracking is disabled
      jumlah_stok: checked ? (prev.jumlah_stok || 0) : null,
    }));
  };

  const handleCancel = () => {
    router.push("/menu-list");
  };

  // Handle image file upload
  const handleImageChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    
    // Update formData with the file when there is a file
    if (newFileList.length > 0) {
      // Use originFileObj which contains the actual File object
      setFormData((prev) => ({ 
        ...prev, 
        image: newFileList[0].originFileObj 
      }));
    } else {
      // Clear the image if no files
      setFormData((prev) => ({ 
        ...prev, 
        image: "" 
      }));
    }
  };

  // Upload component configuration
  const uploadProps = {
    beforeUpload: (file) => {
      // Validate file type
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        message.error('Anda hanya dapat mengunggah file JPG/PNG!');
        return Upload.LIST_IGNORE;
      }
      
      // Validate file size (less than 2MB)
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('Gambar harus kurang dari 2MB!');
        return Upload.LIST_IGNORE;
      }
      
      // Return false to prevent auto upload behavior
      return false;
    },
    fileList,
    onChange: handleImageChange,
    listType: "picture-card",
    maxCount: 1,
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nama) newErrors.nama = "Nama menu wajib diisi.";
    if (!formData.deskripsi) newErrors.deskripsi = "Deskripsi wajib diisi.";
    if (!formData.harga) newErrors.harga = "Harga wajib diisi.";
    else if (!/^\d+$/.test(formData.harga)) newErrors.harga = "Harga harus berupa angka.";
    if (!formData.kategori) newErrors.kategori = "Kategori wajib diisi.";
    if (!formData.image) newErrors.image = "Gambar wajib diunggah.";
    if (formData.status_stok && (formData.jumlah_stok === null || formData.jumlah_stok === '')) newErrors.jumlah_stok = "Jumlah stok wajib diisi.";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      message.error("Mohon lengkapi semua field dengan benar.");
      setLoading(false);
      return;
    }

    try {
      const selectedCategory = categories.find(cat => String(cat.id) === String(formData.kategori));
      const kategoriName = selectedCategory ? selectedCategory.name : "";

      const formPayload = new FormData();
      formPayload.append("nama", formData.nama);
      formPayload.append("deskripsi", formData.deskripsi);
      formPayload.append("harga", formData.harga);
      formPayload.append("kategori", kategoriName);
      formPayload.append("image", formData.image);
      formPayload.append("status_stok", formData.status_stok);
      
      // Only include jumlah_stok if status_stok is true
      if (formData.status_stok) {
        formPayload.append("jumlah_stok", formData.jumlah_stok);
      } else {
        formPayload.append("jumlah_stok", null);
      }
      
      formPayload.append("tersedia", formData.tersedia);

      await Api.post("/menus", formPayload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      messageApi.open({
        type: "success",
        content: "Menu berhasil ditambahkan",
        duration: 2.5,
      });

      router.push("/menu-list");
    } catch (error) {
      console.error("Gagal menambahkan menu:", error);
      message.error("Gagal menambahkan menu. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  // Upload button
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <div className='card'>
      {contextHolder}
      <div className='card-header'>
        {/* <div className='d-flex flex-wrap align-items-center justify-content-end gap-2'>
          <button
            type='button'
            className='btn btn-sm btn-primary-600 radius-8 d-inline-flex align-items-center gap-1'
          >
            <Icon icon='simple-line-icons:check' className='text-xl' />
            Save
          </button>
        </div> */}
      </div>
      <div className='card-body py-40'>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: '#7C0000',
            },
          }}
        >
          <Spin spinning={loading}>
          <div className='row justify-content-center'>
            <div className='col-lg-8'>
              <div className='shadow-4 border radius-8 p-20'>
                <h6 className='text-md text-primary-light mb-16'>Add Menu</h6>
                <form onSubmit={handleSubmit}>
                  <div className='row'>
                    <div className='col-sm-12'>
                      <div className='mb-20'>
                        <label
                          htmlFor='nama'
                          className='form-label fw-semibold text-primary-light text-sm mb-8'
                        >
                          Nama Menu <span className='text-danger-600'>*</span>
                        </label>
                        <input
                          type='text'
                          className={`form-control radius-8${errors.nama ? ' is-invalid' : ''}`}
                          id='nama'
                          name='nama'
                          placeholder='Enter menu name'
                          value={formData.nama}
                          onChange={handleInputChange}
                        />
                        {errors.nama && <div className='text-danger text-xs mt-1'>{errors.nama}</div>}
                      </div>
                    </div>
                    <div className='col-sm-12'>
                      <div className='mb-20'>
                        <label
                          htmlFor='deskripsi'
                          className='form-label fw-semibold text-primary-light text-sm mb-8'
                        >
                          Deskripsi <span className='text-danger-600'>*</span>
                        </label>
                        <textarea
                          className={`form-control radius-8${errors.deskripsi ? ' is-invalid' : ''}`}
                          id='deskripsi'
                          name='deskripsi'
                          placeholder='Enter menu description'
                          rows='3'
                          value={formData.deskripsi}
                          onChange={handleInputChange}
                        />
                        {errors.deskripsi && <div className='text-danger text-xs mt-1'>{errors.deskripsi}</div>}
                      </div>
                    </div>
                    <div className='col-sm-6'>
                      <div className='mb-20'>
                        <label
                          htmlFor='harga'
                          className='form-label fw-semibold text-primary-light text-sm mb-8'
                        >
                          Harga <span className='text-danger-600'>*</span>
                        </label>
                        <input
                          type='text'
                          className={`form-control radius-8${errors.harga ? ' is-invalid' : ''}`}
                          id='harga'
                          name='harga'
                          placeholder='Rp 0'
                          value={formData.harga !== '' ? formatToIDRCurrency(Number(String(formData.harga).replace(/[^\d]/g, ''))) : ''}
                          onChange={e => {
                            const rawValue = e.target.value.replace(/[^\d]/g, '');
                            setFormData(prev => ({ ...prev, harga: rawValue }));
                          }}
                        />
                        {errors.harga && <div className='text-danger text-xs mt-1'>{errors.harga}</div>}
                      </div>
                    </div>
                    <div className='col-sm-6'>
                      <div className='mb-20'>
                        <label
                          htmlFor='kategori'
                          className='form-label fw-semibold text-primary-light text-sm mb-8'
                        >
                          Kategori <span className='text-danger-600'>*</span>
                        </label>
                        <select
                          className={`form-control radius-8 form-select${errors.kategori ? ' is-invalid' : ''}`}
                          id='kategori'
                          name='kategori'
                          value={formData.kategori}
                          onChange={handleInputChange}
                        >
                          <option value='' disabled>
                            Select Category
                          </option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                        {errors.kategori && <div className='text-danger text-xs mt-1'>{errors.kategori}</div>}
                      </div>
                    </div>
                    
                    {/* Stock Management Section */}
                    <div className='col-12'>
                      <hr className='my-3' />
                      <h6 className='text-sm text-primary-light mb-16'>Pengaturan Stok</h6>
                    </div>
                    
                    <div className='col-sm-6'>
                      <div className='mb-20'>
                        <label
                          className='form-label fw-semibold text-primary-light text-sm mb-8 d-flex align-items-center'
                        >
                          <span>Status Stok</span>
                          <Tooltip title="Aktifkan untuk melacak jumlah stok menu ini">
                            <InfoCircleOutlined className='ms-2' />
                          </Tooltip>
                        </label>
                        <div className='d-flex align-items-center'>
                          <Switch 
                            checked={formData.status_stok} 
                            onChange={handleStockToggle}
                          />
                          <span className='ms-2 text-sm'>
                            {formData.status_stok ? 'Aktif' : 'Tidak Aktif'}
                          </span>
                        </div>
                        <p className='text-xs text-muted mt-2'>
                          {formData.status_stok 
                            ? 'Menu ini akan menggunakan sistem perhitungan stok' 
                            : 'Menu ini tidak akan menggunakan sistem perhitungan stok'}
                        </p>
                      </div>
                    </div>
                    
                    {formData.status_stok && (
                      <div className='col-sm-6'>
                        <div className='mb-20'>
                          <label
                            htmlFor='jumlah_stok'
                            className='form-label fw-semibold text-primary-light text-sm mb-8'
                          >
                            Jumlah Stok <span className='text-danger-600'>*</span>
                          </label>
                          <input
                            type='number'
                            className={`form-control radius-8${errors.jumlah_stok ? ' is-invalid' : ''}`}
                            id='jumlah_stok'
                            name='jumlah_stok'
                            placeholder='Masukkan jumlah stok'
                            value={formData.jumlah_stok === null ? '' : formData.jumlah_stok}
                            onChange={handleStockInputChange}
                            min='0'
                          />
                          {errors.jumlah_stok && <div className='text-danger text-xs mt-1'>{errors.jumlah_stok}</div>}
                          <div className='d-flex justify-content-between align-items-center mt-2'>
                            <p className='text-xs text-muted mb-0'>
                              Status: <span className={formData.tersedia ? 'text-success' : 'text-danger'}>
                                {formData.tersedia ? 'Tersedia' : 'Habis'}
                              </span>
                            </p>
                            {formData.jumlah_stok === 0 && (
                              <p className='text-xs text-danger mb-0'>Stok habis</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    <div className='col-sm-12'>
                      <div className='mb-20'>
                        <label
                          className='form-label fw-semibold text-primary-light text-sm mb-8'
                        >
                          Upload Image <span className='text-danger-600'>*</span>
                        </label>
                        <div>
                          <Upload
                            {...uploadProps}
                          >
                            {fileList.length >= 1 ? null : uploadButton}
                          </Upload>
                          {errors.image && <div className='text-danger text-xs mt-1'>{errors.image}</div>}
                          <p className="text-xs text-muted mt-2">Format: JPG, PNG. Max size: 2MB</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className='d-flex align-items-center justify-content-center gap-3'>
                    <button
                      type='button'
                      className='border border-danger-600 bg-hover-danger-200 text-danger-600 text-md px-56 py-11 radius-8'
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                    <button
                      type='submit'
                      className='btn border border-600 text-md px-56 py-12 radius-8'
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

export default MenuAddLayer;