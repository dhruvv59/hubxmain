# Price Field Logic - Frontend Implementation

## ✅ Price Field Behavior

### **Rule: Price field is ENABLED only when Public Paper toggle is ON**

```
Public Paper Toggle: OFF  →  Price field: DISABLED & HIDDEN
Public Paper Toggle: ON   →  Price field: ENABLED & VISIBLE
```

---

## 🎯 Implementation

### 1. React Component Example

```jsx
import { useState } from 'react'

export function GeneratePaperForm() {
  const [formData, setFormData] = useState({
    title: '',
    standard: 0,
    subjectId: '',
    difficulty: '',
    type: 'TIME_BOUND',
    duration: 60,
    chapterIds: [],
    isPublic: false,
    isFreeAccess: false,
    price: null
  })

  // Handle Public Paper Toggle
  const handlePublicToggle = (newValue) => {
    setFormData(prev => ({
      ...prev,
      isPublic: newValue,
      isFreeAccess: newValue ? false : prev.isFreeAccess, // Auto-disable free access
      price: newValue ? 450 : null // Set default price when enabling
    }))
  }

  // Handle Price Change (only when isPublic is true)
  const handlePriceChange = (value) => {
    if (formData.isPublic) {
      setFormData(prev => ({
        ...prev,
        price: value
      }))
    }
  }

  return (
    <form>
      {/* ... other fields ... */}

      {/* Public Paper Toggle */}
      <div className="toggle-group">
        <label>Public Paper</label>
        <Toggle
          checked={formData.isPublic}
          onChange={handlePublicToggle}
        />
      </div>

      {/* Price Field - ONLY SHOWN WHEN PUBLIC IS ON */}
      {formData.isPublic && (
        <div className="price-field">
          <label>Paper Price (₹)</label>
          <input
            type="number"
            value={formData.price || ''}
            onChange={(e) => handlePriceChange(parseFloat(e.target.value))}
            placeholder="Enter price"
            min="1"
            required
          />
        </div>
      )}

      {/* Free Access Toggle - ONLY SHOWN WHEN PUBLIC IS OFF */}
      {!formData.isPublic && (
        <div className="toggle-group">
          <label>Free Access for School Students</label>
          <Toggle
            checked={formData.isFreeAccess}
            onChange={(value) => {
              setFormData(prev => ({
                ...prev,
                isFreeAccess: value,
                price: null // Force price to null
              }))
            }}
          />
        </div>
      )}
    </form>
  )
}
```

---

## 2. Vue.js Example

```vue
<template>
  <form>
    <!-- Public Paper Toggle -->
    <div class="toggle-group">
      <label>Public Paper</label>
      <input
        type="checkbox"
        v-model="formData.isPublic"
        @change="handlePublicToggle"
      />
    </div>

    <!-- Price Field - ONLY WHEN PUBLIC IS ON -->
    <div v-if="formData.isPublic" class="price-field">
      <label>Paper Price (₹)</label>
      <input
        type="number"
        v-model.number="formData.price"
        placeholder="Enter price"
        min="1"
        required
      />
    </div>

    <!-- Free Access Toggle - ONLY WHEN PUBLIC IS OFF -->
    <div v-else class="toggle-group">
      <label>Free Access for School Students</label>
      <input
        type="checkbox"
        v-model="formData.isFreeAccess"
      />
    </div>
  </form>
</template>

<script>
export default {
  data() {
    return {
      formData: {
        title: '',
        isPublic: false,
        isFreeAccess: false,
        price: null
      }
    }
  },
  methods: {
    handlePublicToggle() {
      if (this.formData.isPublic) {
        this.formData.isFreeAccess = false
        this.formData.price = 450 // Set default
      } else {
        this.formData.price = null
      }
    }
  }
}
</script>
```

---

## 3. Vanilla JavaScript Example

```javascript
// Form state
const formData = {
  title: '',
  isPublic: false,
  isFreeAccess: false,
  price: null
}

// Get DOM elements
const publicToggle = document.getElementById('publicToggle')
const priceField = document.getElementById('priceField')
const priceInput = document.getElementById('priceInput')
const freeAccessToggle = document.getElementById('freeAccessToggle')

// Handle Public Toggle
publicToggle.addEventListener('change', (e) => {
  formData.isPublic = e.target.checked

  if (formData.isPublic) {
    // When toggling ON
    formData.isFreeAccess = false
    formData.price = 450

    // Show price field, hide free access
    priceField.style.display = 'block'
    freeAccessToggle.parentElement.style.display = 'none'
    priceInput.value = 450
    priceInput.disabled = false
  } else {
    // When toggling OFF
    formData.price = null

    // Hide price field, show free access
    priceField.style.display = 'none'
    freeAccessToggle.parentElement.style.display = 'block'
    priceInput.value = ''
    priceInput.disabled = true
  }
})

// Handle Price Input (only when enabled)
priceInput.addEventListener('change', (e) => {
  if (formData.isPublic) {
    formData.price = parseFloat(e.target.value)
  }
})
```

---

## 4. HTML Form Structure

```html
<form id="paperForm">
  <!-- Public Paper Toggle -->
  <div class="toggle-group">
    <label for="publicToggle">
      Public Paper
    </label>
    <input
      type="checkbox"
      id="publicToggle"
      name="isPublic"
    />
  </div>

  <!-- Price Field - ONLY SHOWN WHEN PUBLIC IS CHECKED -->
  <div id="priceField" style="display: none;">
    <label for="priceInput">
      Paper Price (₹)
    </label>
    <input
      type="number"
      id="priceInput"
      name="price"
      placeholder="Enter price"
      min="1"
      disabled
    />
  </div>

  <!-- Free Access Toggle - ONLY SHOWN WHEN PUBLIC IS NOT CHECKED -->
  <div id="freeAccessGroup" style="display: block;">
    <label for="freeAccessToggle">
      Free Access for School Students
    </label>
    <input
      type="checkbox"
      id="freeAccessToggle"
      name="isFreeAccess"
    />
  </div>
</form>

<style>
  #priceInput:disabled {
    background-color: #f0f0f0;
    cursor: not-allowed;
    opacity: 0.5;
  }

  #priceField {
    transition: all 0.3s ease;
  }
</style>
```

---

## ✨ UI Behavior Summary

### When Public Toggle is **OFF** ❌
```
┌──────────────────────────────┐
│ Public Paper          [OFF]   │  ← Toggle
├──────────────────────────────┤
│                              │
│ Free Access for School   ✓   │  ← Shows
│ Students                     │
│                              │
│ Price Field              ✗   │  ← HIDDEN
│                              │
└──────────────────────────────┘
```

### When Public Toggle is **ON** ✅
```
┌──────────────────────────────┐
│ Public Paper          [ON]    │  ← Toggle
├──────────────────────────────┤
│                              │
│ Price Field              ✓   │  ← SHOWS
│ [₹450          ]             │
│                              │
│ Free Access for School   ✗   │  ← HIDDEN
│ Students                     │
│                              │
└──────────────────────────────┘
```

---

## ⚠️ Important Notes

### 1. **Price Field Behavior**
```
- When Public = ON  → Price field VISIBLE + ENABLED
- When Public = OFF → Price field HIDDEN + DISABLED
- When toggle ON    → Set default price = 450
- When toggle OFF   → Clear price = null
```

### 2. **Validation**
```
✅ Frontend: Disable price input when public is OFF
✅ Backend: Also validates - rejects if isFreeAccess=true + price>0
✅ Double safety: Frontend UX + Backend validation
```

### 3. **Free Access Toggle**
```
- Shows only when Public = OFF
- Hidden when Public = ON
- Cannot be ON + Public together
```

### 4. **Form Submission**
```json
When Public = ON:
{
  "isPublic": true,
  "price": 450,
  "isFreeAccess": false
}

When Public = OFF:
{
  "isPublic": false,
  "price": null,
  "isFreeAccess": false or true
}
```

---

## 🧪 Test Cases

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Load form | Price field hidden |
| 2 | Toggle Public ON | Price field appears with ₹450 default |
| 3 | Change price to 500 | Value updates to 500 |
| 4 | Toggle Public OFF | Price field disappears, price = null |
| 5 | Toggle Free Access ON | Free access toggle visible, price stays null |
| 6 | Toggle Public ON again | Free access toggles OFF, price field shows ₹450 |

---

## 🎯 Summary

✅ **Price field is ONLY visible when Public Paper = ON**
✅ **When Public = OFF, price is automatically set to null**
✅ **Free Access toggle only shows when Public = OFF**
✅ **Backend validates the state anyway (double safety)**
✅ **User cannot accidentally send price for free papers**

This ensures perfect UX and prevents invalid states! 🚀
