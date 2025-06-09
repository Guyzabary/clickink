import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquare, Send, ArrowLeft, Trash2, Image as ImageIcon, X } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useMessageStore } from '../store/messageStore';
import { formatChatTimestamp } from '../utils/chat';

const Messages: React.FC = () => {
  const [searchParams] = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { userData } = useAuth();
  const {
    chats,
    messages,
    currentChat,
    setCurrentChat,
    sendMessage,
    markChatAsRead,
    deleteChat
  } = useMessageStore();
  const [newMessage, setNewMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Initialize with chat ID from URL if present
  useEffect(() => {
    const chatId = searchParams.get('chat');
    if (chatId) {
      setCurrentChat(chatId);
    }
    return () => setCurrentChat(null);
  }, [searchParams, setCurrentChat]);

  // Mark chat as read when opened
  useEffect(() => {
    if (currentChat && userData) {
      markChatAsRead(currentChat, userData.uid);
    }
  }, [currentChat, userData, markChatAsRead]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedImage) || !currentChat || !userData) return;

    try {
      await sendMessage(
        currentChat,
        newMessage.trim(),
        userData.uid,
        userData.fullName,
        selectedImage
      );
      setNewMessage('');
      setSelectedImage(null);
      setImagePreview(null);
      setUploadProgress(null);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      await deleteChat(chatId);
      setShowDeleteConfirm(null);
      if (currentChat === chatId) {
        setCurrentChat(null);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  const selectedChat = currentChat ? chats.find(chat => chat.id === currentChat) : null;

  const getParticipantName = (chat: any, participantId: string) => {
    return chat.participantNames?.[participantId] || 'Unknown User';
  };

  return (
    <div className="h-[calc(100vh-16rem)] bg-white rounded-xl shadow-sm flex flex-col overflow-hidden">
      <div className="flex h-full">
        {/* Chat List */}
        <div className={`w-full md:w-80 border-r flex flex-col ${selectedChat ? 'hidden md:flex' : ''}`}>
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {chats.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No conversations yet</p>
              </div>
            ) : (
              chats.map((chat) => {
                const otherParticipantId = chat.participants.find(id => id !== userData?.uid);
                const otherParticipantName = otherParticipantId ? getParticipantName(chat, otherParticipantId) : '';
                const isUnread = !chat.readBy?.includes(userData?.uid || '') && chat.lastMessageFrom !== userData?.uid;

                return (
                  <div
                    key={chat.id}
                    className={`relative group ${
                      currentChat === chat.id ? 'bg-purple-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <button
                      onClick={() => setCurrentChat(chat.id)}
                      className="w-full text-left p-4"
                    >
                      <div className="font-semibold">
                        {otherParticipantName}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {chat.lastMessage || 'No messages yet'}
                      </div>
                      {chat.lastMessageAt && (
                        <div className="text-xs text-gray-400 mt-1">
                          {formatChatTimestamp(chat.lastMessageAt)}
                        </div>
                      )}
                      {isUnread && (
                        <div className="absolute top-4 right-4 w-3 h-3 bg-purple-600 rounded-full"></div>
                      )}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(chat.id)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Messages */}
        <div className={`flex-1 flex flex-col ${!selectedChat ? 'hidden md:flex' : ''}`}>
          {selectedChat ? (
            <>
              <div className="p-4 border-b flex items-center">
                <button
                  onClick={() => setCurrentChat(null)}
                  className="md:hidden mr-2"
                >
                  <ArrowLeft className="h-6 w-6" />
                </button>
                <div>
                  <h3 className="font-semibold">
                    {getParticipantName(selectedChat, selectedChat.participants.find(id => id !== userData?.uid) || '')}
                  </h3>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-4 flex ${
                      message.senderId === userData?.uid ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.senderId === userData?.uid
                          ? 'bg-purple-600 text-white ml-auto'
                          : 'bg-gray-100'
                      }`}
                    >
                      <div className="text-sm font-medium mb-1">
                        {message.senderName}
                      </div>
                      {message.imageUrl && (
                        <div className="mb-2">
                          <img
                            src={message.imageUrl}
                            alt="Shared image"
                            className="max-w-full rounded-lg"
                            onClick={() => window.open(message.imageUrl, '_blank')}
                          />
                        </div>
                      )}
                      {message.content && (
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      )}
                      <div
                        className={`text-xs mt-1 ${
                          message.senderId === userData?.uid
                            ? 'text-purple-200'
                            : 'text-gray-500'
                        }`}
                      >
                        {formatChatTimestamp(message.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t">
                {imagePreview && (
                  <div className="mb-4 relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-32 rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {uploadProgress !== null && (
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-purple-500 focus:border-purple-500"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-500 hover:text-purple-600 transition"
                  >
                    <ImageIcon className="h-6 w-6" />
                  </button>
                  <button
                    type="submit"
                    disabled={!newMessage.trim() && !selectedImage}
                    className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-500">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Delete Conversation</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this conversation? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteChat(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;