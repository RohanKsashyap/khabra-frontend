import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { 
  Users, 
  Award, 
  Globe, 
  Heart, 
  Shield, 
  Target,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react';

export function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-purple-800 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              Our Story
            </h1>
            <p className="text-xl mb-8 text-white/90">
              Building a community of successful entrepreneurs through innovative MLM solutions and quality products.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-gray-600 mb-6">
                To empower individuals with the tools, knowledge, and support they need to build successful businesses and achieve financial freedom through our innovative MLM platform.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Target className="h-6 w-6 text-primary mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Empowerment</h3>
                    <p className="text-gray-600">Providing opportunities for personal and financial growth</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Heart className="h-6 w-6 text-primary mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Community</h3>
                    <p className="text-gray-600">Building a supportive network of like-minded entrepreneurs</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Star className="h-6 w-6 text-primary mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Excellence</h3>
                    <p className="text-gray-600">Delivering the highest quality products and services</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg" 
                alt="Team meeting" 
                className="rounded-lg shadow-xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-primary mr-4" />
                  <div>
                    <p className="text-2xl font-bold">5+</p>
                    <p className="text-gray-600">Years of Excellence</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The principles that guide our business and shape our community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="p-3 bg-blue-100 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">People First</h3>
              <p className="text-gray-600">
                We believe in the power of people and invest in their growth and development.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="p-3 bg-green-100 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Integrity</h3>
              <p className="text-gray-600">
                We conduct our business with honesty, transparency, and ethical practices.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm">
              <div className="p-3 bg-purple-100 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                <Globe className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Innovation</h3>
              <p className="text-gray-600">
                We continuously evolve and adapt to bring the best solutions to our community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Leadership Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Meet the visionaries behind our success story.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <img 
                src="https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg" 
                alt="CEO" 
                className="w-48 h-48 rounded-full mx-auto mb-6 object-cover"
              />
              <h3 className="text-xl font-bold mb-2">Rajesh Kumar</h3>
              <p className="text-primary mb-4">Founder & CEO</p>
              <p className="text-gray-600">
                With over 15 years of experience in MLM and business development.
              </p>
            </div>

            <div className="text-center">
              <img 
                src="https://images.pexels.com/photos/3778876/pexels-photo-3778876.jpeg" 
                alt="COO" 
                className="w-48 h-48 rounded-full mx-auto mb-6 object-cover"
              />
              <h3 className="text-xl font-bold mb-2">Priya Sharma</h3>
              <p className="text-primary mb-4">Chief Operations Officer</p>
              <p className="text-gray-600">
                Expert in operations management and team building.
              </p>
            </div>

            <div className="text-center">
              <img 
                src="https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg" 
                alt="CTO" 
                className="w-48 h-48 rounded-full mx-auto mb-6 object-cover"
              />
              <h3 className="text-xl font-bold mb-2">Amit Patel</h3>
              <p className="text-primary mb-4">Chief Technology Officer</p>
              <p className="text-gray-600">
                Leading our digital transformation and platform development.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Join Our Growing Community</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Be part of a network that's transforming lives and creating opportunities.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                <Users className="h-5 w-5 mr-2" />
                Join Now
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 