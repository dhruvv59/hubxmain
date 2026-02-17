# 🧪 AI Assessments Module - Complete Testing Guide

## 📌 START HERE

Welcome! This document will guide you through comprehensive testing of the **AI Assessments Module** at `/teacher/ai-assessments`.

---

## 🎯 What is Being Tested?

The **AI Assessments Module** allows teachers to:
1. **Create question papers** with configurable parameters
2. **Select content** (Standard, Subject, Chapters)
3. **Configure paper properties** (Time bound, Public, Price, Duration)
4. **Generate draft papers** for further editing
5. **Add questions** via three methods: Manual, Bulk Upload, or AI Generation

---

## ✨ Key Features to Test

### 1. **Form Fields & Input**
- Title input field
- Standard dropdown (loads subjects on selection)
- Subject dropdown (loads chapters on selection)
- Chapter selection (grid of checkboxes with "All" toggle)
- Difficulty toggle (Easy/Intermediate/Advanced)
- Duration dropdown (30/60/90/120 minutes)
- Price input field
- Paper type toggles (Time Bound, Public, Free Access)

### 2. **Form Validation**
- Required field validation
- Cascading dropdown behavior
- Chapter selection requirement
- Clear error messages

### 3. **Data Flow**
- Form inputs → Summary card (real-time updates)
- Form submission → Draft creation
- Draft retrieval → Creation method selection

### 4. **Navigation**
- Back button functionality
- Method navigation (Manual/Bulk/AI)
- URL parameter handling

---

## 📊 Testing Approach

### **Option A: Quick Test (20-30 minutes)** ⚡
*Best for: Quick verification, smoke testing, daily checks*

**Location:** `AI_ASSESSMENTS_QUICK_TEST.md`

**What it covers:**
- Page load and UI rendering
- Form field functionality
- Form validation
- Complete form submission
- Draft persistence
- Navigation to creation methods
- Responsive design basics

**When to use:**
- Before deploying to production
- To quickly verify all basic functionality works
- Daily/weekly smoke testing

---

### **Option B: Comprehensive Test (1-2 hours)** 🔬
*Best for: Deep testing, finding edge cases, QA verification*

**Location:** `AI_ASSESSMENTS_COMPREHENSIVE_TESTING.md`

**What it covers:**
- 16 test suites with 100+ test cases
- Boundary conditions & edge cases
- Browser compatibility (Chrome, Firefox, Safari)
- Responsive design (Desktop, Tablet, Mobile)
- Accessibility (Keyboard navigation, Screen readers)
- Error handling (Network failures, Invalid data)
- Performance considerations

**When to use:**
- Initial launch/release testing
- After major updates
- QA/regression testing
- Before going live

---

## 🚀 Getting Started

### **Prerequisites**
- [ ] Logged in as a teacher
- [ ] Backend server running
- [ ] Frontend server running (Next.js on localhost:3000)
- [ ] Modern browser (Chrome, Firefox, Safari, or Edge)

### **Quick Start (5 minutes)**
1. **Open the application:**
   ```
   http://localhost:3000/teacher/ai-assessments
   ```

2. **Check the page loads:**
   - You should see "Generate Paper" header
   - Form should be visible on the left
   - Summary card should be visible on the right

3. **If it doesn't load:**
   - Check console (F12) for errors
   - Verify you're logged in
   - Verify both servers are running
   - Check network connection

---

## 📋 Testing Workflow

### **Step 1: Choose Your Testing Approach**
```
Are you doing a quick verification?
├─ YES → Use Quick Test (20 min)
└─ NO  → Use Comprehensive Test (1-2 hours)
```

### **Step 2: Run the Tests**
- Open the appropriate testing document
- Follow step-by-step instructions
- Mark each test as ✅ Pass / ❌ Fail / ⚠️ Issue

### **Step 3: Document Findings**
- Note any issues found
- Describe expected vs actual behavior
- Take screenshots if needed
- Record console errors

### **Step 4: Create Test Report**
- Summarize all findings
- Categorize issues (Critical/Non-Critical)
- Provide recommendations

---

## 🔍 What to Monitor While Testing

### **Browser Console (F12 → Console tab)**
- [ ] No red error messages
- [ ] No "Uncaught" exceptions
- [ ] No warnings about deprecated APIs
- [ ] All API calls logged with correct parameters

### **Network Tab (F12 → Network tab)**
- [ ] All API requests return 200/201 status
- [ ] No failed requests (red)
- [ ] Response times are reasonable (<2 seconds)
- [ ] Correct endpoints are being called

### **Application State**
- [ ] Form state updates correctly
- [ ] Summary card updates in real-time
- [ ] Navigation works smoothly
- [ ] No page reloads when not expected
- [ ] Data persists correctly

---

## ⚠️ Common Issues to Watch For

### **Form Issues**
- ❌ Dropdowns not populating
- ❌ Cascading selections not working
- ❌ Checkboxes not toggling
- ❌ Validation not triggering

### **API Issues**
- ❌ Draft not creating
- ❌ Data not loading from backend
- ❌ Timeout errors
- ❌ 404/500 server errors

### **Navigation Issues**
- ❌ Back button not working
- ❌ Cannot navigate to creation methods
- ❌ Lost data after navigation
- ❌ Infinite loading spinner

### **UI Issues**
- ❌ Form fields overflow on mobile
- ❌ Buttons not clickable
- ❌ Text not visible (contrast issues)
- ❌ Responsive layout broken

---

## 🐛 How to Report Issues

When you find an issue, document it with:

```markdown
### Issue Title: [Clear description]

**Steps to Reproduce:**
1. ...
2. ...
3. ...

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happened]

**Browser/Device:**
[Chrome 120 / Firefox 121 / Safari / etc.]

**Screenshots/Errors:**
[Paste console errors if any]

**Severity:**
[ ] Critical (blocks functionality)
[ ] High (breaks feature)
[ ] Medium (impacts usability)
[ ] Low (cosmetic/minor)
```

---

## 📱 Testing on Different Devices

### **Desktop (1920x1080)**
- Two-column layout should show
- All fields visible without scrolling
- Form feels spacious and well-organized

### **Tablet (768x1024)**
- Single-column layout
- Summary below form
- All interactive elements accessible

### **Mobile (375x667)**
- Full-screen single column
- Readable text without zooming
- Easy-to-tap buttons (44x44px minimum)

---

## ⌨️ Keyboard Navigation Test

To test accessibility:
1. Tab through all form fields
2. Verify focus is always visible
3. Use Space/Enter to toggle checkboxes and buttons
4. Use Arrow keys in dropdowns
5. Press Escape to close dropdowns (if applicable)

---

## 🎯 Success Criteria

### **Must Pass (Critical)**
- [ ] Page loads without errors
- [ ] All form fields are functional
- [ ] Form validation works correctly
- [ ] Draft can be created successfully
- [ ] Can navigate to creation methods
- [ ] No console errors

### **Should Pass (High Priority)**
- [ ] Responsive design works on all devices
- [ ] All API calls succeed
- [ ] Navigation is smooth
- [ ] Error messages are clear
- [ ] Keyboard navigation works

### **Nice to Have (Medium Priority)**
- [ ] Accessibility features fully implemented
- [ ] Performance is optimal
- [ ] Browser compatibility confirmed
- [ ] Edge cases handled gracefully

---

## 📊 Test Summary Template

Use this when you complete testing:

```markdown
## Test Summary

**Date:** [Date]
**Tester:** [Name]
**Testing Approach:** Quick / Comprehensive
**Duration:** [Time spent]

### Results
- **Tests Run:** [Number]
- **Tests Passed:** [Number] ✅
- **Tests Failed:** [Number] ❌
- **Tests Blocked:** [Number] ⚠️

### Issues Found
- **Critical:** [Number]
- **High:** [Number]
- **Medium:** [Number]
- **Low:** [Number]

### Overall Assessment
- [ ] Ready for Production
- [ ] Needs Minor Fixes
- [ ] Needs Major Fixes
- [ ] Not Ready

### Recommendations
1. ...
2. ...
```

---

## 🔗 Quick Links

- **Quick Test:** `AI_ASSESSMENTS_QUICK_TEST.md`
- **Comprehensive Test:** `AI_ASSESSMENTS_COMPREHENSIVE_TESTING.md`
- **Application URL:** `http://localhost:3000/teacher/ai-assessments`
- **Backend API:** `http://localhost:[port]/api/`

---

## ❓ FAQ

**Q: How long should testing take?**
A: Quick test = 20-30 minutes. Comprehensive = 1-2 hours.

**Q: What if I find a bug?**
A: Document it using the bug report template and file an issue.

**Q: Can I test on my phone?**
A: Yes, if your phone can access localhost on your network. Or use DevTools device emulation.

**Q: What if the page doesn't load?**
A: Check the console (F12) for errors. Verify servers are running. Check network connectivity.

**Q: Should I test in multiple browsers?**
A: Yes, for comprehensive testing. At minimum test Chrome and Safari.

---

## ✅ Ready to Start?

### **For Quick Test (20 min):**
1. Open: `AI_ASSESSMENTS_QUICK_TEST.md`
2. Follow the instructions
3. Mark results as you test
4. Submit findings

### **For Comprehensive Test (1-2 hours):**
1. Open: `AI_ASSESSMENTS_COMPREHENSIVE_TESTING.md`
2. Follow the test suites in order
3. Document all findings
4. Create final report

---

## 📞 Support

If you encounter issues:
1. Check the console (F12) for error messages
2. Review the test guide for expected behavior
3. Compare actual vs expected results
4. Document and report issues

---

**Good luck with testing! 🚀**

---

*Last Updated: 2026-02-17*
*Module: AI Assessments*
*Version: 1.0*

