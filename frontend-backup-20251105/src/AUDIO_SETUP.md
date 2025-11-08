# Audio Setup Guide for NoteLoop AI

## Overview
NoteLoop AI supports lecture audio playback with an interactive volume control system featuring animated soundwave indicators.

## Adding Audio Files

### Option 1: Static Audio Files (Recommended for Demo)
1. Create a `public/audio` directory in your project root
2. Add your MP3 audio files with this naming convention:
   ```
   public/audio/lecture-1.mp3
   public/audio/lecture-2.mp3
   public/audio/lecture-3.mp3
   ```
3. The component will automatically load audio based on the lecture ID

### Option 2: Dynamic Audio URLs
1. Add an `audioUrl` field to the `LearningContent` type in `App.tsx`:
   ```typescript
   export interface LearningContent {
     id: string;
     title: string;
     topic: string;
     level: string;
     duration: number;
     thumbnail: string;
     progress: number;
     difficulty: string;
     audioUrl?: string; // Add this line
   }
   ```

2. Update the audio element in `ConceptDetail.tsx`:
   ```tsx
   <audio ref={audioRef} src={currentLesson.audioUrl || `/audio/lecture-${currentLesson.id}.mp3`}>
   ```

3. Add audio URLs to your content data:
   ```typescript
   const learningContent: LearningContent[] = [
     {
       id: '1',
       title: 'Neural Networks',
       audioUrl: 'https://yourdomain.com/audio/neural-networks.mp3',
       // ... other fields
     }
   ]
   ```

## Creating Lecture Audio

### Using Text-to-Speech (TTS)
Generate natural-sounding lecture audio using AI TTS services:

- **ElevenLabs** (Recommended for quality): https://elevenlabs.io
  - Use "Adam" or "Rachel" voices for educational content
  - Export as MP3, 44.1kHz sample rate

- **Google Cloud Text-to-Speech**: https://cloud.google.com/text-to-speech
  - Use WaveNet or Neural2 voices
  - Export as MP3

- **Amazon Polly**: https://aws.amazon.com/polly
  - Use "Joanna" or "Matthew" neural voices

### Recording Real Audio
1. Record using tools like:
   - Audacity (Free, cross-platform)
   - GarageBand (Mac)
   - Adobe Audition (Professional)

2. Export settings:
   - Format: MP3
   - Bitrate: 128-192 kbps
   - Sample rate: 44.1 kHz
   - Mono (saves file size) or Stereo

3. Keep file sizes manageable:
   - 5-minute lecture ≈ 5-8 MB at 128 kbps
   - 10-minute lecture ≈ 10-15 MB at 128 kbps

## Audio Timing Synchronization

To sync audio with video duration:
1. Set the `duration` field in your `LearningContent` to match audio length (in seconds)
2. The component automatically handles playback and progress tracking

## Testing Audio

1. Add a test audio file: `public/audio/lecture-1.mp3`
2. Navigate to any lecture with `id: '1'`
3. Click play - audio should start
4. Use volume controls to adjust playback

## Volume Control Features

- **3 Soundwave Indicators**: Show volume level visually
  - Bar 1: Active when volume > 0%
  - Bar 2: Active when volume > 33%
  - Bar 3: Active when volume > 66%
- **Animated Waves**: Bars pulse when audio is playing
- **Expandable Slider**: Appears when clicking volume button
- **Auto-collapse**: Slider hides after 2 seconds of inactivity
- **Mute Icon**: Shows when volume is at 0%

## Troubleshooting

### Audio doesn't play
- Check browser console for errors
- Verify audio file path is correct
- Ensure audio format is MP3
- Some browsers block autoplay - user must interact first

### Audio plays but no sound
- Check device volume
- Check browser tab isn't muted
- Verify volume slider is not at 0%

### Audio out of sync
- Verify audio duration matches `duration` field
- Check that audio file isn't corrupted
- Ensure proper sample rate (44.1kHz)

## Browser Compatibility

Supported formats by browser:
- **Chrome/Edge**: MP3, WAV, OGG
- **Firefox**: MP3, WAV, OGG
- **Safari**: MP3, WAV, AAC
- **Recommended**: Use MP3 for universal compatibility

## Production Considerations

1. **CDN Hosting**: Host audio files on a CDN for better performance
2. **Lazy Loading**: Audio is preloaded but not auto-played
3. **File Size**: Compress audio to reduce bandwidth
4. **Fallback**: Include silent/ambient audio as fallback
5. **Accessibility**: Provide transcript alongside audio

## Example Audio Sources

For demo/testing purposes:
- Free music/sounds: https://freesound.org
- Creative Commons audio: https://ccmixter.org
- Podcast audio: Record your own explanations
- TTS services: Generate from lecture transcripts

## Future Enhancements

Potential features to add:
- Playback speed control (0.5x, 1x, 1.5x, 2x)
- 15-second skip forward/backward
- Audio waveform visualization
- Closed captions/subtitles
- Chapter markers for long lectures
- Audio quality selector (lo-fi for slow connections)
