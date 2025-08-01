import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { 
  ShoppingBag, 
  Network, 
  Users, 
  Award, 
  TrendingUp, 
  Shield, 
  Gift, 
  CheckCircle,
  Zap,
  Globe,
  Clock
} from 'lucide-react';

export function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-purple-800 text-white">
        <div className="container mx-auto px-4 py-20 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Transform Your Future with Khabra Generations Care
            </h1>
            <p className="text-xl mb-8 text-white/90">
              Join our revolutionary platform combining premium products with a powerful MLM network. Start your journey to financial freedom today.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                  Start Your Business
                </Button>
              </Link>
              <Link to="/products">
                <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Browse Products
                </Button>
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <img 
              src="https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg" 
              alt="Team success" 
              className="rounded-lg shadow-2xl max-w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why Choose Khabra Generations Care?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We combine cutting-edge technology with premium products and a rewarding compensation plan to help you succeed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-blue-100 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                <Network className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart MLM System</h3>
              <p className="text-gray-600">
                Our platform offers automated placement, commission calculations, and rank upgrades.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-green-100 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                <ShoppingBag className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Quality Products</h3>
              <p className="text-gray-600">
                Premium products with excellent margins and consistent quality standards.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-3 bg-purple-100 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                <Award className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Great Rewards</h3>
              <p className="text-gray-600">
                Multiple income streams including direct sales, team commissions, and leadership bonuses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Success Stories</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Real people achieving real success with our business opportunity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <img
                  src="https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg"
                  alt="Priya Sharma"
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="font-bold">Priya Sharma</h3>
                  <p className="text-primary text-sm">Diamond Franchise</p>
                </div>
              </div>
              <p className="text-gray-600">
                "I joined 2 years ago and it changed my life. Now I earn more than my previous job while having time for family."
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <img
                  src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg"
                  alt="Rahul Verma"
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="font-bold">Rahul Verma</h3>
                  <p className="text-primary text-sm">Platinum Franchise</p>
                </div>
              </div>
              <p className="text-gray-600">
                "The products sell themselves and the compensation plan is amazing. The support from the company is outstanding."
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <img
                  src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg"
                  alt="Neha Patel"
                  className="w-16 h-16 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="font-bold">Neha Patel</h3>
                  <p className="text-primary text-sm">Gold Franchise</p>
                </div>
              </div>
              <p className="text-gray-600">
                "Started as a customer, loved the products, and naturally grew my business. Now I lead a team of 50+ people."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of successful franchise partners building their dream lifestyle with Khabra Generations Care.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                <Users className="h-5 w-5 mr-2" />
                Join Now
              </Button>
            </Link>
            <Link to="/business">
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                <TrendingUp className="h-5 w-5 mr-2" />
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Factors */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            <div className="flex items-center">
              <Shield className="h-6 w-6 text-gray-500 mr-2" />
              <span className="text-gray-600">Secure Payments</span>
            </div>
            <div className="flex items-center">
              <Gift className="h-6 w-6 text-gray-500 mr-2" />
              <span className="text-gray-600">Quality Products</span>
            </div>
            <div className="flex items-center">
              <Users className="h-6 w-6 text-gray-500 mr-2" />
              <span className="text-gray-600">10,000+ Franchise Partners</span>
            </div>
            <div className="flex items-center">
              <TrendingUp className="h-6 w-6 text-gray-500 mr-2" />
              <span className="text-gray-600">5+ Years in Business</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}