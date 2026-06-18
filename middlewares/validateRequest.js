import { badRequest } from "../utils/validators.js"

export const validate = (schemaFn) => (req, res, next) => {
  const result = schemaFn(req)
  if (!result.valid) {
    return badRequest(res, result.message || "Invalid request", result.errors)
  }
  if (result.body) req.body = result.body
  if (result.params) req.params = result.params
  if (result.query) req.query = result.query
  next()
}
