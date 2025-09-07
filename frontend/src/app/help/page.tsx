import { Metadata } from 'next';
import HelpAndFaqs from '../components/FAQs';

export const metadata: Metadata = {
  title: "Help & FAQs | Home Decor",
  description:
    "Find answers to frequently asked questions or contact our team for support. Learn how to order, track deliveries, and get assistance.",
  keywords: [
    "FAQs",
    "help",
    "customer support",
    "order tracking",
    "shipping information",
    "contact us",
  ],
};

export default function HelpPage() {
  return (
    <main className="bg-gray-100 dark:bg-gray-800 min-h-screen">
      <div className="py-12">
        <h1 className="text-3xl font-bold text-center mb-8 text-black dark:text-pink-500">Help & FAQs</h1>
        <HelpAndFaqs />
      </div>
    </main>
  );
}