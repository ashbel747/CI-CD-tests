"use client";

import { useState } from 'react';

interface FaqItem {
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    question: "How do I place an order?",
    answer: "To place an order, simply browse our products, add them to your cart, and proceed to checkout. You'll receive a confirmation email once your order is complete."
  },
  {
    question: "What are your shipping options?",
    answer: "We offer several shipping options, including standard ground shipping and express delivery. You can see the estimated delivery times and costs at checkout."
  },
  {
    question: "How can I track my order?",
    answer: "Once your order has shipped, you will receive a tracking number via email. You can use this number on our carrier's website to monitor its status."
  },
];

const HelpAndFaqs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'faq' | 'contact'>('faq');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-center mb-6 border-b-2 border-gray-900 dark:border-pink-600">
        <button
          className={`py-2 mr-2 px-4 font-semibold rounded-lg text-lg ${
            activeTab === 'faq' ? 'text-black border-b-2 bg-gray-700 dark:bg-pink-600' : 'bg-gray-100 dark:bg-gray-700'
          }`}
          onClick={() => setActiveTab('faq')}
        >
          FAQ
        </button>
        <button
          className={`py-2 px-4 font-semibold rounded-lg text-lg ${
            activeTab === 'contact' ? 'text-black border-b-2 bg-gray-700 dark:bg-pink-600' : 'bg-gray-100 dark:bg-gray-700'
          }`}
          onClick={() => setActiveTab('contact')}
        >
          Contact Us
        </button>
      </div>

      {activeTab === 'faq' ? (
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden">
              <button
                className="w-full flex justify-between items-center p-4 focus:outline-none"
                onClick={() => toggleFaq(index)}
              >
                <h3 className="font-semibold text-left text-gray-900 dark:text-white">{faq.question}</h3>
                <span className="text-gray-500 dark:text-white transform transition-transform duration-300 ease-in-out">
                  {openFaqIndex === index ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  )}
                </span>
              </button>
              <div className={`transition-all duration-300 ease-in-out ${openFaqIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="p-4 pt-0 text-gray-600 dark:text-white">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-black dark:text-white">Contact Our Team</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Customer Service</h3>
              <p className="text-gray-600 dark:text-white">Email us at <a href="mailto:homedecor@example.com" className="text-blue-600 hover:underline">homedecor@example.com</a> for any general inquiries.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Technical Support</h3>
              <p className="text-gray-600 dark:text-white">Call our technical support line at <a href="tel:+1234567890" className="text-black dark:text-white hover:underline">+1 (234) 567-890</a> for technical assistance.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Facebook</h3>
              <p className="text-gray-600 dark:text-white">Follow us on our <a href="https://web.facebook.com/" className="text-black dark:text-white hover:underline">Facebook</a> Page.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Instagram</h3>
              <p className="text-gray-600 dark:text-white">Foolow us on our <a href="https://www.instagram.com/" className="text-black dark:text-white hover:underline">Instagram</a> Page.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpAndFaqs;