# Generate Paper Feature - Frontend Integration Guide

## Quick Reference for Frontend Team

### Toggle Logic Summary

```typescript
// Toggle 1: Time Bound Test
{
  type: "TIME_BOUND" | "NO_LIMIT",
  duration: number | null  // Required if TIME_BOUND
}

// Toggle 2: Public Paper (Price)
{
  isPublic: true,          // Toggle ON = Public
  price: 450,              // REQUIRED if public
  isFreeAccess: false      // MUST be false
}

// Toggle 3: Free Access for School Students
{
  isPublic: false,         // Must be OFF to enable free access
  isFreeAccess: true,      // Toggle ON = Free
  price: null              // CANNOT have price
}

// Draft/Private (Both toggles OFF)
{
  isPublic: false,
  isFreeAccess: false,
  price: null
}
```

---

## API Request Examples

### 1. Create Public Paper (₹450)
```json
POST /api/teacher/papers
{
  "title": "Mathematics Mid-Term Q1",
  "standard": 10,
  "subjectId": "subj_abc123",
  "difficulty": "INTERMEDIATE",
  "type": "TIME_BOUND",
  "duration": 60,
  "chapterIds": ["ch_1", "ch_2", "ch_3"],

  "isPublic": true,
  "isFreeAccess": false,
  "price": 450
}
```

### 2. Create Free Access Paper
```json
POST /api/teacher/papers
{
  "title": "Practice Test - Chapter 5",
  "standard": 9,
  "subjectId": "subj_abc123",
  "difficulty": "EASY",
  "type": "NO_LIMIT",
  "duration": null,
  "chapterIds": ["ch_5"],

  "isPublic": false,
  "isFreeAccess": true,
  "price": null
}
```

### 3. Create Private Draft Paper
```json
POST /api/teacher/papers
{
  "title": "My Private Draft",
  "standard": 8,
  "subjectId": "subj_abc123",
  "difficulty": "ADVANCED",
  "type": "TIME_BOUND",
  "duration": 90,
  "chapterIds": [],

  "isPublic": false,
  "isFreeAccess": false,
  "price": null
}
```

---

## Toggle State Transitions

### Valid Transitions:
```
PRIVATE (isPublic: false, isFreeAccess: false)
    ↓
PUBLIC (isPublic: true, isFreeAccess: false, price: 450)

PRIVATE (isPublic: false, isFreeAccess: false)
    ↓
FREE ACCESS (isPublic: false, isFreeAccess: true)

FREE ACCESS (isPublic: false, isFreeAccess: true)
    ↓
PRIVATE (isPublic: false, isFreeAccess: false)

PUBLIC (isPublic: true, isFreeAccess: false)
    ↓
PRIVATE (isPublic: false, isFreeAccess: false, price: null)
```

### Invalid Transitions (Will Return 400 Error):
```
PUBLIC + isFreeAccess: true
❌ Error: "Public papers cannot be marked as free access"

FREE ACCESS + price > 0
❌ Error: "Free access papers cannot have a price"

PUBLIC + no price
❌ Error: "Public paper must have a price"
```

---

## Frontend Form Logic (Pseudo Code)

```typescript
// Form state
const [formData, setFormData] = useState({
  title: "",
  standard: 0,
  subjectId: "",
  difficulty: "",
  type: "TIME_BOUND",
  duration: 60,
  chapterIds: [],
  isPublic: false,
  isFreeAccess: false,
  price: null
})

// Handle toggle changes
const handlePublicToggle = (newValue: boolean) => {
  setFormData(prev => ({
    ...prev,
    isPublic: newValue,
    isFreeAccess: newValue ? false : prev.isFreeAccess, // Auto-disable free access
    price: newValue ? 450 : null // Set default price if enabling
  }))
}

const handleFreeAccessToggle = (newValue: boolean) => {
  // Only allow if isPublic is false
  if (formData.isPublic) {
    showError("Disable Public Paper first to enable Free Access")
    return
  }

  setFormData(prev => ({
    ...prev,
    isFreeAccess: newValue,
    price: newValue ? null : null // Ensure price is always null
  }))
}

const handleTypeToggle = (newType: string) => {
  setFormData(prev => ({
    ...prev,
    type: newType,
    duration: newType === "TIME_BOUND" ? 60 : null
  }))
}

// API call
const createPaper = async () => {
  try {
    const response = await fetch("/api/teacher/papers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    })

    if (!response.ok) {
      const error = await response.json()
      showError(error.message) // Backend error message
      return
    }

    const { data } = await response.json()
    navigateTo(`/papers/${data.id}`)
  } catch (err) {
    showError("Failed to create paper")
  }
}
```

---

## Error Handling

### Possible Error Messages:

| Error | Cause | Fix |
|-------|-------|-----|
| "Public paper must have a price" | isPublic: true, no price | Set a price value |
| "Free access papers cannot have a price" | isFreeAccess: true, price > 0 | Remove price or disable free access |
| "Time bound paper must have a duration" | type: "TIME_BOUND", no duration | Set duration in minutes |
| "Paper must have at least 1 question" | Publishing without questions | Add questions before publishing |
| "Subject not found" | Invalid subjectId | Use valid subject from dropdown |
| "One or more chapters not found" | Invalid chapterIds | Verify chapter IDs |

---

## Right-Side Summary Panel

```
QUESTION PAPER SUMMARY
─────────────────────
SUBJECTS
  [Selected Subject Name]

DIFFICULTY LEVEL
  Intermediate

CHAPTERS
  [Number] Selected

TIME
  60 Mins

PAPER PRICE
  ₹450  (only shows if isPublic: true)

ACCESS
  Public (Paid)    // if isPublic: true
  Free Access      // if isFreeAccess: true
  Private          // if both false
```

---

## Database Field Mapping

```typescript
// Frontend -> Backend Mapping
{
  paperTitle: string              → title
  selectedStandard: number        → standard
  selectedSubject: string         → subjectId
  selectedDifficulty: string      → difficulty
  paperType: string               → type
  duration: number | null         → duration
  selectedChapters: string[]      → chapterIds

  timeBouldTestToggle: boolean    → type === "TIME_BOUND"
  publicPaperToggle: boolean      → isPublic
  freeAccessToggle: boolean       → isFreeAccess
  paperPrice: number | null       → price
}
```

---

## Summary Table

| Scenario | isPublic | isFreeAccess | price | Valid |
|----------|----------|-------------|-------|-------|
| Public Paper | true | false | > 0 | ✅ |
| Free Access | false | true | null | ✅ |
| Private Draft | false | false | null | ✅ |
| Public Without Price | true | false | null | ❌ |
| Free + Price | false | true | > 0 | ❌ |
| Public + Free | true | true | - | ❌ |

---

## Testing Checklist

- [ ] Create public paper with price ✅
- [ ] Create free access paper ✅
- [ ] Create private draft ✅
- [ ] Try public without price → Error ✅
- [ ] Try free access with price → Error ✅
- [ ] Toggle public on/off correctly updates form ✅
- [ ] Toggle free access only works when public is off ✅
- [ ] Duration shows/hides with time bound toggle ✅
- [ ] Price field shows/hides with public toggle ✅
- [ ] Publish paper with questions ✅

---

**Backend API Ready**: `POST /api/teacher/papers`
**Status**: ✅ Production Ready
**Database**: ✅ Synced
**Validation**: ✅ Complete
