import { Link } from 'react-router-dom';
import { Network, Mail, Phone, MapPin } from 'lucide-react';
import { FooterContactForm } from '../contact/FooterContactForm';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Information */}
          <div>
            <div className="flex items-center mb-4">
              <Network className="h-6 w-6 text-secondary mr-2" />
              <h3 className="text-xl font-bold">KHABRA-MLM</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Building stronger networks and empowering entrepreneurs with innovative MLM solutions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-gray-400 hover:text-accent transition-colors duration-200">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/business" className="text-gray-400 hover:text-accent transition-colors duration-200">
                  Business Opportunity
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-accent transition-colors duration-200">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-accent transition-colors duration-200">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-accent transition-colors duration-200">
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
                  <MapPin className="h-5 w-5 text-secondary mr-2 mt-0.5" />
                  <span className="text-gray-400">
                    Garhshnakar<br />
                    Hoshiarpur, Punjab 144527
                  </span>
                </li>
                <li className="flex items-center">
                  <Phone className="h-5 w-5 text-secondary mr-2" />
                  <a href="tel:+919915456220" className="text-gray-400 hover:text-accent transition-colors duration-200">
                    +91 99154 56220
                  </a>
                </li>
                <li className="flex items-center">
                  <Mail className="h-5 w-5 text-secondary mr-2" />
                  <a href="mailto:khabragc@gmail.com" className="text-gray-400 hover:text-accent transition-colors duration-200">
                    khabragc@gmail.com
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/terms" className="text-gray-400 hover:text-accent transition-colors duration-200">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-gray-400 hover:text-accent transition-colors duration-200">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/refund-policy" className="text-gray-400 hover:text-accent transition-colors duration-200">
                    Refund Policy
                  </Link>
                </li>
                <li>
                  <Link to="/income-disclosure" className="text-gray-400 hover:text-accent transition-colors duration-200">
                    Income Disclosure
                  </Link>
                </li>
                <li>
                  <Link to="/franchise-agreement" className="text-gray-400 hover:text-accent transition-colors duration-200">
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
            GST: 03BQAPK5390N1ZN | CIN: U74999DL2023PTC123456
          </p>
        </div>
      </div>
    </footer>
  );
}