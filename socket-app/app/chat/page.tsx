"use client";

import { useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';

const socket: Socket = io("http://localhost:4000");

interface Message {
  text: string;
  senderId: string;
}

export default function Chat() {
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    console.log("Socket bağlantısı kuruluyor...");
    
    socket.on('connect', () => {
      console.log('Socket bağlantısı başarılı');
      socket.emit('requestUserId');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.IO bağlantı hatası:', error);
    });

    // Kullanıcı ID'sini almak için bir olay dinleyicisi ekleyin
    socket.on('userId', (id: string) => {
      console.log("UserId alındı:", id);
      setUserId(id);
    });

    // Mevcut mesajları almak için bir işlev ekleyin
    const fetchMessages = () => {
      socket.emit('getMessages');
    };

    // Bağlantı kurulduğunda mesajları alın
    socket.on('connect', fetchMessages);

    // Yeni mesajları dinleyin
    socket.on('message', (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Tüm mesajları almak için bir olay dinleyicisi ekleyin
    socket.on('allMessages', (allMessages: Message[]) => {
      setMessages(allMessages);
    });

    // Temizleme işlevi
    return () => {
      socket.off('connect');
      socket.off('userId');
      socket.off('message');
      socket.off('allMessages');
    };
  }, []);

  const sendMessage = (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    console.log("Mesaj gönderme denemesi. Message:", message, "UserId:", userId);
    if (message.trim() !== '' && userId) {
      console.log("Mesaj gönderiliyor:", { text: message, senderId: userId });
      socket.emit('message', { text: message, senderId: userId });
      setMessage('');
    } else {
      console.log("Mesaj gönderilemedi. Message boş mu?", message.trim() === '', "UserId var mı?", Boolean(userId));
      if (!userId) {
        console.log("UserId yok, yeniden talep ediliyor...");
        socket.emit('requestUserId');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      sendMessage(e as any);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full animate-fadeIn">
        <h1 className="text-2xl font-bold text-center text-gray-700 mb-4">Chat Uygulaması</h1>

        <ul className="space-y-2 mb-4 h-64 overflow-y-auto flex flex-col">
          {messages.map((msg, index) => (
            <li
              key={index}
              className={`rounded px-4 py-2 shadow-md ${
                msg.senderId === userId
                  ? 'bg-purple-500 text-white self-end ml-auto'
                  : 'bg-gray-100 text-gray-700 self-start mr-auto'
              } max-w-[70%] mb-2`}
            >
              {msg.text}
            </li>
          ))}
        </ul>

        <form onSubmit={sendMessage} className="flex space-x-2">
          <input 
            className="flex-grow border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-300 text-black"
            value={message}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Bir mesaj yazın"
          />
          <button 
            type="submit"
            className="bg-purple-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-purple-600 transition duration-300"
          >
            Gönder
          </button>
        </form>
      </div>
    </div>
  );
}
