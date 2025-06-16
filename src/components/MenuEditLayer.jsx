"use client";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useState, useEffect } from "react";
import Api from "../api";
import { message, Spin, Upload, Switch, Tooltip } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { PlusOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { formatToIDRCurrency } from "../utils/formatCurrency";

const MenuEditLayer = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const menuId = searchParams.get("id");
  const [messageApi, contextHolder] = message.useMessage();

  const [formData, setFormData] = useState({
    nama: "",
    deskripsi: "",
    harga: "",
    kategori: "",
    kategoriId: "",
    image: null,
    status_stok: false,
    jumlah_stok: null,
    tersedia: true,
  });

  const [imageUrl, setImageUrl] = useState(""); // For displaying existing image
  const [fileList, setFileList] = useState([]); // For Upload component
  const [categories, setCategories] = useState([]); // State for categories
  const [loading, setLoading] = useState(true);

  // Fetch categories
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

  // Fetch menu data
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await Api.get(`/menus/${menuId}`);
        const res = response.data;
        setFormData({
          nama: res.menu.nama || "",
          deskripsi: res.menu.deskripsi || "",
          harga: res.menu.harga || "",
          kategori: res.menu.kategoriId || res.menu.kategori || "",
          kategoriId: res.menu.kategoriId || "",
          image: null, 
          status_stok: res.menu.status_stok !== undefined ? res.menu.status_stok : false,
          jumlah_stok: res.menu.jumlah_stok !== undefined ? res.menu.jumlah_stok : null,
          tersedia: res.menu.tersedia !== undefined ? res.menu.tersedia : true,
        });
        
        // Set image URL for preview if exists
        if (res.menu.image_url) {
          setImageUrl(res.menu.image_url);
          // Initialize fileList for the Upload component
          setFileList([
            {
              uid: '-1',
              name: res.menu.image || 'Current Image',
              status: 'done',
              url: res.menu.image_url,
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching menu data:", error);
        message.error("Gagal memuat data menu.");
      } finally {
        setLoading(false);
      }
    };

    if (menuId) {
      fetchMenu();
    }
  }, [menuId]);

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
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  // Handle image file upload
  const handleImageChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);

    // Cek apakah file baru dipilih user
    if (
      newFileList.length > 0 &&
      newFileList[0].originFileObj instanceof File
    ) {
      setFormData((prev) => ({
        ...prev,
        image: newFileList[0].originFileObj,
      }));
    } else {
      // Tidak ada file baru, kosongkan image di formData
      setFormData((prev) => ({
        ...prev,
        image: null,
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
    onRemove: () => {
      setFileList([]);
      setFormData(prev => ({ ...prev, image: null }));
    }
  };

  const handleCancel = () => {
    router.push("/menu-list");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Cari nama kategori berdasarkan id yang dipilih
    const selectedCategory = categories.find(cat => String(cat.id) === String(formData.kategori));
    const kategoriName = selectedCategory ? selectedCategory.name : "";

    const formDataToSend = new FormData();

    formDataToSend.append("nama", formData.nama);
    formDataToSend.append("deskripsi", formData.deskripsi);
    formDataToSend.append("harga", formData.harga);
    formDataToSend.append("kategori", kategoriName);
    formDataToSend.append("status_stok", formData.status_stok);

    if (formData.status_stok) {
      formDataToSend.append("jumlah_stok", formData.jumlah_stok);
    } else {
      formDataToSend.append("jumlah_stok", null);
    }
    
    formDataToSend.append("tersedia", formData.tersedia);

    // Hanya kirim image jika user memilih file baru
    if (formData.image instanceof File) {
      formDataToSend.append("image", formData.image);
    }

    try {
      await Api.put(`/menus/${menuId}`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      messageApi.open({
        type: "success",
        content: "Menu berhasil diedit",
        duration: 2.5,
      });

      router.push("/menu-list");
    } catch (error) {
      console.error("Error updating menu:", error);
      message.error("Gagal mengupdate menu. Silakan coba lagi.");
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
        <Spin spinning={loading}>
          <div className='row justify-content-center'>
            <div className='col-lg-8'>
              <div className='shadow-4 border radius-8 p-20'>
                <h6 className='text-md text-primary-light mb-16'>Edit Menu</h6>
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
                          className='form-control radius-8'
                          id='nama'
                          name='nama'
                          value={formData.nama || ""}
                          onChange={handleInputChange}
                          placeholder='Enter menu name'
                        />
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
                          className='form-control radius-8'
                          id='deskripsi'
                          name='deskripsi'
                          value={formData.deskripsi || ""}
                          onChange={handleInputChange}
                          placeholder='Enter menu description'
                          rows='3'
                        />
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
                          className='form-control radius-8'
                          id='harga'
                          name='harga'
                          placeholder='Rp 0'
                          value={formData.harga !== '' ? formatToIDRCurrency(Number(String(formData.harga).replace(/[^\d]/g, ''))) : ''}
                          onChange={e => {
                            // Remove non-digit characters, parse to number, and update formData
                            const rawValue = e.target.value.replace(/[^\d]/g, '');
                            setFormData(prev => ({ ...prev, harga: rawValue }));
                          }}
                        />
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
                          className='form-control radius-8 form-select'
                          id='kategori'
                          name='kategori'
                          value={formData.kategori || ""}
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
                      </div>
                    </div>
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
                            className='form-control radius-8'
                            id='jumlah_stok'
                            name='jumlah_stok'
                            placeholder='Masukkan jumlah stok'
                            value={formData.jumlah_stok === null ? '' : formData.jumlah_stok}
                            onChange={handleStockInputChange}
                            min='0'
                          />
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
                          <Upload {...uploadProps}>
                            {fileList.length >= 1 ? null : uploadButton}
                          </Upload>
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
      </div>
    </div>
  );
};

export default MenuEditLayer;