import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Upload, FileText, Image, FileCode, Check, Loader2, X, Tag, Lock, BookOpen, Presentation, Brain, Sparkles, Eye, Play, Heart, Zap, TrendingUp, Clock } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface UploadHubProps {
  onBack: () => void;
  onUploadComplete?: () => void;
}

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: string;
  status: 'uploading' | 'processing' | 'complete';
  progress: number;
  tags: string[];
}

const mockProcessedFiles: UploadedFile[] = [
  {
    id: '1',
    name: 'Machine Learning Notes.pdf',
    type: 'pdf',
    size: '2.4 MB',
    status: 'complete',
    progress: 100,
    tags: ['Machine Learning', 'Lecture 3', 'Neural Networks']
  },
  {
    id: '2',
    name: 'Chemistry Lab Report.docx',
    type: 'docx',
    size: '1.8 MB',
    status: 'complete',
    progress: 100,
    tags: ['Chemistry', 'Lab 5', 'Organic']
  }
];

export function UploadHub({ onBack, onUploadComplete }: UploadHubProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(mockProcessedFiles);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [loginModal, setLoginModal] = useState<string | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showPreviewDemo, setShowPreviewDemo] = useState(false);

  const processingSteps = [
    'Reading notes...',
    'Extracting concepts...',
    'Generating clips...',
    'Complete!'
  ];

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newFile: UploadedFile = {
      id: Date.now().toString(),
      name: files[0].name,
      type: files[0].name.split('.').pop() || 'file',
      size: `${(files[0].size / 1024 / 1024).toFixed(1)} MB`,
      status: 'uploading',
      progress: 0,
      tags: []
    };

    setUploadedFiles([newFile, ...uploadedFiles]);
    setIsProcessing(true);
    setProcessingStep(0);

    // Simulate upload and processing
    let progress = 0;
    let step = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress > 100) {
        clearInterval(interval);
        setUploadedFiles(files => 
          files.map(f => 
            f.id === newFile.id 
              ? { ...f, status: 'complete', progress: 100, tags: ['Auto-tagged', 'New Topic'] }
              : f
          )
        );
        setIsProcessing(false);
        return;
      }

      if (progress % 33 === 0 && step < 3) {
        step++;
        setProcessingStep(step);
      }

      setUploadedFiles(files => 
        files.map(f => 
          f.id === newFile.id 
            ? { ...f, progress, status: progress > 30 ? 'processing' : 'uploading' }
            : f
        )
      );
    }, 300);
  };

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf': return FileText;
      case 'docx': case 'doc': return FileCode;
      case 'png': case 'jpg': case 'jpeg': return Image;
      default: return FileText;
    }
  };

  const handleServiceLogin = (serviceName: string) => {
    // This would normally trigger OAuth flow
    console.log(`Logging in to ${serviceName}...`);
    setTimeout(() => {
      setLoginModal(null);
      // Here you would handle the actual OAuth connection
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pb-20 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="text-white">Create Your Loop</div>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative rounded-3xl border-2 border-dashed transition-all ${
            isDragging
              ? 'border-blue-400 bg-blue-500/10'
              : 'border-slate-600 hover:border-slate-500'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFileUpload(e.dataTransfer.files);
          }}
        >
          <div className="p-12 text-center">
            <motion.div
              className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-emerald-400 flex items-center justify-center mx-auto mb-6"
              animate={{
                scale: isDragging ? 1.1 : 1,
              }}
            >
              <Upload className="w-10 h-10 text-white" />
            </motion.div>

            <h3 className="text-2xl text-white mb-2">Upload Notes or Slides</h3>
            <p className="text-slate-400 mb-6">
              Drag and drop files here or click to browse
            </p>

            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {['PDF', 'DOCX', 'PPTX', 'PNG', 'JPG'].map((format) => (
                <Badge
                  key={format}
                  variant="secondary"
                  className="bg-white/10 text-slate-300 border-white/20"
                >
                  {format}
                </Badge>
              ))}
            </div>

            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".pdf,.docx,.pptx,.png,.jpg,.jpeg"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
            <Button
              onClick={() => document.getElementById('file-upload')?.click()}
              className="bg-gradient-to-r from-blue-500 to-emerald-400 hover:from-blue-600 hover:to-emerald-500 text-white rounded-full px-8"
            >
              Choose Files
            </Button>
          </div>
        </motion.div>

        {/* Processing Animation */}
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 className="w-5 h-5 text-blue-400" />
                </motion.div>
                <span className="text-white">{processingSteps[processingStep]}</span>
              </div>
            </div>
            <Progress value={(processingStep / processingSteps.length) * 100} />
          </motion.div>
        )}

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h3 className="text-xl text-white">Your Uploads</h3>
            </div>

            <div className="space-y-3">
              {uploadedFiles.map((file) => (
                <FileCard 
                  key={file.id} 
                  file={file}
                  onGenerateFeed={() => setShowGenerateModal(true)}
                  onPreview={() => setShowPreviewDemo(true)}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Quick Import Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
        >
          <h3 className="text-lg text-white mb-4">Quick Import</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { name: 'Google Drive', icon: '📁' },
              { name: 'Notion', icon: '📝' },
              { name: 'Canvas', icon: '🎓' }
            ].map((service) => (
              <motion.button
                key={service.name}
                onClick={() => setLoginModal(service.name)}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-left"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-2xl mb-2">{service.icon}</div>
                <div className="text-white text-sm">{service.name}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Login Modal */}
      <AnimatePresence>
        {loginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setLoginModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 border border-white/10 rounded-3xl p-8 max-w-md w-full"
            >
              <div className="text-center">
                {/* Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-emerald-400 flex items-center justify-center mx-auto mb-6"
                >
                  <Lock className="w-10 h-10 text-white" />
                </motion.div>

                <h2 className="text-2xl text-white mb-2">Connect {loginModal}</h2>
                <p className="text-slate-400 text-sm mb-8">
                  Sign in to your {loginModal} account to import your notes
                </p>

                {/* Login Form */}
                <div className="space-y-4 mb-6">
                  <Input
                    type="email"
                    placeholder="Email"
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl h-12"
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl h-12"
                  />
                </div>

                <div className="space-y-3">
                  <Button
                    onClick={() => handleServiceLogin(loginModal)}
                    className="w-full bg-gradient-to-r from-blue-500 to-emerald-400 hover:from-blue-600 hover:to-emerald-500 text-white rounded-full h-12"
                  >
                    Connect {loginModal}
                  </Button>
                  <Button
                    onClick={() => setLoginModal(null)}
                    variant="ghost"
                    className="w-full text-slate-400 hover:text-white hover:bg-white/5 rounded-full h-12"
                  >
                    Cancel
                  </Button>
                </div>

                <p className="text-xs text-slate-500 mt-6">
                  We'll only access your files with your permission
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Demo Modal */}
      <AnimatePresence>
        {showPreviewDemo && (
          <ContentPreviewDemo 
            onClose={() => setShowPreviewDemo(false)}
            fileName={uploadedFiles[0]?.name || 'Your Notes'}
          />
        )}
      </AnimatePresence>

      {/* Generate Learning Feed Modal */}
      <AnimatePresence>
        {showGenerateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowGenerateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 border border-white/10 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between mb-6 gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-white mb-2 line-clamp-1">Choose Your Learning Style</h2>
                  <p className="text-slate-400 text-sm line-clamp-1">Select how you want to learn from your notes</p>
                </div>
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Option 1: Simplified Notes */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowGenerateModal(false);
                    onUploadComplete?.();
                  }}
                  className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-2 border-blue-500/30 rounded-2xl p-6 cursor-pointer hover:border-blue-500/60 transition-all group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-white mb-2 line-clamp-1">Simplified Notes</h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-3 leading-relaxed">
                    Get your notes broken down into easy-to-understand explanations with key concepts highlighted
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                      Best for Review
                    </Badge>
                  </div>
                </motion.div>

                {/* Option 2: Visual Slideshows */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowGenerateModal(false);
                    onUploadComplete?.();
                  }}
                  className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border-2 border-emerald-500/30 rounded-2xl p-6 cursor-pointer hover:border-emerald-500/60 transition-all group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Presentation className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl text-white mb-2">Visual Slideshows</h3>
                  <p className="text-slate-400 text-sm mb-4">
                    Interactive slide-by-slide visual presentations with explanations and diagrams
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs">
                      Visual Learners
                    </Badge>
                  </div>
                </motion.div>

                {/* Option 3: Full Quiz */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setShowGenerateModal(false);
                    onUploadComplete?.();
                  }}
                  className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-2 border-purple-500/30 rounded-2xl p-6 cursor-pointer hover:border-purple-500/60 transition-all group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl text-white mb-2">Interactive Quiz</h3>
                  <p className="text-slate-400 text-sm mb-4">
                    Comprehensive quiz covering all your notes with detailed explanations and feedback
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                      Test Knowledge
                    </Badge>
                  </div>
                </motion.div>
              </div>

              <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <p className="text-sm text-slate-300 text-center">
                  💡 <span className="text-white">Pro Tip:</span> You can switch between learning styles anytime in your feed
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface FileCardProps {
  file: UploadedFile;
  onGenerateFeed: () => void;
  onPreview: () => void;
}

function FileCard({ file, onGenerateFeed, onPreview }: FileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tags, setTags] = useState(file.tags);
  const [newTag, setNewTag] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const Icon = getFileIcon(file.type);

  const addTag = () => {
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleViewOriginal = () => {
    // In a real app, this would open the actual file
    window.open(`/files/${file.name}`, '_blank');
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => file.status === 'complete' && setShowOptions(true)}
        className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 transition-colors ${
          file.status === 'complete' ? 'cursor-pointer hover:bg-white/10 hover:border-white/20' : ''
        }`}
      >
        <div className="flex items-start gap-4">
          {/* File Icon */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-400 flex items-center justify-center flex-shrink-0">
            <Icon className="w-6 h-6 text-white" />
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="text-white truncate">{file.name}</h4>
                <p className="text-sm text-slate-400">{file.size}</p>
              </div>
              {file.status === 'complete' && (
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Progress Bar */}
            {file.status !== 'complete' && (
              <div className="mb-3">
                <Progress value={file.progress} className="h-1" />
                <p className="text-xs text-slate-400 mt-1">
                  {file.status === 'uploading' ? 'Uploading...' : 'Processing...'}
                </p>
              </div>
            )}

            {/* Tags */}
            {file.status === 'complete' && (
              <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2 flex-wrap">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      className="bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30 group"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    + Add tag
                  </button>
                </div>

                {isEditing && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex gap-2"
                  >
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      placeholder="Enter tag name"
                      className="bg-white/5 border-white/10 text-white"
                    />
                    <Button
                      onClick={addTag}
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      Add
                    </Button>
                  </motion.div>
                )}
              </div>
            )}

            {/* Click hint for completed files */}
            {file.status === 'complete' && (
              <p className="text-xs text-slate-500 mt-2">Click to view options</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* File Options Modal */}
      <AnimatePresence>
        {showOptions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowOptions(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 border border-white/10 rounded-3xl p-8 max-w-md w-full"
            >
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-400 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white mb-1 truncate">{file.name}</h3>
                  <p className="text-sm text-slate-400">{file.size}</p>
                </div>
                <button
                  onClick={() => setShowOptions(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {/* View Original File */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    handleViewOriginal();
                    setShowOptions(false);
                  }}
                  className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                      <Eye className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-white mb-1">View Original File</h4>
                      <p className="text-xs text-slate-400">Open the {file.type.toUpperCase()} file</p>
                    </div>
                  </div>
                </motion.button>

                {/* Preview Content */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onPreview();
                    setShowOptions(false);
                  }}
                  className="w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                      <Play className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-white mb-1">Preview Content</h4>
                      <p className="text-xs text-slate-400">See AI-generated clips</p>
                    </div>
                  </div>
                </motion.button>

                {/* Generate Feed */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    onGenerateFeed();
                    setShowOptions(false);
                  }}
                  className="w-full p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-emerald-400/10 hover:from-blue-500/20 hover:to-emerald-400/20 border-2 border-blue-500/30 hover:border-blue-500/50 transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white mb-1">Generate Learning Feed</h4>
                      <p className="text-xs text-slate-400">Create TikTok-style video clips</p>
                    </div>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function getFileIcon(type: string) {
  switch (type.toLowerCase()) {
    case 'pdf': return FileText;
    case 'docx': case 'doc': return FileCode;
    case 'png': case 'jpg': case 'jpeg': return Image;
    default: return FileText;
  }
}

// Content Preview Demo Component
interface ContentPreviewDemoProps {
  onClose: () => void;
  fileName: string;
}

function ContentPreviewDemo({ onClose, fileName }: ContentPreviewDemoProps) {
  const [currentCard, setCurrentCard] = useState(0);

  const generatedContent = [
    {
      id: '1',
      title: 'Introduction to Neural Networks',
      concept: 'Neural networks are computing systems inspired by biological neural networks in animal brains',
      difficulty: 'i',
      duration: '2:30',
      thumbnail: 'https://images.unsplash.com/photo-1664526936810-ec0856d31b92?w=800&q=80',
      keyPoints: [
        'Mimics brain structure',
        'Consists of interconnected nodes',
        'Processes information in layers'
      ],
      views: '2.4k',
      likes: 342
    },
    {
      id: '2',
      title: 'How Neural Networks Learn',
      concept: 'Neural networks learn by adjusting weights through backpropagation and gradient descent',
      difficulty: 'i+1',
      duration: '3:15',
      thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
      keyPoints: [
        'Weights adjust during training',
        'Uses backpropagation algorithm',
        'Minimizes error through gradient descent'
      ],
      views: '1.8k',
      likes: 289
    },
    {
      id: '3',
      title: 'Activation Functions Explained',
      concept: 'Activation functions determine whether a neuron should be activated, introducing non-linearity',
      difficulty: 'i+1',
      duration: '2:45',
      thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80',
      keyPoints: [
        'ReLU is most common',
        'Sigmoid for binary classification',
        'Introduces non-linearity to the model'
      ],
      views: '3.1k',
      likes: 421
    },
    {
      id: '4',
      title: 'Deep Learning Architecture',
      concept: 'Deep neural networks have multiple hidden layers, enabling complex pattern recognition',
      difficulty: 'i+2',
      duration: '4:00',
      thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
      keyPoints: [
        'Multiple hidden layers',
        'Hierarchical feature learning',
        'Powers modern AI applications'
      ],
      views: '1.2k',
      likes: 178
    }
  ];

  const flashcards = [
    {
      term: 'Neural Network',
      definition: 'A computing system inspired by biological neural networks that consists of interconnected nodes organized in layers',
      difficulty: 'i'
    },
    {
      term: 'Backpropagation',
      definition: 'An algorithm used to train neural networks by calculating gradients and adjusting weights to minimize error',
      difficulty: 'i+1'
    },
    {
      term: 'Activation Function',
      definition: 'A mathematical function that determines the output of a neural network node, introducing non-linearity',
      difficulty: 'i+1'
    }
  ];

  const extractedConcepts = [
    { name: 'Neurons & Nodes', count: 12, difficulty: 'i' },
    { name: 'Weights & Biases', count: 8, difficulty: 'i+1' },
    { name: 'Training Process', count: 15, difficulty: 'i+1' },
    { name: 'Deep Learning', count: 6, difficulty: 'i+2' }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'i': return 'from-emerald-500 to-teal-500';
      case 'i+1': return 'from-blue-500 to-cyan-500';
      case 'i+2': return 'from-purple-500 to-pink-500';
      default: return 'from-slate-500 to-slate-600';
    }
  };

  const getDifficultyBadgeColor = (difficulty: string) => {
    switch (difficulty) {
      case 'i': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'i+1': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'i+2': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 overflow-y-auto custom-scrollbar"
      onClick={onClose}
    >
      <div className="min-h-screen p-4 md:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl text-white mb-2">AI-Generated Learning Content</h1>
              <p className="text-slate-400">Preview of content generated from: <span className="text-blue-400">{fileName}</span></p>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white hover:bg-white/10 rounded-full"
            >
              <X className="w-6 h-6" />
            </Button>
          </motion.div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Original Notes Preview */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1 space-y-6"
            >
              {/* Original Notes */}
              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-white/10 p-6">
                <h3 className="text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  Original Notes
                </h3>
                <div className="rounded-xl overflow-hidden border border-white/10 mb-4">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1612414982194-981a9de93860?w=800&q=80"
                    alt="Handwritten notes"
                    className="w-full h-64 object-cover"
                  />
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-400">
                    <span>Pages Analyzed</span>
                    <span className="text-white">12</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Concepts Extracted</span>
                    <span className="text-white">41</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Processing Time</span>
                    <span className="text-white">34s</span>
                  </div>
                </div>
              </Card>

              {/* Extracted Concepts */}
              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-white/10 p-6">
                <h3 className="text-white mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  Extracted Concepts
                </h3>
                <div className="space-y-3">
                  {extractedConcepts.map((concept, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${getDifficultyColor(concept.difficulty)}`} />
                        <span className="text-white">{concept.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${getDifficultyBadgeColor(concept.difficulty)}`}>
                          {concept.difficulty}
                        </Badge>
                        <span className="text-slate-400 text-sm">{concept.count}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Card>

              {/* Generated Flashcards Preview */}
              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-white/10 p-6">
                <h3 className="text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Generated Flashcards
                </h3>
                <div className="space-y-3">
                  {flashcards.map((card, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-white">{card.term}</h4>
                        <Badge className={`text-xs ${getDifficultyBadgeColor(card.difficulty)}`}>
                          {card.difficulty}
                        </Badge>
                      </div>
                      <p className="text-slate-300 text-sm">{card.definition}</p>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <span className="text-slate-400 text-sm">+ 18 more flashcards</span>
                </div>
              </Card>
            </motion.div>

            {/* Right Column - TikTok-Style Feed Preview */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-white/10 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white flex items-center gap-2">
                    <Play className="w-5 h-5 text-emerald-400" />
                    TikTok-Style Learning Feed Preview
                  </h3>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                    {generatedContent.length} Clips Generated
                  </Badge>
                </div>

                {/* Feed Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {generatedContent.map((content, index) => (
                    <motion.div
                      key={content.id}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="group cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setCurrentCard(index)}
                    >
                      <div className={`rounded-2xl overflow-hidden border-2 transition-all ${
                        currentCard === index 
                          ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
                          : 'border-white/10 hover:border-white/20'
                      }`}>
                        {/* Thumbnail */}
                        <div className="relative aspect-video">
                          <ImageWithFallback
                            src={content.thumbnail}
                            alt={content.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          
                          {/* Difficulty Badge */}
                          <div className="absolute top-3 right-3">
                            <Badge className={`${getDifficultyBadgeColor(content.difficulty)}`}>
                              {content.difficulty}
                            </Badge>
                          </div>

                          {/* Duration */}
                          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
                            <Clock className="w-3 h-3 text-white" />
                            <span className="text-white text-xs">{content.duration}</span>
                          </div>

                          {/* Play Button */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center">
                              <Play className="w-7 h-7 text-white ml-1" />
                            </div>
                          </div>
                        </div>

                        {/* Content Info */}
                        <div className="p-4 bg-slate-900/50">
                          <h4 className="text-white mb-2 line-clamp-1">{content.title}</h4>
                          <p className="text-slate-400 text-sm mb-3 line-clamp-2">{content.concept}</p>
                          
                          {/* Stats */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-sm">
                              <span className="flex items-center gap-1 text-slate-400">
                                <TrendingUp className="w-4 h-4" />
                                {content.views}
                              </span>
                              <span className="flex items-center gap-1 text-slate-400">
                                <Heart className="w-4 h-4" />
                                {content.likes}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Selected Card Details */}
                <motion.div
                  key={currentCard}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getDifficultyColor(generatedContent[currentCard].difficulty)} flex items-center justify-center flex-shrink-0`}>
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white mb-1">{generatedContent[currentCard].title}</h4>
                      <p className="text-slate-300 text-sm">{generatedContent[currentCard].concept}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-white text-sm">Key Learning Points:</h5>
                    {generatedContent[currentCard].keyPoints.map((point, index) => (
                      <motion.div
                        key={index}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-2"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                        <span className="text-slate-300 text-sm">{point}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* AI Insights */}
                <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-emerald-300 text-sm mb-1">AI Learning Optimization</p>
                      <p className="text-slate-300 text-sm">
                        Content has been automatically organized by difficulty using Krashen's i+1 model. 
                        Start with <span className="text-emerald-400">i</span> level content for foundational knowledge, 
                        then progress to <span className="text-blue-400">i+1</span> and <span className="text-purple-400">i+2</span> 
                        as you master each concept.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex items-center justify-center gap-4"
          >
            <Button
              onClick={onClose}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 rounded-full px-8"
            >
              Close Preview
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-500 to-emerald-400 hover:from-blue-600 hover:to-emerald-500 text-white rounded-full px-8"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Start Learning
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
