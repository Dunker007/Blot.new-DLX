import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createChatSession, sendMessageStream, generateGroundedText, generateComplexText } from '../services/geminiService';
import { Message } from '../types';
import { Chat } from '@google/genai';
import { generateSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../services/audioService';

const Chatbot: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<'chat' | 'grounded' | 'thinking'>('chat');
    
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        chatRef.current = createChatSession();
        setMessages([{
            sender: 'bot',
            text: "LUX is online. How can I assist you?"
        }]);
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        
        return () => {
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
        }
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    
    const playAudio = useCallback(async (text: string) => {
        if(!audioContextRef.current) return;
        try {
            const base64Audio = await generateSpeech(text);
            const audioBuffer = await decodeAudioData(decode(base64Audio), audioContextRef.current, 24000, 1);
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.start();
        } catch(e){
            console.error("Error playing audio", e);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        
        const botMessage: Message = { sender: 'bot', text: '' };
        setMessages(prev => [...prev, botMessage]);

        try {
            let fullResponse = '';
            if (mode === 'chat' && chatRef.current) {
                const stream = await sendMessageStream(chatRef.current, input);
                for await (const chunk of stream) {
                    const chunkText = chunk.text;
                    fullResponse += chunkText;
                    setMessages(prev => {
                        const newMessages = [...prev];
                        newMessages[newMessages.length - 1].text = fullResponse;
                        return newMessages;
                    });
                }
            } else if (mode === 'grounded') {
                 const { text, sources } = await generateGroundedText(input);
                 fullResponse = text;
                 setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = { sender: 'bot', text, sources };
                    return newMessages;
                });
            } else if (mode === 'thinking') {
                const text = await generateComplexText(input);
                fullResponse = text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text = text;
                    return newMessages;
                });
            }
            if(fullResponse) {
                playAudio(fullResponse);
            }
        } catch (error) {
            console.error(error);
             setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].text = "Apologies, Operator. I encountered an error.";
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };

    const getModeDescription = () => {
        switch(mode) {
            case 'chat': return "Standard conversational mode.";
            case 'grounded': return "Grounded with Google Search for recent information.";
            case 'thinking': return "Deep Thinking Mode for complex problem-solving.";
        }
    }

    return (
        <div className="flex flex-col h-full bg-gray-800 rounded-lg shadow-inner">
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-lg p-3 rounded-lg ${msg.sender === 'user' ? 'bg-cyan-700' : 'bg-gray-700'}`}>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                            {msg.sources && msg.sources.length > 0 && (
                                <div className="mt-2 pt-2 border-t border-gray-600">
                                    <h4 className="text-xs font-semibold text-gray-400 mb-1">Sources:</h4>
                                    <ul className="text-xs space-y-1">
                                        {msg.sources.map((source, i) => (
                                            <li key={i}>
                                                <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{source.title}</a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {isLoading && <div className="flex justify-start"><div className="p-3 rounded-lg bg-gray-700">Thinking...</div></div>}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-cyan-500/20">
                <div className="flex items-center space-x-2 mb-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                        <span>Mode:</span>
                        <select value={mode} onChange={e => setMode(e.target.value as any)} className="bg-gray-700 text-white rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500">
                            <option value="chat">Chat</option>
                            <option value="grounded">Grounded Search</option>
                            <option value="thinking">Thinking Mode</option>
                        </select>
                    </label>
                    <p className="text-xs text-gray-400 flex-1">{getModeDescription()}</p>
                </div>
                <form onSubmit={handleSubmit} className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Enter your command..."
                        aria-label="Enter your command for LUX"
                        className="flex-1 bg-gray-900 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading} aria-label="Send command" className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-500 text-white font-semibold px-4 py-2 rounded-md transition-colors">
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Chatbot;
