# Public Papers Deep Testing Guide

## Overview
Test the public papers marketplace module where teachers can publish and discover papers created by other teachers.

**URL:** `http://localhost:3000/teacher/public-papers`

## Architecture
- **Own Papers Section:** Papers created by logged-in teacher (always shown first)
- **Other Papers Section:** Papers from all other teachers with pagination
- **Filters:** Subject, Standard, Difficulty, Rating
- **Search:** Real-time search by title/teacher name
- **Pagination:** 9 papers per page

---

## Deep Testing Scenarios

### Test 1: Initial Page Load
**Objective:** Verify page loads with correct data structure

**Steps:**
1. Login as a teacher
2. Navigate to `http://localhost:3000/teacher/public-papers`
3. Wait for loading to complete

**Expected Results:**
- ✅ Page shows "Public Papers (X)" with total count
- ✅ "Your Public Papers" section shows your published papers at the top
- ✅ "Other Teachers' Papers" section shows paginated results
- ✅ Each paper card displays:
  - Title
  - Standard badge (e.g., "Std 10th")
  - Price in rupees (₹)
  - Difficulty badge (Beginner, Intermediate, Advanced)
  - Subject tag
  - Star rating (0-5)
  - Question count
  - Duration
  - Attempts count
  - Created date
  - Teacher name with avatar
  - "Preview" button

**If Nothing Shows:**
- Check if teacher has published papers (status = PUBLISHED, isPublic = true)
- Verify papers have price field set
- Check browser console for API errors
- Verify auth token is valid

---

### Test 2: Your Public Papers Display
**Objective:** Verify own papers show first and are correctly marked

**Steps:**
1. Check if you (logged-in teacher) have any public papers
2. If not, publish a paper first through AI Features
3. Navigate back to public-papers

**Expected Results:**
- ✅ "Your Public Papers" section appears at top if you have any
- ✅ Your papers show before other papers in the list
- ✅ Count shows: "Showing X of Y other papers (+ Z your own)"
- ✅ Your papers and other papers are separated visually

**How to Publish a Paper:**
1. Go to AI Features → Create New Paper
2. Fill details and add questions
3. Click Publish → Check "Make Public" → Set price

---

### Test 3: Filter by Subject
**Objective:** Verify subject filtering works

**Steps:**
1. Click "All" under Subjects to see all papers
2. Select "Science"
3. Observe the papers list
4. Select "Mathematics"
5. Select back to "All"

**Expected Results:**
- ✅ Papers filter to show only selected subject
- ✅ Page resets to page 1 on filter change
- ✅ Count updates: "Showing X of Y papers..."
- ✅ All subjects show correctly filtered papers
- ✅ No flicker or delay (should be responsive)

---

### Test 4: Filter by Standard
**Objective:** Verify standard/grade filtering works

**Steps:**
1. Select "8th" under Standard
2. Verify papers shown are for 8th standard
3. Try "9th", "10th"
4. Select "All" to reset

**Expected Results:**
- ✅ Papers filter correctly by standard
- ✅ Standard badges on cards match selected filter
- ✅ Page resets to 1 on filter change
- ✅ Count shows filtered total
- ✅ Works in combination with subject filter

---

### Test 5: Filter by Difficulty Level
**Objective:** Verify difficulty filtering

**Steps:**
1. Select "Beginner" difficulty
2. Check if papers show easy content
3. Try "Intermediate" and "Advanced"
4. Check difficulty badges match

**Expected Results:**
- ✅ Papers filter by difficulty level
- ✅ Difficulty badges visible on cards match filter
- ✅ Can combine with other filters
- ✅ Colors are consistent (Beginner, Intermediate, Advanced)

---

### Test 6: Filter by Rating
**Objective:** Verify rating filter works

**Steps:**
1. Select "4 ★ & above" - show papers with rating ≥ 4
2. Select "Most Popular" - show papers with most attempts
3. Select "All" to reset

**Expected Results:**
- ✅ Only papers matching rating threshold show
- ✅ Star ratings on cards are visible (0-5 scale)
- ✅ "Most Popular" sorts by attempt count
- ✅ Filters work in combination with others

---

### Test 7: Combined Filters
**Objective:** Verify multiple filters work together

**Steps:**
1. Select: Subject = "Science", Standard = "9th", Difficulty = "Intermediate"
2. Observe filtered results
3. Change one filter at a time
4. Reset all filters

**Expected Results:**
- ✅ Papers match ALL selected criteria
- ✅ Count updates to show correct total
- ✅ Can change any filter without conflicts
- ✅ Page resets to 1 when filters change
- ✅ Empty state shows if no papers match

---

### Test 8: Search Functionality
**Objective:** Verify search by title and teacher name

**Steps:**
1. Type a paper title (e.g., "Science")
2. Verify results update (should see matching papers)
3. Clear and type a teacher name
4. Verify papers by that teacher show

**Expected Results:**
- ✅ Search filters papers by title
- ✅ Search also works with teacher names
- ✅ Results update as you type
- ✅ Search works in combination with other filters
- ✅ Clear search to show all papers

---

### Test 9: Pagination
**Objective:** Verify pagination works correctly

**Steps:**
1. Navigate to page 2 by clicking page number
2. Click "Next" button
3. Click "Prev" button
4. Click "1" to return to first page

**Expected Results:**
- ✅ Page numbers show (up to 5 visible at a time)
- ✅ Current page is highlighted
- ✅ Next/Prev buttons enable/disable appropriately
- ✅ Each page shows different 9 papers
- ✅ Page scrolls to top on navigation
- ✅ Status text shows: "Showing X of Y papers"

---

### Test 10: Price Display & Badges
**Objective:** Verify all visual indicators display correctly

**Steps:**
1. Check each paper card for:
   - Price badge (yellow background, ₹)
   - Standard badge (gray background)
   - Difficulty badge (colored)
   - Subject tag (gray)
2. Verify prices are accurate for different papers

**Expected Results:**
- ✅ Price shows correctly in yellow badge
- ✅ Standard shows as "Std 10th" format
- ✅ Difficulty colored: Red=Advanced, Orange=Intermediate, Green=Beginner
- ✅ Subject shows the actual subject name
- ✅ All badges render without overflow

---

### Test 11: Teacher Information
**Objective:** Verify teacher details display

**Steps:**
1. Look at paper cards for teacher info
2. Check if avatar/profile picture displays
3. Verify teacher name is shown

**Expected Results:**
- ✅ Teacher avatar displays (or fallback icon)
- ✅ Teacher name shown correctly
- ✅ Avatar has proper border and sizing
- ✅ Avatar is clickable/interactive (if implemented)

---

### Test 12: Empty State
**Objective:** Verify empty state messaging

**Steps:**
1. Apply filters that match no papers (e.g., "Advanced" for standard "12th" and "Biology")
2. OR clear all papers from database temporarily

**Expected Results:**
- ✅ Shows "No papers found" message
- ✅ Shows helpful search icon
- ✅ "Clear all filters" button appears and works
- ✅ Message text is clear and helpful

---

### Test 13: Mobile Responsiveness
**Objective:** Verify mobile view works correctly

**Steps:**
1. Open DevTools (F12)
2. Set device width to mobile (375px)
3. Test all features:
   - Filter button opens sidebar
   - Search works
   - Papers display correctly
   - Pagination works

**Expected Results:**
- ✅ "Filters (X)" button shows instead of sidebar
- ✅ Mobile filter sidebar opens from right
- ✅ Papers stack single column
- ✅ All buttons are touchable (44px+ height)
- ✅ Text is readable
- ✅ Pagination is accessible

---

### Test 14: Real-time Data Updates
**Objective:** Verify new papers appear without page refresh

**Steps:**
1. Open public-papers in one browser tab
2. In another tab, go to AI Features → Create & Publish a paper with:
   - Make Public: Yes
   - Set Price: ₹100
3. Return to public-papers tab
4. Apply a filter that would show new paper

**Expected Results:**
- ✅ New paper appears in list
- ✅ Total count updates
- ✅ Paper shows correctly with all details
- ✅ Can filter/search for new paper
- ✅ No need to manually refresh

---

### Test 15: Performance Check
**Objective:** Verify page performance

**Steps:**
1. Open DevTools Network tab
2. Load public-papers page
3. Change filters multiple times
4. Navigate through pages
5. Use search

**Expected Results:**
- ✅ Initial load < 2 seconds
- ✅ Filter changes < 1 second
- ✅ Page navigation < 1 second
- ✅ Search responds while typing
- ✅ No console errors
- ✅ Network tab shows successful API calls (200 status)

---

### Test 16: API Response Validation
**Objective:** Verify backend API returns correct data

**Steps:**
1. Open DevTools → Network tab
2. Go to public-papers
3. Click on Network request: `getPublicPapers`
4. Check Response tab

**Expected Results:**
- ✅ Response includes: `ownPapers`, `otherPapers`, `pagination`
- ✅ Each paper has: id, title, price, rating, totalAttempts, averageScore, subject, teacher, questionCount
- ✅ Pagination shows: page, limit, total, pages
- ✅ Rating is calculated correctly (0-5 scale)
- ✅ Status code is 200

---

### Test 17: Filter Persistence During Pagination
**Objective:** Verify filters stay applied when changing pages

**Steps:**
1. Apply filters: Science, 10th, Intermediate
2. Go to page 2
3. Go to page 3
4. Observe filters remain selected

**Expected Results:**
- ✅ Filter selections remain visible in sidebar
- ✅ Papers on page 2 & 3 match the filters
- ✅ Can change filters on any page
- ✅ Page resets to 1 when filters change

---

### Test 18: Price Sorting & Filtering
**Objective:** Verify papers with different prices display correctly

**Steps:**
1. Look for papers with different prices (₹50, ₹100, ₹200, etc.)
2. Verify price badge shows correctly
3. Try to find both free (₹0) and paid papers

**Expected Results:**
- ✅ All prices display correctly
- ✅ Zero price shows as ₹0
- ✅ High prices (₹200+) display without overlap
- ✅ Price field is required for public papers

---

### Test 19: Trending/Popular Indicators
**Objective:** Verify trending papers show special indicator

**Steps:**
1. Look for papers with many attempts
2. Check if trending icon appears for popular papers
3. Papers with 50+ attempts should show trending

**Expected Results:**
- ✅ Papers with high attempts show trending icon (if implemented)
- ✅ Trending icon visible and styled
- ✅ Clicking sort by "Most Popular" shows trending papers first

---

### Test 20: Error Handling
**Objective:** Verify error states handle gracefully

**Steps:**
1. Disconnect internet temporarily
2. Try to load papers
3. Click Retry button
4. Reconnect internet and retry

**Expected Results:**
- ✅ Error message shows: "Failed to Load Papers"
- ✅ Retry button appears and works
- ✅ After reconnecting, papers load successfully
- ✅ No infinite loading or frozen UI

---

## Summary Checklist

### Functional Features
- [ ] Page loads without errors
- [ ] Own papers display first
- [ ] Other papers paginate correctly (9 per page)
- [ ] Subject filter works
- [ ] Standard filter works
- [ ] Difficulty filter works
- [ ] Rating filter works
- [ ] Multiple filters work together
- [ ] Search by title works
- [ ] Search by teacher name works
- [ ] Pagination works (Prev, Next, page numbers)
- [ ] Paper cards display all information
- [ ] Teacher avatars show correctly
- [ ] Price badges are accurate
- [ ] Difficulty badges color correctly
- [ ] Empty state shows for no results
- [ ] Error handling works

### Visual/UI Features
- [ ] Layout is responsive on mobile
- [ ] Filters show in sidebar on desktop
- [ ] Mobile filter button works
- [ ] Paper cards are properly sized
- [ ] Badges display without overflow
- [ ] Icons display correctly
- [ ] Colors are consistent
- [ ] Spacing is proper
- [ ] Fonts are readable

### Performance
- [ ] Initial load < 2 seconds
- [ ] Filter changes responsive
- [ ] Search is fast
- [ ] No console errors
- [ ] API calls are successful (200 status)
- [ ] Network requests are optimized

### Real-time Features
- [ ] New published papers appear
- [ ] Data updates without refresh
- [ ] Counts update accurately
- [ ] Filters respect new data

---

## How to Add Test Data

See **[DATABASE_SEEDING.md](./DATABASE_SEEDING.md)** for scripts to add real-time test data with:
- 3+ Public papers with different prices (₹50, ₹100, ₹200)
- Papers with different standards (8th, 9th, 10th, 11th, 12th)
- Papers with different difficulties (Beginner, Intermediate, Advanced)
- Papers with different subjects (Science, Mathematics, History)
- Papers with different attempt counts (for rating calculation)
- Multiple teachers so "Other Papers" section populates

---

## Troubleshooting

### No Papers Showing
1. Verify papers are published (status = "PUBLISHED")
2. Verify papers have isPublic = true
3. Verify papers have price set (required for public papers)
4. Check backend logs for errors

### Filters Not Working
1. Check if API is receiving filter parameters
2. Verify filter values match database values
3. Check browser console for errors
4. Verify query parameters in Network tab

### Pagination Not Showing
1. Need 10+ papers in database for pagination to appear
2. Check if pagination component is mounted
3. Verify page count calculation is correct

### Data Not Updating in Real-time
1. Papers need to be published, not just drafted
2. Papers need isPublic = true
3. Papers need price field set
4. Manually refresh page to verify data was added

---

## Expected API Response Format

```json
{
  "success": true,
  "message": "Public papers fetched successfully",
  "data": {
    "ownPapers": [
      {
        "id": "paper_id_1",
        "title": "Class 10 Mathematics",
        "standard": 10,
        "difficulty": "INTERMEDIATE",
        "subject": {
          "id": "subject_id",
          "name": "Mathematics"
        },
        "teacher": {
          "id": "teacher_id",
          "firstName": "Rajesh",
          "lastName": "Kumar",
          "email": "teacher@hubx.com"
        },
        "price": 100,
        "totalAttempts": 25,
        "averageScore": 72.5,
        "questionCount": 15,
        "createdAt": "2025-02-17T10:30:00Z"
      }
    ],
    "otherPapers": [...],
    "pagination": {
      "page": 1,
      "limit": 9,
      "total": 45,
      "pages": 5
    }
  }
}
```

---

## Next Steps

1. ✅ Complete all 20 test scenarios
2. ✅ Verify checklist items
3. ✅ Test on different browsers (Chrome, Firefox, Safari)
4. ✅ Test on different devices (Desktop, Tablet, Mobile)
5. ✅ Load test with 100+ papers in database
6. ✅ Test edge cases (very long titles, zero price, no avatar)
7. ✅ Verify accessibility (keyboard navigation, screen readers)

---

**Last Updated:** February 17, 2025
**Status:** Ready for comprehensive testing
