import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Smile, Paperclip, Users, Phone, Video } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';

interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline';
}

interface Message {
  id: string;
  userId: string;
  userName: string;
  avatar: string;
  text: string;
  time: string;
}

interface GroupMessagingProps {
  groupName: string;
  members: GroupMember[];
  onClose: () => void;
}

export function GroupMessaging({ groupName, members, onClose }: GroupMessagingProps) {
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      userId: '2',
      userName: 'Sarah K.',
      avatar: 'SK',
      text: 'Hey everyone! Ready for the study session?',
      time: '10:30 AM'
    },
    {
      id: '2',
      userId: '3',
      userName: 'Alex M.',
      avatar: 'AM',
      text: 'Yeah! Just finished reviewing the notes.',
      time: '10:32 AM'
    },
    {
      id: '3',
      userId: 'me',
      userName: 'You',
      avatar: 'ME',
      text: 'On my way! Should be there in 5.',
      time: '10:35 AM'
    },
    {
      id: '4',
      userId: '4',
      userName: 'Jordan L.',
      avatar: 'JL',
      text: 'Perfect! I brought the study guide we made.',
      time: '10:37 AM'
    }
  ]);

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      userId: 'me',
      userName: 'You',
      avatar: 'ME',
      text: messageText,
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setMessageText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-800 border border-white/10 rounded-3xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-blue-500/10 to-emerald-500/10">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-400 text-white">
                {groupName.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-white text-xl">{groupName}</h2>
              <p className="text-slate-400 text-sm">{members.length} members</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white hover:bg-white/5 rounded-full"
                onClick={() => alert('Voice call coming soon!')}
              >
                <Phone className="w-5 h-5" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white hover:bg-white/5 rounded-full"
                onClick={() => alert('Video call coming soon!')}
              >
                <Video className="w-5 h-5" />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                onClick={onClose}
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white hover:bg-white/5 rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Main Content - Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Messages Area */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <ScrollArea className="flex-1 p-6 custom-scrollbar">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex gap-3 ${message.userId === 'me' ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarFallback className={`${
                        message.userId === 'me'
                          ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                          : 'bg-gradient-to-br from-blue-500 to-emerald-400'
                      } text-white`}>
                        {message.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex flex-col ${message.userId === 'me' ? 'items-end' : ''} max-w-[70%]`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-slate-400 text-xs">{message.userName}</span>
                        <span className="text-slate-500 text-xs">{message.time}</span>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className={`rounded-2xl px-4 py-3 ${
                          message.userId === 'me'
                            ? 'bg-gradient-to-r from-blue-500 to-emerald-400 text-white rounded-br-sm'
                            : 'bg-white/5 text-white rounded-bl-sm'
                        }`}
                      >
                        {message.text}
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-6 border-t border-white/10 bg-slate-900/50">
              <div className="flex items-end gap-3">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-400 hover:text-white hover:bg-white/5 rounded-full"
                    onClick={() => alert('Attachments coming soon!')}
                  >
                    <Paperclip className="w-5 h-5" />
                  </Button>
                </motion.div>
                <div className="flex-1 relative">
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-2xl pr-12 h-12 resize-none"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full"
                    onClick={() => alert('Emoji picker coming soon!')}
                  >
                    <Smile className="w-5 h-5" />
                  </Button>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                    className="bg-gradient-to-r from-blue-500 to-emerald-400 hover:from-blue-600 hover:to-emerald-500 text-white rounded-full h-12 w-12 p-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Members Sidebar */}
          <div className="w-80 border-l border-white/10 bg-slate-900/30 p-6 overflow-y-auto custom-scrollbar">
            <h3 className="text-white flex items-center gap-2 mb-4">
              <Users className="w-5 h-5" />
              Members ({members.length})
            </h3>
            <div className="space-y-2">
              {members.map((member, index) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                >
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-400 text-white">
                        {member.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-800 ${
                        member.status === 'online' ? 'bg-emerald-500' : 'bg-slate-500'
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-sm">{member.name}</div>
                    <div className="text-slate-400 text-xs capitalize">{member.status}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-6 border-t border-white/10 space-y-2">
              <h4 className="text-slate-400 text-sm mb-3">Quick Actions</h4>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-300 hover:text-white hover:bg-white/5"
                  onClick={() => alert('View group details')}
                >
                  📊 View Group Details
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-300 hover:text-white hover:bg-white/5"
                  onClick={() => alert('Shared resources coming soon!')}
                >
                  📁 Shared Resources
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-300 hover:text-white hover:bg-white/5"
                  onClick={() => alert('Study sessions coming soon!')}
                >
                  📅 Schedule Study Session
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
