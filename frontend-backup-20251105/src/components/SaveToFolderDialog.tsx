import { useState } from 'react';
import { motion } from 'motion/react';
import { Folder, FolderPlus, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';

export interface SavedFolder {
  id: string;
  name: string;
  description?: string;
  contentIds: string[];
  createdAt: Date;
  coverImage?: string;
}

interface SaveToFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folders: SavedFolder[];
  contentId: string;
  onSaveToFolder: (folderId: string) => void;
  onCreateFolder: (name: string, description: string) => void;
}

export function SaveToFolderDialog({
  open,
  onOpenChange,
  folders,
  contentId,
  onSaveToFolder,
  onCreateFolder,
}: SaveToFolderDialogProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    onCreateFolder(newFolderName, newFolderDescription);
    setNewFolderName('');
    setNewFolderDescription('');
    setShowCreateForm(false);
  };

  const handleSaveToFolder = (folderId: string) => {
    onSaveToFolder(folderId);
    onOpenChange(false);
  };

  const isContentInFolder = (folder: SavedFolder) => {
    return folder.contentIds.includes(contentId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-900 dark:text-white">Save to Collection</DialogTitle>
          <DialogDescription className="text-slate-500 dark:text-slate-400">
            Choose a collection or create a new one
          </DialogDescription>
        </DialogHeader>

        {!showCreateForm ? (
          <>
            <ScrollArea className="max-h-96">
              <div className="space-y-2 pr-4">
                {folders.filter(f => f.id !== 'all').map((folder) => {
                  const isSaved = isContentInFolder(folder);
                  
                  return (
                    <motion.div
                      key={folder.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className={`p-4 cursor-pointer transition-all ${
                          isSaved
                            ? 'bg-gradient-to-r from-blue-500/10 to-emerald-400/10 border-blue-500/30 dark:border-blue-400/30'
                            : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10'
                        }`}
                        onClick={() => handleSaveToFolder(folder.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-200 dark:from-slate-700 to-slate-300 dark:to-slate-800 flex items-center justify-center">
                            <Folder className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-slate-900 dark:text-white truncate">{folder.name}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {folder.contentIds.length} items
                            </p>
                          </div>
                          {isSaved && (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-emerald-400 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </ScrollArea>

            <Button
              onClick={() => setShowCreateForm(true)}
              variant="outline"
              className="w-full border-dashed border-2 border-slate-300 dark:border-white/20 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              Create New Collection
            </Button>
          </>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="new-folder-name" className="text-slate-900 dark:text-white">
                Collection Name
              </Label>
              <Input
                id="new-folder-name"
                placeholder="e.g., Physics Lectures, Math Notes..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-folder-description" className="text-slate-900 dark:text-white">
                Description (Optional)
              </Label>
              <Input
                id="new-folder-description"
                placeholder="Brief description"
                value={newFolderDescription}
                onChange={(e) => setNewFolderDescription(e.target.value)}
                className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white"
              />
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewFolderName('');
                  setNewFolderDescription('');
                }}
                className="dark:border-white/10 dark:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
                className="bg-gradient-to-r from-blue-500 to-emerald-400 text-white hover:from-blue-600 hover:to-emerald-500"
              >
                Create & Save
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
