# Video Demo Setup Guide for SageSpace

## Quick Start

The landing page now has a beautiful video demo section that showcases SageSpace's key features. Here's how to add your actual demo video:

## Recording Your Demo (Under 2 Minutes)

### Recommended Tools:
- **Loom** (loom.com) - Easy, cloud-hosted, automatic compression
- **OBS Studio** (obsproject.com) - Free, professional-grade recording
- **ScreenFlow** (Mac) or **Camtasia** (Windows) - Paid, polished output

### Demo Script (90-120 seconds):

1. **Intro (10s)**: "Welcome to SageSpace, where 300 AI agents collaborate in real-time"
2. **Hub Overview (15s)**: Show the main dashboard with live metrics
3. **Council Deliberation (25s)**: Start a multi-agent discussion, show results streaming
4. **Memory Lane (15s)**: Navigate through past conversations
5. **Persona Editor (15s)**: Customize a sage quickly
6. **Multiverse (10s)**: Show the social feed
7. **Observatory (10s)**: Highlight agent metrics
8. **Closing (10s)**: "Start your journey today at sagespace.ai"

### Recording Tips:
- Record in 1920x1080 (1080p) minimum
- Use 60fps for smooth animations
- Keep cursor movements smooth and intentional
- Mute desktop notifications
- Use a clean browser window (no tabs/bookmarks showing)

## Adding Your Video

### Step 1: Process Your Video

Convert to multiple formats for browser compatibility:

\`\`\`bash
# Install ffmpeg if needed: brew install ffmpeg (Mac) or download from ffmpeg.org

# Create MP4 (H.264) - widely supported
ffmpeg -i your-recording.mov -c:v libx264 -crf 23 -c:a aac -b:a 128k public/videos/sagespace-demo.mp4

# Create WebM (VP9) - modern browsers, smaller file size
ffmpeg -i your-recording.mov -c:v libvpx-vp9 -crf 30 -b:v 0 -c:a libopus public/videos/sagespace-demo.webm

# Create poster thumbnail
ffmpeg -i your-recording.mov -ss 00:00:03 -vframes 1 -q:v 2 public/videos/demo-thumbnail.jpg
\`\`\`

### Step 2: Upload Your Files

Place these files in your `public/videos/` directory:
- `sagespace-demo.mp4` (primary format)
- `sagespace-demo.webm` (fallback format)
- `demo-thumbnail.jpg` (poster image shown before play)

### Step 3: Update the Video Component

The video is already configured in `app/(marketing)/page.tsx`. Just ensure your files match the paths:

\`\`\`tsx
<video
  className="w-full h-full object-cover"
  controls
  poster="/videos/demo-thumbnail.jpg"  // Your thumbnail
  preload="metadata"
>
  <source src="/videos/sagespace-demo.mp4" type="video/mp4" />
  <source src="/videos/sagespace-demo.webm" type="video/webm" />
</video>
\`\`\`

## Alternative: Use Hosted Video

If you prefer cloud hosting (recommended for faster page loads):

### Option 1: YouTube
1. Upload to YouTube (can be unlisted)
2. Replace the `<video>` element with YouTube embed:

\`\`\`tsx
<iframe
  className="w-full aspect-video"
  src="https://www.youtube.com/embed/YOUR_VIDEO_ID?rel=0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
/>
\`\`\`

### Option 2: Vimeo
1. Upload to Vimeo
2. Use Vimeo embed:

\`\`\`tsx
<iframe
  className="w-full aspect-video"
  src="https://player.vimeo.com/video/YOUR_VIDEO_ID"
  allow="autoplay; fullscreen; picture-in-picture"
  allowFullScreen
/>
\`\`\`

### Option 3: Loom
1. Record directly in Loom
2. Get embed code and use their player

## Optimization Tips

### File Size Targets:
- MP4: Aim for 5-15 MB for a 2-minute video
- WebM: Usually 30-50% smaller than MP4
- Thumbnail: Keep under 200 KB

### CDN Deployment:
For production, consider uploading to:
- **Vercel Blob** (vercel.com/docs/storage/vercel-blob)
- **Cloudflare Stream** (cloudflare.com/products/stream)
- **AWS S3 + CloudFront**

## Current Setup

The video section includes:
- ✅ Responsive aspect ratio (16:9)
- ✅ Multiple format support (MP4 + WebM)
- ✅ Poster image/thumbnail
- ✅ Fallback content for unsupported browsers
- ✅ Glowing border animations
- ✅ Feature highlights below video
- ✅ Quick stats showcase
- ✅ Mobile-optimized controls

## Testing Checklist

Before going live:
- [ ] Video plays on Chrome, Firefox, Safari, Edge
- [ ] Mobile playback works (iOS Safari, Android Chrome)
- [ ] Poster image displays before play
- [ ] Controls are accessible
- [ ] File sizes are reasonable (< 20MB total)
- [ ] Video quality is clear at 1080p
- [ ] Audio is balanced and clear
- [ ] Loading time is acceptable

## Next Steps

1. Record your 2-minute demo following the script above
2. Process video files using ffmpeg or your preferred tool
3. Upload to `public/videos/` or your chosen CDN
4. Test on multiple devices and browsers
5. Monitor page load performance
6. Consider adding captions for accessibility

Your video demo section is ready to go! Just drop in your video files and watch engagement soar. 🚀
