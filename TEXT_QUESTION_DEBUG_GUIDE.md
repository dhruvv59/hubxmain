# TEXT Question - Debugging Guide

## Issue
TEXT questions are not showing the textarea input field during exams.

---

## 🔍 **How to Debug**

### Step 1: Check Browser Console (Frontend)

Open browser DevTools (F12 or Right-click → Inspect)

**Look for these logs**:

```
Question Type: TEXT
Type Check - MCQ: false
FITB: false
TEXT: true
```

If you see these logs, the question type is being recognized correctly.

When you click "Save Answer", you should see:

```
📝 Saving Answer
{
  questionType: "TEXT",
  selectedAnswer: "Process management is...",
  isFillInWithOptions: false,
  payload: {
    selectedOptionIndex: undefined,
    answerText: "Process management is..."
  },
  questionId: "q123"
}
```

If answer saves successfully:
```
✅ Answer saved successfully: {data: {...}}
```

---

### Step 2: Check Server Logs (Backend)

**Look for these logs**:

```
[TEXT Question] Processing answer for question q123
{
  answerLength: 125,
  questionMarks: 5
}
```

When answer is saved:
```
[Answer Saved] Question Type: TEXT
{
  questionId: "q123",
  isCorrect: true,
  marksObtained: 5,
  attemptId: "att456",
  questionType: "TEXT",
  answerProvided: true
}
```

---

## ✅ **Expected Behavior**

### Question Display

```
Question: "What is process management?"

[Textarea with 6 rows]
Type your answer here...
[Large text input area]
```

### After Typing & Saving

```
Frontend Log:
📝 Saving Answer {
  questionType: "TEXT",
  selectedAnswer: "Process management is a function of...",
  payload: { answerText: "Process management is a function of..." }
}

Backend Log:
[TEXT Question] Processing answer for question q123
[Answer Saved] Question Type: TEXT
  isCorrect: true (if AI marked correct)
  marksObtained: 5 (full marks)
```

---

## 🐛 **Common Issues & Solutions**

### Issue 1: Textarea Not Showing

**Symptom**: Question displays but no input field below it

**Check**:
1. Open browser console (F12)
2. Look for "Question Type:" log
3. Check if it says `TEXT: true`

**If TEXT: true but no textarea**:
- Issue is in CSS or React rendering
- The fallback textarea should still show (in yellow box)
- Check for JavaScript errors in console

**If TEXT: false**:
- Backend is not returning `type: "TEXT"`
- Check network tab → API response
- Look for question object - should have `"type": "TEXT"`

**Solution**:
```
1. Check backend getQuestion method
2. Ensure question.type is exactly "TEXT" (case-sensitive)
3. Check if question exists in database with type="TEXT"
```

---

### Issue 2: Answer Not Saving

**Symptom**: Click "Save Answer" but nothing happens

**Check Browser Console**:
```
❌ Error saving answer: {message: "..."}
```

**Check**:
1. Are you typing in the textarea?
2. Is the text field getting focus (blue border)?
3. Does answer have content when you click Save?

**Solution**:
```javascript
// Frontend checks:
if (selectedAnswer === null || selectedAnswer === "") {
  alert("Please select or enter an answer");
  return;
}
```
- Make sure you're typing something
- Make sure textarea is active (focused)

---

### Issue 3: Server Error on Save

**Backend Console Shows**:
```
❌ [Answer Saved] Question Type: TEXT
{
  isCorrect: false,
  marksObtained: 0,
  error: "OpenAI API error"
}
```

**Cause**: OpenAI API call failed

**Solution**:
- Check `OPENAI_API_KEY` environment variable is set
- Check OpenAI API quota/billing
- Backend has fallback word-similarity scoring if OpenAI fails
- Check admin email for notification about failed evaluation

---

### Issue 4: Wrong Question Type Received

**Browser Console Shows**:
```
Question Type: TEXT_ESSAY
Type Check - TEXT: false
```

**Issue**: Backend returning different type than expected

**Solution**:
1. Check what type is being returned: `console.log(currentQuestion.type)`
2. Database might have different type values
3. Possible values:
   - `TEXT` - Short answer
   - `MCQ` - Multiple choice
   - `FILL_IN_THE_BLANKS` - Fill in blanks
   - Others?

**Fix**: Update frontend condition or backend to use correct type name

---

## 📊 **Complete Flow with Logs**

### 1. Page Loads
```
Browser Console:
Loading exam...
Exam data loaded: maths test, 5 questions
Question loaded: Question Type: TEXT (Type Check - TEXT: true)
```

### 2. Student Types Answer
```
Browser Console:
selectedAnswer updated: "Process management is..."
```

### 3. Student Clicks Save
```
Browser Console:
📝 Saving Answer {
  questionType: "TEXT",
  selectedAnswer: "Process management is a function...",
  payload: { answerText: "Process management is a function..." }
}

[Wait for server response]

✅ Answer saved successfully: {
  success: true,
  data: { isCorrect: true, marksObtained: 5 }
}

Server Console:
[TEXT Question] Processing answer for question q123
[Wait for OpenAI evaluation]
[Answer Saved] Question Type: TEXT {
  isCorrect: true,
  marksObtained: 5
}
```

### 4. Student Submits Exam
```
Browser Console:
Submitting exam...
Exam submitted successfully
Redirecting to results...

Server Console:
[Exam Submission] Score calculation...
All TEXT questions processed
Final score: X/100
```

---

## 🛠️ **Testing Steps**

### Manual Test for TEXT Question

**Setup**:
1. Create paper with TEXT question
2. Start exam as student
3. Open browser DevTools (F12)

**Steps**:
1. Go to TEXT question
2. Check console: Should see "Question Type: TEXT"
3. Type answer in textarea:
   ```
   Process management is a function of the operating system.
   It is used to handle processes in a computer.
   ```
4. Click "Save Answer"
5. Check console: Should see "📝 Saving Answer" log
6. Wait 1-3 seconds for AI evaluation
7. Check console: Should see "✅ Answer saved successfully"
8. Check server logs: Should see "[Answer Saved]"

**Expected Result**:
- ✅ Textarea shows below question
- ✅ Answer is typed successfully
- ✅ Save button works
- ✅ Answer is stored in database
- ✅ AI evaluates answer
- ✅ Marks are assigned

---

## 📝 **API Testing**

### Using cURL to Test Answer Submission

```bash
# Save TEXT question answer
curl -X POST http://localhost:8000/api/exam/att123/answer/q456 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answerText": "Process management is a function of the operating system. It is used to handle processes in a computer. The operating system controls how programs run."
  }'

# Expected Response:
{
  "success": true,
  "data": {
    "id": "ans789",
    "isCorrect": true,
    "marksObtained": 5,
    "answerText": "Process management is a function..."
  }
}
```

---

## 🎯 **Checklist**

- [ ] Browser shows "Question Type: TEXT"
- [ ] Textarea is visible below question
- [ ] Can type in textarea
- [ ] "Save Answer" button works
- [ ] Console shows "📝 Saving Answer" log
- [ ] Server processes TEXT question
- [ ] Console shows "✅ Answer saved successfully"
- [ ] Server logs show "[Answer Saved]"
- [ ] Marks are assigned (0 or full marks)
- [ ] Results page shows answer status

---

## 📞 **If Still Not Working**

1. **Check Browser Console** (F12):
   - Are there any RED error messages?
   - What is the "Question Type:" log showing?
   - Copy full error and search in code

2. **Check Server Logs**:
   - Is `[TEXT Question]` being logged?
   - Is `[Answer Saved]` being logged?
   - Any errors during OpenAI evaluation?

3. **Check Network Tab** (DevTools → Network):
   - Click "Save Answer"
   - Look for POST request to `/api/exam/`.../answer/...
   - Check Response tab for error details
   - Check if response status is 200 (success) or 4xx/5xx (error)

4. **Check Database**:
   - Does question exist with `type = "TEXT"`?
   - Is question in a published paper?
   - Can student access the paper?

5. **Common Fixes**:
   ```
   ❌ Textarea not showing → Check question type matches "TEXT"
   ❌ Save fails → Check OPENAI_API_KEY in backend
   ❌ Wrong marks → Check OpenAI response
   ❌ Answer lost → Check database connection
   ```

---

**Status**: Debug logging added v2.0
**Last Updated**: 2026-02-18
