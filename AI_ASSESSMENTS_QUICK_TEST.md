# AI Assessments Module - Quick Test Checklist

## 🚀 Quick Start Testing

### STEP 1: Open Application (5 minutes)
1. Open your browser and go to: **http://localhost:3000/teacher/ai-assessments**
2. Make sure you're logged in as a teacher
3. Wait for page to fully load

**Verify:**
- [ ] Page loads without errors
- [ ] Header shows "Generate Paper"
- [ ] Form appears on the left side
- [ ] Summary card appears on the right side
- [ ] Back arrow button is visible

---

### STEP 2: Form Field Testing (10 minutes)

#### Test Title Input
1. Enter: "Advanced Physics Test"
2. Verify it appears in the summary card

**Status:** ✅ Pass / ❌ Fail / ⚠️ Issue

#### Test Standard Dropdown
1. Click "Select Standard" dropdown
2. Select any standard (e.g., "Standard 12")
3. Wait 1-2 seconds for subjects to load

**Expected:** Subject dropdown becomes enabled and shows subjects

**Status:** ✅ Pass / ❌ Fail / ⚠️ Issue

#### Test Subject Dropdown
1. Click "Select Subject" dropdown
2. Select any subject (e.g., "Physics")
3. Wait 1-2 seconds for chapters to load

**Expected:** Chapters appear as checkboxes

**Status:** ✅ Pass / ❌ Fail / ⚠️ Issue

#### Test Chapter Selection
1. Check 3-5 chapters
2. Click "All" checkbox
3. Verify all chapters are selected
4. Click "All" again to deselect all

**Expected:** Checkboxes toggle correctly, summary updates

**Status:** ✅ Pass / ❌ Fail / ⚠️ Issue

#### Test Difficulty Toggle
1. Click "Easy"
2. Click "Advanced"
3. Click "Intermediate"

**Expected:** Only one is selected at a time, shows purple color when selected

**Status:** ✅ Pass / ❌ Fail / ⚠️ Issue

#### Test Duration Dropdown
1. Select 30, 60, 90, 120 minutes in sequence
2. Verify summary updates each time

**Status:** ✅ Pass / ❌ Fail / ⚠️ Issue

#### Test Price Input
1. Clear the price field
2. Enter: 100, 500, 1000
3. Verify each value shows in summary

**Status:** ✅ Pass / ❌ Fail / ⚠️ Issue

#### Test Paper Toggles
1. Toggle "Time Bound Test" ON/OFF
2. Toggle "Public Paper" ON/OFF
3. Toggle "Free Access for School Students" ON/OFF
4. Check summary updates

**Expected:** When "Free Access for School Students" is ON, help text appears

**Status:** ✅ Pass / ❌ Fail / ⚠️ Issue

---

### STEP 3: Form Validation (5 minutes)

#### Test 1: Missing Title
1. Leave title empty
2. Select Standard, Subject, and Chapters
3. Click "Add Question" button
4. Verify alert: "Please enter a paper title"

**Status:** ✅ Pass / ❌ Fail / ⚠️ Issue

#### Test 2: Missing Standard/Subject
1. Enter title: "Test"
2. Leave Standard empty
3. Click "Add Question" button
4. Verify alert: "Please select standard and subject"

**Status:** ✅ Pass / ❌ Fail / ⚠️ Issue

#### Test 3: Missing Chapters
1. Enter title: "Test"
2. Select Standard and Subject
3. Leave all chapters unchecked
4. Click "Add Question" button
5. Verify alert: "Please select at least one chapter"

**Status:** ✅ Pass / ❌ Fail / ⚠️ Issue

---

### STEP 4: Form Submission (10 minutes)

#### Test: Complete Valid Form
1. Fill form completely:
   - Title: "Complete Physics Test"
   - Standard: Any standard
   - Subject: Any subject
   - Chapters: Select 2-3 chapters
   - Keep other fields at defaults
2. Click "Add Question" button
3. Watch for "Processing..." message with spinner
4. Wait for navigation

**Expected Results:**
- [ ] Button shows "Processing..." with spinner
- [ ] Form fields become disabled
- [ ] After 2-5 seconds, page navigates
- [ ] New URL includes `?draftId=...`
- [ ] No error message appears
- [ ] Method selection page shows (Manual, Bulk, AI options)

**Status:** ✅ Pass / ❌ Fail / ⚠️ Issue

---

### STEP 5: Draft Verification (5 minutes)

#### Test: Draft Data Persists
1. You should now be on method selection page: `/teacher/ai-assessments/create?draftId=...`
2. Look at the Summary Card on the left
3. Verify all data matches what you entered:
   - [ ] Title matches
   - [ ] Standard matches
   - [ ] Subject matches
   - [ ] Chapters count matches
   - [ ] Difficulty matches
   - [ ] Duration matches
   - [ ] Price matches

**Status:** ✅ Pass / ❌ Fail / ⚠️ Issue

---

### STEP 6: Navigation Methods (10 minutes)

#### Test: Manual Method
1. Click "Manual" card
2. Wait for page to load
3. Verify manual question form loads

**Expected:** URL changes to `/teacher/ai-assessments/create/manual?draftId=...`

**Status:** ✅ Pass / ❌ Fail / ⚠️ Issue

#### Test: Bulk Upload Method
1. Go back to method selection (click back button)
2. Click "Bulk Upload" card
3. Wait for page to load
4. Verify bulk upload form loads

**Expected:** URL changes to `/teacher/ai-assessments/create/bulk?draftId=...`

**Status:** ✅ Pass / ❌ Fail / ⚠️ Issue

#### Test: AI Generation Method
1. Go back to method selection (click back button)
2. Click "AI" card
3. Wait for page to load
4. Verify AI generation form loads

**Expected:** URL changes to `/teacher/ai-assessments/create/ai?draftId=...`

**Status:** ✅ Pass / ❌ Fail / ⚠️ Issue

---

### STEP 7: Back Navigation (5 minutes)

#### Test: Back Button on Main Page
1. Refresh page and go back to: `/teacher/ai-assessments`
2. Click the back arrow button (top left)
3. Verify page navigates back

**Expected:** Should go back to previous page or dashboard

**Status:** ✅ Pass / ❌ Fail / ⚠️ Issue

---

### STEP 8: Responsive Design (10 minutes)

#### Test: Tablet View (768px)
1. Open DevTools (F12)
2. Click Device Toggle (mobile icon)
3. Set to iPad/Tablet size (768px width)
4. Verify form layout

**Expected:**
- [ ] Form and summary stack vertically
- [ ] All fields are readable
- [ ] No horizontal scroll needed
- [ ] Buttons are easy to tap

**Status:** ✅ Pass / ❌ Fail / ⚠️ Issue

#### Test: Mobile View (375px)
1. Set to iPhone size (375px width)
2. Scroll through entire form
3. Verify all functionality works on mobile

**Expected:**
- [ ] Single column layout
- [ ] No horizontal scroll
- [ ] Buttons are large enough
- [ ] Can scroll to see all fields

**Status:** ✅ Pass / ❌ Fail / ⚠️ Issue

---

## 📊 FINAL SCORE

### Tests Summary:
- **Total Tests:** 25+
- **Tests Passed:** _____
- **Tests Failed:** _____
- **Issues Found:** _____

### Overall Assessment:
- [ ] ✅ **EXCELLENT** - All tests pass, ready for production
- [ ] ✅ **GOOD** - Minor issues only, functional
- [ ] ⚠️ **NEEDS REVIEW** - Some issues found, needs fixes
- [ ] ❌ **BROKEN** - Critical issues, cannot use

---

## 🐛 Issues Found

### Critical Issues:
1. _________________________________
2. _________________________________

### Non-Critical Issues:
1. _________________________________
2. _________________________________

### Notes & Observations:
__________________________________________________________________________________________

__________________________________________________________________________________________

---

## 📝 Console Check

While testing, also check the browser console (F12):
- [ ] No red error messages
- [ ] No warnings about deprecated APIs
- [ ] All API calls succeed (green in Network tab)
- [ ] No infinite loops or pending requests

---

## ✅ Final Approval

- **Tested By:** _______________
- **Date:** _______________
- **Recommended For Production:** YES / NO
- **Comments:** _______________

