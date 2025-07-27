import React from 'react';
import { Link } from 'react-router-dom';
import { Network, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { FooterContactForm } from '../contact/FooterContactForm';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Information */}
          <div>
            <div className="flex items-center mb-4">
              <Network className="h-6 w-6 text-primary mr-2" />
              <h3 className="text-xl font-bold">KHABRA-MLM</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Building stronger networks and empowering entrepreneurs with innovative MLM solutions.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-gray-400 hover:text-primary">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/business" className="text-gray-400 hover:text-primary">
                  Business Opportunity
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-primary">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-primary">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <h3 className="text-lg font-semibold mb-4">Get in Touch</h3>
            <FooterContactForm />
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <MapPin className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span className="text-gray-400">
                    123 Business Park, Sector 5<br />
                    Noida, Uttar Pradesh 201301
                  </span>
                </li>
                <li className="flex items-center">
                  <Phone className="h-5 w-5 text-primary mr-2" />
                  <a href="tel:+911234567890" className="text-gray-400 hover:text-primary">
                    +91 1234 567 890
                  </a>
                </li>
                <li className="flex items-center">
                  <Mail className="h-5 w-5 text-primary mr-2" />
                  <a href="mailto:support@nexgenmlm.com" className="text-gray-400 hover:text-primary">
                    support@nexgenmlm.com
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/terms" className="text-gray-400 hover:text-primary">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-gray-400 hover:text-primary">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/refund-policy" className="text-gray-400 hover:text-primary">
                    Refund Policy
                  </Link>
                </li>
                <li>
                  <Link to="/income-disclosure" className="text-gray-400 hover:text-primary">
                    Income Disclosure
                  </Link>
                </li>
                <li>
                  <Link to="/franchise-agreement" className="text-gray-400 hover:text-primary">
                    Franchise Agreement
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} KHABRA-MLM. All rights reserved.</p>
          <p className="mt-2">
            GST: 07AABCS1429B1Z1 | CIN: U74999DL2023PTC123456
          </p>
        </div>
      </div>
    </footer>
  );
}