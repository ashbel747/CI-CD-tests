import { Bot } from "lucide-react";
import Link from "next/link";

export default function ChatbotButton() {

  return (
    <div className="fixed bottom-6 right-6 z-50">
        <Link href="/chatbot">
            <Bot
            size={48}
            className="bg-pink-400 p-2 rounded-full text-white shadow-lg hover:bg-pink-500 transition"
            />
        </Link>
    </div>

  );
}
