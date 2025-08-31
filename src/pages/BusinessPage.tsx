import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { TrendingUp, Users, Award, Gift, CheckCircle, Zap, Globe, Clock, BarChart as ChartBar, Wallet, Briefcase, GraduationCap } from 'lucide-react';

export function BusinessPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-purple-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Your Path to Financial Freedom
            </h1>
            <p className="text-xl mb-8 text-white/90">
              Join our growing network of successful entrepreneurs and build a sustainable business with our proven MLM system.
            </p>
            <Link to="/register">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                Start Your Business Today
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Compensation Plan */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Lucrative Compensation Plan</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our multi-faceted compensation plan rewards you for both personal sales and team building.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="p-3 bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Direct Commission</h3>
              <p className="text-gray-600">Earn up to 20% commission on personal sales</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="p-3 bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Team Bonus</h3>
              <p className="text-gray-600">7-10% commission on team sales up to 5 levels</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="p-3 bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Leadership Bonus</h3>
              <p className="text-gray-600">Additional 2-5% on entire organization volume</p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="p-3 bg-amber-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Gift className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Lifestyle Rewards</h3>
              <p className="text-gray-600">Car bonus, travel incentives, and more</p>
            </div>
          </div>
        </div>
      </section>

      {/* Rank System */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Achievement Ranks</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Progress through our rank system and unlock greater rewards at each level.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-bronze-100 rounded-full mr-4">
                    <Award className="h-6 w-6 text-amber-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Bronze</h3>
                    <p className="text-sm text-gray-500">Entry Level</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    100 PV Monthly
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    1,000 GV Monthly
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    2 Direct Referrals
                  </li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-silver-100 rounded-full mr-4">
                    <Award className="h-6 w-6 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Silver</h3>
                    <p className="text-sm text-gray-500">Intermediate</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    200 PV Monthly
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    5,000 GV Monthly
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    4 Direct Referrals
                  </li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-yellow-100 rounded-full mr-4">
                    <Award className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Gold</h3>
                    <p className="text-sm text-gray-500">Advanced</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    300 PV Monthly
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    10,000 GV Monthly
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    6 Direct Referrals
                  </li>
                </ul>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-blue-100 rounded-full mr-4">
                    <Award className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Diamond</h3>
                    <p className="text-sm text-gray-500">Elite</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    1,000 PV Monthly
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    50,000 GV Monthly
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    10 Direct Referrals
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support & Training */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Comprehensive Support System</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We provide all the tools and training you need to succeed in your business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="p-3 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Training Academy</h3>
              <p className="text-gray-600">
                Access our comprehensive online training platform with video courses and tutorials.
              </p>
            </div>

            <div className="text-center">
              <div className="p-3 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Business Tools</h3>
              <p className="text-gray-600">
                Get marketing materials, presentation tools, and tracking systems.
              </p>
            </div>

            <div className="text-center">
              <div className="p-3 bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <ChartBar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Performance Analytics</h3>
              <p className="text-gray-600">
                Track your progress with detailed reports and analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Get Started CTA */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Start Your Success Story Today</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our network of successful entrepreneurs and build a business you can be proud of.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                <Users className="h-5 w-5 mr-2" />
                Register Now
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-white text-white bg-white/10 hover:bg-white/20">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}