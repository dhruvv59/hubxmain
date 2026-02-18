# 🧪 Quick Testing Guide - Paper Purchase Flow

## 📱 How to Test the Complete Flow

### Prerequisites:
- Backend running on `http://localhost:3000/api`
- Frontend running on `http://localhost:3000`
- Logged in as a student
- Have some papers available in the system

---

## 🧪 Test Case 1: Basic Purchase Flow

### Step 1: View Public Papers
```
Visit: http://localhost:3000/papers
Expected:
- See list of papers available for purchase
- Each paper shows price (e.g., ₹681, ₹844, ₹940)
- Papers you already bought should NOT appear here
```

### Step 2: Click "Buy" or "Start Test" → Should show payment modal
```
Expected:
- PaymentModal opens
- Shows paper title
- Shows original price
- Has coupon input field
- "Pay with Razorpay" button enabled
```

### Step 3: (Optional) Apply Coupon
```
If you have a coupon code:
1. Enter code in "Have a School Code or Coupon?" field
2. Click "Apply"
Expected:
- Discount shows in green
- Final price updated
- "Pay with Razorpay" or "Claim Free Access" button changes
```

### Step 4: Complete Razorpay Payment
```
Click "Pay with Razorpay"
Expected:
- Razorpay checkout opens
- Complete test payment (use test card: 4111 1111 1111 1111)
```

### Step 5: Success Screen
```
Expected:
- Modal shows "Purchase Successful! ✓"
- Message: "Paper has been added to your purchased papers"
- "Close" button
```

### Step 6: Papers List Updates
```
Click "Close"
Expected:
- Modal closes
- Returned to papers list
- Purchased paper SHOULD BE REMOVED from list ✅
- Paper count decreased by 1
```

### Step 7: Check Purchased Papers
```
Visit: http://localhost:3000/papers/purchased
Expected:
- Purchased paper now appears here
- Can see all papers you've bought
```

---

## 🧪 Test Case 2: Free Coupon (100% Discount)

### Prerequisites:
- Have a coupon that gives 100% discount

### Steps:
1. Go to `/papers` and click "Buy" on a paper
2. Enter coupon code that gives 100% discount
3. Click "Apply"
4. Expected: Price changes to "FREE"
5. Button changes to "Claim Free Access"
6. Click "Claim Free Access"
7. Expected: Success screen shows (no Razorpay needed)
8. Paper should be in purchased section

---

## 🧪 Test Case 3: Already Purchased Paper

### Steps:
1. Purchase a paper (follow Test Case 1)
2. Go back to `/papers`
3. Try to find the paper you just bought
4. Expected: Paper should NOT appear in list
5. Go to `/papers/purchased`
6. Expected: Paper SHOULD appear here

---

## 🧪 Test Case 4: Filtering & Search

### On `/papers` (Public Papers):
```
Test Filters:
1. Subject filter - Should show papers of that subject
2. Difficulty filter - Should show papers of that difficulty
3. Search - Should find papers by title or teacher name
4. Sort By - Should sort by "Most Recent" or "Price: Low to High"

Important: All filters should work AND still exclude purchased papers
```

### On `/papers/purchased`:
```
Test Search:
1. Enter search term
2. Expected: Filters purchased papers by title or teacher
```

---

## 🧪 Test Case 5: Edge Cases

### Edge Case 1: Purchase Same Paper Twice
```
1. Purchase a paper
2. Try to buy it again
Expected: Should show "Paper already purchased" error or button should be disabled
```

### Edge Case 2: Apply Coupon After Payment
```
1. Open PaymentModal
2. Apply coupon
3. Close modal without paying
4. Reopen modal for same paper
Expected: Coupon should be cleared (fresh state)
```

### Edge Case 3: Cancel Payment
```
1. Open PaymentModal
2. Click "Pay with Razorpay"
3. Close Razorpay without paying
Expected: Modal should still be open, ready to try again
```

---

## 🔍 Browser Console Debugging

### Open DevTools → Console

### Check for errors:
```javascript
// Should see paper fetch requests
// Should NOT see payment errors
// Should see successful payment verification
```

### Check Network tab:
```
Should see these API calls:

1. GET /api/student/public-papers
   Status: 200
   Response includes: papers with {purchased: true/false}

2. POST /api/payment/create-order
   Status: 200
   Response includes: orderId, amount

3. POST /api/payment/verify
   Status: 200
   Response includes: successful verification

4. GET /api/student/public-papers (second call after payment)
   Status: 200
   Paper now has purchased: true
```

---

## 🗂️ Database Verification

### Check if Purchase Was Created:

#### In MySQL/Prisma Studio:

```sql
-- Check PaperPurchase table
SELECT * FROM "PaperPurchase"
WHERE studentId = 'YOUR_STUDENT_ID'
ORDER BY createdAt DESC;

-- Check Payment table
SELECT * FROM "Payment"
WHERE userId = 'YOUR_STUDENT_ID'
ORDER BY createdAt DESC;

-- Verify paper is marked as purchased
SELECT id, title, price
FROM "Paper"
WHERE id = 'PAPER_ID_YOU_BOUGHT';
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: Purchased Paper Still Shows in Public List

**Solution**:
1. Check Network tab - verify `/api/student/public-papers` returns `purchased: true` for the paper
2. Check Frontend code - verify `getPublicPapers()` has the filter: `uiPapers.filter(p => !p.purchased)`
3. Clear browser cache: `Ctrl+Shift+Delete`

### Issue 2: Paper Doesn't Appear in Purchased Section

**Solution**:
1. Refresh page (`Ctrl+R`)
2. Check if `PaperPurchase` record exists in database
3. Verify `getPurchasedPapers()` is filtering correctly

### Issue 3: Razorpay Payment Gateway Not Loading

**Solution**:
1. Check if `RAZORPAY_KEY_ID` environment variable is set
2. Check Network tab for blocked scripts
3. Clear browser cache

### Issue 4: Coupon Shows Invalid Even Though It Should Work

**Solution**:
1. Check if coupon is active and not expired
2. Check if coupon applies to the specific paper
3. Verify minimum order value is met
4. Check backend coupon validation logic

---

## 📊 Success Indicators

### ✅ System is Working Correctly if:

1. **Papers List**:
   - Only shows papers you haven't purchased ✓
   - Count updates after purchase ✓
   - Filters work correctly ✓

2. **Payment Process**:
   - Modal shows correct price ✓
   - Coupon discount applies ✓
   - Razorpay checkout works ✓

3. **Post-Purchase**:
   - Success message shows ✓
   - Papers list refreshes automatically ✓
   - Purchased paper disappears from public list ✓
   - Paper appears in `/papers/purchased` ✓

4. **Database**:
   - `PaperPurchase` record created ✓
   - `Payment` record marked SUCCESS ✓

---

## 🎯 Full Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    START HERE                               │
│           Visit http://localhost:3000/papers                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              PUBLIC PAPERS LIST                             │
│  - Shows unpurchased papers only (purchased: false)         │
│  - Filters available by subject, difficulty, price          │
│  - Can search by title or teacher name                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │ Click "Buy" Button     │
        └────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              PAYMENT MODAL OPENS                            │
│  - Shows paper title and price                              │
│  - Option to apply coupon code                              │
│  - "Pay with Razorpay" button (or "Claim Free Access")      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │ Razorpay Checkout      │
        │ Complete Payment       │
        └────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         PAYMENT VERIFICATION (Backend)                      │
│  - Verify Razorpay signature                                │
│  - Create PaperPurchase record                              │
│  - Mark Payment as SUCCESS                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           SUCCESS SCREEN                                    │
│  "Purchase Successful! ✓"                                   │
│  "Paper added to your purchased papers"                     │
│  User clicks "Close"                                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│       AUTO-REFRESH PAPERS LIST                              │
│  - Frontend calls fetchPapers()                             │
│  - Backend returns papers (with purchased: true for bought)  │
│  - Frontend filters out papers where purchased: true        │
│  - Purchased paper DISAPPEARS from list                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │ User is back on        │
        │ /papers page           │
        │ (paper removed)        │
        └────────────────────────┘
                     │
                     ▼
        ┌────────────────────────┐
        │ Visit /papers/purchased│
        │ to see purchased paper │
        │ (now appears here)     │
        └────────────────────────┘
```

---

## 🚀 Ready to Test!

All components are now properly integrated. Follow the test cases above to verify everything works correctly.

**Need Help?** Check the console logs and network tab for detailed debugging information.
