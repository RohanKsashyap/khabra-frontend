import React, { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

interface ReturnRequestFormProps {
  orderId: string;
  onRequestSubmitted: () => void;
  onCancel: () => void;
}

const ReturnRequestForm: React.FC<ReturnRequestFormProps> = ({
  orderId,
  onRequestSubmitted,
  onCancel
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      toast.error('Please provide a reason for the return');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.post(`/orders/${orderId}/return`, { reason });
      toast.success('Return request submitted successfully');
      onRequestSubmitted();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error submitting return request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Request Return
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="reason"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Reason for Return
          </label>
          <textarea
            id="reason"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please provide details about why you want to return this item..."
            required
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReturnRequestForm; 