import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Save, User, GraduationCap, School, BookOpen, Target, Calendar, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback } from './ui/avatar';

interface ProfileEditProps {
  onBack: () => void;
  onSave: (profile: UserProfile) => void;
  currentProfile?: UserProfile;
}

export interface UserProfile {
  name: string;
  email: string;
  major: string;
  school: string;
  year: string;
  bio: string;
  learningGoals: string;
  location: string;
  favoriteSubjects: string[];
}

export function ProfileEdit({ onBack, onSave, currentProfile }: ProfileEditProps) {
  const [profile, setProfile] = useState<UserProfile>(currentProfile || {
    name: '',
    email: '',
    major: '',
    school: '',
    year: '',
    bio: '',
    learningGoals: '',
    location: '',
    favoriteSubjects: []
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      onSave(profile);
      setIsSaving(false);
    }, 1000);
  };

  const majors = [
    'Computer Science',
    'Engineering',
    'Biology',
    'Chemistry',
    'Physics',
    'Mathematics',
    'Business',
    'Economics',
    'Psychology',
    'Sociology',
    'History',
    'English',
    'Other'
  ];

  const years = [
    'Freshman',
    'Sophomore',
    'Junior',
    'Senior',
    'Graduate Student',
    'PhD Candidate',
    'Other'
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-24 pt-6 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            onClick={onBack}
            variant="ghost"
            size="icon"
            className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-slate-900 dark:text-white">Edit Profile</h1>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-blue-500 to-emerald-400 hover:from-blue-600 hover:to-emerald-500 text-white rounded-full"
            >
              {isSaving ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="mr-2"
                  >
                    <Save className="w-4 h-4" />
                  </motion.div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Picture */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-white dark:bg-white/5 backdrop-blur-sm border-slate-200 dark:border-white/10 p-6">
            <div className="flex items-center gap-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative cursor-pointer"
                onClick={() => alert('Photo upload coming soon!')}
              >
                <Avatar className="w-24 h-24 border-4 border-slate-200 dark:border-white/20">
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-3xl">
                    {profile.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'ME'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 flex items-center justify-center border-2 border-white dark:border-slate-900">
                  <User className="w-4 h-4 text-white" />
                </div>
              </motion.div>
              <div className="flex-1">
                <h3 className="text-slate-900 dark:text-white mb-1">Profile Photo</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
                  Click to upload a new photo
                </p>
                <Button
                  onClick={() => alert('Photo upload coming soon!')}
                  variant="outline"
                  size="sm"
                  className="text-slate-600 dark:text-slate-400 border-slate-300 dark:border-white/20"
                >
                  Change Photo
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Basic Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white dark:bg-white/5 backdrop-blur-sm border-slate-200 dark:border-white/10 p-6">
            <h3 className="text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <User className="w-5 h-5" />
              Basic Information
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="mt-1 bg-slate-50 dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  placeholder="your.email@example.com"
                  className="mt-1 bg-slate-50 dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <Label htmlFor="location" className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </Label>
                <Input
                  id="location"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  placeholder="City, State or Country"
                  className="mt-1 bg-slate-50 dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Academic Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white dark:bg-white/5 backdrop-blur-sm border-slate-200 dark:border-white/10 p-6">
            <h3 className="text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <GraduationCap className="w-5 h-5" />
              Academic Information
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="school" className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <School className="w-4 h-4" />
                  School/University
                </Label>
                <Input
                  id="school"
                  value={profile.school}
                  onChange={(e) => setProfile({ ...profile, school: e.target.value })}
                  placeholder="e.g., Stanford University"
                  className="mt-1 bg-slate-50 dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <Label htmlFor="major" className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Major/Field of Study
                </Label>
                <Select value={profile.major} onValueChange={(value) => setProfile({ ...profile, major: value })}>
                  <SelectTrigger className="mt-1 bg-slate-50 dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white">
                    <SelectValue placeholder="Select your major" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-white/10">
                    {majors.map((major) => (
                      <SelectItem key={major} value={major} className="text-slate-900 dark:text-white">
                        {major}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="year" className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Year/Level
                </Label>
                <Select value={profile.year} onValueChange={(value) => setProfile({ ...profile, year: value })}>
                  <SelectTrigger className="mt-1 bg-slate-50 dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white">
                    <SelectValue placeholder="Select your year" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-white/10">
                    {years.map((year) => (
                      <SelectItem key={year} value={year} className="text-slate-900 dark:text-white">
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Learning Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white dark:bg-white/5 backdrop-blur-sm border-slate-200 dark:border-white/10 p-6">
            <h3 className="text-slate-900 dark:text-white flex items-center gap-2 mb-4">
              <Target className="w-5 h-5" />
              Learning Profile
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="bio" className="text-slate-700 dark:text-slate-300">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell us a bit about yourself..."
                  rows={3}
                  className="mt-1 bg-slate-50 dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white resize-none"
                />
              </div>
              <div>
                <Label htmlFor="goals" className="text-slate-700 dark:text-slate-300">Learning Goals</Label>
                <Textarea
                  id="goals"
                  value={profile.learningGoals}
                  onChange={(e) => setProfile({ ...profile, learningGoals: e.target.value })}
                  placeholder="What are your learning objectives? What do you want to achieve?"
                  rows={4}
                  className="mt-1 bg-slate-50 dark:bg-white/5 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white resize-none"
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* AI Personalization Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-blue-500/10 to-emerald-500/10 border-blue-500/20 p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-400 flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-slate-900 dark:text-white mb-2">🤖 AI Personalization</h4>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  Your profile helps our AI tailor content to your learning level and goals. The more details you provide, 
                  the better we can match you with optimal study materials and connect you with peers in similar programs.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
