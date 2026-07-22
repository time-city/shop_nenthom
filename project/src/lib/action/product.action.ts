'use server'

import { revalidatePath } from "next/cache";


import { requireAdmin } from "../requireAdmin";
import { ProductService } from "../services/product.service";
import { GetProductsParams, productSchema, createProductSchema, updateProductSchema, deleteProductSchema } from "../validations/product.schema";
import { getPublicErrorMessage } from "../utils/publicError";
import { z } from "zod";


export async function getProductsAction(params: Partial<GetProductsParams> = {}) {
  const parsed = productSchema.safeParse(params);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }
  try {
    const products = await ProductService.getProducts(parsed.data);
    return { success: true, ...products };
  } catch (err) {
    return { error: getPublicErrorMessage(err, "Chưa thể tải sản phẩm. Vui lòng thử lại.") };
  }
}


export async function getProductDetailsAction(id: string) {
  if (!id) return { error: 'Không thể mở sản phẩm này. Vui lòng chọn lại sản phẩm.' }
  try {
    const product = await ProductService.getProductDetail(id)
    return { success: true, data: product }
  } catch (err) {
    return { error: getPublicErrorMessage(err, "Chưa thể mở sản phẩm. Vui lòng thử lại.") }
  }
}



export async function getCustomizationOptionsAction() {
  try {
    const options = await ProductService.getCustomizationOptions()
    return { success: true, data: options }
  } catch (err) {
    return { error: getPublicErrorMessage(err, "Chưa thể tải thông tin tùy chọn. Vui lòng thử lại.") }
  }
}


export async function getScentsAction() {
  try {
    const scents = await ProductService.getScents()
    return { success: true, data: scents }
  } catch (err) {
    return { error: getPublicErrorMessage(err, "Chưa thể tải danh sách hương. Vui lòng thử lại.") }
  }
}




export async function getCustomCandleProductAction() {
  try {
    const product = await ProductService.getCustomCandleProduct()
    return { success: true, data: product }
  } catch (err) {
    return { error: getPublicErrorMessage(err, "Chưa thể chuẩn bị sản phẩm tùy chỉnh. Vui lòng thử lại.") }
  }
}




export async function createProductAction(params: unknown) {
  const authError = await requireAdmin()
  if ("error" in authError) return authError
  const parsed = createProductSchema.safeParse(params)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  try {
    const product = await ProductService.createProduct(parsed.data)
    
    revalidatePath('/', 'layout');
    
    return { success: true, data: product, message: "Đã thêm sản phẩm." }
  } catch (err) {
    return { error: getPublicErrorMessage(err, "Chưa thể thêm sản phẩm. Vui lòng thử lại.") }
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
    
    revalidatePath('/', 'layout');
    
    return { success: true, data: product, message: "Đã cập nhật sản phẩm." }
  } catch (err) {
    return { error: getPublicErrorMessage(err, "Chưa thể cập nhật sản phẩm. Vui lòng thử lại.") }
  }
}




export async function deleteProductAction(params: unknown) {
  const authError = await requireAdmin()
  if ("error" in authError) return authError
  const parsed = deleteProductSchema.safeParse(params)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  try {
    const product = await ProductService.deleteProduct(parsed.data.id)
    
    revalidatePath('/', 'layout');
    
    return {
      success: true,
      data: product,
      message: product.removedCartItemCount > 0
        ? "Đã ngừng bán sản phẩm và gỡ sản phẩm khỏi các giỏ hàng liên quan."
        : "Đã ngừng bán sản phẩm.",
    }
  } catch (err) {
    return { error: getPublicErrorMessage(err, "Chưa thể ngừng bán sản phẩm. Vui lòng thử lại.") }
  }
}

export async function getProductDeleteImpactAction(params: unknown) {
  const authError = await requireAdmin()
  if ("error" in authError) return authError
  const parsed = deleteProductSchema.safeParse(params)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  try {
    const impact = await ProductService.getDeleteImpact(parsed.data.id)
    return { success: true, data: impact }
  } catch (err) {
    return { error: getPublicErrorMessage(err, "Chưa thể kiểm tra sản phẩm. Vui lòng thử lại.") }
  }
}

export async function hardDeleteProductAction(params: unknown) {
  const authError = await requireAdmin()
  if ("error" in authError) return authError
  const parsed = deleteProductSchema.safeParse(params)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  try {
    const product = await ProductService.hardDeleteProduct(parsed.data.id)
    return {
      success: true,
      data: product,
      message: "Đã xóa vĩnh viễn sản phẩm thành công.",
    }
  } catch (err) {
    return { error: getPublicErrorMessage(err, "Chưa thể xóa vĩnh viễn sản phẩm. Vui lòng thử lại.") }
  }
}

export async function bulkDeactivateProductsAction(params: unknown) {
  const authError = await requireAdmin()
  if ("error" in authError) return authError
  
  const bulkSchema = z.object({
    ids: z.array(z.string()).min(1, "Vui lòng chọn ít nhất một sản phẩm"),
  });
  
  const parsed = bulkSchema.safeParse(params)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  try {
    const result = await ProductService.bulkDeactivateProducts(parsed.data.ids)
    return {
      success: true,
      data: result,
      message: `Đã ngừng bán thành công ${result.count} sản phẩm và gỡ khỏi ${result.removedCartItemCount} giỏ hàng.`,
    }
  } catch (err) {
    return { error: getPublicErrorMessage(err, "Chưa thể ngừng bán hàng loạt sản phẩm. Vui lòng thử lại.") }
  }
}

export async function bulkHardDeleteProductsAction(params: unknown) {
  const authError = await requireAdmin()
  if ("error" in authError) return authError
  
  const bulkSchema = z.object({
    ids: z.array(z.string()).min(1, "Vui lòng chọn ít nhất một sản phẩm"),
  });
  
  const parsed = bulkSchema.safeParse(params)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  try {
    const result = await ProductService.bulkHardDeleteProducts(parsed.data.ids)
    return {
      success: true,
      data: result,
      message: `Đã xóa vĩnh viễn thành công ${result.count} sản phẩm khỏi hệ thống.`,
    }
  } catch (err) {
    return { error: getPublicErrorMessage(err, "Chưa thể xóa vĩnh viễn hàng loạt sản phẩm. Vui lòng thử lại.") }
  }
}
