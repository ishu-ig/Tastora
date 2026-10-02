const multer = require("multer")
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const cloudinary = require("../cloudinary")

function createUploader(folder) {
    const storage = new CloudinaryStorage({
        cloudinary,
        params: async (req, file) => {
            const cleanName = (file.originalname || "upload")
                .replace(/\s+/g, '_')
                .replace(/[()]/g, '')
                .replace(/[^a-zA-Z0-9._-]/g, '')

            const isPdf = file.mimetype === 'application/pdf'
            const baseName = cleanName.split(".")[0] || "file"

            return {
                folder: `Tastora/${folder}`,
                allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
                resource_type: isPdf ? 'raw' : 'image',
                public_id: `${Date.now()}_${baseName}`,
            }
        },
    })

    return multer({
        storage,
        limits: {
            fileSize: 10 * 1024 * 1024 // 10MB limit
        },
        fileFilter: (req, file, cb) => {
            const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg", "application/pdf"]
            if (allowed.includes(file.mimetype)) {
                cb(null, true)
            } else {
                cb(new Error("Unsupported file format. Please upload JPG, PNG, WEBP or PDF."))
            }
        }
    })
}

module.exports = {
    maincategoryUploader: createUploader("maincategory"),
    subcategoryUploader: createUploader("subcategory"),
    comboUploader: createUploader("combo"),
    thaliUploader: createUploader("thali"),
    testimonialUploader: createUploader("testimonial"),
    productUploader: createUploader("product"),
    userUploader: createUploader("user"),
    bannerUploader: createUploader("banner"),
    deliveryBoyUploader: createUploader("deliveryBoy"),
}