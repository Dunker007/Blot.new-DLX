# Hybrid Cloud Integration Guide

Complete guide to DLX Studios' seamless .diy + bolt.new synchronization, project migration, cloud backup, and multi-environment deployment.

## Overview

The Hybrid Cloud Integration enables you to work across both local (.diy) and cloud (bolt.new) environments with automatic synchronization, conflict resolution, and backup capabilities. This system ensures your projects are always accessible, protected, and deployable to any environment.

## Core Features

### 1. **Seamless .diy + bolt.new Sync**
- Bidirectional project synchronization
- Real-time conflict detection and resolution
- Automatic change tracking
- Smart merge strategies

### 2. **Project Migration Tools**
- One-click project transfers
- Preserve all conversations and messages
- Maintain project structure and metadata
- Import/export in standardized JSON format

### 3. **Cloud Backup & Restore**
- Automated backup snapshots
- Point-in-time restoration
- Incremental and full backup support
- Backup history and management

### 4. **Multi-Environment Deployment**
- Deploy to local, dev, staging, and production
- Environment-specific configurations
- Deployment history tracking
- Rollback capabilities

## Getting Started

### Prerequisites

- Active Supabase account (for cloud storage)
- LM Studio or Ollama (for local AI providers)
- Node.js proxy server (for hybrid mode)

### Initial Setup

1. **Enable Hybrid Mode**
   ```bash
   # Start the local proxy server
   node local-proxy-server.js
   ```

2. **Configure Local Providers**
   - Settings → Providers & Models
   - Verify LM Studio/Ollama connection
   - Test provider availability

3. **Activate Sync**
   - Navigate to Hybrid Mode Panel
   - Toggle "Enable Hybrid Mode"
   - Verify local providers are connected

## Bidirectional Synchronization

### How It Works

The sync system maintains project consistency across environments by:

1. **Change Detection**: Monitors modifications to projects, conversations, and messages
2. **Hash Comparison**: Uses content hashing to detect differences
3. **Conflict Resolution**: Presents conflicts for manual or automatic resolution
4. **Merge Strategies**: Applies smart merging when appropriate

### Sync Modes

#### Upload Mode
Pushes local changes to the cloud.

```typescript
// Programmatic usage
const result = await projectSyncService.bidirectionalSync('upload');
```

**Use When:**
- You've made changes locally
- Want to backup to cloud
- Sharing projects with team

**UI Access:**
- Hybrid Mode Panel → Project Sync → Upload ↑

#### Download Mode
Pulls cloud changes to local environment.

```typescript
const result = await projectSyncService.bidirectionalSync('download');
```

**Use When:**
- Accessing projects from new device
- Restoring from cloud backup
- Pulling team updates

**UI Access:**
- Hybrid Mode Panel → Project Sync → Download ↓

#### Bidirectional Mode
Syncs changes in both directions with conflict detection.

```typescript
const result = await projectSyncService.bidirectionalSync('bidirectional');
```

**Use When:**
- Working across multiple devices
- Collaborating with team
- Want automatic sync

**UI Access:**
- Hybrid Mode Panel → Project Sync → Bi-Sync ⇄

### Sync Results

After each sync, you'll receive detailed results:

```typescript
interface SyncResult {
  success: boolean;
  projectsUploaded: number;
  projectsDownloaded: number;
  conversationsUploaded: number;
  conversationsDownloaded: number;
  conflicts: SyncConflict[];
  errors: string[];
  timestamp: Date;
}
```

**Example Output:**
```
✓ Sync Complete!
↑ 3 project(s) uploaded
↓ 1 project(s) downloaded
⚠ 0 conflicts detected
```

## Conflict Resolution

### Types of Conflicts

1. **Project Conflicts**: Same project modified in both environments
2. **Conversation Conflicts**: Different conversation updates
3. **Message Conflicts**: Divergent message histories

### Resolution Strategies

#### Local Wins
```typescript
await projectSyncService.resolveConflict(conflict, 'local');
```
- Uses local version
- Updates cloud with local changes
- Best when local is authoritative

#### Cloud Wins
```typescript
await projectSyncService.resolveConflict(conflict, 'cloud');
```
- Uses cloud version
- Overwrites local with cloud changes
- Best when cloud is authoritative

#### Smart Merge
```typescript
await projectSyncService.resolveConflict(conflict, 'merge');
```
- Combines both versions
- Preserves unique changes from each
- Marks as merged for review

### Conflict UI

Conflicts are displayed in the sync result:

```
⚠ Sync Issues
⚠ 2 conflict(s) detected
```

**Resolution Process:**
1. Review conflicting items
2. Choose resolution strategy
3. Apply resolution
4. Re-sync to confirm

## Project Migration

### Export Projects

#### Full Export
Includes all project data, conversations, and messages.

```typescript
const blob = await projectSyncService.exportProject(projectId, 'full');
```

**Contains:**
- Project metadata
- All conversations
- All messages
- Export timestamp
- Version information

#### Conversation Only
Exports just the conversation data.

```typescript
const blob = await projectSyncService.exportProject(projectId, 'conversation_only');
```

**Contains:**
- Project basic info
- Conversation threads
- Message history

#### Incremental Export
Exports changes since last export.

```typescript
const blob = await projectSyncService.exportProject(projectId, 'incremental');
```

### Import Projects

Import projects from JSON files:

```typescript
const file = /* File from input */;
const project = await projectSyncService.importProject(file);
```

**Process:**
1. Validates export format
2. Creates new project (renamed as "Imported")
3. Restores all conversations
4. Rebuilds message threads
5. Maintains relationships

**UI Access:**
- Projects → Import Project
- Drag & drop JSON file
- Automatic restoration

### Project Cloning

Duplicate projects within the same environment:

```typescript
const clonedProject = await projectSyncService.cloneProject(projectId);
```

**Creates:**
- New project with "(Copy)" suffix
- Independent copy of all data
- Fresh IDs for all items
- Separate conversation history

## Cloud Backup System

### Creating Backups

#### Manual Backup
```typescript
const snapshot = await projectSyncService.createBackup(
  projectId,
  'Pre-deployment backup'
);
```

**Snapshot Contains:**
```typescript
{
  id: string;
  projectId: string;
  name: string;
  timestamp: Date;
  size: number;
  itemCount: number;
  metadata: {...};
}
```

#### Automatic Backups

Backups are automatically created:
- Before major sync operations
- Prior to deployments
- On project export
- Scheduled intervals (configurable)

### Listing Backups

```typescript
const backups = await projectSyncService.listBackups(projectId);
```

**Backup List Shows:**
- Backup name
- Creation timestamp
- Data size
- Item count
- Quick restore option

### Restoring Backups

```typescript
const restoredProject = await projectSyncService.restoreBackup(backupId);
```

**Restore Process:**
1. Deletes current conversations
2. Restores conversation structure
3. Rebuilds message threads
4. Maintains conversation IDs mapping
5. Preserves message order

**Important Notes:**
- Restoration overwrites current data
- Creates automatic backup before restore
- Cannot be undone (without another restore)
- Maintains project ID

### Backup Management

**Best Practices:**
1. Name backups descriptively
2. Create before major changes
3. Review backup history regularly
4. Clean up old backups periodically
5. Test restore process occasionally

## Multi-Environment Deployment

### Available Environments

#### Local Development
```typescript
{
  type: 'local',
  name: 'Local Dev',
  url: 'http://localhost:5173',
  status: 'active'
}
```

#### Development Server
```typescript
{
  type: 'development',
  name: 'Dev Server',
  url: 'https://dev.example.com',
  status: 'active'
}
```

#### Staging Environment
```typescript
{
  type: 'staging',
  name: 'Staging',
  url: 'https://staging.example.com',
  status: 'inactive'
}
```

#### Production
```typescript
{
  type: 'production',
  name: 'Production',
  url: 'https://app.example.com',
  status: 'active'
}
```

### Deploying Projects

```typescript
const result = await projectSyncService.deployToEnvironment(
  projectId,
  environment
);
```

**Deployment Process:**
1. Creates full export
2. Validates project integrity
3. Records deployment metadata
4. Initiates deployment
5. Updates deployment status
6. Returns deployment URL

**Result:**
```typescript
{
  success: true,
  url: 'https://production.example.com',
  deploymentId: '...'
}
```

### Deployment History

Track all deployments:

```typescript
const history = await projectSyncService.getDeploymentHistory(projectId);
```

**History Includes:**
- Deployment timestamp
- Target environment
- Deployment status
- Deployed by
- Version/commit info
- Rollback availability

### Environment Configuration

**Per-Environment Settings:**
- API endpoints
- Feature flags
- Resource limits
- Access controls
- Monitoring configs

## Advanced Features

### Sync Status Monitoring

Real-time sync status for each project:

```typescript
const status = await projectSyncService.getSyncStatus(projectId);
```

**Status Response:**
```typescript
{
  lastSynced: Date;
  pendingChanges: number;
  conflicts: number;
  status: 'synced' | 'pending' | 'conflict' | 'error';
}
```

**Status Indicators:**
- 🟢 **Synced**: Up-to-date across environments
- 🟡 **Pending**: Changes waiting to sync
- 🔴 **Conflict**: Manual resolution required
- ⚫ **Error**: Sync failure, check logs

### Conversation Duplication

Copy conversations within or across projects:

```typescript
const duplicated = await projectSyncService.duplicateConversation(
  conversationId,
  targetProjectId // optional
);
```

**Use Cases:**
- Template conversations
- Cross-project sharing
- Testing scenarios
- Backup important threads

### Export History

Track all project exports:

```typescript
const history = await projectSyncService.getExportHistory(projectId);
```

**Useful For:**
- Audit trails
- Compliance tracking
- Understanding usage patterns
- Debugging export issues

## Best Practices

### Synchronization

1. **Regular Sync**: Sync at least daily when actively developing
2. **Before Switching**: Always sync before changing devices
3. **After Major Changes**: Sync after significant project updates
4. **Conflict Prevention**: Avoid simultaneous edits across environments

### Backup Strategy

1. **Before Deployment**: Always backup before deploying
2. **Major Milestones**: Backup at feature completion
3. **Weekly Routine**: Schedule weekly automated backups
4. **Pre-Migration**: Backup before any migration
5. **Retention**: Keep 10 most recent backups

### Deployment Workflow

```
Local Dev → Test → Backup → Deploy to Staging → QA → Deploy to Production
```

**Checklist:**
- ✅ All tests passing
- ✅ Backup created
- ✅ Staging deployed successfully
- ✅ QA approved
- ✅ Production deployment scheduled
- ✅ Rollback plan ready

### Security Considerations

1. **Authentication**: Always use authenticated sync
2. **Encryption**: Data encrypted in transit and at rest
3. **Access Control**: Limit deployment permissions
4. **Audit Logs**: Review sync and deployment logs
5. **Backup Security**: Encrypt sensitive backups

## Troubleshooting

### Sync Failures

**Problem**: Sync operation times out
**Solution**:
- Check network connectivity
- Verify Supabase connection
- Reduce batch size
- Try incremental sync

**Problem**: Conflicts keep recurring
**Solution**:
- Identify conflict source
- Establish single source of truth
- Implement conflict prevention strategy
- Consider manual resolution

### Backup Issues

**Problem**: Backup creation fails
**Solution**:
- Check storage space
- Verify permissions
- Review backup size limits
- Try smaller backup scope

**Problem**: Restore doesn't complete
**Solution**:
- Verify backup integrity
- Check target environment
- Review logs for errors
- Try partial restore

### Deployment Problems

**Problem**: Deployment fails
**Solution**:
- Validate environment configuration
- Check deployment logs
- Verify target environment status
- Test with staging first

## API Reference

### ProjectSyncService

```typescript
class ProjectSyncService {
  // Synchronization
  async bidirectionalSync(direction): Promise<SyncResult>
  async getSyncStatus(projectId): Promise<SyncStatus>
  async resolveConflict(conflict, resolution): Promise<void>

  // Export/Import
  async exportProject(projectId, exportType): Promise<Blob>
  async importProject(file): Promise<Project>
  async downloadProjectExport(projectId, name): Promise<void>

  // Backup/Restore
  async createBackup(projectId, name): Promise<BackupSnapshot>
  async listBackups(projectId): Promise<BackupSnapshot[]>
  async restoreBackup(backupId): Promise<Project>

  // Deployment
  async deployToEnvironment(projectId, env): Promise<DeploymentResult>
  async getDeploymentHistory(projectId): Promise<Deployment[]>

  // Utilities
  async cloneProject(projectId): Promise<Project>
  async duplicateConversation(conversationId, targetProjectId): Promise<Conversation>
}
```

## Configuration

### Environment Variables

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key

# Sync Configuration
SYNC_INTERVAL=300000  # 5 minutes
AUTO_BACKUP=true
BACKUP_RETENTION=10

# Deployment
DEFAULT_ENVIRONMENT=development
DEPLOYMENT_TIMEOUT=300000
```

### Database Tables

Required Supabase tables:
- `projects` - Project metadata
- `conversations` - Conversation threads
- `messages` - Message content
- `project_backups` - Backup snapshots
- `project_exports` - Export history
- `deployments` - Deployment records

## Future Enhancements

Planned features:
- Real-time collaborative editing
- Automatic conflict resolution AI
- Incremental backup optimization
- Multi-region deployment
- Version control integration
- Deployment pipelines
- Automated testing pre-deployment
- Performance optimization

---

**Need Help?**

- 📚 Check the main docs: `README.md`
- 🤖 AI Features: `AI_FEATURES.md`
- 🚀 Quick Start: `HYBRID_QUICKSTART.md`
- 🐛 Issues: Open a GitHub issue

**Built with ❤️ for seamless hybrid cloud development**
