# 🚶 Step-by-Step Testing Walkthrough

**Don't worry!** This is super simple. We'll test together, one step at a time.

---

## 🎯 Goal
We want to make sure everything works. That's it! No complicated stuff.

---

## 📋 Before We Start

### 1. Make sure your app is running:
```bash
npm run dev
```
You should see: `Local: http://localhost:5173/`

### 2. Open your browser:
Go to: `http://localhost:5173`

### 3. Keep this file open:
We'll test together!

---

## 🟢 STEP 1: Easiest Tests (No API Needed!)

These work right away - no setup required!

### Test 1.1: Feature Flags (2 minutes)

**What we're testing:** Can you turn features on/off?

1. **Look at the left sidebar** in your browser
2. **Click "Feature Flags"** (has a flag icon 🚩)
3. **What you should see:**
   - A table with feature names
   - Dropdown menus next to each feature
   - Options like "active", "preview", "inactive"

4. **Try this:**
   - Find "ideaBoard" in the list
   - Click the dropdown next to it
   - Change it from "preview" to "active"
   - ✅ **Did it change?** Great! That works!

5. **Try one more:**
   - Click "Reset to Defaults" button (usually at top)
   - ✅ **Did it reset?** Perfect!

**✅ If both worked, you're done with Feature Flags!**

---

### Test 1.2: Idea Lab (3 minutes)

**What we're testing:** Can you create and manage ideas?

1. **Click "Idea Lab"** in the sidebar (lightbulb icon 💡)

2. **What you should see:**
   - A board with columns: "New Idea", "In Progress", "Completed"
   - An "Add New Idea" button

3. **Create an idea:**
   - Click "Add New Idea"
   - Fill in:
     - **Title:** "Test Idea"
     - **Description:** "This is a test"
   - Click "Create" or "Add"
   - ✅ **Did a card appear in "New Idea" column?** Great!

4. **Move the idea:**
   - Look for three dots (⋯) on your idea card
   - Click it
   - Select "Move to In Progress"
   - ✅ **Did it move?** Perfect!

5. **Refresh the page (F5):**
   - ✅ **Is your idea still there?** Awesome! It saved!

**✅ If all worked, Idea Lab is good!**

---

### Test 1.3: Mind Map (3 minutes)

**What we're testing:** Can you interact with the mind map?

1. **Click "Mind Map"** in the sidebar (network icon 🕸️)

2. **What you should see:**
   - A canvas with some nodes (circles/bubbles)
   - Maybe "DLX Studios Ultimate" as a center node

3. **Try dragging:**
   - Click and hold a node
   - Drag it around
   - ✅ **Does it move?** Great!

4. **Try zoom:**
   - Look for zoom buttons (+ and -) usually in corner
   - Click the + button
   - ✅ **Does it zoom in?** Perfect!

5. **Add a node:**
   - Look for "Add Node" button
   - Click it
   - ✅ **Did a new node appear?** Awesome!

**✅ If dragging, zooming, and adding work, Mind Map is good!**

---

### Test 1.4: Labs Hub (2 minutes)

**What we're testing:** Can you see and navigate labs?

1. **Click "Labs Hub"** in the sidebar (flask icon ⚗️)

2. **What you should see:**
   - A grid of lab cards
   - Cards like "AURA Interface", "Agent Forge", "Crypto Lab", etc.
   - Status badges (Active, Preview, Coming Soon)

3. **Try filtering:**
   - Look for category buttons at top (AI, Development, Research, System)
   - Click "AI Labs"
   - ✅ **Do only AI labs show?** Great!

4. **Try opening a lab:**
   - Click on "AURA Interface" card
   - ✅ **Does it open?** (Even if it says "coming soon" or needs API, that's OK!)

5. **Go back:**
   - Look for "Back to Labs Hub" or sidebar navigation
   - ✅ **Can you get back?** Perfect!

**✅ If you can navigate and filter, Labs Hub works!**

---

## 🔵 STEP 2: Tests That Need Gemini API

**These need your Gemini API key** (but you can skip these if you don't have one yet!)

### Setting Up Gemini API (One Time):

1. **Get a key:** Go to https://aistudio.google.com/app/apikey
2. **Click "Create API Key"**
3. **Copy the key** (it's a long string)

4. **In your app:**
   - Click "Settings" in sidebar
   - Find "Gemini API" section
   - Paste your key
   - Click "Save"

---

### Test 2.1: AURA Interface (2 minutes)

1. **Go to Labs Hub → AURA Interface**

2. **What you should see:**
   - A chat interface
   - A message input box

3. **Try chatting:**
   - Type: "Hello"
   - Click Send
   - ✅ **Do you get a response?** Great!

**✅ If AURA responds, it works!**

---

### Test 2.2: Agent Forge (3 minutes)

1. **Go to Labs Hub → Agent Forge**

2. **What you should see:**
   - A list of agents (Code Assistant, Research Agent, etc.)
   - An "Add Agent" button

3. **Try chatting with an agent:**
   - Click on "Code Assistant" agent
   - Type a message in the chat
   - ✅ **Does it respond?** Great!

4. **Try creating an agent (optional):**
   - Click "Add Agent"
   - Fill in name and description
   - Save it
   - ✅ **Does it appear in the list?** Perfect!

**✅ If agents work, Agent Forge is good!**

---

### Test 2.3: Code Review Lab (3 minutes)

1. **Go to Labs Hub → Code Review Lab**

2. **What you should see:**
   - A code input area
   - Language selector
   - "Review Code" button

3. **Try reviewing code:**
   - Paste some code (or type: `function test() { return 1; }`)
   - Select language (JavaScript)
   - Click "Review Code"
   - ✅ **Do you get a review?** Great!

**✅ If review appears, Code Review Lab works!**

---

### Test 2.4: Other Labs (Quick Checks)

**Just check if they load:**
- ✅ Crypto Lab - Does it show the interface?
- ✅ Data Weave Lab - Does it load?
- ✅ Signal Lab - Can you see the search box?
- ✅ Creator Studio - Does the prompt input appear?
- ✅ Comms Channel - Can you see the microphone button?
- ✅ Dataverse - Does the knowledge base load?
- ✅ System Matrix - Can you see components?

**If they load without errors, they're working!**

---

## 🟡 STEP 3: Quick Error Tests

**Just to make sure errors are handled nicely:**

### Test 3.1: Invalid API Key

1. Go to Settings → Gemini API
2. Change your key to "test123"
3. Try using AURA Interface
4. ✅ **Do you see a friendly error message?** (Not a crash)

**✅ If you see an error message (not a crash), error handling works!**

---

## ✅ You're Done!

**What to check off:**
- [ ] Feature Flags work
- [ ] Idea Lab works
- [ ] Mind Map works
- [ ] Labs Hub works
- [ ] AURA Interface works (if you have API key)
- [ ] At least 2-3 labs work

**If most things work, you're golden!** 🎉

---

## 🐛 Something Not Working?

**Don't panic!** Just note:
- What you tried
- What happened instead
- Any error messages (check browser console with F12)

**We can fix it together!**

---

## 💡 Pro Tips

1. **Test one thing at a time** - Don't rush!
2. **It's OK if something doesn't work** - That's why we test!
3. **Start with the easy stuff** - Feature Flags, Idea Lab, Mind Map
4. **Save API tests for last** - Those need setup

---

**You've got this! Take your time, and check things off as you go.** 🚀

