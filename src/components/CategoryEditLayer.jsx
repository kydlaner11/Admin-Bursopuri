"use client";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useState, useEffect} from "react";
import Api from "../api";
import { message, Spin } from "antd";
import { useRouter, useSearchParams } from "next/navigation";

const CategoryEditLayer = () => {
const router = useRouter();
  const [uploadedFileName, setUploadedFileName] = useState("");
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("id");
  const [messageApi, contextHolder] = message.useMessage();

  const [formData, setFormData] = useState({
    name: "",
    image: null,
  });

  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await Api.get(`/categories/${categoryId}`);
        const res = response.data;
        console.log("first", res);
        setFormData({
          name: res.category.name || "", // Ensure name is always a string
          image: res.category.image || null, // Ensure image is null if not provided
        });
      } catch (error) {
        console.error("Error fetching menu data:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    if (categoryId) {
      fetchMenu();
    }
  }, [categoryId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
    setUploadedFileName(e.target.files[0].name);
  };

  const handleCancel = () => {
    router.push("/category-list");
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null) formDataToSend.append(key, value);
    });

    try {
      await Api.put(`/categories/${categoryId}`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      messageApi.open({
        type: "success",
        content: "Menu berhasil diedit",
        duration: 2.5,
      });

      router.push("/category-list");
    } catch (error) {
      console.error("Error updating menu:", error);
    }finally {
      setLoading(false); // Set loading to false after fetching
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
                          htmlFor='name'
                          className='form-label fw-semibold text-primary-light text-sm mb-8'
                        >
                          Nama Menu <span className='text-danger-600'>*</span>
                        </label>
                        <input
                          type='text'
                          className='form-control radius-8'
                          id='name'
                          name='name'
                          placeholder='Enter menu name'
                          value={formData.name || ""} // Ensure value is always a string
                          onChange={handleInputChange}
                        />
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

export default CategoryEditLayer;
