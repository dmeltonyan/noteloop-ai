import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Send, Users, User, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  level: string;
  status: 'online' | 'offline';
}

export interface Group {
  id: string;
  name: string;
  members: number;
  avatar: string;
  topic: string;
}

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  contentTitle: string;
  contentType: 'lecture' | 'clip' | 'note';
  friends: Friend[];
  groups: Group[];
  onShare: (recipients: { friends: string[]; groups: string[] }) => void;
}

export function ShareDialog({
  isOpen,
  onClose,
  contentTitle,
  contentType,
  friends,
  groups,
  onShare
}: ShareDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'friends' | 'groups'>('friends');

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFriend = (friendId: string) => {
    setSelectedFriends(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const toggleGroup = (groupId: string) => {
    setSelectedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleShare = () => {
    onShare({ friends: selectedFriends, groups: selectedGroups });
    setSelectedFriends([]);
    setSelectedGroups([]);
    setSearchQuery('');
    onClose();
  };

  const totalSelected = selectedFriends.length + selectedGroups.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-white/10 text-white p-0 gap-0 max-w-md [&>button]:hidden">
        {/* Accessibility - Hidden but required for screen readers */}
        <DialogTitle className="sr-only">Share {contentType}</DialogTitle>
        <DialogDescription className="sr-only">
          Share "{contentTitle}" with your friends and groups
        </DialogDescription>
        
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl" aria-hidden="true">Share {contentType}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-slate-400 truncate mb-4" aria-hidden="true">{contentTitle}</p>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search friends or groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'friends' | 'groups')} className="flex-1">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10">
              <TabsTrigger
                value="friends"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-emerald-400 data-[state=active]:text-white text-slate-400"
              >
                <User className="w-4 h-4 mr-2" />
                Friends ({selectedFriends.length})
              </TabsTrigger>
              <TabsTrigger
                value="groups"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-emerald-400 data-[state=active]:text-white text-slate-400"
              >
                <Users className="w-4 h-4 mr-2" />
                Groups ({selectedGroups.length})
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Friends Tab */}
          <TabsContent value="friends" className="mt-0 p-0">
            <ScrollArea className="h-[400px] px-6 py-4">
              {filteredFriends.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No friends found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFriends.map((friend) => (
                    <motion.button
                      key={friend.id}
                      onClick={() => toggleFriend(friend.id)}
                      className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                        selectedFriends.includes(friend.id)
                          ? 'bg-gradient-to-r from-blue-500/20 to-emerald-400/20 border border-blue-500/50'
                          : 'bg-white/5 hover:bg-white/10 border border-transparent'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="relative">
                        <Avatar className="w-10 h-10 border-2 border-white/20">
                          <AvatarImage src={friend.avatar} alt={friend.name} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-400 text-white">
                            {friend.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {friend.status === 'online' && (
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-white">{friend.name}</span>
                          <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                            {friend.level}
                          </Badge>
                        </div>
                      </div>
                      {selectedFriends.includes(friend.id) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 flex items-center justify-center"
                        >
                          <Check className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Groups Tab */}
          <TabsContent value="groups" className="mt-0 p-0">
            <ScrollArea className="h-[400px] px-6 py-4">
              {filteredGroups.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No groups found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredGroups.map((group) => (
                    <motion.button
                      key={group.id}
                      onClick={() => toggleGroup(group.id)}
                      className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                        selectedGroups.includes(group.id)
                          ? 'bg-gradient-to-r from-blue-500/20 to-emerald-400/20 border border-blue-500/50'
                          : 'bg-white/5 hover:bg-white/10 border border-transparent'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="text-white mb-1">{group.name}</div>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <span>{group.members} members</span>
                          <span>•</span>
                          <span>{group.topic}</span>
                        </div>
                      </div>
                      {selectedGroups.includes(group.id) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 flex items-center justify-center"
                        >
                          <Check className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-slate-400">
              {totalSelected === 0 ? (
                'Select recipients'
              ) : (
                <span>
                  <span className="text-white">{totalSelected}</span> selected
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-slate-400 hover:text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleShare}
                disabled={totalSelected === 0}
                className="bg-gradient-to-r from-blue-500 to-emerald-400 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
