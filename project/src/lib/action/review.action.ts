'use server'

import { getPublicErrorMessage } from "../utils/publicError";
import { getSession } from "../session";
import { emitNewReviewToAdmin, emitReviewChangedToAdmin } from "../events/adminReviewEvents";
import { emitProductReviewUpdated } from "../events/publicProductEvents";
import { ReviewService } from "../services/review.service";
import { 
  createReviewSchema, 
  getReviewsSchema, 
  updateReviewStatusSchema, 
  replyReviewSchema,
  CreateReviewInput,
  GetReviewsInput,
  UpdateReviewStatusInput,
  ReplyReviewInput
} from "../validations/review.schema";

export async function createReviewAction(input: CreateReviewInput) {
  try {
    const session = await getSession();
    if (!session || !session.sub) {
      return { success: false, error: "Bạn cần đăng nhập để đánh giá." };
    }

    const validatedData = createReviewSchema.parse(input);
    const review = await ReviewService.createReview(session.sub, validatedData);
    
    try {
      await emitNewReviewToAdmin({
        reviewId: review.id,
        productName: review.product.name,
        rating: review.rating,
        content: review.content,
        customerName: review.user?.fullname || review.user?.email || "Khách hàng",
        createdAt: new Date().toISOString()
      });
      await emitProductReviewUpdated(
        review.product_id, 
        `Một đánh giá mới vừa được thêm.`, 
        session.sub
      );
    } catch (e) {
      console.error("Failed to emit new review ws events", e);
    }

    return { success: true, data: review };
  } catch (error) {
    return { success: false, error: getPublicErrorMessage(error, "Lỗi khi thêm đánh giá") };
  }
}

export async function updateReviewByUserAction(reviewId: string, input: Partial<CreateReviewInput>) {
  try {
    const session = await getSession();
    if (!session || !session.sub) {
      return { success: false, error: "Bạn cần đăng nhập để sửa đánh giá." };
    }

    const review = await ReviewService.updateReviewByUser(reviewId, session.sub, input);
    await emitProductReviewUpdated(
      review.product_id, 
      `Người dùng đã cập nhật đánh giá của họ.`, 
      session.sub
    ).catch(console.error);
    
    // Notify admin
    await emitReviewChangedToAdmin(`Một đánh giá vừa được sửa bởi khách hàng.`).catch(console.error);
    
    return { success: true, data: review };
  } catch (error) {
    return { success: false, error: getPublicErrorMessage(error, "Lỗi khi sửa đánh giá") };
  }
}

export async function deleteReviewByUserAction(reviewId: string) {
  try {
    const session = await getSession();
    if (!session || !session.sub) {
      return { success: false, error: "Bạn cần đăng nhập để xóa đánh giá." };
    }

    // Since we delete it, we might want to get it first to know the name, but ReviewService.deleteReview returns the deleted record
    const review = await ReviewService.deleteReviewByUser(reviewId, session.sub);
    await emitProductReviewUpdated(
      review.product_id, 
      `Một đánh giá đã bị xóa bởi người dùng.`, 
      session.sub
    ).catch(console.error);

    // Notify admin
    await emitReviewChangedToAdmin(`Một đánh giá vừa bị xóa bởi khách hàng.`).catch(console.error);

    return { success: true };
  } catch (error) {
    return { success: false, error: getPublicErrorMessage(error, "Lỗi khi xóa đánh giá") };
  }
}

export async function getReviewsByProductAction(input: GetReviewsInput) {
  try {
    const validatedData = getReviewsSchema.parse(input);
    const data = await ReviewService.getReviewsByProduct(validatedData);
    
    return { success: true, data };
  } catch (error) {
    return { success: false, error: getPublicErrorMessage(error, "Lỗi khi lấy đánh giá") };
  }
}

// =====================================
// ADMIN ACTIONS
// =====================================

export async function getAllReviewsAdminAction(input: GetReviewsInput) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: "Không có quyền truy cập." };
    }

    const validatedData = getReviewsSchema.parse(input);
    const data = await ReviewService.getAllReviewsAdmin(validatedData);
    
    return { success: true, data };
  } catch (error) {
    return { success: false, error: getPublicErrorMessage(error, "Lỗi khi lấy danh sách đánh giá") };
  }
}

export async function updateReviewStatusAction(input: UpdateReviewStatusInput) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: "Không có quyền truy cập." };
    }

    const validatedData = updateReviewStatusSchema.parse(input);
    const review = await ReviewService.updateReviewStatus(validatedData);
    
    await emitProductReviewUpdated(
      review.product_id, 
      `Một đánh giá vừa bị ${validatedData.is_published ? 'hiển thị lại' : 'ẩn'} bởi quản trị viên.`, 
      session.sub
    ).catch(console.error);

    return { success: true, data: review };
  } catch (error) {
    return { success: false, error: getPublicErrorMessage(error, "Lỗi khi cập nhật trạng thái") };
  }
}

export async function deleteReviewAction(reviewId: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: "Không có quyền truy cập." };
    }

    const review = await ReviewService.deleteReview(reviewId);
    await emitProductReviewUpdated(
      review.product_id, 
      `Một đánh giá đã bị xóa bởi quản trị viên.`, 
      session.sub
    ).catch(console.error);
    return { success: true };
  } catch (error) {
    return { success: false, error: getPublicErrorMessage(error, "Lỗi khi xóa đánh giá") };
  }
}

export async function replyToReviewAction(input: ReplyReviewInput) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: "Không có quyền truy cập." };
    }

    const validatedData = replyReviewSchema.parse(input);
    const review = await ReviewService.replyToReview(validatedData);
    
    return { success: true, data: review };
  } catch (error) {
    return { success: false, error: getPublicErrorMessage(error, "Lỗi khi trả lời đánh giá") };
  }
}
