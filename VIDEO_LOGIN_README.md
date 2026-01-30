# 🎬 Video Background Login - Experimental

## Setup Instructions

### 1. Install Dependencies

First, install the required packages:

```bash
cd apps/mobile
npm install expo-av
```

### 2. Add Your Video File

Copy your video file to the assets folder:

```bash
cp "Timeline 1.mov" apps/mobile/assets/background-video.mov
```

**Important:**
- File must be named `background-video.mov`
- Place it in `apps/mobile/assets/`
- Video plays in slow motion (75% speed) - remove `rate={0.75}` in code for normal speed

### 3. Run the App

```bash
npx expo start --clear
```

Then open the app and go to the login screen!

---

## What's Different?

✅ **Video Background** - Looping video behind login form
✅ **Blur Effect** - BlurView with intensity 60 for that blurry look
✅ **Dark Overlay** - Semi-transparent black for text readability
✅ **White Text** - All text is white with shadow for visibility
✅ **Slow Motion** - Video plays at 75% speed (configurable)

---

## Customization

### Change Blur Intensity

In `login.tsx`, line with `<BlurView>`:
```tsx
<BlurView intensity={60} ... />
// Try values: 20 (subtle), 60 (medium), 100 (heavy)
```

### Change Video Speed

In `login.tsx`, in `<Video>` component:
```tsx
rate={0.75}  // 75% speed (slow-mo)
rate={1.0}   // Normal speed
rate={0.5}   // Super slow
```

### Change Dark Overlay

In `styles.blurOverlay`:
```tsx
backgroundColor: 'rgba(0, 0, 0, 0.4)',  // Current (40% dark)
backgroundColor: 'rgba(0, 0, 0, 0.6)',  // Darker (60%)
backgroundColor: 'rgba(0, 0, 0, 0.2)',  // Lighter (20%)
```

---

## Performance Notes

⚠️ **10MB video** - Will make app bigger and slower to download
⚠️ **Battery drain** - Video backgrounds use more power
⚠️ **Older phones** - May lag on devices with low RAM

### To Compress Video (Optional):

**Using ffmpeg:**
```bash
ffmpeg -i "Timeline 1.mov" -vcodec h264 -acodec aac -b:v 1000k background-video.mov
```

This will compress to ~1MB which is way better!

---

## Remove Video Later

To go back to normal login:
```bash
git checkout main
```

This branch is just for experimentation! 🎉
