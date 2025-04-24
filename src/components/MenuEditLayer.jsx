"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Icon } from "@iconify/react/dist/iconify.js";
import { message, Spin } from "antd"; // Import Spin
import Api from "../api";

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
    image: null,
  });

  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await Api.get(`/menus/${menuId}`);
        const res = response.data;
        setFormData({
          nama: res.menu.nama || "",
          deskripsi: res.menu.deskripsi || "",
          harga: res.menu.harga || "",
          kategori: res.menu.kategori || "",
          image: res.menu.image || null,
        });
      } catch (error) {
        console.error("Error fetching menu data:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    if (menuId) {
      fetchMenu();
    }
  }, [menuId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleCancel = () => {
    router.push("/menu-list");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null) formDataToSend.append(key, value);
    });

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
        <Spin spinning={loading}> {/* Wrap form with Spin */}
          <div className='row justify-content-center'>
            <div className='col-lg-8'>
              <div className='shadow-4 border radius-8 p-20'>
                <h6 className='text-md text-primary-light mb-16'>Edit Menu</h6>
                <form onSubmit={handleSubmit}>
                  <div className='row'>
                    <div className='col-sm-12'>
                      <div className='mb-20'>
                        <label
                          htmlFor='menu-name'
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
                          htmlFor='menu-description'
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
                          type='number'
                          className='form-control radius-8'
                          id='harga'
                          name='harga'
                          value={formData.harga || ""}
                          onChange={handleInputChange}
                          placeholder='Enter price'
                        />
                      </div>
                    </div>
                    <div className='col-sm-6'>
                      <div className='mb-20'>
                        <label
                          htmlFor='menu-category'
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
                          <option value='Makanan'>Makanan</option>
                          <option value='Minuman'>Minuman</option>
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
                              onChange={handleFileChange}
                              hidden
                            />
                            <label
                              htmlFor='menu-image'
                              className='w-32-px h-32-px d-flex justify-content-center align-items-center bg-primary-50 text-primary-600 border border-primary-600 bg-hover-primary-100 text-lg rounded-circle'
                            >
                              <Icon icon='solar:camera-outline' />
                            </label>
                          </div>
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
                    >
                      Save
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
