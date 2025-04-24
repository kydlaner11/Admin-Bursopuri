"use client";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useState, useEffect } from "react";
import Api from "../api";
import { message, Spin } from "antd";
import { useRouter } from "next/navigation";

const MenuAddLayer = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nama: "",
    deskripsi: "",
    harga: "",
    kategori: "",
    image: "",
  });
  const [categories, setCategories] = useState([]); // State for categories
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await Api.get("/categories");
        setCategories(response.data.categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        message.error("Gagal memuat kategori.");
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setUploadedFileName(file.name);
    }
  };

  const handleCancel = () => {
    router.push("/menu-list");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.nama || !formData.harga || !formData.kategori || !formData.image) {
      message.error("Mohon lengkapi semua field termasuk gambar.");
      setLoading(false);
      return;
    }

    try {
      const formPayload = new FormData();
      formPayload.append("nama", formData.nama);
      formPayload.append("deskripsi", formData.deskripsi);
      formPayload.append("harga", formData.harga);
      formPayload.append("kategori", formData.kategori);
      formPayload.append("image", formData.image);

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
                          className='form-control radius-8'
                          id='nama'
                          name='nama'
                          placeholder='Enter menu name'
                          value={formData.nama}
                          onChange={handleInputChange}
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
                          placeholder='Enter menu description'
                          rows='3'
                          value={formData.deskripsi}
                          onChange={handleInputChange}
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
                          type='number'
                          className='form-control radius-8'
                          id='harga'
                          name='harga'
                          placeholder='Enter price'
                          value={formData.harga}
                          onChange={handleInputChange}
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
                          value={formData.kategori}
                          onChange={handleInputChange}
                        >
                          <option value='' disabled>
                            Select Category
                          </option>
                          {categories.map((category) => (
                            <option key={category.id_category} value={category.id_category}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className='col-sm-12'>
                      <div className='mb-20'>
                        <label
                          htmlFor='image'
                          className='form-label fw-semibold text-primary-light text-sm mb-8'
                        >
                          Upload Image
                        </label>
                        <div className='avatar-upload'>
                          <div className='avatar-edit position-relative'>
                            <input
                              type='file'
                              id='image'
                              accept='.png, .jpg, .jpeg'
                              hidden
                              onChange={handleFileChange}
                            />
                            <label
                              htmlFor='image'
                              className='w-32-px h-32-px d-flex justify-content-center align-items-center bg-primary-50 text-primary-600 border border-primary-600 bg-hover-primary-100 text-lg rounded-circle'
                            >
                              <Icon icon='solar:camera-outline' />
                            </label>
                          </div>
                          {uploadedFileName && (
                            <p className='text-sm text-success-main mt-2'>
                              File uploaded: {uploadedFileName}
                            </p>
                          )}
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
                      className='btn btn-primary border border-primary-600 text-md px-56 py-12 radius-8'
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

export default MenuAddLayer;
