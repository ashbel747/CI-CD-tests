import React from 'react';
import { Mic, Send,  Headphones, Camera} from 'lucide-react';

const Chatbot = () => {
  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-800 text-black dark:text-white mt-16">
        {/* Header */}
        <div className="flex justify-center w-screen shadow border-b-2 border-black dark:border-white">
            <div className="flex flex-col items-center justify-center p-4 w-full max-w-4xl mb-4">
                <h1 className="text-xl font-bold flex items-center">
                <Headphones className="mr-2" /> Assistant
                </h1>
            </div>
        </div>

        {/* Message Container */}
        <div className="flex-1 overflow-y-auto space-y-4 rounded-lg shadow-md pt-7">
            {/*Bot Message Bubble */}
            <div className="flex justify-start">
                <div className="bg-gray-300 text-gray-800 dark:bg-pink-400 p-3 rounded-full max-w-xs">
                    How can I help you today?
                </div>
            </div>

            {/*User Message bubbles */}
            <div className="flex justify-end">
                <div className="bg-gray-400 dark:bg-white text-black p-3 rounded-full max-w-xs">
                    User message goes here
                </div>
            </div>    
        </div>

        {/* Input Area */}
        <div className="p-12 mt-4 rounded-lg shadow-md flex items-center">
            {/* Input field and buttons */}
            <button><Camera className='text-2xl hover:opacity-50'/></button>
            <input
            type="text"
            placeholder="Write Here..."
            className="ml-4 mr-4 flex-1 p-3 rounded-full bg-gray-200 dark:bg-gray-600 text-black dark:text-white focus:outline-none"
            />
            <button><Mic className='text-2xl hover:opacity-50 mr-2'/></button>
            <button><Send className='text-2xl hover:opacity-50'/></button>
        </div>
    </div>
  );
};

export default Chatbot;