import { Prisma } from "@prisma/client";
import prisma from "../prisma";
import { CreateReviewInput, GetReviewsInput, ReplyReviewInput, UpdateReviewStatusInput } from "../validations/review.schema";
import { emitReviewRepliedToUser } from "../events/userReviewEvents";

export class ReviewService {
  static async createReview(userId: string, data: CreateReviewInput) {
    return await prisma.review.create({
      data: {
        user_id: userId,
        product_id: data.productId,
        rating: data.rating,
        content: data.content,
        images: data.images || [],
        is_published: true, // Default to published immediately as requested
      },
      include: {
        user: {
          select: {
            fullname: true,
            email: true,
          }
        }
      }
    });
  }

  static async getReviewsByProduct(data: GetReviewsInput) {
    const { productId, page, limit, rating } = data;
    const skip = (page - 1) * limit;

    const where: Prisma.ReviewWhereInput = {
      is_published: true,
    };

    if (productId) {
      where.product_id = productId;
    }
    
    if (rating) {
      where.rating = rating;
    }

    const [items, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc'
        },
        include: {
          user: {
            select: {
              fullname: true,
            }
          }
        }
      }),
      prisma.review.count({ where })
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async getAllReviewsAdmin(data: GetReviewsInput) {
    const { productId, page, limit, status, rating } = data;
    const skip = (page - 1) * limit;

    const where: Prisma.ReviewWhereInput = {};

    if (productId) where.product_id = productId;
    if (rating) where.rating = rating;
    if (status === 'published') where.is_published = true;
    if (status === 'pending') where.is_published = false;

    const [items, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc'
        },
        include: {
          user: {
            select: {
              fullname: true,
              email: true,
            }
          },
          product: {
            select: {
              name: true,
              images: true,
            }
          }
        }
      }),
      prisma.review.count({ where })
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  static async updateReviewStatus(data: UpdateReviewStatusInput) {
    return await prisma.review.update({
      where: { id: data.reviewId },
      data: { is_published: data.is_published }
    });
  }

  static async deleteReview(reviewId: string) {
    return await prisma.review.delete({
      where: { id: reviewId }
    });
  }

  static async replyToReview(data: ReplyReviewInput) {
    const review = await prisma.review.update({
      where: { id: data.reviewId },
      data: { 
        admin_reply: data.admin_reply,
        replied_at: new Date()
      },
      include: {
        product: { select: { name: true } },
      }
    });

    try {
      if (review.user_id && data.admin_reply) {
        await emitReviewRepliedToUser({
          reviewId: review.id,
          productName: review.product?.name || "sản phẩm",
          productId: review.product_id,
          reply: data.admin_reply,
          repliedAt: new Date().toISOString(),
          userId: review.user_id
        });
      }
    } catch (e) {
      console.error("[emitReviewRepliedToUser] Failed to emit event", e);
    }

    return review;
  }
}

