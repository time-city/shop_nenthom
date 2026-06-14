'use server'


import { ProductService } from "../services/product.service";
import { GetProductsParams, productSchema, createProductSchema, updateProductSchema, deleteProductSchema } from "../validations/product.schema";
import { getSession } from "../session";

// Kiểm tra người dùng hiện tại có quyền ADMIN để thao tác quản trị.
async function requireAdmin() {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') return { error: 'Không có quyền truy cập' }

  return null
}


export async function getProductsAction(params: Partial<GetProductsParams> = {}) {
  const parsed = productSchema.safeParse(params);
  if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
  }
  try {
      const products = await ProductService.getProducts(parsed.data);
      return { success: true, ...products };
  } catch (err) {
      return { error: (err as Error).message };
  }
}


export async function getProductDetailsAction(id: string) {
  if (!id) return { error: 'Không thể mở sản phẩm này. Vui lòng chọn lại sản phẩm.' }
  try {
      const product = await ProductService.getProductDetail(id)
      return { success: true, data: product }
  } catch (err) {
      return { error: (err as Error).message }
  }
}



export async function getCustomizationOptionsAction() {
try {
  const options = await ProductService.getCustomizationOptions()
  return { success: true, data: options }
} catch (err) {
  return { error: (err as Error).message }
}
}




export async function getCustomCandleProductAction() {
try {
  const product = await ProductService.getCustomCandleProduct()
  return { success: true, data: product }
} catch (err) {
  return { error: (err as Error).message }
}
}




export async function createProductAction(params: unknown) {
  const authError = await requireAdmin()
  if (authError) return authError
  const parsed = createProductSchema.safeParse(params)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  try {
      const product = await ProductService.createProduct(parsed.data)
      return { success: true, data: product }
  } catch (err) {
      return { error: (err as Error).message }
  }
}




export async function updateProductAction(id: string, params: unknown) {
  const authError = await requireAdmin()
  if (authError) return authError
  if (!id) return { error: 'Không thể xác định sản phẩm cần cập nhật. Vui lòng tải lại trang.' }
  const parsed = updateProductSchema.safeParse(params)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  try {
      const product = await ProductService.updateProduct(id, parsed.data)
      return { success: true, data: product }
  } catch (err) {
      return { error: (err as Error).message }
  }
}




export async function deleteProductAction(params: unknown) {
  const authError = await requireAdmin()
  if (authError) return authError
  const parsed = deleteProductSchema.safeParse(params)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  try {
      const product = await ProductService.deleteProduct(parsed.data.id)
      return { success: true, data: product }
  } catch (err) {
      return { error: (err as Error).message }
  }
}

