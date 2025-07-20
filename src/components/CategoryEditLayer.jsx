"use client";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useState, useEffect } from "react";
import Api from "../api";
import { message, Spin, Upload, List, Image, ConfigProvider } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import { PlusOutlined } from "@ant-design/icons";

const CategoryEditLayer = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("id");
  const [messageApi, contextHolder] = message.useMessage();
  const [imageUrl, setImageUrl] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    image: null,
  });
  
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({}); // State for validation errors

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await Api.get(`/categories/${categoryId}`);
        const res = response.data;
        console.log("fetched category data:", res);
        
        setFormData({
          name: res.category.name || "",
          image: null, // We'll handle image separately with fileList
        });
        
        // If there's an existing image, add it to the fileList
        if (res.category.image_url) {
          // Assuming the image URL is returned directly, adjust if needed
          const imageUrl = res.category.image_url;
          setImageUrl(imageUrl);
          
          setFileList([
            {
              uid: '-1',
              name: res.category.image || "image.png",
              status: 'done',
              url: imageUrl,
            }
          ]);
        }
      } catch (error) {
        console.error("Error fetching menu data:", error);
        message.error("Failed to load category data");
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchMenu();
    } else {
      setLoading(false);
    }
  }, [categoryId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    // Keep only the latest file
    const latestFileList = newFileList.length > 0 ? [newFileList[newFileList.length - 1]] : [];
    setFileList(latestFileList);

    // Update formData with the file object if available
    if (latestFileList.length > 0 && latestFileList[0].originFileObj) {
      setFormData((prev) => ({
        ...prev,
        image: latestFileList[0].originFileObj,
      }));
    } else if (latestFileList.length > 0 && latestFileList[0].url) {
      // If it's an existing image with URL but no file object,
      // keep the image URL but don't update the formData.image
      // as we don't want to re-upload the existing image
    } else {
      setFormData((prev) => ({
        ...prev,
        image: null,
      }));
    }
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const handleCancel = () => {
    router.push("/category-list");
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Nama kategori wajib diisi.";
    // Tidak wajib upload gambar baru, tapi jika ada file, validasi tipe
    if (formData.image && !(formData.image.type && formData.image.type.startsWith('image/'))) {
      newErrors.image = "File harus berupa gambar.";
    }
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
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      
      // Only append image if a new one was selected
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      await Api.put(`/categories/${categoryId}`, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      messageApi.open({
        type: "success",
        content: "Menu berhasil diperbarui",
        duration: 2.5,
      });

      router.push("/category-list");
    } catch (error) {
      console.error("Error updating menu:", error);
      message.error("Gagal memperbarui menu");
    } finally {
      setLoading(false);
    }
  };

  // Custom request to prevent auto-upload behavior
  const customRequest = ({ file, onSuccess }) => {
    setTimeout(() => {
      onSuccess("ok");
    }, 0);
  };

  return (
    <div className="card">
      {contextHolder}
      <div className="card-header">
        {/* Header content */}
      </div>
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
                <h6 className="text-md text-primary-light mb-16">Edit Menu</h6>
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-sm-12">
                      <div className="mb-20">
                        <label
                          htmlFor="name"
                          className="form-label fw-semibold text-primary-light text-sm mb-8"
                        >
                          Nama Menu <span className="text-danger-600">*</span>
                        </label>
                        <input
                          type="text"
                          className={`form-control radius-8${errors.name ? ' is-invalid' : ''}`}
                          id="name"
                          name="name"
                          placeholder="Enter menu name"
                          value={formData.name || ""}
                          onChange={handleInputChange}
                        />
                        {errors.name && <div className="text-danger text-xs mt-1">{errors.name}</div>}
                      </div>
                    </div>
                    <div className="col-sm-12">
                      <div className="mb-20">
                        <label
                          className="form-label fw-semibold text-primary-light text-sm mb-8"
                        >
                          Upload Image
                        </label>
                        <div>
                          <Upload
                            listType="picture-card"
                            fileList={fileList}
                            onChange={handleUploadChange}
                            customRequest={customRequest}
                            accept=".png, .jpg, .jpeg"
                            maxCount={1}
                            beforeUpload={(file) => {
                              const isImage = file.type.startsWith('image/');
                              if (!isImage) {
                                message.error('You can only upload image files!');
                              }
                              return isImage || Upload.LIST_IGNORE;
                            }}
                            onPreview={(file) => {
                              if (file.url) {
                                window.open(file.url);
                              }
                            }}
                          >
                            {fileList.length >= 1 ? null : uploadButton}
                          </Upload>
                          {errors.image && <div className="text-danger text-xs mt-1">{errors.image}</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center justify-content-center gap-3">
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

export default CategoryEditLayer;