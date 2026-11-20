import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

const REQUIRED_ENV = ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"]

const removeLocalFile = (file) => {
    try {
        if (file && fs.existsSync(file)) fs.unlinkSync(file)
    } catch (error) {
        console.error("Could not delete temp upload file:", file, error.message)
    }
}

// Uploads a local file to Cloudinary and returns its secure URL.
// Throws an Error with a clear message if the upload is not possible,
// so controllers can report the real reason instead of failing later.
const uploadOnCloudinary = async (file) => {
    const missing = REQUIRED_ENV.filter((key) => !process.env[key] || !process.env[key].trim())
    if (missing.length) {
        removeLocalFile(file)
        throw new Error(`Image upload is not configured on the server (missing: ${missing.join(", ")})`)
    }

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
        api_key: process.env.CLOUDINARY_API_KEY.trim(),
        api_secret: process.env.CLOUDINARY_API_SECRET.trim()
    })

    try {
        const result = await cloudinary.uploader.upload(file, { resource_type: "image" })
        if (!result?.secure_url) throw new Error("Cloudinary did not return an image URL")
        return result.secure_url
    } catch (error) {
        const reason = error?.error?.message || error?.message || "unknown error"
        console.error("Cloudinary upload failed:", reason)
        throw new Error(`Image upload failed: ${reason}`)
    } finally {
        removeLocalFile(file)
    }
}

export default uploadOnCloudinary
