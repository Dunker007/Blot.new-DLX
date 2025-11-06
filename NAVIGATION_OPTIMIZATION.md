# Navigation Structure Optimization Plan

## Current Issues Identified

### 1. Duplicate Spokes
- `monaco-editor`: appears in both 'home' and 'dev' categories
- `tasks`: appears as both 'tasks' (home) and 'tasks-dev' (dev)
- `dashboard`: appears in both 'home' and 'ai' categories
- `mind-map`: should be in 'ai' only, not 'labs'
- `idea-lab`: appears in both 'labs' and 'dev' categories

### 2. Overlapping Tab Views
- `monaco-editor`: in 'home', 'labs', and 'dev' tabs
- `mind-map`: in 'labs' and 'ai' tabs
- `idea-lab`: in 'labs' and 'dev' tabs
- `tasks`: in 'labs' and 'dev' tabs
- `dashboard`: in 'home' and 'ai' tabs

### 3. Logical Grouping Issues
- Labs tab includes non-lab items (monaco-editor, mind-map, idea-lab, tasks)
- Dev tab overlaps heavily with Labs tab
- AI tab includes dashboard which is odd

## Optimized Structure

### Home Tab
**Purpose:** Core workspace and overview
- Dashboard (AI Command Center)
- Projects
- Connections

### Labs Tab
**Purpose:** All specialized lab experiments
- Labs Hub (main entry)
- Individual labs: aura, forge, review, data-weave, signal, creator, comms, dataverse, system-matrix, crypto

### Revenue Tab
**Purpose:** Revenue-generating features
- Business Generator
- Affiliate Factory
- Crypto Lab (revenue-focused)

### Development Tab
**Purpose:** Development tools
- Monaco Editor (code editor)
- Tasks (project management)
- Idea Lab (concept management)

### AI Tools Tab
**Purpose:** Multi-modal AI tools
- Mind Map
- Audio Transcriber
- Image Analysis

### System Tab
**Purpose:** Configuration and utilities
- Settings
- Feature Flags
- Layout Playground
- Punch List

## Changes to Make

1. Remove duplicate spokes (keep one instance per view)
2. Clean up tab views to remove overlaps
3. Remove 'revenue-dashboard' spoke (redundant with dashboard)
4. Ensure each view appears in only one primary tab
5. Add missing spokes for all labs

