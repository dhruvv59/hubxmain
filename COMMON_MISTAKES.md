# Common Junior Developer Mistakes in This Codebase

## 🚨 CRITICAL MISTAKES THAT BREAK PRODUCTION

### 1. ❌ Not Validating Inputs on Backend

**WRONG:**
```typescript
// routes/profile.route.ts
router.put("/:studentId", authenticate, async (req, res) => {
  const { fullName, phone } = req.body;
  // Directly use without validation!
  await profileService.updateProfile(studentId, { fullName, phone });
});
```

**WHY IT'S DANGEROUS:**
- SQL Injection: `fullName = "'; DROP TABLE users; --"`
- XSS: `fullName = "<script>alert('hacked')</script>"`
- Invalid data: phone = "hello" causes database error
- Frontend validation is NOT security, it's UX

**RIGHT:**
```typescript
router.put(
  "/:studentId",
  authenticate,
  validateProfileUpdate,  // ← VALIDATE!
  handleValidationErrors,
  async (req, res) => {
    // At this point, req.body is guaranteed valid
    const { fullName, phone } = req.body;
    await profileService.updateProfile(studentId, { fullName, phone });
  }
);
```

**Remember:** *Frontend validation is for user experience. Backend validation is for security.*

---

### 2. ❌ Forgetting Authorization Checks

**WRONG:**
```typescript
// Can update ANY student's profile!
router.put("/:studentId", authenticate, async (req, res) => {
  const { studentId } = req.params;
  // No check that studentId matches the logged-in user!
  await profileService.updateProfile(studentId, req.body);
});

// User 123 can do: PUT /api/student/profile/456 and modify User 456's profile!
```

**WHY IT'S DANGEROUS:**
- Privilege escalation: Student can modify teacher's profile
- Unauthorized access: User can change another user's password
- Data leakage: User can access another user's private data

**RIGHT:**
```typescript
router.put("/:studentId", authenticate, async (req, res) => {
  const { studentId } = req.params;
  const userId = (req as any).user?.id;

  // CRITICAL: Check ownership!
  if (studentId !== userId) {
    return res.status(403).json({
      success: false,
      message: "You can only update your own profile"
    });
  }

  await profileService.updateProfile(studentId, req.body);
});
```

**Remember:** *Always verify that the user owns the resource they're modifying.*

---

### 3. ❌ Not Using Transactions for Multiple Operations

**WRONG:**
```typescript
// If step 2 fails, step 1 is already committed!
async updateProfile(studentId, data) {
  // Step 1: Update user table
  await prisma.user.update({
    where: { id: studentId },
    data: { firstName: data.fullName.split(' ')[0] }
  });

  // Step 2: Update profile table
  // If this fails, user table is already updated = corrupted data!
  await prisma.studentProfile.update({
    where: { userId: studentId },
    data: { phone: data.phone }
  });
}
```

**WHY IT'S DANGEROUS:**
- Partial updates leave database in inconsistent state
- Student's firstName updated but phone not updated
- Leads to mysterious bugs and data corruption

**RIGHT:**
```typescript
async updateProfile(studentId, data) {
  // Use transaction: all-or-nothing
  return await prisma.$transaction(async (tx) => {
    // Step 1
    const user = await tx.user.update({...});
    // Step 2
    const profile = await tx.studentProfile.update({...});
    // If either fails, BOTH are rolled back
    return { user, profile };
  });
}
```

**Remember:** *If multiple database operations must succeed together, use transactions.*

---

### 4. ❌ Storing Sensitive Data in Response

**WRONG:**
```typescript
// API Response includes password hash!
return res.status(200).json({
  success: true,
  data: {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    password: user.password,  // ❌ NEVER!
    passwordHash: user.passwordHash,  // ❌ NEVER!
    apiKey: user.apiKey,  // ❌ NEVER!
    stripe_secret: user.stripe_secret  // ❌ NEVER!
  }
});
```

**WHY IT'S DANGEROUS:**
- If API is hacked, attackers get all passwords
- Frontend logs might expose secrets
- Anyone reading network traffic sees secrets
- Compliance violations (GDPR, PCI)

**RIGHT:**
```typescript
// Use Prisma's select to exclude sensitive fields
const user = await prisma.user.findUnique({
  where: { id: studentId },
  select: {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    avatar: true,
    // password, apiKey NOT selected
  }
});

return res.status(200).json({
  success: true,
  data: user  // Only safe fields
});
```

**Remember:** *Never expose passwords, tokens, API keys, or secrets in API responses.*

---

### 5. ❌ Exposing Error Details to Client

**WRONG:**
```typescript
try {
  const user = await db.query('SELECT * FROM users WHERE id = ?', [id]);
} catch (error) {
  // Attacker learns database structure!
  res.status(500).json({
    message: error.message,  // "Unknown column 'user_id' in where clause"
    sql: error.sql,  // SELECT * FROM users WHERE id = ?
    stack: error.stack  // Full stack trace with file paths!
  });
}
```

**WHY IT'S DANGEROUS:**
- Reveals database schema
- Shows file structure/paths
- Helps attackers craft better attacks
- Looks unprofessional

**RIGHT:**
```typescript
try {
  const user = await db.query('SELECT * FROM users WHERE id = ?', [id]);
} catch (error) {
  // Log full error internally
  console.error("Database error:", error);
  logger.error("Query failed for user lookup", {
    error: error.message,
    userId: id,
    timestamp: new Date()
  });

  // Return generic error to client
  res.status(500).json({
    success: false,
    message: "Failed to fetch user data",
    requestId: req.id  // Use request ID for support
  });
}
```

**Remember:** *Log full errors internally for debugging. Send generic messages to clients.*

---

### 6. ❌ Not Handling Concurrency Issues

**WRONG:**
```typescript
// Race condition: multiple requests updating same record
async function awardAchievement(userId, achievementId) {
  // Check if already earned
  const exists = await prisma.userAchievement.findUnique({
    where: { userId_achievementId: { userId, achievementId } }
  });

  if (!exists) {
    // Between check and create, another request might create it!
    await prisma.userAchievement.create({
      data: { userId, achievementId }
    });
  }
}

// Two requests can both pass the check and both create, causing duplicate!
```

**WHY IT'S DANGEROUS:**
- Duplicate achievements awarded
- Loyalty points double-counted
- Inconsistent state

**RIGHT:**
```typescript
async function awardAchievement(userId, achievementId) {
  try {
    // create() fails if unique constraint violated
    const awarded = await prisma.userAchievement.create({
      data: { userId, achievementId }
    });
    return true;
  } catch (error) {
    if (error.code === 'P2002') {
      // Unique constraint failed = already exists
      return false;
    }
    throw error;
  }
}
```

**Remember:** *Use database constraints (UNIQUE, transactions) to prevent race conditions.*

---

### 7. ❌ Not Rate Limiting APIs

**WRONG:**
```typescript
// Anyone can spam this endpoint!
router.post("/support/tickets", authenticate, async (req, res) => {
  const ticket = await supportService.createTicket(req.body);
  res.json({ data: ticket });
});

// Attacker creates 1000 tickets per second, DDoS!
```

**WHY IT'S DANGEROUS:**
- DDoS attacks
- Database overload
- Server crashes
- Service disruption

**RIGHT:**
```typescript
import rateLimit from "express-rate-limit";

const ticketLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 5,  // Max 5 tickets per 15 min per IP
  message: "Too many support tickets created. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  "/support/tickets",
  authenticate,
  ticketLimiter,  // ← Apply rate limiting
  async (req, res) => {
    const ticket = await supportService.createTicket(req.body);
    res.json({ data: ticket });
  }
);
```

**Remember:** *Rate limit all public APIs to prevent abuse.*

---

### 8. ❌ Using Hardcoded Values

**WRONG:**
```typescript
// Can't change without redeploying!
const RAZORPAY_KEY = "rzp_test_1234567890";
const DATABASE_HOST = "localhost";
const AWS_REGION = "us-east-1";
const MAX_FILE_SIZE = 52428800;  // 50MB hardcoded

async function uploadFile(file) {
  if (file.size > 52428800) {
    throw new Error("File too large");  // Hardcoded again!
  }
}
```

**WHY IT'S DANGEROUS:**
- Can't change config without code change
- Can't have different configs for test/prod
- Security keys in code = huge breach risk
- Can't scale

**RIGHT:**
```typescript
// Use environment variables
const RAZORPAY_KEY = process.env.RAZORPAY_KEY_ID!;
const DATABASE_HOST = process.env.DB_HOST || "localhost";
const AWS_REGION = process.env.AWS_REGION || "us-east-1";
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || "52428800");

async function uploadFile(file) {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File exceeds ${MAX_FILE_SIZE} bytes`);
  }
}

// .env file (development)
RAZORPAY_KEY_ID="rzp_test_1234567890"
DB_HOST="localhost"
MAX_FILE_SIZE="52428800"

// .env.production (production)
RAZORPAY_KEY_ID="rzp_live_9876543210"
DB_HOST="prod-db.aws.com"
MAX_FILE_SIZE="10485760"  // 10MB for prod
```

**Remember:** *All configuration should come from environment variables, never hardcoded.*

---

### 9. ❌ Not Validating Database Operations

**WRONG:**
```typescript
// What if user doesn't exist? What if create fails?
async function getProfile(studentId) {
  const user = await prisma.user.findUnique({
    where: { id: studentId }
  });
  return {
    id: user.id,  // ❌ user could be null!
    email: user.email,
    fullName: `${user.firstName} ${user.lastName}`
  };
}

// Crash: Cannot read property 'id' of null
```

**WHY IT'S DANGEROUS:**
- Server crashes on missing data
- Unhandled promise rejections
- Bad user experience

**RIGHT:**
```typescript
async function getProfile(studentId) {
  const user = await prisma.user.findUnique({
    where: { id: studentId }
  });

  // Check if exists
  if (!user) {
    throw {
      status: 404,
      message: "Student not found"
    };
  }

  return {
    id: user.id,
    email: user.email,
    fullName: `${user.firstName} ${user.lastName}`
  };
}

// In route:
router.get("/:studentId", async (req, res) => {
  try {
    const profile = await profileService.getProfile(req.params.studentId);
    res.json({ data: profile });
  } catch (error: any) {
    if (error.status === 404) {
      return res.status(404).json({ message: error.message });
    }
    // Handle other errors
  }
});
```

**Remember:** *Always check if database operations succeeded before using results.*

---

### 10. ❌ Frontend: Not Checking User Authentication

**WRONG:**
```typescript
// Assuming user is always logged in
export default function ProfilePage() {
  const handleSave = async () => {
    const token = localStorage.getItem("token");
    // What if token doesn't exist?
    const response = await fetch(`/api/profile`, {
      headers: { "Authorization": `Bearer ${token}` }  // null token!
    });
  };
}
```

**WHY IT'S DANGEROUS:**
- Unauthenticated requests to protected APIs
- API returns 401, frontend crashes
- User data might be sent to wrong person

**RIGHT:**
```typescript
import { useAuth } from "@/hooks/useAuth";

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (!user) {
    return <LoginRequired />;  // Redirect to login
  }

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`/api/profile/${user.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (response.status === 401) {
        // Token expired, logout
        localStorage.removeItem("token");
        window.location.href = "/login";
      }

      if (!response.ok) {
        throw new Error("Failed to save");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to save profile");
    }
  };
}
```

**Remember:** *Always check authentication before making API calls.*

---

## 🔍 TESTING CHECKLIST

Before deploying, test these scenarios:

### Security Testing
- [ ] Try SQL injection: `name' OR '1'='1`
- [ ] Try XSS: `<script>alert('xss')</script>`
- [ ] Try accessing another user's data
- [ ] Try expired/invalid tokens
- [ ] Try missing required fields
- [ ] Test with super long inputs

### Functional Testing
- [ ] Create → Read → Update flow
- [ ] Empty/null values handling
- [ ] Concurrent requests (race conditions)
- [ ] Network failure (timeout)
- [ ] Database failure recovery
- [ ] Edge cases (max int, special chars)

### Performance Testing
- [ ] Can handle 1000 concurrent users?
- [ ] Response time < 200ms?
- [ ] No memory leaks?
- [ ] Database queries optimized?

---

## 🚀 PRODUCTION DEPLOYMENT CHECKLIST

- [ ] All environment variables configured
- [ ] Database backups enabled
- [ ] Error logging configured
- [ ] Rate limiting enabled
- [ ] HTTPS/SSL configured
- [ ] CORS properly configured
- [ ] Database secrets NOT in code
- [ ] API keys NOT in code
- [ ] All validations in place
- [ ] Proper error handling
- [ ] No console.log() in production
- [ ] No hardcoded ports/hosts
- [ ] Tests passing
- [ ] Security audit completed
- [ ] Load testing completed

---

## 📚 RESOURCES

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Secure Coding Practices](https://cwe.mitre.org/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)

---

**Created:** February 2025
**Purpose:** Prevent common mistakes in production
