'use client';

import { useEffect, useState } from 'react';
import { Star, ThumbsUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { message } from 'antd';

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string | null;
  userId: string;
  helpfulCount: number;
  createdAt: Date;
}

interface ProductReviewsProps {
  productId: string;
  onAddReviewClick: () => void;
  refreshTrigger?: number;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({
  productId,
  onAddReviewClick,
  refreshTrigger = 0,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [productId, refreshTrigger]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reviews?productId=${productId}`);

      if (!response.ok) throw new Error('Failed to fetch reviews');

      const data = await response.json();
      setReviews(data.reviews || []);
      setAverageRating(data.averageRating || 0);
      setTotalReviews(data.totalReviews || 0);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) => {
    const sizeClass = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const RatingDistribution = () => {
    const distribution = [5, 4, 3, 2, 1].map((rating) => {
      const count = reviews.filter((r) => r.rating === rating).length;
      const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
      return { rating, count, percentage };
    });

    return (
      <div className="space-y-2">
        {distribution.map(({ rating, count, percentage }) => (
          <div key={rating} className="flex items-center gap-2">
            <span className="text-sm text-gray-600 w-12">{rating} star</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-400 h-2 rounded-full"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-sm text-gray-600 w-12 text-right">({count})</span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="w-full py-8 text-center">
        <p className="text-gray-500">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

        {totalReviews === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">No reviews yet. Be the first to review this product!</p>
            <Button onClick={onAddReviewClick} className="bg-blue-600 hover:bg-blue-700">
              Write a Review
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Average Rating */}
            <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl font-bold text-gray-900 mb-2">{averageRating}</div>
              <StarRating rating={Math.round(averageRating)} size="lg" />
              <p className="text-sm text-gray-600 mt-2">Based on {totalReviews} reviews</p>
            </div>

            {/* Rating Distribution */}
            <div className="col-span-2 bg-gray-50 rounded-lg p-6">
              <RatingDistribution />
              <Button
                onClick={onAddReviewClick}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700"
              >
                Write a Review
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Individual Reviews */}
      {reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <StarRating rating={review.rating} />
                  <h3 className="font-semibold text-gray-900 mt-2">{review.title}</h3>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>

              {review.comment && (
                <p className="text-gray-700 mb-3 leading-relaxed">{review.comment}</p>
              )}

              <div className="flex items-center gap-4 pt-3 border-t border-gray-200">
                <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition">
                  <ThumbsUp className="w-4 h-4" />
                  <span>Helpful ({review.helpfulCount})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
