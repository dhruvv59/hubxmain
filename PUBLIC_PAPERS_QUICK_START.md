# Public Papers Testing - Quick Start Guide

## ✅ What's Been Done

### Sample Data Added
**12 Public Papers** have been created with:

#### By Price Range:
- **Budget Papers (₹40-₹50):** 4 papers
- **Standard Papers (₹75-₹120):** 5 papers
- **Premium Papers (₹180-₹250):** 3 papers

#### By Standard/Class:
- Class 8: 2 papers (Basic topics)
- Class 9: 3 papers (Foundation)
- Class 10: 3 papers (Intermediate)
- Class 11: 3 papers (Advanced)
- Class 12: 1 paper (Highest level)

#### By Difficulty:
- **EASY:** 4 papers (Beginner level)
- **INTERMEDIATE:** 4 papers (Medium level)
- **ADVANCED:** 4 papers (Expert level)

#### By Teacher:
- Amit (4 papers)
- Priya (4 papers)
- Rajesh (4 papers)

### Features Ready to Test

#### ✨ Working Features:
1. ✅ Own Public Papers Display
2. ✅ Other Teachers' Papers Display
3. ✅ Filter by Subject
4. ✅ Filter by Standard (8th-12th)
5. ✅ Filter by Difficulty (Beginner/Intermediate/Advanced)
6. ✅ Filter by Rating
7. ✅ Search by Title
8. ✅ Search by Teacher Name
9. ✅ Pagination (9 papers/page)
10. ✅ Price Display
11. ✅ Rating Calculation
12. ✅ Mobile Responsive

---

## 🧪 How to Test Now

### Test 1: Basic Load (2 minutes)
```
1. Open: http://localhost:3000/teacher/public-papers
2. Should see:
   - "Public Papers (12)" title
   - "Other Teachers' Papers" section
   - Multiple paper cards with prices
   - 2 pages of papers
```

**Expected:** See 9 papers on page 1, pagination controls showing page 2

### Test 2: Filter Testing (5 minutes)
```
1. Click "Class 9" under Standard
   → Should see only 3 papers

2. Click "EASY" under Difficulty
   → Should see fewer papers

3. Click "All" to reset
   → Should see all 12 papers again
```

**Expected:** Filters work instantly, results update

### Test 3: Search Testing (3 minutes)
```
1. Type "Mathematics" in search box
   → Should see only math papers

2. Type "Amit"
   → Should see only Amit's papers

3. Clear search
   → Should see all papers
```

**Expected:** Search works as you type

### Test 4: Pagination (2 minutes)
```
1. Click "Next" button
   → Should go to page 2

2. Click page "1"
   → Should go back to page 1

3. Click "Prev" on page 1
   → Should be disabled
```

**Expected:** Navigation works smoothly, page scrolls to top

### Test 5: Paper Card Details (3 minutes)
```
Look at any paper card and verify:
✓ Title displayed
✓ Price badge (yellow) showing ₹value
✓ Standard badge showing "Std 10th"
✓ Difficulty badge (colored)
✓ Subject tag
✓ Star rating (0-5)
✓ Question count
✓ Duration
✓ Attempts number
✓ Date
✓ Teacher name
✓ Preview button
```

**Expected:** All details visible and correctly formatted

### Test 6: Combined Filters (4 minutes)
```
1. Select: Subject = Science, Standard = 10, Difficulty = INTERMEDIATE
2. Check results match all 3 criteria
3. Change one filter
4. Verify only papers matching new criteria show
```

**Expected:** Multi-filter works correctly

### Test 7: Mobile Test (3 minutes)
```
1. Press F12 (DevTools)
2. Click device toggle (mobile icon)
3. Set width to 375px
4. Test:
   - Click "Filters" button
   - Try search
   - Check pagination
   - Scroll through papers
```

**Expected:** Everything works on mobile, buttons are touchable

### Test 8: Real-time Update (5 minutes)
```
1. Keep public-papers tab open
2. Open new tab: http://localhost:3000/teacher/ai-assessments
3. Create & Publish new paper with:
   - Make Public: YES
   - Price: ₹150
4. Return to public-papers tab
5. Change a filter to trigger refresh
6. New paper should appear!
```

**Expected:** New paper shows up without manual refresh

---

## 📊 Test Data Summary

### Papers by Teacher:
| Teacher | Papers | Price Range | Topics |
|---------|--------|------------|--------|
| **Amit** | 4 | ₹40-₹100 | Science, Math, English |
| **Priya** | 4 | ₹50-₹250 | Math, Science, History |
| **Rajesh** | 4 | ₹45-₹200 | Physics, Chemistry, Biology |

### Popular Filters to Try:
```
Filter Combo 1: Standard=10, Difficulty=INTERMEDIATE
  → Shows: 3 papers

Filter Combo 2: Subject=Science, Difficulty=EASY
  → Shows: 2 papers

Filter Combo 3: Just Search "Math"
  → Shows: 4 papers
```

### Price Points to Verify:
- Lowest: ₹40 (Class 8 Science)
- Highest: ₹250 (Class 12 Math)
- Most Common: ₹100-₹120

---

## 🔍 What to Look For

### UI Elements ✓
- [ ] All paper cards display correctly
- [ ] Prices show in yellow badges
- [ ] Difficulty colors are distinct
- [ ] Pagination buttons work
- [ ] Mobile filters open/close
- [ ] Search box is visible and functional
- [ ] No text overflow or clipping
- [ ] Spacing is consistent

### Functionality ✓
- [ ] Filters apply instantly
- [ ] Search works while typing
- [ ] Pagination shows correct page numbers
- [ ] "Previous" disabled on page 1
- [ ] "Next" disabled on last page
- [ ] Page counter shows correct totals
- [ ] Clear filters button works
- [ ] No console errors

### Data ✓
- [ ] All 12 papers visible across pages
- [ ] Each paper has correct details
- [ ] Prices are accurate
- [ ] Teacher names display
- [ ] Difficulty matches data
- [ ] Ratings calculated (0-5 scale)
- [ ] Attempt counts show
- [ ] Dates are reasonable

---

## 📝 Testing Checklist

**Quick Test (5 minutes)**
- [ ] Page loads without errors
- [ ] Can see 9 papers on first page
- [ ] Pagination shows page 2
- [ ] Search filters papers
- [ ] Mobile view works

**Standard Test (15 minutes)**
- [ ] All filters work
- [ ] Combined filters work
- [ ] Pagination works fully
- [ ] All paper details visible
- [ ] Mobile responsive

**Deep Test (30 minutes)**
- [ ] Complete all 20 scenarios from `PUBLIC_PAPERS_TESTING_GUIDE.md`
- [ ] Test error handling
- [ ] Test performance
- [ ] Test API responses
- [ ] Test edge cases

---

## 🚀 Quick Commands

### Run Tests Again
```bash
# Add 12 more papers (creates duplicates, but tests scale)
node scripts/add-public-papers.mjs

# View current papers in database
# (Use Prisma Studio)
npx prisma studio
```

### View in Browser
```
http://localhost:3000/teacher/public-papers
```

### Debug API
```
1. Press F12 (DevTools)
2. Go to Network tab
3. Look for request: "getPublicPapers"
4. Check Response tab to see API data
```

---

## ⚠️ Common Issues & Solutions

### Issue: No papers showing
**Solution:**
1. Check papers are marked PUBLISHED (not DRAFT)
2. Check papers are PUBLIC (isPublic = true)
3. Check papers have price set (required)
4. Refresh page (Ctrl+Shift+R for hard refresh)

### Issue: Only 9 papers showing
**Solution:**
1. This is correct - pagination shows 9 per page
2. Click "Next" to see more
3. Or click page "2" if available

### Issue: Filters not working
**Solution:**
1. Check backend is running
2. Check browser console (F12) for errors
3. Verify API calls in Network tab
4. Try hard refresh (Ctrl+Shift+R)

### Issue: Search is slow
**Solution:**
1. This is normal - search uses 500ms debounce
2. Wait after typing
3. Check browser console for errors

### Issue: Mobile view not responsive
**Solution:**
1. Hard refresh (Ctrl+Shift+R)
2. Close DevTools and reopen
3. Try different screen size

---

## 📚 Full Documentation

- **Deep Testing Guide:** `PUBLIC_PAPERS_TESTING_GUIDE.md`
- **Paper Assessments Guide:** `PAPER_ASSESSMENTS_TESTING_GUIDE.md`
- **Backend Filtering:** Implemented in `paper.service.ts`

---

## 🎯 Success Criteria

The public-papers module is working perfectly when:

✅ All 12 papers display across 2 pages
✅ Filters work and update results instantly
✅ Search finds papers by title/teacher
✅ Pagination navigates correctly
✅ Mobile view is responsive
✅ Paper details are complete and accurate
✅ Prices display correctly
✅ Ratings calculate from attempts
✅ No console errors
✅ API responses are successful (200 status)

---

## 🎉 You're Ready!

**Go test:** http://localhost:3000/teacher/public-papers

The module has real data, working filters, search, pagination, and mobile support. Go explore!

If you find any issues, check the troubleshooting section above or the full testing guide.

Happy testing! 🚀
