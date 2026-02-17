# Paper Assessments Testing Guide

## Overview
This guide will help you test the Private Papers (/teacher/paper-assessments) module like a real user, with all filters, search, and real-time updates working properly.

## Prerequisites
- You must be logged in as a teacher
- You should have created some papers first (or have papers in the database)
- Backend and Frontend should be running

## Quick Setup (If No Papers Exist)
If you don't have any papers created, you can quickly create some for testing:

1. Navigate to `/teacher/dashboard`
2. Go to `AI Features` → Create New Paper
3. Fill in paper details with different:
   - Titles: "Algebra Basics", "Biology Chapter 1", "History Essay"
   - Standards: Mix of 8th, 9th, 10th, 11th, 12th
   - Subjects: Science, Mathematics, English
   - Difficulties: Easy, Intermediate, Advanced
4. Add at least 3-5 questions to each paper
5. Save papers

## Testing Scenarios

### Test 1: Page Load & Initial Display
**Objective:** Verify papers load on initial page visit

**Steps:**
1. Navigate to `http://localhost:3000/teacher/paper-assessments`
2. Wait for the loading spinner to disappear

**Expected Results:**
- ✅ Page title "Private Papers (X)" shows with count
- ✅ Papers list displays with cards showing:
  - Paper title
  - Difficulty badge (green for Beginner, orange for Intermediate, red for Advanced)
  - Tags/Chapters
  - Rating (0-5 stars)
  - Questions count
  - Duration in minutes
  - Attempts/plays count
  - Date created
  - Teacher name and avatar
- ✅ "Create New Paper" button visible at top right
- ✅ Pagination controls appear if more than 9 papers

---

### Test 2: Filter by Subject
**Objective:** Verify subject filtering works correctly

**Steps:**
1. Look at the left sidebar filters (or click "Filters" on mobile)
2. Click on "Mathematics" under Subjects
3. Observe the papers list update

**Expected Results:**
- ✅ Only papers with Mathematics subject display
- ✅ "All" option shows the complete list
- ✅ Transitions smoothly without page refresh
- ✅ Counter shows "Private Papers (X)" updates with filtered count

---

### Test 3: Filter by Standard/Grade
**Objective:** Verify standard filtering works correctly

**Steps:**
1. In the Filters panel, click on "10th" under Standard
2. Observe the papers list

**Expected Results:**
- ✅ Only papers for 10th standard display
- ✅ Can select different standards: 8th, 9th, 10th, 11th, 12th
- ✅ Selecting "All" shows papers from all standards
- ✅ Can combine with Subject filter

---

### Test 4: Filter by Difficulty Level
**Objective:** Verify difficulty filtering works correctly

**Steps:**
1. In the Filters panel, click on "Intermediate" under Difficulty Level
2. Observe the papers list

**Expected Results:**
- ✅ Only papers with Intermediate difficulty display
- ✅ Options available: Beginner, Intermediate, Advanced
- ✅ "All" shows papers of all difficulties
- ✅ Can combine with other filters (subject + difficulty)

---

### Test 5: Combined Filters
**Objective:** Verify multiple filters work together

**Steps:**
1. Select Subject: "Science"
2. Select Standard: "9th"
3. Select Difficulty: "Advanced"

**Expected Results:**
- ✅ Only papers matching ALL conditions display
- ✅ Paper count updates correctly
- ✅ If no papers match, shows "No papers found" message with option to "Clear Filters"
- ✅ Clear Filters button resets all filters to "All"

---

### Test 6: Search Functionality
**Objective:** Verify search works with debouncing

**Steps:**
1. Click the search box at the top (Magnifying glass icon)
2. Type "Algebra" slowly
3. Wait 500ms and observe results

**Expected Results:**
- ✅ Results update smoothly as you type
- ✅ Search is debounced (waits 500ms before searching)
- ✅ Finds papers by title or description
- ✅ Works combined with other filters
- ✅ Clear search box to reset

---

### Test 7: Sort Functionality
**Objective:** Verify sorting options work

**Steps:**
1. Click the "Sort By" dropdown (right side of search area)
2. Select different sort options:
   - Most Recent (default)
   - Most Popular
   - Highest Rated

**Expected Results:**
- ✅ Papers order changes based on selection
- ✅ "Most Recent" shows newest papers first
- ✅ "Most Popular" sorts by number of attempts
- ✅ "Highest Rated" sorts by average score

---

### Test 8: Pagination
**Objective:** Verify pagination works correctly

**Steps:**
1. Navigate to the bottom of papers list
2. If you have more than 9 papers, pagination controls show
3. Click on page number "2"
4. Click "Next" button
5. Click "Prev" button

**Expected Results:**
- ✅ Page numbers highlight current page (lighter background)
- ✅ Next/Prev buttons enable/disable appropriately
- ✅ Papers update to show correct page
- ✅ Page scrolls to top automatically on page change

---

### Test 9: Paper Card Actions
**Objective:** Verify paper card buttons work

**Steps:**
1. Find a paper card
2. Click the "Questions" button (blue button)
3. Go back and click the "Manage" button

**Expected Results:**
- ✅ "Questions" button navigates to `/teacher/papers/{paperId}/questions`
- ✅ Can view and manage questions for the paper
- ✅ "Manage" button navigates to paper edit/management page
- ✅ "MoreVertical" menu button exists (for future features)

---

### Test 10: Real-time Data Updates
**Objective:** Verify data updates reflect in real-time

**Steps:**
1. Open paper-assessments in one browser tab
2. In another tab, go to AI Features and create a new paper
3. Come back to the paper-assessments tab
4. Change a filter slightly (toggle a subject on/off) to refresh data

**Expected Results:**
- ✅ New paper appears in the list
- ✅ Paper count in header updates
- ✅ Filters still work with new data

---

### Test 11: Mobile Filters
**Objective:** Verify mobile responsive filters work

**Steps:**
1. Open on mobile device or use browser DevTools (F12) to set device width < 1024px
2. Notice filters are hidden by default
3. Click "Filters" button (top right)
4. Adjust filters in the side panel

**Expected Results:**
- ✅ Filters panel slides in from right side
- ✅ Can close with X button
- ✅ Filters apply to papers list
- ✅ Papers list is full width on mobile
- ✅ Search bar and sort dropdown visible

---

### Test 12: Empty State
**Objective:** Verify empty state messaging

**Steps:**
1. Apply filters that match no papers (e.g., "8th" standard with "Advanced" difficulty and "English" subject)
2. OR Create a filter combination that yields no results

**Expected Results:**
- ✅ Shows "No papers found" message with icon
- ✅ Helpful text: "Try adjusting your filters or search query..."
- ✅ "Clear Filters" button visible and functional
- ✅ Clicking "Clear Filters" resets all filters and shows papers again

---

## Summary Checklist

**Frontend Features:**
- [ ] Page loads without errors
- [ ] All 9+ papers display initially
- [ ] Subject filter works (Science, Mathematics, English, History)
- [ ] Standard filter works (8th-12th)
- [ ] Difficulty filter works (Beginner, Intermediate, Advanced)
- [ ] Multiple filters work together
- [ ] Search finds papers by title/description
- [ ] Sort options work (Recent, Popular, Rated)
- [ ] Pagination works (Prev, Next, page numbers)
- [ ] Paper card buttons navigate correctly
- [ ] Mobile filters work
- [ ] Empty state displays properly
- [ ] Filter counts are accurate

**Backend Features (API):**
- [ ] GET /teacher/papers endpoint returns papers
- [ ] Filters are applied correctly (subject, difficulty, std)
- [ ] Search filters by title/description
- [ ] Sort works (by createdAt, totalAttempts, averageScore)
- [ ] Pagination works (page, limit)
- [ ] Rating is calculated from exam attempts
- [ ] Response includes all required fields (chapters, questions, subject)

---

## If Something Fails

### Papers Not Showing
1. **Check Database Connection:**
   - Verify backend is running: `npm run dev` from Hubx_backend
   - Check browser console (F12) for API errors
   - Check backend logs for database errors

2. **Create Sample Papers:**
   ```bash
   node /e/Hubx_Project/Hubx_backend/scripts/create-test-users.js
   ```

3. **Check API Endpoint:**
   - Visit: `http://localhost:3001/api/teacher/papers` (after logging in)
   - Should return JSON with papers array

### Filters Not Working
1. **Check Backend Parameters:**
   - Verify query params are in URL
   - Example: `?page=1&limit=9&subject=Science&std=10th&difficulty=Intermediate`

2. **Check Frontend Service:**
   - Open DevTools Network tab
   - Look for request to `/api/teacher/papers?...`
   - Verify query params match filter selections

3. **Reset Filters:**
   - Click "Clear Filters" button
   - Refresh page (F5)

### Pagination Not Working
1. Verify total count is accurate
2. Check that papers count matches pagination
3. Manual URL test: `?page=2&limit=9`

### Search Not Updating
1. Wait 500ms after typing (debounce delay)
2. Check browser Network tab for API requests
3. Try clearing search and typing again

### Empty State Shows Incorrectly
1. Click "Clear Filters" to reset
2. If still empty, create new papers in AI Features
3. Refresh page

---

## Frontend Files Modified
- `/Hubx_frontend/src/services/private-paper-service.ts` - Added `std` parameter support
- `/Hubx_backend/src/modules/teacher/teacher.controller.ts` - Added filter parameter extraction
- `/Hubx_backend/src/modules/teacher/paper.service.ts` - Added filter logic and rating calculation

## Backend Features Implemented
- ✅ Subject filtering
- ✅ Standard/Grade filtering (8th-12th)
- ✅ Difficulty filtering with mapping (Beginner→EASY, Intermediate→INTERMEDIATE, Advanced→ADVANCED)
- ✅ Text search in title and description
- ✅ Sorting (Most Recent, Most Popular by attempts, Highest Rated by average score)
- ✅ Pagination with accurate total count
- ✅ Rating calculation from exam attempts
- ✅ Combine multiple filters

## Next Steps After Testing
Once all tests pass:
1. Test with student users taking exams to ensure rating calculation works
2. Test API performance with large dataset (100+ papers)
3. Consider caching frequent filter combinations
4. Add analytics to track which filters are used most
