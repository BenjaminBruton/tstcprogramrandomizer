# 🔧 Troubleshooting Guide

## Issue: Black Screen / Can't See Anything

### Quick Fixes:

1. **Open Browser Console** (F12 or Right Click → Inspect → Console)
   - Look for error messages
   - Should see logs like "🚀 Initializing..." and "🔴 DEBUG: Red test cube added"

2. **Check if server is running**
   ```bash
   cd /Users/benjaminbruton/Desktop/RandomSelector
   npm run dev
   ```
   - Should show: `Local: http://localhost:5174/`

3. **Try using mouse to orbit**
   - Click and drag on the canvas
   - Scroll to zoom in/out
   - OrbitControls are now enabled for debugging

4. **What you SHOULD see:**
   - Grid on the ground (purple/gray)
   - Red test cube at center
   - Plinko button (red cylinder with gold ring)
   - Plinko board with pegs behind button

### Console Logs to Expect:

```
🚀 Initializing Rube Goldberg Machine...
Creating scene...
📷 Initial camera position: (0, 10, 25) looking at (0, 3, 0)
🎮 OrbitControls enabled - use mouse to look around
🔴 DEBUG: Red test cube added at (0, 3, 0)
Creating physics world...
Creating state manager...
Creating raycaster...
Creating camera controller...
🎰 Initializing Plinko Machine...
Building Plinko Machine...
Plinko button: Mesh { ... }
✅ Plinko button added to interactive objects
📷 Camera position: Vector3 { x: 0, y: 10, z: 25 }
📦 Scene children count: [some number > 10]
🎬 Starting animation loop...
✅ Initialization complete!
🎞️ First frame rendered!
🎞️ 60 frames rendered - animation loop confirmed
```

### Common Issues:

#### 1. WebGL Not Supported
**Symptom:** Error message about WebGL
**Fix:** Update browser or try a different one (Chrome, Firefox, Edge)

#### 2. JavaScript Errors
**Symptom:** Red errors in console
**Fix:** Check which file has the error, may need to fix imports

#### 3. Still Black Screen with No Errors
**Symptom:** Console logs appear but screen is black
**Fix:** 
- Check canvas element exists: `document.getElementById('three-canvas')`
- Try refreshing (Cmd+Shift+R or Ctrl+Shift+F5)
- Clear browser cache

#### 4. Can't Click Button
**Symptom:** Can see scene but button doesn't respond
**Fix:**
- Button is at position (0, 1, -3)
- Use OrbitControls to pan around and find it
- Should see it pulsing up and down
- Make sure you're in PLINKO_PHASE (check console logs)

### Manual Camera Positioning

If you can't see anything, open console and type:

```javascript
// Get camera
const scene = document.querySelector('canvas').getContext('webgl');

// Or use OrbitControls:
// Left mouse: rotate
// Right mouse: pan
// Scroll: zoom
```

### Check Scene Contents

Open console and type:
```javascript
// This will list all objects in scene
console.table(window.app.sceneSetup.getScene().children.map(c => ({
    type: c.type,
    position: `${c.position.x}, ${c.position.y}, ${c.position.z}`
})));
```

## Getting Help

If none of these work:

1. **Copy ALL console logs** and errors
2. **Take screenshot** of what you see (even if black)
3. **Check browser** - name and version
4. **Try different browser** to rule out browser-specific issues

## Debug Mode

The app now has debug features enabled:
- ✅ Console logging at every step
- ✅ OrbitControls for free camera movement  
- ✅ Red test cube for visual confirmation
- ✅ Frame counter to confirm rendering

Once everything works, we can remove these debug features.
