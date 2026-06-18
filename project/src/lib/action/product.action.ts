'use server'


import { requireAdmin } from "../requireAdmin";
import { ProductService } from "../services/product.service";
import { GetProductsParams, productSchema, createProductSchema, updateProductSchema, deleteProductSchema } from "../validations/product.schema";


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


export async function getScentsAction() {
  try {
    const scents = await ProductService.getScents()
    return { success: true, data: scents }
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
  if ("error" in authError) return authError
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
  if ("error" in authError) return authError
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
  if ("error" in authError) return authError
  const parsed = deleteProductSchema.safeParse(params)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  try {
    const product = await ProductService.deleteProduct(parsed.data.id)
    return { success: true, data: product }
  } catch (err) {
    return { error: (err as Error).message }
  }
}
