export const uploadToCloudinary = async (imageUri) => {
    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "product_image.jpg",
    });
    formData.append("upload_preset", "my_preset"); 
  
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/de8vufzzx/image/upload`, 
        {
          method: "POST",
          body: formData,
        }
      );
  
      const data = await response.json();
      return data.secure_url; // ✅ Trả về URL ảnh sau khi upload thành công
    } catch (error) {
      console.error("❌ Lỗi khi tải ảnh lên Cloudinary:", error);
      return null;
    }
  };
  