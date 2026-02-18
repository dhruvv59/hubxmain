# Fill in the Blanks - Multiple Blanks with Pipe-Separated Format

## Overview
Support for **multiple blanks in a single question** with auto-grading and flexible answer variations.

---

## 📚 **How It Works**

### Question Setup (What Teacher Creates)

**Step 1: Create Question Type**
- Type: `FILL_IN_THE_BLANKS`
- Set: `caseSensitive: false` (or true, your choice)

**Step 2: Write Question with Multiple Blanks**
```
"The brain of the computer is the _____ and it performs all _____ operations."
```

**Step 3: Define Correct Answers**
This is the KEY part! Set `correctAnswers` as a **nested array**:

```json
{
  "correctAnswers": [
    ["CPU", "cpu"],              // Blank 1: Accept "CPU" or "cpu"
    ["processing", "Processing"] // Blank 2: Accept "processing" or "Processing"
  ]
}
```

**Complete Question Body**:
```json
POST /api/teacher/papers/{paperId}/questions
{
  "type": "FILL_IN_THE_BLANKS",
  "questionText": "The brain of the computer is the _____ and it performs all _____ operations.",
  "marks": 5,
  "difficulty": "INTERMEDIATE",
  "solutionText": "The CPU is known as the brain of the computer and it performs all processing operations.",
  "correctAnswers": [
    ["CPU", "cpu"],
    ["processing", "Processing"]
  ],
  "caseSensitive": false
}
```

---

## ✏️ **How Students Answer**

### Student's Exam Experience

**Question Display**:
```
Question: "The brain of the computer is the _____ and it performs all _____ operations."

┌──────────────────────────┐
│ Type your answer here... │
└──────────────────────────┘
```

**Student Types**:
```
CPU|processing
```

---

## ✅ **Backend Verification Logic**

### Step-by-Step Validation

```
Question Setup:
  correctAnswers = [["CPU", "cpu"], ["processing", "Processing"]]
  caseSensitive = false

Student Submission:
  answerText = "CPU|processing"

Backend Process:

  1. Split by pipe (|):
     studentParts = ["CPU", "processing"]

  2. Loop through each blank:

     Blank 1 (i=0):
       possibleAnswers = ["CPU", "cpu"]
       studentAnswer = "CPU"

       Check: Does "CPU" match any in ["CPU", "cpu"]?
       ✓ "CPU".toLowerCase() === "cpu".toLowerCase() → TRUE ✅

     Blank 2 (i=1):
       possibleAnswers = ["processing", "Processing"]
       studentAnswer = "processing"

       Check: Does "processing" match any in ["processing", "Processing"]?
       ✓ "processing".toLowerCase() === "processing".toLowerCase() → TRUE ✅

  3. Result:
     allMatched = true
     isCorrect = true
     marksObtained = 5 (full marks)
```

---

## 📊 **Test Cases & Examples**

### Test Case 1: Correct Answer (All Blanks Match)
```
Question: "The brain is the _____ and performs _____ operations."
Correct: [["CPU", "cpu"], ["processing", "Processing"]]
Student: "CPU|Processing"

Validation:
  Blank 1: "CPU" vs ["CPU", "cpu"] → ✅ Match
  Blank 2: "Processing" vs ["processing", "Processing"] → ✅ Match

Result: ✅ CORRECT (5/5 marks)
```

### Test Case 2: Case Variation (Correct)
```
Student: "cpu|processing"

Validation:
  Blank 1: "cpu" vs ["CPU", "cpu"] → ✅ Match (case insensitive)
  Blank 2: "processing" vs ["processing", "Processing"] → ✅ Match

Result: ✅ CORRECT (5/5 marks)
```

### Test Case 3: Wrong First Blank
```
Student: "GPU|Processing"

Validation:
  Blank 1: "GPU" vs ["CPU", "cpu"] → ❌ No match

Result: ❌ INCORRECT (0/5 marks)
Note: Entire answer marked wrong if ANY blank is incorrect
```

### Test Case 4: Missing Second Blank
```
Student: "CPU"  // Missing pipe and second answer

Validation:
  studentParts = ["CPU"]
  Blank 1: "CPU" vs ["CPU", "cpu"] → ✅ Match
  Blank 2: "" (empty) vs ["processing", "Processing"] → ❌ No match

Result: ❌ INCORRECT (0/5 marks)
```

### Test Case 5: Extra Content (Still Works)
```
Student: "CPU | Processing"  // Extra spaces around pipe

After trim():
  studentParts = ["CPU", "Processing"]
  Both match → ✅ CORRECT (5/5 marks)
```

---

## 🔧 **Implementation Details**

### Data Structure

**Stored in Database**:
```typescript
type Question = {
  type: "FILL_IN_THE_BLANKS"
  questionText: string
  options: string[][]  // [["CPU", "cpu"], ["processing", "Processing"]]
  correctOption: number  // Index of correct answer (used for UI only)
  caseSensitive: boolean // false = ignore case, true = must match exactly
  marks: number
}

type StudentAnswer = {
  answerText: string  // "CPU|Processing"
  isCorrect: boolean  // true or false (auto-graded)
  marksObtained: number  // 0 or full marks
}
```

### Backend Code Logic

**Location**: `Hubx_backend/src/modules/exam/exam.service.ts` lines 309-361

```typescript
// Split by pipe separator
const studentParts = String(answer.answerText).split("|").map((s) => s.trim())

// Get all possible correct answers
const correctArrays = question.options  // [["CPU", "cpu"], ["processing", "Processing"]]

let allMatched = true

// Check each blank
for (let i = 0; i < correctArrays.length; i++) {
  const possibleAnswers = correctArrays[i]  // ["CPU", "cpu"]
  const studentAns = studentParts[i] ?? ""  // "CPU"

  // Does student's answer match ANY of the possible answers?
  const matched = possibleAnswers.some((ans: string) => {
    if (question.caseSensitive) {
      return ans.trim() === studentAns
    }
    return ans.trim().toLowerCase() === studentAns.trim().toLowerCase()
  })

  if (!matched) {
    allMatched = false
    break  // Stop checking if ANY blank is wrong
  }
}

isCorrect = allMatched
marksObtained = isCorrect ? questionMarks : 0
```

---

## 📋 **API Contract**

### Creating Multiple Blanks Question

**Request**:
```
POST /api/teacher/papers/{paperId}/questions
Content-Type: application/json

{
  "type": "FILL_IN_THE_BLANKS",
  "questionText": "The _____ is the _____ of the computer.",
  "marks": 5,
  "difficulty": "EASY",
  "solutionText": "The CPU is the brain of the computer.",
  "correctAnswers": [
    ["CPU", "cpu"],
    ["brain", "Brain"]
  ],
  "caseSensitive": false
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "q123",
    "type": "FILL_IN_THE_BLANKS",
    "options": [["CPU", "cpu"], ["brain", "Brain"]],
    "correctOption": 0,
    "marks": 5
  }
}
```

### Student Submitting Answer

**Request**:
```
POST /api/exam/{attemptId}/answer/{questionId}
Content-Type: application/json

{
  "answerText": "CPU|Brain"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "isCorrect": true,
    "marksObtained": 5,
    "answerText": "CPU|Brain"
  }
}
```

### Getting Results

**Request**:
```
GET /api/exam/{attemptId}/result
```

**Response (Answer Details)**:
```json
{
  "answers": [
    {
      "questionText": "The _____ is the _____ of the computer.",
      "type": "FILL_IN_THE_BLANKS",
      "studentAnswer": "CPU|Brain",
      "correctAnswer": [["CPU", "cpu"], ["brain", "Brain"]],
      "isCorrect": true,
      "marksObtained": 5,
      "marks": 5,
      "status": "CORRECT"
    }
  ]
}
```

---

## ⚙️ **Configuration Options**

### Case Sensitivity

**Case Insensitive** (Default - Recommended):
```json
{
  "caseSensitive": false,
  "correctAnswers": [["CPU", "cpu"], ["processing", "PROCESSING"]]
}
```
```
Student answer "cpu|processing" → ✅ CORRECT
Student answer "CPU|PROCESSING" → ✅ CORRECT
```

**Case Sensitive** (Exact Match):
```json
{
  "caseSensitive": true,
  "correctAnswers": [["CPU"], ["processing"]]
}
```
```
Student answer "cpu|processing" → ❌ INCORRECT
Student answer "CPU|processing" → ✅ CORRECT
```

---

## 🚀 **Features**

| Feature | Supported | Example |
|---------|-----------|---------|
| Multiple blanks | ✅ Yes | "The _____ and the _____" |
| Multiple correct answers per blank | ✅ Yes | ["CPU", "cpu"] |
| Case-insensitive matching | ✅ Yes | "cpu" matches "CPU" |
| Case-sensitive matching | ✅ Yes | "cpu" does NOT match "CPU" |
| Partial credit | ❌ No | All blanks must match (all or nothing) |
| Whitespace handling | ✅ Yes | "CPU | processing" same as "CPU\|processing" |
| Escaped pipes | ❌ No | Can't include literal pipe in answer |

---

## 🔍 **Debugging**

### Issue: Student Answer Marked Wrong But Looks Correct

**Check**:
1. **Spelling**: Exact spelling required (unless very similar)
2. **Case Sensitivity**: Is `caseSensitive: true` set?
   - If yes, "cpu" won't match "CPU"
3. **Whitespace**: Extra spaces around pipe?
   - Backend trims automatically, should be fine
4. **Answer Format**: Did they use pipe separator?
   - Correct: "CPU|Processing"
   - Wrong: "CPU and Processing"
5. **Number of Blanks**: Do studentParts match question blanks?
   - 2 blanks → Need exactly 2 pipe-separated values

### Issue: Extra Blank in Question

```
Question: "The _____ and _____ and _____"  // 3 blanks
Student: "CPU|processing"  // Only 2 answers

studentParts = ["CPU", "processing"]
Blank 3: "" (empty) vs correct answers → ❌ WRONG
```

**Solution**: Ensure student provides answer for EVERY blank

---

## 📝 **Best Practices**

1. **Clear Question Wording**: Make blank positions obvious
   ```
   ✅ "The _____ is the _____ of the computer."
   ❌ "The is the of the computer."  // Ambiguous
   ```

2. **Consistent Answer Format**: Document expected format
   ```
   ✅ "Use pipe (|) to separate answers: CPU|Processing"
   ❌ Leave it ambiguous
   ```

3. **Provide Multiple Variations**: Accept common variations
   ```json
   ✅ ["CPU", "cpu", "C.P.U."]
   ❌ ["CPU"]  // Only exact match
   ```

4. **Set Appropriate Marks**: Full marks if all blanks correct
   ```json
   ✅ "marks": 5  // All-or-nothing grading
   ```

---

## 🧪 **Complete Example Flow**

### Teacher Creates Question
```json
POST /teacher/papers/paper123/questions
{
  "type": "FILL_IN_THE_BLANKS",
  "questionText": "The _____ is the _____ of the computer and performs _____ operations.",
  "marks": 3,
  "difficulty": "EASY",
  "solutionText": "The CPU is the brain of the computer and performs processing operations.",
  "correctAnswers": [
    ["CPU", "cpu"],
    ["brain", "Brain"],
    ["processing", "Processing"]
  ],
  "caseSensitive": false
}
```

### Student Takes Exam
```
Sees: "The _____ is the _____ of the computer and performs _____ operations."
Types: "CPU|brain|processing"
Clicks: Save Answer
```

### Backend Processes
```
Check blank 1: "CPU" vs ["CPU", "cpu"] → ✅
Check blank 2: "brain" vs ["brain", "Brain"] → ✅
Check blank 3: "processing" vs ["processing", "Processing"] → ✅
Result: isCorrect = true, marksObtained = 3
```

### Student Sees Result
```
✅ CORRECT
Marks: 3/3
Status: CORRECT
```

---

## 🔗 **Related Documentation**

- [FILL_IN_BLANKS_VERIFICATION.md](./FILL_IN_BLANKS_VERIFICATION.md) - Verification overview
- [FILL_IN_BLANKS_INTEGRATION_COMPLETE.md](./FILL_IN_BLANKS_INTEGRATION_COMPLETE.md) - Complete integration guide
- [exam.service.ts](./Hubx_backend/src/modules/exam/exam.service.ts) - Backend implementation (lines 309-361)

---

## ✅ **Verification Checklist**

- [x] Multiple blanks with pipe separator
- [x] Case-insensitive/sensitive matching
- [x] Multiple correct answers per blank
- [x] Auto-grading (all-or-nothing)
- [x] Whitespace handling
- [x] Empty answer validation
- [x] Database storage

---

**Status**: ✅ Fully Implemented & Tested
**Last Updated**: 2026-02-18
