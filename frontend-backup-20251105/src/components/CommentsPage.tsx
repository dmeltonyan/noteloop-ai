import { motion } from 'motion/react';
import { ArrowLeft, Send, Heart, MoreVertical } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { useState } from 'react';

interface CommentsPageProps {
  onBack: () => void;
  clipTitle: string;
  clipUser: string;
  commentsCount: number;
}

const mockComments = [
  {
    id: '1',
    user: 'Taylor Swift',
    avatar: 'TS',
    comment: 'This is such a great explanation! Really helped me understand the concept better 🙌',
    timeAgo: '2h ago',
    likes: 12
  },
  {
    id: '2',
    user: 'Morgan Park',
    avatar: 'MP',
    comment: 'Can you explain the last part again? I\'m a bit confused about the application.',
    timeAgo: '5h ago',
    likes: 5
  },
  {
    id: '3',
    user: 'Casey Davis',
    avatar: 'CD',
    comment: 'Perfect timing! We\'re covering this in class next week 💯',
    timeAgo: '1d ago',
    likes: 8
  },
  {
    id: '4',
    user: 'Riley Brown',
    avatar: 'RB',
    comment: 'Love how you broke this down step by step. Super clear!',
    timeAgo: '1d ago',
    likes: 15
  }
];

export function CommentsPage({ onBack, clipTitle, clipUser, commentsCount }: CommentsPageProps) {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(mockComments);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  const handleSendComment = () => {
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now().toString(),
      user: 'You',
      avatar: 'ME',
      comment: newComment,
      timeAgo: 'Just now',
      likes: 0
    };

    setComments([comment, ...comments]);
    setNewComment('');
  };

  const handleLikeComment = (commentId: string) => {
    setLikedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-24 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button
              onClick={onBack}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 rounded-full flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h2 className="text-white line-clamp-1">{clipTitle}</h2>
              <p className="text-slate-400 text-sm line-clamp-1">by {clipUser}</p>
            </div>
          </div>
          <div className="text-slate-400 text-sm whitespace-nowrap">
            {commentsCount} comments
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {/* Comments List */}
        {comments.map((comment, index) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-4 hover:bg-white/10 transition-colors">
              <div className="flex items-start gap-3">
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    {comment.avatar}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-sm mb-1">{comment.user}</div>
                      <div className="text-slate-400 text-xs">{comment.timeAgo}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-slate-400 hover:text-white hover:bg-white/5 h-8 w-8 flex-shrink-0"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <p className="text-slate-200 text-sm mb-3 break-words">{comment.comment}</p>
                  
                  <motion.button
                    onClick={() => handleLikeComment(comment.id)}
                    className="flex items-center gap-2 group"
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.3 }}
                    >
                      <Heart 
                        className={`w-4 h-4 transition-colors ${
                          likedComments.has(comment.id)
                            ? 'text-red-500 fill-red-500'
                            : 'text-slate-400 group-hover:text-red-400'
                        }`}
                      />
                    </motion.div>
                    <span className={`text-xs ${
                      likedComments.has(comment.id) ? 'text-red-400' : 'text-slate-400'
                    }`}>
                      {comment.likes + (likedComments.has(comment.id) ? 1 : 0)}
                    </span>
                  </motion.button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Comment Input - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-white/10 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Avatar className="w-10 h-10 flex-shrink-0">
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-emerald-400 text-white">
              ME
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 flex gap-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
              placeholder="Add a comment..."
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-full h-12 px-4"
            />
            <Button
              onClick={handleSendComment}
              disabled={!newComment.trim()}
              className="bg-gradient-to-r from-blue-500 to-emerald-400 hover:from-blue-600 hover:to-emerald-500 text-white rounded-full h-12 w-12 flex-shrink-0 p-0"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
