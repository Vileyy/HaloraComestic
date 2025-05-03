import { database } from "../config/firebaseConfig";
import { ref, set, remove, update, push, get } from "firebase/database";
import { uploadToCloudinary } from "../utils/uploadImage"; // ✅ Kiểm tra import

//Thêm sản phẩm vào Firebase
export const addProductToFirebase = async (
  name,
  price,
  description,
  imageUri,
  category
) => {
  try {
    if (!name || !price || !description || !imageUri || !category) {
      throw new Error("⚠️ Thiếu thông tin sản phẩm! Vui lòng nhập đầy đủ.");
    }

    console.log("📤 Đang tải ảnh lên Cloudinary...");
    const imageUrl = await uploadToCloudinary(imageUri);

    if (!imageUrl) throw new Error("❌ Upload ảnh thất bại!");

    const newProductRef = push(ref(database, "products"));
    const productData = {
      name,
      price,
      description,
      image: imageUrl,
      category,
    };

    console.log("🟢 Dữ liệu gửi lên Firebase:", productData);
    await set(newProductRef, productData);

    console.log("✅ Sản phẩm đã được thêm vào Firebase!");
    return true;
  } catch (error) {
    console.error("❌ Lỗi khi thêm sản phẩm:", error);
    throw error;
  }
};

// Cập nhật sản phẩm trên Firebase
export const updateProductInFirebase = async (productId, updatedProduct) => {
  try {
    if (!productId || !updatedProduct) {
      throw new Error("⚠️ Thiếu thông tin sản phẩm cần cập nhật!");
    }

    // Nếu ảnh được thay đổi, tải ảnh mới lên Cloudinary
    if (updatedProduct.image && updatedProduct.image.startsWith("file://")) {
      console.log("📤 Đang tải ảnh mới lên Cloudinary...");
      const imageUrl = await uploadToCloudinary(updatedProduct.image);
      updatedProduct.image = imageUrl;
    }

    console.log("🟡 Cập nhật sản phẩm:", updatedProduct);
    await update(ref(database, `products/${productId}`), updatedProduct);
    console.log("✅ Sản phẩm đã được cập nhật!");
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật sản phẩm:", error);
    throw error;
  }
};

// Xóa sản phẩm khỏi Firebase
export const deleteProductFromFirebase = async (productId) => {
  try {
    if (!productId) throw new Error("⚠️ Thiếu ID sản phẩm để xóa!");
    await remove(ref(database, `products/${productId}`));
    console.log("🗑 Sản phẩm đã bị xóa!");
  } catch (error) {
    console.error("❌ Lỗi khi xóa sản phẩm:", error);
    throw error;
  }
};

// ===== QUẢN LÝ BANNER =====

// Lấy danh sách banner từ Firebase
export const getBannersFromFirebase = async () => {
  try {
    const bannersRef = ref(database, "banners");
    const snapshot = await get(bannersRef);

    if (snapshot.exists()) {
      const bannersData = snapshot.val();
      // Chuyển đổi object thành array và thêm id
      const bannersArray = Object.keys(bannersData).map((key) => ({
        id: key,
        ...bannersData[key],
      }));

      // Sắp xếp theo thời gian tạo (mới nhất lên đầu)
      return bannersArray.sort((a, b) => b.createdAt - a.createdAt);
    }
    return [];
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách banner:", error);
    throw error;
  }
};

// Thêm banner mới vào Firebase
export const addBannerToFirebase = async (
  title,
  imageUri,
  linkUrl,
  isActive = true
) => {
  try {
    if (!title || !imageUri) {
      throw new Error("⚠️ Thiếu thông tin banner! Vui lòng nhập đầy đủ.");
    }

    console.log("📤 Đang tải ảnh banner lên Cloudinary...");
    const imageUrl = await uploadToCloudinary(imageUri);

    if (!imageUrl) throw new Error("❌ Upload ảnh banner thất bại!");

    const newBannerRef = push(ref(database, "banners"));
    const bannerData = {
      title,
      imageUrl,
      linkUrl: linkUrl || "",
      isActive,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    console.log("🟢 Dữ liệu banner gửi lên Firebase:", bannerData);
    await set(newBannerRef, bannerData);

    console.log("✅ Banner đã được thêm vào Firebase!");
    return true;
  } catch (error) {
    console.error("❌ Lỗi khi thêm banner:", error);
    throw error;
  }
};

// Cập nhật banner trên Firebase
export const updateBannerInFirebase = async (bannerId, updatedBanner) => {
  try {
    if (!bannerId || !updatedBanner) {
      throw new Error("⚠️ Thiếu thông tin banner cần cập nhật!");
    }

    // Nếu ảnh được thay đổi, tải ảnh mới lên Cloudinary
    if (
      updatedBanner.imageUrl &&
      updatedBanner.imageUrl.startsWith("file://")
    ) {
      console.log("📤 Đang tải ảnh banner mới lên Cloudinary...");
      const imageUrl = await uploadToCloudinary(updatedBanner.imageUrl);
      updatedBanner.imageUrl = imageUrl;
    }

    updatedBanner.updatedAt = Date.now();

    console.log("🟡 Cập nhật banner:", updatedBanner);
    await update(ref(database, `banners/${bannerId}`), updatedBanner);
    console.log("✅ Banner đã được cập nhật!");
    return true;
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật banner:", error);
    throw error;
  }
};

// Xóa banner khỏi Firebase
export const deleteBannerFromFirebase = async (bannerId) => {
  try {
    if (!bannerId) throw new Error("⚠️ Thiếu ID banner để xóa!");
    await remove(ref(database, `banners/${bannerId}`));
    console.log("🗑 Banner đã bị xóa!");
    return true;
  } catch (error) {
    console.error("❌ Lỗi khi xóa banner:", error);
    throw error;
  }
};

// Thay đổi trạng thái active của banner
export const toggleBannerStatus = async (bannerId, isActive) => {
  try {
    await update(ref(database, `banners/${bannerId}`), {
      isActive: isActive,
      updatedAt: Date.now(),
    });
    console.log(`🔄 Banner đã được ${isActive ? "kích hoạt" : "vô hiệu hóa"}!`);
    return true;
  } catch (error) {
    console.error("❌ Lỗi khi thay đổi trạng thái banner:", error);
    throw error;
  }
};

