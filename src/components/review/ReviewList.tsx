import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { reviewAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface Review {
  _id: string;
  user: {
    id: string;
    name: string;
  };
  rating: number;
  review: string;
  images: string[];
  likes: string[];
  isVerifiedPurchase: boolean;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface ReviewListProps {
  productId: string;
}

export const ReviewList = ({ productId }: ReviewListProps) => {
  const { user, loading } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('-createdAt');
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentReview, setCurrentReview] = useState<Review | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [productId, page, sortBy]);

  const fetchReviews = async () => {
    try {
      const data = await reviewAPI.getProductReviews(productId, {
        page,
        limit: 5,
        sort: sortBy
      });
      setReviews(data.reviews);
      setTotalPages(data.totalPages);
      setIsLoading(false);
    } catch (error) {
      // Don't show error toast, just set empty reviews
      setReviews([]);
      setTotalPages(1);
      setIsLoading(false);
    }
  };

  const handleLike = async (reviewId: string) => {
    if (!user || loading) {
      toast.error('Please login to like reviews');
      return;
    }

    try {
      const data = await reviewAPI.toggleLike(reviewId);
      setReviews(reviews.map(review => 
        review._id === reviewId ? data : review
      ));
    } catch (error) {
      toast.error('Failed to like review');
    }
  };

  const handleEditClick = (review: Review) => {
    setCurrentReview(review);
    setShowEditModal(true);
  };

  const handleDeleteClick = async (reviewId: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }
    try {
      await reviewAPI.deleteReview(reviewId);
      toast.success('Review deleted successfully');
      fetchReviews();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete review');
    }
  };

  const handleUpdateReview = async (updatedReview: Review) => {
    try {
      await reviewAPI.updateReview(updatedReview._id, {
        rating: updatedReview.rating,
        review: updatedReview.review,
        images: updatedReview.images,
        status: updatedReview.status
      });
      toast.success('Review updated successfully');
      setShowEditModal(false);
      fetchReviews();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update review');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading reviews...</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Customer Reviews</h3>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="-createdAt">Most Recent</option>
            <option value="-rating">Highest Rated</option>
            <option value="rating">Lowest Rated</option>
            <option value="-likes">Most Helpful</option>
          </select>
        </div>

        <div className="text-center py-8">
          <div className="flex justify-center mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-6 h-6 ${
                  star <= 4.5 ? 'text-yellow-400' : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Customer Reviews</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="-createdAt">Most Recent</option>
          <option value="-rating">Highest Rated</option>
          <option value="rating">Lowest Rated</option>
          <option value="-likes">Most Helpful</option>
        </select>
      </div>

      <div className="space-y-8">
        {reviews.map((review) => (
          <div key={review._id} className="border-b pb-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{review.user.name}</span>
                  {review.isVerifiedPurchase && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      Verified Purchase
                    </span>
                  )}
                </div>
                <div className="flex items-center mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-5 h-5 ${
                        star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <span className="ml-2 text-sm text-gray-500">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleLike(review._id)}
                className={`flex items-center space-x-1 text-sm ${
                  review.likes.includes(user?.id || '') ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill={review.likes.includes(user?.id || '') ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span>{review.likes.length}</span>
              </button>

              {user?.role === 'admin' && (
                <div className="flex items-center space-x-2 ml-auto">
                  <button
                    onClick={() => handleEditClick(review)}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(review._id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>

            <p className="mt-2 text-gray-700">{review.review}</p>

            {review.images && review.images.length > 0 && (
              <div className="mt-4 flex space-x-2">
                {review.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Review image ${index + 1}`}
                    className="w-20 h-20 object-cover rounded"
                  />
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center space-x-4">
              <button
                onClick={() => handleLike(review._id)}
                className={`flex items-center space-x-1 text-sm ${
                  review.likes.includes(user?.id || '') ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill={review.likes.includes(user?.id || '') ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span>{review.likes.length}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {showEditModal && currentReview && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Edit Review</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateReview(currentReview);
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Rating</label>
                <div className="flex items-center mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setCurrentReview(prev => prev ? { ...prev, rating: star } : null)}
                      className="focus:outline-none"
                    >
                      <svg
                        className={`w-8 h-8 ${
                          star <= currentReview.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="edit-review" className="block text-sm font-medium text-gray-700">
                  Review
                </label>
                <textarea
                  id="edit-review"
                  rows={4}
                  value={currentReview.review}
                  onChange={(e) => setCurrentReview(prev => prev ? { ...prev, review: e.target.value } : null)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  minLength={10}
                />
              </div>

              <div>
                <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="edit-status"
                  value={currentReview.status}
                  onChange={(e) => setCurrentReview(prev => prev ? { ...prev, status: e.target.value as 'pending' | 'approved' | 'rejected' } : null)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Update Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}; 