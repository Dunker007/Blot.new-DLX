# DLX Repositories Consolidation Plan

## 🎯 Goal
Consolidate 10 repositories into **1 primary** (DLX-Studios-Ultimate) by extracting unique best features from each.

## 📊 Repository Analysis

### Primary Repository (Keep & Enhance)
**DLX-Studios-Ultimate** ⭐
- ✅ Production-ready server (server.js)
- ✅ LuxRig bridge integration
- ✅ Monaco Editor
- ✅ Multimodal AI (Audio/Image)
- ✅ Basic Mind Map
- ✅ Project Management
- ✅ Local storage (no Supabase)

### Repositories to Extract From

#### 1. **DLX-3.0** → Extract Feature Flags System
**Unique Features:**
- Feature Flag Service (featureFlagService.ts)
- Feature Flag Module UI
- Telemetry integration
- Flag state management (active/preview/comingSoon/inactive)

**Action:** Port feature flag system to Ultimate

#### 2. **DLX-Ultra** → Extract Enhanced Mind Map
**Unique Features:**
- WebGL Background rendering
- Voice Control integration
- Agent Designer node type
- Better node visualization with tasks
- Context menu for nodes
- Side panel with knowledge base
- More sophisticated node connections

**Action:** Replace basic mind map in Ultimate with enhanced version

#### 3. **DLX-Ultra-2** → Extract Lab System & Agents
**Unique Features:**
- 10+ specialized labs (AURA, Agent Forge, Data Weave, Signal Lab, etc.)
- Agent management system
- Ambiance profiles (themes + soundscapes)
- Command Palette (Ctrl+K)
- System Matrix configuration
- Generative backgrounds
- Audio context management

**Action:** Integrate lab system as optional "Labs" view

#### 4. **DLX-Command-Center-LUX-2.0** → Extract Task/Idea Management
**Unique Features:**
- Idea Board (Kanban-style)
- Task execution with Gemini
- Knowledge Base with search
- Notification system
- Task status tracking

**Action:** Port Idea Board and enhanced Task Management

#### 5. **Blot.new-DLX** → Archive (Superseded by Ultimate)
**Status:** Older version of Ultimate
**Action:** Archive/delete after confirming Ultimate has all features

#### 6. **DLX-Cognitive-Co-Pilot** → Delete (Google AI Studio template)
**Status:** Template code, no unique value
**Action:** Delete

#### 7. **DLX-Cognitive-Co-Pilot-** → Delete (Duplicate template)
**Status:** Template code, no unique value
**Action:** Delete

#### 8. **dlxstudios-ai** → Keep Separate (Marketing Site)
**Status:** Static marketing website
**Action:** Keep as separate repo (not a dev tool)

#### 9. **Dunkerlux-shell** → Investigate
**Status:** Unknown
**Action:** Check contents, delete if empty/minimal

## 🚀 Consolidation Steps

### Phase 1: Feature Extraction (Priority Order)
1. ✅ **Feature Flags** from DLX-3.0 → Add to Ultimate
2. ✅ **Enhanced Mind Map** from DLX-Ultra → Replace in Ultimate
3. ✅ **Idea Board** from Command-Center → Add to Ultimate
4. ⏳ **Lab System** from DLX-Ultra-2 → Add as optional module
5. ⏳ **Agent Designer** enhancements → Merge with existing

### Phase 2: Cleanup
1. Archive Blot.new-DLX (create archive branch, then delete)
2. Delete DLX-Cognitive-Co-Pilot repos
3. Delete Dunkerlux-shell if empty
4. Update README to reflect consolidation

### Phase 3: Git Cleanup
1. Create consolidated branch structure
2. Archive old repos (mark as archived in GitHub)
3. Update all documentation

## 📋 Implementation Checklist

- [ ] Port Feature Flag Service
- [ ] Port Feature Flag UI Component
- [ ] Replace Mind Map with enhanced version
- [ ] Port Idea Board component
- [ ] Port Task Management enhancements
- [ ] Integrate Lab System (optional view)
- [ ] Test all integrated features
- [ ] Update documentation
- [ ] Archive/delete duplicate repos
- [ ] Clean up git remotes

## 🎨 Architecture Decisions

**Primary Navigation Structure:**
```
Dashboard (AI Command Center)
├── Workspace
├── Projects
├── Connections
├── Settings
├── [NEW] Labs (from DLX-Ultra-2)
│   ├── AURA Interface
│   ├── Agent Forge
│   ├── Data Weave
│   └── ... (10+ labs)
├── [NEW] Ideas (from Command-Center)
└── [ENHANCED] Mind Map (from DLX-Ultra)
```

**Feature Flags Integration:**
- Control which features are active/preview/comingSoon
- Allow gradual rollout of new features
- A/B testing capabilities
