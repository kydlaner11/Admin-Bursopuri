"use client";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useState } from "react";
import Api from "../api";
import { message, Spin, Upload, List, Image, ConfigProvider } from "antd";
import { useRouter } from "next/navigation";
import { PlusOutlined } from "@ant-design/icons";

const CategoryAddLayer = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    image: null,
  });
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [errors, setErrors] = useState({}); // State for validation errors

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
    if (!formData.image) newErrors.image = "Gambar wajib diunggah.";
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
      const formPayload = new FormData();
      formPayload.append("name", formData.name);
      formPayload.append("image", formData.image);

      await Api.post("/categories", formPayload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      messageApi.open({
        type: "success",
        content: "Menu berhasil ditambahkan",
        duration: 2.5,
      });

      router.push("/category-list");
    } catch (error) {
      console.error("Gagal menambahkan menu:", error);
      message.open({
        type: "error",
        content: "Gagal menambahkan menu",
        duration: 2.5,
      });
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
                <h6 className="text-md text-primary-light mb-16">Add Menu</h6>
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
                          value={formData.name}
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
                          Upload Image <span className="text-danger-600">*</span>
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
                          >
                            {fileList.length >= 1 ? null : uploadButton}
                          </Upload>
                          {errors.image && <div className="text-danger text-xs mt-1">{errors.image}</div>}
                          
                          {fileList.length > 0 && (
                            <List
                              className="mt-3"
                              itemLayout="horizontal"
                              dataSource={fileList}
                              renderItem={(item) => (
                                <List.Item>
                                  <List.Item.Meta
                                    avatar={
                                      <Image
                                        width={60}
                                        height={60}
                                        src={item.thumbUrl || URL.createObjectURL(item.originFileObj)}
                                        alt="Menu image"
                                        style={{ objectFit: 'cover' }}
                                      />
                                    }
                                    title={item.name}
                                    description={`Size: ${(item.size / 1024).toFixed(2)} KB`}
                                  />
                                </List.Item>
                              )}
                            />
                          )}
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

export default CategoryAddLayer;