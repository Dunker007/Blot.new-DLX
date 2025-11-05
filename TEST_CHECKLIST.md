# 🧪 Feature Test Checklist

Use this checklist to verify all ported features work correctly.

## ✅ Quick Tests (No API Key Required)

### 1. Feature Flags System
- [ ] Navigate to Feature Flags page
- [ ] See all flags listed in categories
- [ ] Toggle a flag state (e.g., change `ideaBoard` from `preview` to `active`)
- [ ] Verify change persists after page refresh
- [ ] Try "Reset to Defaults" button
- [ ] Use search to filter flags

### 2. Idea Lab
- [ ] Navigate to Idea Lab
- [ ] Click "Add New Idea" button
- [ ] Create an idea with title and description
- [ ] Verify idea appears in "New Idea" column
- [ ] Use menu (three dots) to move idea to different column
- [ ] Delete an idea
- [ ] Verify ideas persist after refresh

### 3. Enhanced Mind Map
- [ ] Navigate to Mind Map
- [ ] See default nodes (DLX Studios Ultimate, Development Tools, AI Features)
- [ ] Click and drag a node
- [ ] Use zoom controls (zoom in/out buttons)
- [ ] Try mouse wheel zoom
- [ ] Click "Add Node" button
- [ ] Verify new node appears
- [ ] Click a node to see info panel
- [ ] Click canvas to deselect

### 4. Labs Hub
- [ ] Navigate to Labs Hub
- [ ] See all 11 labs listed
- [ ] Filter by category (AI, Development, Research, System)
- [ ] Click on "AURA Interface" lab
- [ ] Verify lab opens (shows placeholder if Gemini API not set)
- [ ] Click back to Labs Hub
- [ ] Verify labs with "Coming Soon" status show lock icon

## ⚡ Tests Requiring Gemini API Key

### 5. Task Management
- [ ] Navigate to Task Management
- [ ] Set Gemini API key in Settings → Gemini API
- [ ] Go back to Task Management
- [ ] Choose "Quick Task" mode
- [ ] Enter a simple task: "Write a haiku about coding"
- [ ] Click "EXECUTE"
- [ ] Verify task appears in list with "In Progress..." status
- [ ] Wait for completion, verify status changes to "Complete"
- [ ] See result displayed
- [ ] Try "Intel Analysis" mode
- [ ] Enter query: "What are the benefits of TypeScript?"
- [ ] Verify structured report appears
- [ ] Test search functionality
- [ ] Test filter buttons (All, Complete, In Progress, Failed)

### 6. AURA Interface Lab
- [ ] Navigate to Labs Hub → AURA Interface
- [ ] Verify Gemini API key is set
- [ ] Type a message: "Hello AURA"
- [ ] Click Send
- [ ] Verify AURA responds
- [ ] Continue conversation
- [ ] Verify messages persist during session

### 7. Mind Map Voice Control
- [ ] Navigate to Mind Map
- [ ] Enable "voiceControl" feature flag
- [ ] Refresh page
- [ ] See voice control button (bottom-right)
- [ ] Click microphone button
- [ ] Grant microphone permission if prompted
- [ ] Say: "add node"
- [ ] Verify new node is created
- [ ] Say: "reset"
- [ ] Verify confirmation dialog appears

### 8. WebGL Background (Mind Map)
- [ ] Navigate to Mind Map
- [ ] Enable "webglBackground" feature flag
- [ ] Refresh page
- [ ] Verify animated background appears (instead of static)
- [ ] Click on a node
- [ ] Verify glow effect around selected node
- [ ] Click on canvas
- [ ] Verify ripple effect

## 🐛 Error Handling Tests

### 9. Gemini API Errors
- [ ] Navigate to Settings → Gemini API
- [ ] Enter invalid API key
- [ ] Try Task Management
- [ ] Verify error message appears
- [ ] Try AURA Interface
- [ ] Verify error handling

### 10. LocalStorage Limits
- [ ] Create 100+ ideas in Idea Lab
- [ ] Verify no errors occur
- [ ] Create 50+ tasks
- [ ] Verify performance remains acceptable

## 📊 Performance Tests

- [ ] Open browser DevTools → Network tab
- [ ] Navigate between pages
- [ ] Verify no unnecessary API calls
- [ ] Check bundle size (should be optimized)
- [ ] Test on mobile viewport (responsive design)

## ✅ Success Criteria

All features should:
- ✅ Load without errors
- ✅ Persist data in localStorage
- ✅ Handle errors gracefully
- ✅ Show loading states appropriately
- ✅ Be responsive on mobile
- ✅ Have consistent styling

## 🐛 Common Issues

### Ideas/Tasks not persisting
- Check browser console for errors
- Verify localStorage is enabled
- Try clearing localStorage and starting fresh

### Gemini API not working
- Verify API key is set correctly
- Check API quota in Google AI Studio
- Verify network connectivity

### Voice control not working
- Check browser permissions
- Try Chrome/Edge (best support)
- Verify feature flag is enabled

### WebGL not showing
- Check browser WebGL support
- Verify feature flag is enabled
- Try different browser

---

**Test Date:** _______________
**Tester:** _______________
**Notes:** 

