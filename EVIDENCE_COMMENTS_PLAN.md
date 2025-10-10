# 🗨️ Evidence Comments & Annotations System - Implementation Plan

## 📋 Overview
Implement a comprehensive commenting system that allows property owners, law enforcement, and other stakeholders to add comments, questions, and annotations to specific evidence files.

**Feature Branch**: `feature/evidence-comments`  
**Target Version**: v1.4.0  
**Estimated Effort**: 2-3 days

---

## 🎯 Goals

### Primary Objectives:
1. Enable property owners to ask questions about evidence files
2. Allow law enforcement to add professional annotations and observations
3. Support threaded discussions (replies to comments)
4. Implement role-based visibility for sensitive comments
5. Provide clear visual indication of comment activity

### User Stories:
- **As a property owner**, I want to ask questions about specific evidence photos so I can provide context to law enforcement
- **As law enforcement**, I want to annotate evidence with observations so my team can track investigation progress
- **As an insurance agent**, I want to add notes about evidence quality so claims can be processed efficiently
- **As any stakeholder**, I want to reply to existing comments so discussions stay organized

---

## 🗄️ Database Schema

### New Model: EvidenceComment

```prisma
model EvidenceComment {
  id                Int       @id @default(autoincrement())
  evidenceId        Int
  itemId            Int
  content           String    @db.Text
  commentType       String    @default("general") // 'general', 'question', 'observation', 'request'
  isPrivate         Boolean   @default(false)
  createdBy         String
  createdByName     String
  createdByRole     String
  parentCommentId   Int?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  evidence          Evidence  @relation(fields: [evidenceId], references: [id], onDelete: Cascade)
  item              StolenItem @relation(fields: [itemId], references: [id], onDelete: Cascade)
  parentComment     EvidenceComment? @relation("CommentReplies", fields: [parentCommentId], references: [id])
  replies           EvidenceComment[] @relation("CommentReplies")
  
  @@map("evidence_comments")
}
```

### Schema Updates:
- Add `comments` relation to `Evidence` model
- Add `evidenceComments` relation to `StolenItem` model

---

## 🔌 API Endpoints

### 1. Get Comments for Evidence
**GET** `/api/evidence/[evidenceId]/comments`

**Query Parameters:**
- `userId` - Current user ID (for permission checks)
- `userRole` - Current user role

**Response:**
```json
{
  "comments": [
    {
      "id": 1,
      "evidenceId": 5,
      "itemId": 10,
      "content": "Is this the tractor that was stolen on March 15th?",
      "commentType": "question",
      "isPrivate": false,
      "createdBy": "user-123",
      "createdByName": "George Page",
      "createdByRole": "property_owner",
      "parentCommentId": null,
      "createdAt": "2025-10-10T10:00:00Z",
      "updatedAt": "2025-10-10T10:00:00Z",
      "replies": [...]
    }
  ]
}
```

### 2. Create Comment
**POST** `/api/evidence/[evidenceId]/comments`

**Request Body:**
```json
{
  "itemId": 10,
  "content": "Yes, this is the tractor. Note the damaged front wheel.",
  "commentType": "observation",
  "isPrivate": false,
  "userId": "user-456",
  "userName": "Deputy Dave Brown",
  "userRole": "law_enforcement",
  "parentCommentId": 1
}
```

### 3. Update Comment
**PUT** `/api/evidence/comments/[commentId]`

**Request Body:**
```json
{
  "content": "Updated comment text",
  "commentType": "observation"
}
```

### 4. Delete Comment
**DELETE** `/api/evidence/comments/[commentId]`

**Query Parameters:**
- `userId` - For permission verification

---

## 🎨 UI Components

### 1. CommentThread Component
**Location**: `src/components/CommentThread.tsx`

**Props:**
```typescript
interface CommentThreadProps {
  evidenceId: number
  itemId: number
  user: User
  onCommentAdded?: () => void
}
```

**Features:**
- Display all comments for an evidence file
- Show nested replies (threaded discussions)
- Visual distinction between comment types (question, observation, etc.)
- Timestamps and user role badges
- Expand/collapse replies
- Edit/delete buttons for own comments

### 2. CommentInput Component
**Location**: `src/components/CommentInput.tsx`

**Props:**
```typescript
interface CommentInputProps {
  evidenceId: number
  itemId: number
  parentCommentId?: number
  user: User
  onSubmit: (comment: CommentData) => void
  onCancel?: () => void
  placeholder?: string
}
```

**Features:**
- Textarea for comment input
- Comment type selector (question, observation, general)
- Private comment toggle (for law enforcement only)
- Character count
- Submit/cancel buttons
- Loading state during submission

### 3. CommentBadge Component
**Location**: `src/components/CommentBadge.tsx`

**Props:**
```typescript
interface CommentBadgeProps {
  count: number
  hasUnread?: boolean
  onClick?: () => void
}
```

**Features:**
- Shows comment count on evidence files
- Optional unread indicator
- Clickable to open comment thread

---

## 🔒 Permission Rules

### Viewing Comments:
- **Property Owner**: Can view all comments on their items
- **Law Enforcement**: Can view all comments
- **Stakeholders**: Can view non-private comments
- **Super Admin**: Can view all comments

### Creating Comments:
- **Property Owner**: Can create questions and general comments
- **Law Enforcement**: Can create all types, including private
- **Stakeholders**: Can create general comments and observations
- **All authenticated users**: Can reply to existing comments they can view

### Editing Comments:
- Users can edit their own comments
- Cannot edit after 24 hours
- Cannot edit if there are replies

### Deleting Comments:
- Users can delete their own comments
- Law enforcement and super admin can delete any comment
- Deleting a parent comment deletes all replies

---

## 🎯 Comment Types

### 1. General (default)
- Basic comments and observations
- Available to all users

### 2. Question ❓
- Used by property owners to ask questions
- Available to property owners and stakeholders

### 3. Observation 🔍
- Professional notes and annotations
- Primarily used by law enforcement
- Available to law enforcement and insurance agents

### 4. Request 📋
- Requests for additional information or action
- Available to all users

---

## 🔔 Basic Notification Integration

### Comment Created Notifications:
- Notify property owner when law enforcement comments
- Notify law enforcement when property owner asks question
- Notify all thread participants when someone replies

### Implementation:
- Create simple in-app notification badge
- Store notification count in user state
- Foundation for full notification system in v1.5.0

---

## 📍 Integration Points

### ItemDetailView Updates:
1. Add comment count badge to each evidence file thumbnail
2. Add "Comments" tab or section in evidence viewer
3. Show CommentThread when evidence file is selected
4. Add quick comment button in evidence actions

### Evidence Management:
1. Show comment indicators in evidence list
2. Filter evidence by "has comments"
3. Sort by comment activity

---

## 🧪 Testing Strategy

### Unit Tests:
- API endpoint tests for CRUD operations
- Permission validation tests
- Comment threading logic tests

### Integration Tests:
- Comment creation flow end-to-end
- Reply functionality
- Private comment visibility
- Cross-role interaction

### User Acceptance Testing:
- Property owner asks question
- Law enforcement responds
- Threaded discussion
- Edit/delete functionality
- Mobile responsiveness

---

## 📅 Implementation Timeline

### Phase 1: Database & API (Day 1)
- ✅ Create database schema
- ✅ Run migration
- ✅ Implement API endpoints
- ✅ Test API with Postman/curl

### Phase 2: Core Components (Day 2)
- ✅ Build CommentInput component
- ✅ Build CommentThread component
- ✅ Build CommentBadge component
- ✅ Implement permission logic

### Phase 3: Integration (Day 3)
- ✅ Integrate into ItemDetailView
- ✅ Add comment indicators to evidence
- ✅ Basic notification badges
- ✅ Testing and refinement

---

## 🎨 Design Considerations

### Visual Design:
- Comments styled similar to investigation notes
- Clear visual hierarchy for threaded replies
- Role-based color coding (property owner = blue, law enforcement = green, etc.)
- Question comments have "?" icon
- Observation comments have "🔍" icon

### UX Considerations:
- Auto-focus comment input when "Reply" clicked
- Confirmation dialog for delete
- Success feedback on submit
- Error handling with friendly messages
- Keyboard shortcuts (Cmd+Enter to submit)

---

## 🚀 Success Criteria

### Feature Complete When:
- ✅ Users can add comments to any evidence file
- ✅ Comments support threading (replies)
- ✅ Role-based permissions work correctly
- ✅ Private comments only visible to authorized users
- ✅ Users can edit/delete their own comments
- ✅ Comment counts display on evidence files
- ✅ Mobile-responsive design
- ✅ No performance degradation with many comments

### Performance Targets:
- Comment load time: < 500ms
- Comment submission: < 1s
- 100+ comments per evidence file without lag

---

## 📝 Notes

### Future Enhancements (v1.5.0):
- Rich text formatting (bold, italic, links)
- @mentions to notify specific users
- Attach images to comments
- Comment search
- Export comments to PDF report
- Email notifications for new comments
- Real-time updates via WebSocket

### Known Limitations:
- No rich text in v1.4.0 (plain text only)
- No file attachments in comments
- No @mentions or tagging
- No email notifications (coming in notification system)

---

**Next Step**: Begin implementation with database schema updates and API endpoints.

