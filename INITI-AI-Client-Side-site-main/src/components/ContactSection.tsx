'use client';

import { HotelConfig } from '@/config/hotels';

interface ContactSectionProps {
  hotelConfig: HotelConfig;
}

export function ContactSection({ hotelConfig }: ContactSectionProps) {
  return (
    <section id="contact" className="py-20 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Get in Touch
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Need assistance? Our team is here to help make your stay exceptional.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Phone */}
          {hotelConfig.contact.phone && (
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Phone
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                <a href={`tel:${hotelConfig.contact.phone}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {hotelConfig.contact.phone}
                </a>
              </p>
            </div>
          )}

          {/* Email */}
          {hotelConfig.contact.email && (
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <div className="w-12 h-12 mx-auto mb-4 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Email
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                <a href={`mailto:${hotelConfig.contact.email}`} className="hover:text-green-600 dark:hover:text-green-400 transition-colors">
                  {hotelConfig.contact.email}
                </a>
              </p>
            </div>
          )}

          {/* Address */}
          {hotelConfig.contact.address && (
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Address
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {hotelConfig.contact.address}
              </p>
            </div>
          )}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center justify-center p-6 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <div className="text-left">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                24/7 AI Concierge
              </h4>
              <p className="text-gray-600 dark:text-gray-300">
                Scan the QR code in your room for instant assistance
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
