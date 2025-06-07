import React from 'react';
import { format } from 'date-fns';

interface TrackingUpdate {
  status: string;
  location?: string;
  description?: string;
  timestamp: Date;
}

interface TrackingTimelineProps {
  updates: TrackingUpdate[];
  currentStatus: string;
  estimatedDelivery?: Date;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-gray-400';
    case 'in_transit':
      return 'bg-blue-500';
    case 'out_for_delivery':
      return 'bg-yellow-500';
    case 'delivered':
      return 'bg-green-500';
    case 'failed':
      return 'bg-red-500';
    default:
      return 'bg-gray-400';
  }
};

const getStatusText = (status: string) => {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

const TrackingTimeline: React.FC<TrackingTimelineProps> = ({
  updates,
  currentStatus,
  estimatedDelivery
}) => {
  return (
    <div className="relative">
      {/* Estimated Delivery */}
      {estimatedDelivery && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600">
            Estimated Delivery: {format(new Date(estimatedDelivery), 'MMM dd, yyyy')}
          </p>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-6">
        {updates.map((update, index) => (
          <div key={index} className="relative pl-8">
            {/* Vertical Line */}
            {index !== updates.length - 1 && (
              <div className="absolute left-3 top-4 bottom-0 w-0.5 bg-gray-200" />
            )}

            {/* Status Dot */}
            <div className={`absolute left-0 w-6 h-6 rounded-full ${getStatusColor(update.status)} flex items-center justify-center`}>
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>

            {/* Content */}
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">
                  {getStatusText(update.status)}
                </h4>
                <span className="text-sm text-gray-500">
                  {format(new Date(update.timestamp), 'MMM dd, yyyy h:mm a')}
                </span>
              </div>

              {update.location && (
                <p className="text-sm text-gray-600 mb-1">
                  Location: {update.location}
                </p>
              )}

              {update.description && (
                <p className="text-sm text-gray-600">
                  {update.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Current Status */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Current Status: <span className="font-medium">{getStatusText(currentStatus)}</span>
        </p>
      </div>
    </div>
  );
};

export default TrackingTimeline; 