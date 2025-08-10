import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { reviewAPI, orderAPI } from '../../services/api';
import toast from 'react-hot-toast';

interface ReviewFormProps {
  productId: string;
  orderId?: string; // Make orderId optional for admin reviews
  onReviewSubmitted: () => void;
  onCancel: () => void;
}

export const ReviewForm = ({ productId, orderId, onReviewSubmitted, onCancel }: ReviewFormProps) => {
  const { user, loading } = useAuth();
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eligibleOrders, setEligibleOrders] = useState<Array<{ _id: string }>>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  const needsOrderSelection = !orderId && user?.role !== 'admin';

  useEffect(() => {
    const fetchEligibleOrders = async () => {
      if (!needsOrderSelection || !user) return;
      try {
        setIsLoadingOrders(true);
        const data = await orderAPI.fetchOrders(false);
        const orders = Array.isArray(data?.data) ? data.data : data;
        const filtered = (orders || []).filter((o: any) => {
          if (!o || o.status !== 'delivered' || !Array.isArray(o.items)) return false;
          return o.items.some((it: any) => {
            const prod = it?.product;
            const prodId = typeof prod === 'string' ? prod : prod?._id;
            return prodId === productId;
          });
        });
        setEligibleOrders(filtered.map((o: any) => ({ _id: o._id })));
        if (filtered.length === 1) setSelectedOrderId(filtered[0]._id);
      } catch (err) {
        setEligibleOrders([]);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchEligibleOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsOrderSelection, user?.id, productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || loading) {
      toast.error('Please login to submit a review');
      return;
    }

    if (review.length < 10) {
      toast.error('Review must be at least 10 characters long');
      return;
    }

    // For regular users, require orderId (provided or selected)
    const finalOrderId = orderId || selectedOrderId;
    if (user.role !== 'admin' && !finalOrderId) {
      toast.error('Select an eligible order to review this product');
      return;
    }

    setIsSubmitting(true);
    try {
      await reviewAPI.addReview({
        productId,
        orderId: finalOrderId || 'admin-review', // placeholder for admin reviews
        rating,
        review,
        images
      });
      toast.success('Review submitted successfully');
      onReviewSubmitted();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // TODO: Implement image upload to cloud storage
    // For now, we'll just use placeholder URLs
    const newImages = Array.from(files).map(file => URL.createObjectURL(file));
    setImages([...images, ...newImages]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {needsOrderSelection && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Select Order</label>
          {isLoadingOrders ? (
            <div className="text-sm text-gray-500 mt-1">Loading your delivered orders…</div>
          ) : eligibleOrders.length > 0 ? (
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={selectedOrderId}
              onChange={(e) => setSelectedOrderId(e.target.value)}
              required
            >
              <option value="">Choose an order</option>
              {eligibleOrders.map((o) => (
                <option key={o._id} value={o._id}>{o._id}</option>
              ))}
            </select>
          ) : (
            <div className="text-sm text-red-600 mt-1">
              No delivered orders found for this product. You can submit a review from the order details page once delivered.
            </div>
          )}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700">Rating</label>
        <div className="flex items-center mt-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="focus:outline-none"
            >
              <svg
                className={`w-8 h-8 ${
                  star <= rating ? 'text-yellow-400' : 'text-gray-300'
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
        <label htmlFor="review" className="block text-sm font-medium text-gray-700">
          Review
        </label>
        <textarea
          id="review"
          rows={4}
          value={review}
          onChange={(e) => setReview(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Write your review here..."
          required
          minLength={10}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Images (optional)</label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          className="mt-1 block w-full"
        />
        {images.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Review image ${index + 1}`}
                className="w-20 h-20 object-cover rounded"
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
}; 