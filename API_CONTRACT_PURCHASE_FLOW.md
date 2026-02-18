# 📋 API Contract - Paper Purchase Flow

## Overview
This document defines the exact API contracts between frontend and backend for the paper purchase system.

---

## 1️⃣ GET Public Papers List

### Endpoint
```
GET /api/student/public-papers
```

### Query Parameters
```
page: number (default: 1)
limit: number (default: 10)
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Public papers fetched successfully",
  "data": {
    "papers": [
      {
        "id": "paper_123",
        "title": "Chemistry - Final Exam 30",
        "description": "Complete chemistry exam...",
        "difficulty": "ADVANCED",
        "price": 681,
        "createdAt": "2026-02-18T07:13:47.000Z",
        "duration": 60,
        "subject": {
          "id": "subj_123",
          "name": "Science"
        },
        "teacher": {
          "id": "teacher_123",
          "firstName": "Rajesh",
          "lastName": "Verma",
          "avatar": "https://..."
        },
        "_count": {
          "examAttempts": 2,
          "questions": 30
        },
        "purchased": false,        // ⭐ CRITICAL: Indicates if student bought this
        "hasCoupon": false,        // ⭐ Indicates if student has coupon for this paper
        "couponCode": null         // ⭐ The coupon code if one exists
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 99,
      "pages": 10
    }
  }
}
```

### Response (200 OK) - After Purchase
```json
{
  "success": true,
  "data": {
    "papers": [
      {
        "id": "paper_123",
        "title": "Chemistry - Final Exam 30",
        // ... other fields ...
        "purchased": true         // ⭐ NOW TRUE! Indicates user bought it
      }
    ]
  }
}
```

### Frontend Handling
```typescript
// Get papers
const allPapers = await getPublicPapers();

// Filter OUT purchased papers
const uiPapers = allPapers.filter(p => !p.purchased);

// Display only unpurchased papers
```

---

## 2️⃣ Create Payment Order

### Endpoint
```
POST /api/payment/create-order
```

### Request Body
```json
{
  "paperId": "paper_123",
  "amount": 681,
  "currency": "INR"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "orderId": "order_1234567890",
    "amount": 68100,              // Amount in paise (681 * 100)
    "currency": "INR",
    "paymentId": "payment_xyz",
    "razorpayKeyId": "rzp_test_xxxxx"
  }
}
```

### Response (400 Bad Request) - Already Purchased
```json
{
  "success": false,
  "message": "Paper already purchased",
  "statusCode": 400
}
```

---

## 3️⃣ Verify Payment

### Endpoint
```
POST /api/payment/verify
```

### Request Body
```json
{
  "orderId": "order_1234567890",
  "paymentId": "pay_29QQoUBi66xm2f",
  "signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d",
  "paperId": "paper_123"
}
```

### Response (200 OK) - Success
```json
{
  "success": true,
  "message": "Payment verified and purchase completed",
  "data": {
    "payment": {
      "id": "payment_xyz",
      "userId": "student_123",
      "orderId": "order_1234567890",
      "paymentId": "pay_29QQoUBi66xm2f",
      "signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d",
      "amount": 681,
      "status": "SUCCESS"
    },
    "purchase": {
      "id": "purchase_xyz",
      "paperId": "paper_123",
      "studentId": "student_123",
      "paymentId": "payment_xyz",
      "price": 681,
      "createdAt": "2026-02-18T10:30:00.000Z"
    }
  }
}
```

### Response (400 Bad Request) - Invalid Signature
```json
{
  "success": false,
  "message": "Invalid payment signature",
  "statusCode": 400
}
```

### What Happens in Backend:
1. Signature verification against `RAZORPAY_KEY_SECRET`
2. Verify payment status with Razorpay API
3. Check if purchase already exists (idempotency)
4. Create `PaperPurchase` record
5. Update `Payment` record with status=SUCCESS

---

## 4️⃣ Claim Free Access (100% Coupon)

### Endpoint
```
POST /api/payment/claim-free
```

### Request Body
```json
{
  "paperId": "paper_123"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Free access claimed successfully",
  "data": {
    "purchase": {
      "id": "purchase_xyz",
      "paperId": "paper_123",
      "studentId": "student_123",
      "paymentId": null,
      "price": 0,
      "createdAt": "2026-02-18T10:30:00.000Z"
    }
  }
}
```

---

## 5️⃣ Validate Coupon

### Endpoint
```
POST /api/coupon/validate
```

### Request Body
```json
{
  "code": "SCHOOL100",
  "paperId": "paper_123"
}
```

### Response (200 OK) - Valid Coupon
```json
{
  "success": true,
  "message": "Coupon applied successfully",
  "data": {
    "id": "paper_123",
    "title": "Chemistry - Final Exam 30",
    "price": 0,                    // Discounted price
    "discount": 681,               // Amount saved
    "discountType": "PERCENTAGE",
    "discountValue": 100
  }
}
```

### Response (200 OK) - Invalid Coupon
```json
{
  "success": false,
  "message": "Invalid or expired coupon code",
  "data": null
}
```

---

## 6️⃣ Payment History

### Endpoint
```
GET /api/payment/history
```

### Query Parameters
```
page: number (default: 1)
limit: number (default: 10)
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Payment history fetched successfully",
  "data": [
    {
      "id": "payment_xyz",
      "amount": 681,
      "status": "SUCCESS",
      "date": "2026-02-18T10:30:00.000Z",
      "paperId": "paper_123",
      "paperTitle": "Chemistry - Final Exam 30"
    }
  ]
}
```

---

## 7️⃣ Verify Access to Paper

### Endpoint
```
GET /api/payment/verify-access/:paperId
```

### Response (200 OK) - Has Access
```json
{
  "success": true,
  "message": "Access verified",
  "data": {
    "hasAccess": true
  }
}
```

### Response (200 OK) - No Access
```json
{
  "success": true,
  "message": "Access verified",
  "data": {
    "hasAccess": false
  }
}
```

---

## 🔄 Complete Frontend Flow Implementation

### Step 1: Fetch Papers
```typescript
// src/services/paper.ts
export async function getPublicPapers(filters: PaperFilters = {}): Promise<PublicPaper[]> {
    const response = await http.get(DASHBOARD_ENDPOINTS.getPublicPapers(1, 50));

    let papers = response.data.papers.map(transformBackendPaper);

    // ⭐ CRITICAL: Filter out purchased papers
    papers = papers.filter(p => !p.purchased);

    return papers;
}
```

### Step 2: Handle Purchase Click
```typescript
// src/app/(dashboard)/papers/page.tsx
const handlePurchase = (paper: PublicPaper) => {
    setSelectedPaper(paper);
    setIsPaymentOpen(true);
};
```

### Step 3: Complete Payment
```typescript
// src/components/payment/PaymentModal.tsx
const handlePayment = async () => {
    // 1. Create order
    const orderData = await paymentService.createOrder(finalAmount, "INR", paperId);

    // 2. Open Razorpay
    const razp = new window.Razorpay({
        key: orderData.razorpayKeyId,
        amount: orderData.amount,
        order_id: orderData.orderId,
        handler: async (response) => {
            // 3. Verify payment
            await paymentService.verifyPayment(
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature,
                paperId
            );

            // 4. Show success
            setIsSuccess(true);
        }
    });

    razp.open();
};
```

### Step 4: Refresh Papers List
```typescript
// src/app/(dashboard)/papers/page.tsx
const handlePaymentSuccess = () => {
    setIsPaymentOpen(false);
    fetchPapers(); // ⭐ Re-fetch to update purchase status
};
```

---

## 📊 Database Records After Purchase

### PaperPurchase Table
```
┌─────────────┬────────────────┬──────────────┬──────────────┬─────────┐
│ id          │ paperId        │ studentId    │ paymentId    │ price   │
├─────────────┼────────────────┼──────────────┼──────────────┼─────────┤
│ purchase_1  │ paper_123      │ student_456  │ payment_789  │ 681     │
└─────────────┴────────────────┴──────────────┴──────────────┴─────────┘
```

### Payment Table
```
┌────────────┬──────────────┬──────────┬────────────┬─────────┬────────────┐
│ id         │ userId       │ orderId  │ paymentId  │ amount  │ status     │
├────────────┼──────────────┼──────────┼────────────┼─────────┼────────────┤
│ payment_789│ student_456  │ order_123│ pay_29QQ...│ 681     │ SUCCESS    │
└────────────┴──────────────┴──────────┴────────────┴─────────┴────────────┘
```

---

## 🧪 Integration Checklist

### Frontend:
- [x] Fetch public papers with `purchased` flag
- [x] Filter papers where `purchased === false`
- [x] Payment modal opens on "Buy" click
- [x] Razorpay integration works
- [x] Payment verification sends all required fields
- [x] Success screen shows on verification success
- [x] Papers list refreshes after payment
- [x] Purchased papers visible in `/papers/purchased`

### Backend:
- [x] GET `/api/student/public-papers` returns `purchased` flag
- [x] POST `/api/payment/create-order` creates valid order
- [x] POST `/api/payment/verify` verifies signature correctly
- [x] PaperPurchase record created after payment
- [x] Payment record status set to SUCCESS
- [x] Idempotent purchases (no duplicates)
- [x] Coupon validation works
- [x] Free access claiming works

---

## 🚀 Deployment Checklist

- [ ] RAZORPAY_KEY_ID is set
- [ ] RAZORPAY_KEY_SECRET is set
- [ ] Database migrations run
- [ ] All tables exist (Payment, PaperPurchase, Paper, etc.)
- [ ] Backend API endpoints accessible
- [ ] Frontend built and deployed
- [ ] CORS configured properly
- [ ] Payment webhook endpoint available
- [ ] Test payment flow end-to-end

---

## 📞 Troubleshooting

### "Paper already purchased" error on second buy attempt
✅ **Expected behavior** - Prevents duplicate purchases

### Purchased paper still shows in public list
❌ **Issue** - Frontend filter not working
- Check: `getPublicPapers()` has `.filter(p => !p.purchased)`
- Verify: Backend returns `purchased: true` in response

### Paper doesn't appear in purchased section
❌ **Issue** - Purchase record not created
- Check: Verify signature matches Razorpay secret
- Verify: PaperPurchase record exists in database
- Check: Payment record has status=SUCCESS

### Razorpay checkout won't open
❌ **Issue** - Script not loading or key missing
- Check: RAZORPAY_KEY_ID environment variable
- Check: Browser console for script loading errors
- Verify: Network tab shows Razorpay script loaded

---

## ✨ Summary

This API contract ensures:
1. ✅ Clean separation between public and purchased papers
2. ✅ Secure payment verification using signatures
3. ✅ Idempotent operations (no duplicate purchases)
4. ✅ Coupon support with discounts
5. ✅ Free access option (100% discount)
6. ✅ Complete payment history tracking

**Status**: READY FOR TESTING ✨
