import { toast } from 'react-hot-toast';
import api from './axios';
import { getApiErrorMessage, unwrap } from './apiUtils';

export interface ReviewRecord {
  id: number;
  customerId: number;
  customerName: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
}

export interface ReviewInput {
  customerId: number;
  rating: number;
  comment?: string | null;
}

export type ReviewDto = ReviewRecord;

export const reviewService = {
  async create(payload: ReviewInput) {
    return this.createReview(payload);
  },

  async getReviews() {
    try {
      const response = await api.get('/review');
      return unwrap<ReviewRecord[]>(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load reviews.'));
      throw error;
    }
  },

  async createReview(payload: ReviewInput) {
    try {
      const response = await api.post('/review', payload);
      return unwrap<ReviewRecord>(response);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to submit review.'));
      throw error;
    }
  },
};