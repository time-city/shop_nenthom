'use server'

import { getPublicErrorMessage } from "../utils/publicError";
import { getSession } from "../session";
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
    
    return { success: true, data: review };
  } catch (error) {
    return { success: false, error: getPublicErrorMessage(error, "Lỗi khi thêm đánh giá") };
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

    await ReviewService.deleteReview(reviewId);
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
