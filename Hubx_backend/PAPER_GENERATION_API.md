# Paper Generation API - Complete Implementation Guide

## Overview
This document outlines the complete backend implementation for the "Generate Paper" feature with support for public, free access, and private paper types with comprehensive validation.

---

## Database Schema Update

### New Field Added to Paper Model:
```prisma
model Paper {
  // ... existing fields

  // Public paper fields
  isPublic      Boolean @default(false)  // Is paper publicly available?
  price         Float?                   // Required if isPublic
  isFreeAccess  Boolean @default(false)  // "Free Access for School Students" toggle

  // ... relations
}
```

### Migration Applied:
- **File**: `prisma/migrations/20260219_add_free_access_to_paper/migration.sql`
- **Changes**:
  - Added `isFreeAccess` BOOLEAN column with default `false`
  - Added index on `isFreeAccess` for fast queries
  - Database synced with schema

---

## Business Rules & Validation Logic

### Paper Access Configuration Rules:

#### Rule 1: PUBLIC PAPER (isPublic: true)
```
✅ VALID:
- isPublic: true
- price: 450 (any number > 0)
- isFreeAccess: false (MUST be false)

❌ INVALID:
- isPublic: true, price: null/undefined → ERROR: "Public paper must have a price"
- isPublic: true, isFreeAccess: true → ERROR: "Public papers cannot be marked as free access"
```

#### Rule 2: FREE ACCESS PAPER (isPublic: false, isFreeAccess: true)
```
✅ VALID:
- isPublic: false
- isFreeAccess: true
- price: null (cannot have price)

❌ INVALID:
- isPublic: false, isFreeAccess: true, price: 100 → ERROR: "Free access papers cannot have a price"
```

#### Rule 3: PRIVATE/DRAFT PAPER (isPublic: false, isFreeAccess: false)
```
✅ VALID:
- isPublic: false
- isFreeAccess: false
- price: null

❌ INVALID:
- isPublic: false, isFreeAccess: false, price: 100 → ERROR: "Free access papers cannot have a price"
```

---

## API Endpoints

### 1. CREATE PAPER
**Endpoint**: `POST /api/teacher/papers`
**Authentication**: Required (TEACHER role)

#### Request Body:
```json
{
  "title": "Mathematics Q1 - Chapter 5",
  "description": "Comprehensive questions on quadratic equations",
  "standard": 10,
  "subjectId": "subj_123",
  "difficulty": "INTERMEDIATE",
  "type": "TIME_BOUND",
  "duration": 60,
  "chapterIds": ["ch_1", "ch_2"],

  "isPublic": false,
  "isFreeAccess": true,
  "price": null
}
```

#### Response (201 Created):
```json
{
  "success": true,
  "message": "Paper created successfully",
  "data": {
    "id": "paper_456",
    "title": "Mathematics Q1 - Chapter 5",
    "standard": 10,
    "difficulty": "INTERMEDIATE",
    "type": "TIME_BOUND",
    "duration": 60,
    "isPublic": false,
    "isFreeAccess": true,
    "price": null,
    "status": "DRAFT",
    "createdAt": "2026-02-19T10:30:00Z"
  }
}
```

#### Error Examples:
```json
// Public paper without price
{
  "success": false,
  "message": "Public paper must have a price",
  "statusCode": 400
}

// Free access with price
{
  "success": false,
  "message": "Free access papers cannot have a price",
  "statusCode": 400
}

// Time bound without duration
{
  "success": false,
  "message": "Time bound paper must have a duration",
  "statusCode": 400
}
```

---

### 2. UPDATE PAPER
**Endpoint**: `PUT /api/teacher/papers/:paperId`
**Authentication**: Required (TEACHER role)
**Note**: Cannot update published papers

#### Request Body (Partial Update):
```json
{
  "title": "Updated Title",
  "isPublic": true,
  "price": 450,
  "isFreeAccess": false
}
```

#### Toggle Transition Examples:

**Scenario A: Draft → Public Paper**
```json
// Before:
{
  "isPublic": false,
  "isFreeAccess": false,
  "price": null
}

// Request:
{
  "isPublic": true,
  "price": 450
}

// After:
{
  "isPublic": true,
  "isFreeAccess": false,
  "price": 450
}
```

**Scenario B: Draft → Free Access Paper**
```json
// Before:
{
  "isPublic": false,
  "isFreeAccess": false,
  "price": null
}

// Request:
{
  "isFreeAccess": true
}

// After:
{
  "isPublic": false,
  "isFreeAccess": true,
  "price": null
}
```

**Scenario C: Public → Free Access (INVALID)**
```json
// Request:
{
  "isPublic": false,
  "isFreeAccess": true,
  "price": null
}

// Response:
{
  "success": false,
  "message": "Public papers cannot be marked as free access. Toggle off public paper first.",
  "statusCode": 400
}
```

---

### 3. PUBLISH PAPER
**Endpoint**: `PATCH /api/teacher/papers/:paperId/publish`
**Authentication**: Required (TEACHER role)

#### Validation Checklist Before Publishing:
- ✅ Paper must have at least 1 question
- ✅ If public: must have price set
- ✅ If time bound: must have duration set
- ✅ Access configuration must be valid

#### Request:
```json
{}
```

#### Response (200 OK):
```json
{
  "success": true,
  "message": "Paper published successfully",
  "data": {
    "id": "paper_456",
    "status": "PUBLISHED",
    "isPublic": true,
    "price": 450
  }
}
```

---

## Implementation Details

### Validation Method
```typescript
private validatePaperAccessConfig(
  isPublic: boolean,
  isFreeAccess: boolean,
  price: number | undefined | null,
): void {
  // Logic:
  // 1. If public → price MUST be set, isFreeAccess MUST be false
  // 2. If not public → price MUST be null
}
```

### Data Flow:
1. Frontend sends create/update request with toggles
2. Backend validates access configuration
3. Backend validates other fields (duration, questions, etc.)
4. Backend ensures price is only stored for public papers
5. Response includes updated paper state

---

## Frontend Integration

### Request Format (TypeScript):
```typescript
interface CreatePaperRequest {
  title: string
  standard: number
  subjectId: string
  difficulty: 'EASY' | 'INTERMEDIATE' | 'ADVANCED'
  type: 'TIME_BOUND' | 'NO_LIMIT'
  duration?: number
  chapterIds?: string[]

  isPublic: boolean
  isFreeAccess?: boolean
  price?: number
}
```

### Toggle Logic:
```typescript
// Public Paper Toggle ON
if (isPublic === true) {
  price = 450 (required)
  isFreeAccess = false (forced)
}

// Free Access Toggle ON (when Public is OFF)
if (isPublic === false && isFreeAccess === true) {
  price = null (forced)
}

// Both OFF
if (isPublic === false && isFreeAccess === false) {
  price = null (forced)
}
```

---

## Database Queries

### Find All Public Papers:
```sql
SELECT * FROM Paper WHERE isPublic = true AND status = 'PUBLISHED'
```

### Find All Free Access Papers:
```sql
SELECT * FROM Paper WHERE isFreeAccess = true AND status = 'PUBLISHED'
```

### Find Teacher's Draft Papers:
```sql
SELECT * FROM Paper
WHERE teacherId = 'teacher_123'
AND status = 'DRAFT'
```

---

## Error Handling

### Error Messages (from constants):
- `PUBLIC_PAPER_REQUIRES_PRICE`: "Public paper must have a price"
- `FREE_ACCESS_CANNOT_HAVE_PRICE`: "Free access papers cannot have a price"
- `TIME_BOUND_REQUIRES_DURATION`: "Time bound paper must have a duration"
- `INSUFFICIENT_QUESTIONS`: "Paper must have at least 1 question"

### HTTP Status Codes:
- `201`: Paper created successfully
- `200`: Paper updated/published successfully
- `400`: Validation error (invalid access config, missing fields)
- `404`: Paper/subject/chapter not found
- `401`: Unauthorized (not authenticated)
- `403`: Forbidden (not TEACHER role)

---

## Production Considerations

### Performance:
- ✅ Index on `isPublic` for public paper queries
- ✅ Index on `isFreeAccess` for free access paper queries
- ✅ Efficient chapter association creation with Promise.all()

### Security:
- ✅ Teacher ownership validation on all operations
- ✅ No price exposed to unauthorized users
- ✅ Cannot update published papers

### Scalability:
- ✅ Proper indexes on frequently queried fields
- ✅ No N+1 queries (using include in findUnique)
- ✅ Clean separation of concerns (validation → creation → return)

---

## Testing Scenarios

### Test Case 1: Create Public Paper
```
Input: isPublic=true, price=450, isFreeAccess=false
Expected: Paper created with status DRAFT
```

### Test Case 2: Create Free Access Paper
```
Input: isPublic=false, isFreeAccess=true, price=null
Expected: Paper created with status DRAFT
```

### Test Case 3: Invalid - Public Without Price
```
Input: isPublic=true, price=null
Expected: Error 400 - "Public paper must have a price"
```

### Test Case 4: Invalid - Free Access With Price
```
Input: isPublic=false, isFreeAccess=true, price=450
Expected: Error 400 - "Free access papers cannot have a price"
```

### Test Case 5: Toggle Public → Free Access
```
Step 1: Create public paper (isPublic=true, price=450)
Step 2: Update to free access (isPublic=false, isFreeAccess=true)
Expected: Success, price set to null
```

---

## Summary

✅ **Database**: `isFreeAccess` field added with index
✅ **Validation**: Complete toggle state validation implemented
✅ **API**: All endpoints support new field
✅ **Error Messages**: Clear, actionable error messages
✅ **Security**: Teacher ownership validated
✅ **Performance**: Proper indexing applied

The implementation is production-ready and handles all toggle combinations with proper validation.
