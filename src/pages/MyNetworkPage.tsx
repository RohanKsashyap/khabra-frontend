import React from 'react';
import NetworkTree from '../components/dashboard/NetworkTree';
import { motion } from 'framer-motion';
import { Network, Users, GitBranch, Share2, TrendingUp } from 'lucide-react';

const MyNetworkPage: React.FC = () => {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-4 sm:p-6 lg:p-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
            <Network className="h-6 w-6 sm:h-8 sm:w-8" />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">My Network</h1>
            <p className="text-indigo-100 text-base sm:text-lg">Build and grow your MLM business through strategic networking</p>
          </div>
        </div>
      </motion.div>

      {/* Network Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
      >
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Total Team Size</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">Growing</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <GitBranch className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Network Levels</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">Multi-Level</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100 hover:shadow-xl transition-all duration-200 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Growth Potential</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">Unlimited</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Network Tree Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Share2 className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Network Tree</h2>
                <p className="text-sm sm:text-base text-gray-600">Visualize your team structure and connections</p>
              </div>
            </div>
            <div className="text-xs sm:text-sm text-gray-500 bg-white px-3 py-2 rounded-lg border self-start sm:self-auto">
              Real-time updates
            </div>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <NetworkTree />
        </div>
      </motion.div>

      {/* Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-6 border border-blue-200"
      >
        <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-4">💡 Network Building Tips</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm text-blue-800">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <p>Focus on quality relationships over quantity</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <p>Provide value and support to your team members</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <p>Regular communication keeps your network engaged</p>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <p>Lead by example and maintain high standards</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MyNetworkPage; 