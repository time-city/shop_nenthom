'use server'

import { ProductService } from "../services/product.service";
import { GetProductsParams, productSchema } from "../validations/product.schema";

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
    if (!id) return { error: 'Thiếu product ID' }

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
