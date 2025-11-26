'use client';

import { useState } from 'react';
import { Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { message } from 'antd';
import { useSession } from 'next-auth/react';

interface ReviewFormProps {
  productId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  productId,
  onClose,
  onSuccess,
}) => {
  const { data: session } = useSession();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.id) {
      message.error('Please log in to submit a review');
      return;
    }

    if (!title.trim()) {
      message.error('Please enter a title');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating,
          title: title.trim(),
          comment: comment.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        message.error(data.error || 'Failed to submit review');
        return;
      }

      message.success(data.message || 'Review submitted successfully!');
      setTitle('');
      setComment('');
      setRating(5);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      message.error('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ value, onMouseEnter, onMouseLeave, onClick }: any) => {
    return (
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onClick(star)}
            onMouseEnter={() => onMouseEnter(star)}
            onMouseLeave={onMouseLeave}
            className="focus:outline-none transition"
          >
            <Star
              className={`w-8 h-8 ${
                star <= (hoverRating || value)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold">Write a Review</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Rating
            </label>
            <StarRating
              value={rating}
              onMouseEnter={setHoverRating}
              onMouseLeave={() => setHoverRating(0)}
              onClick={setRating}
            />
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
              Review Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value.slice(0, 255))}
              placeholder="Summarize your experience in a title"
              maxLength={255}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              {title.length}/255 characters
            </p>
          </div>

          {/* Comment */}
          <div>
            <label htmlFor="comment" className="block text-sm font-semibold text-gray-900 mb-2">
              Your Review (Optional)
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 5000))}
              placeholder="Share your detailed experience with this product"
              maxLength={5000}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/5000 characters
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading || !title.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center">
            Your review will be visible after admin approval
          </p>
        </form>
      </div>
    </div>
  );
};
