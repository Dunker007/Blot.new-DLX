# 🧪 Testing Guide for Beginners

## What is TEST_CHECKLIST.md?

It's a **manual checklist** - a list of things to test. You go through it step-by-step and check off items as you test them.

**It's NOT a script that runs automatically** - you do the testing yourself!

---

## 🚀 Step-by-Step: How to Test

### Step 1: Start Your App

Open a terminal in the project folder and run:

```bash
npm run dev
```

Wait for it to say something like:
```
  VITE v6.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### Step 2: Open the App in Your Browser

1. Open your web browser (Chrome, Edge, Firefox, etc.)
2. Go to: `http://localhost:5173`
3. You should see the DLX Studios Ultimate app!

### Step 3: Open the Test Checklist

1. Open `TEST_CHECKLIST.md` in your code editor (it's right there in the project)
2. Keep it open while you test

### Step 4: Test Each Feature

#### Example: Testing Feature Flags

**In TEST_CHECKLIST.md, you'll see:**
```
### 1. Feature Flags System
- [ ] Navigate to Feature Flags page
- [ ] See all flags listed in categories
- [ ] Toggle a flag state
```

**What you do:**
1. Look at your browser with the app open
2. Find "Feature Flags" in the sidebar (left side)
3. Click it
4. ✅ Did it work? Check it off in the markdown file!
5. Look at the page - do you see flags listed?
6. ✅ Yes? Check it off!
7. Try changing a flag (use the dropdown)
8. ✅ Works? Check it off!

**That's it!** You just manually test each thing and check it off.

---

## 📝 How to Check Off Items

### In Markdown Files:

**Before testing:**
```markdown
- [ ] Navigate to Feature Flags page
```

**After testing (if it works):**
```markdown
- [x] Navigate to Feature Flags page
```

Just change `[ ]` to `[x]` when something works!

---

## 🎯 Quick Start Testing Order

### Test 1: Feature Flags (Easiest - No API needed)
1. Click "Feature Flags" in sidebar
2. Try toggling some flags
3. Check items off as you go

### Test 2: Idea Lab (Easy - No API needed)
1. Click "Idea Lab" in sidebar
2. Click "Add New Idea"
3. Type a title and description
4. See if it appears
5. Try moving it between columns

### Test 3: Mind Map (Fun - No API needed)
1. Click "Mind Map" in sidebar
2. Try dragging nodes around
3. Use zoom buttons
4. Click "Add Node"

### Test 4: Task Management (Needs Gemini API)
1. First: Go to Settings → Gemini API
2. Enter your API key (get one from https://aistudio.google.com/app/apikey)
3. Go to Task Management
4. Try creating a task

### Test 5: Labs Hub (Check it out)
1. Click "Labs Hub" in sidebar
2. Browse the labs
3. Try clicking "AURA Interface"

---

## 🐛 What If Something Doesn't Work?

### Option 1: Check Browser Console
1. Press `F12` in your browser
2. Click "Console" tab
3. Look for red error messages
4. Copy the error and note it down

### Option 2: Check Terminal
- Look at the terminal where `npm run dev` is running
- Any red errors there?

### Option 3: Common Issues

**"Feature not showing"**
- Check if the feature flag is enabled
- Go to Feature Flags page and set it to "active"

**"Can't connect to API"**
- Make sure you set your Gemini API key in Settings
- Check if you have internet connection

**"Page won't load"**
- Make sure `npm run dev` is still running
- Try refreshing the browser (F5)

---

## ✅ Success Looks Like

When testing goes well:
- ✅ Features load without errors
- ✅ You can interact with them
- ✅ Data saves (refresh page, it's still there)
- ✅ No red errors in console

---

## 💡 Pro Tips

1. **Test one feature at a time** - Don't rush!
2. **Keep TEST_CHECKLIST.md open** - Check items off as you go
3. **Test without API first** - Feature Flags, Idea Lab, Mind Map work without API
4. **Take notes** - If something breaks, write it down
5. **Don't worry if something fails** - That's why we test!

---

## 🎉 You're Done When...

- All checkboxes in the "Quick Tests" section are checked ✅
- You've tested with Gemini API (if you have one)
- You've noted any issues that came up

**Remember:** Testing is just trying things out and seeing if they work. There's no "right" or "wrong" - you're just checking!

---

## 📞 Need Help?

If something doesn't work:
1. Check the browser console (F12)
2. Check the terminal running `npm run dev`
3. Look at TROUBLESHOOTING.md for common fixes
4. Note what happened so we can fix it!

**You've got this!** 🚀

