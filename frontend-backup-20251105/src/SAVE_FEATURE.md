# Save Feature Documentation

## Overview
The Save feature allows users to bookmark lectures, slides, and any learning content for later reference. All saved items are accessible from a dedicated "Saved" section in the user's profile.

## Features Implemented

### 1. Save/Unsave Functionality
- **Location**: Available on every lecture card in the main feed and concept detail pages
- **Icon**: Bookmark icon (filled when saved, outline when not saved)
- **Visual Feedback**: 
  - Animated save button with wiggle effect on click
  - Background color changes when content is saved (blue in feed, yellow in detail view)
  - Toast notifications confirm save/unsave actions
  - Smooth scale animations on hover and tap

### 2. Profile "Saved" Tab
- **Location**: Profile → Saved tab (4th tab in profile navigation)
- **Features**:
  - Grid layout showing all saved content with thumbnails
  - Display content title, topic, duration, and difficulty level
  - Click any saved item to view the full lecture
  - Click the bookmark icon again to remove from saved
  - Empty state when no content is saved
  - Saved count displayed in profile stats

### 3. Share Icons Updated
- **Change**: All share icons throughout the app now use the paper airplane icon (Send component from lucide-react)
- **Locations**:
  - ConceptDetail action buttons
  - SocialLoops shared clips section
  - All other share buttons across the app

## User Flow

### Saving Content
1. User views a lecture in the main feed or concept detail page
2. User clicks the bookmark button (top-right on feed cards, top-left on detail view)
3. Toast notification appears: "Saved for later!"
4. Bookmark icon fills with color and animates
5. Content is added to the "Saved" section in profile

### Viewing Saved Content
1. User navigates to Profile tab
2. User clicks on "Saved" tab
3. All saved lectures appear with full details
4. User can click any saved item to view it
5. User can remove items by clicking the bookmark icon

### Removing Saved Content
1. User clicks the bookmark icon on a saved item (from feed, detail, or profile)
2. Toast notification appears: "Removed from saved"
3. Bookmark icon empties and animates
4. Content is removed from the "Saved" section

## Technical Implementation

### State Management
- `savedContent` array stored in App.tsx
- Passed down to MainFeed, ConceptDetail, and Profile components
- `handleSaveContent` function toggles save state
- `isContentSaved` function checks if content is already saved

### Components Updated
1. **App.tsx**: Added saved content state and handlers
2. **MainFeed.tsx**: Added bookmark button to each content card
3. **ConceptDetail.tsx**: Updated existing bookmark button to use global state
4. **Profile.tsx**: Added "Saved" tab with saved content display
5. **SocialLoops.tsx**: Replaced Share2 with Send icon

### Animations
- Bookmark button scales on hover (1.1x) and tap (1.3x → 0.9x)
- Wiggle animation when saving/unsaving (rotate -10° → 10° → -10° → 0°)
- Background color transitions
- Toast notifications with slide-in animation

## Future Enhancements
- Organize saved content into custom folders/categories
- Search and filter saved content
- Export saved content list
- Share saved collections with other users
- Set reminders to review saved content
