import mongoose from "mongoose"

export const ROLES = ["user", "owner", "deliveryBoy"]
export const ITEM_CATEGORIES = [
  "Snacks",
  "Main Course",
  "Desserts",
  "Pizza",
  "Burgers",
  "Sandwiches",
  "South Indian",
  "North Indian",
  "Chinese",
  "Fast Food",
  "Others"
]
export const FOOD_TYPES = ["veg", "non veg"]
export const PAYMENT_METHODS = ["cod", "online"]
export const SHOP_ORDER_STATUSES = ["pending", "preparing", "out of delivery", "delivered"]

export const badRequest = (res, message, details = undefined) =>
  res.status(400).json(details ? { message, details } : { message })

export const forbidden = (res, message = "Not authorized") =>
  res.status(403).json({ message })

export const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value || ""))

export const normalizeString = (value) => String(value ?? "").trim().replace(/\s+/g, " ")

export const isNonEmptyString = (value, min = 1, max = 255) => {
  const v = normalizeString(value)
  return v.length >= min && v.length <= max
}

export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeString(value).toLowerCase())

export const normalizeEmail = (value) => normalizeString(value).toLowerCase()

export const isIndianMobile = (value) => /^[6-9]\d{9}$/.test(String(value ?? "").trim())

export const isStrongPassword = (value) =>
  typeof value === "string" &&
  value.length >= 8 &&
  value.length <= 72 &&
  /[A-Z]/.test(value) &&
  /[a-z]/.test(value) &&
  /\d/.test(value)

export const toFiniteNumber = (value) => {
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

export const isPositiveNumber = (value, { min = 0.01, max = 100000 } = {}) => {
  const num = toFiniteNumber(value)
  return num !== null && num >= min && num <= max
}

export const isIntegerInRange = (value, min, max) => {
  const num = Number(value)
  return Number.isInteger(num) && num >= min && num <= max
}

export const isLatitude = (value) => {
  const num = toFiniteNumber(value)
  return num !== null && num >= -90 && num <= 90
}

export const isLongitude = (value) => {
  const num = toFiniteNumber(value)
  return num !== null && num >= -180 && num <= 180
}

export const escapeRegex = (value) => normalizeString(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

export const validateDeliveryAddress = (address) => {
  const errors = []
  if (!address || typeof address !== "object" || Array.isArray(address)) {
    return { valid: false, errors: ["deliveryAddress is required"] }
  }
  if (!isNonEmptyString(address.text, 5, 500)) errors.push("deliveryAddress.text must be 5-500 characters")
  if (!isLatitude(address.latitude)) errors.push("deliveryAddress.latitude is invalid")
  if (!isLongitude(address.longitude)) errors.push("deliveryAddress.longitude is invalid")

  return {
    valid: errors.length === 0,
    errors,
    value: {
      text: normalizeString(address.text),
      latitude: Number(address.latitude),
      longitude: Number(address.longitude)
    }
  }
}

export const assertAllowedKeys = (body, allowedKeys = []) => {
  const allowed = new Set(allowedKeys)
  return Object.keys(body || {}).filter((key) => !allowed.has(key))
}
