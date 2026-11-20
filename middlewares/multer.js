import multer from "multer"
import fs from "fs"
import path from "path"

const UPLOAD_DIR = path.resolve("public")
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

const storage = multer.diskStorage({
   destination: (req, file, cb) => {
      // Make sure the temp folder exists (e.g. on a fresh server)
      fs.mkdirSync(UPLOAD_DIR, { recursive: true })
      cb(null, UPLOAD_DIR)
   },
   filename: (req, file, cb) => {
      // Unique, safe file name so two uploads with the same name never clash
      const ext = path.extname(file.originalname || "").toLowerCase().replace(/[^.a-z0-9]/g, "")
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`)
   }
})

const imageOnly = (req, file, cb) => {
   if (file.mimetype && file.mimetype.startsWith("image/")) return cb(null, true)
   const error = new Error("Only image files are allowed")
   error.status = 400
   cb(error)
}

export const upload = multer({ storage, fileFilter: imageOnly, limits: { fileSize: MAX_FILE_SIZE } })
