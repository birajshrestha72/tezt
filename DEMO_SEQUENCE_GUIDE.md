# Demo Sequence & Presentation Guide
**For:** Wrench Mob Vehicle Parts Management System - Saksham Basnet (23048911)  
**Date:** May 12, 2026  
**Duration:** 8-10 minutes recommended

---

## Pre-Demo Checklist

- [ ] Frontend running at http://localhost:3000
- [ ] Backend running at http://localhost:5033
- [ ] PostgreSQL database connected
- [ ] Browser console open to check for errors (F12)
- [ ] Demo credentials visible: `admin@vehicleparts.com` / `Admin@2025`
- [ ] This guide printed or available on second screen

### Quick Setup (if needed)
```bash
# Terminal 1 - Start Backend
cd backend-api
dotnet run

# Terminal 2 - Start Frontend
cd frontend
npm run dev
```

---

## DEMO FLOW: 5 Feature Showcase (8-10 minutes)

### SEGMENT 1: Authentication & Dashboard Foundation (1 minute)

**Goal:** Establish user is authenticated and navigating the admin shell

**Steps:**
1. Navigate to http://localhost:3000/login
2. Click "Admin" quick login button to auto-populate credentials
3. Click "Sign In" 
4. ✅ Verify: Redirects to /admin/dashboard

**Expected View:**
- Dark sidebar with logo and navigation groups
- Light main content area
- Greeting: "Good evening, Admin User!"
- 4 metric cards showing Staff, Vendors, Parts in Stock, Low Stock Alerts
- Quick Actions buttons with emoji icons

**Talking Points:**
- "The admin dashboard provides a quick overview of key metrics"
- "All navigation is accessible from the sidebar"
- "Each area of the system is designed for efficient management"

---

### SEGMENT 2: Feature #1 - Orders & Sales CRUD (2.5 minutes)

**Goal:** Demonstrate full CRUD workflow with inventory management integration

**Location:** /admin/sales

**Steps:**

#### A. View & Search (30 seconds)
1. Click "Sales" in sidebar (or navigate to /admin/sales)
2. ✅ Verify: Page loads with "Orders & Sales" heading
3. ✅ Verify: Empty state shows shopping cart icon + "No orders found"
4. ✅ Verify: Search bar present with placeholder text

**Talking Points:**
- "This page manages all customer orders and automatically tracks inventory"
- "We can search orders by ID, customer name, or email"

#### B. Create Order (1 minute)
1. Click "Create Order" button
2. ✅ Verify: Modal opens with form
3. Fill form:
   - Select a customer from dropdown (e.g., "John Doe")
   - Set order date (today's date)
   - Set credit due date (30 days out)
   - Add first item:
     - Click "Add Item"
     - Select product from dropdown (e.g., "Brake Pad")
     - Enter quantity (e.g., 2)
     - Unit price auto-fills
     - ✅ Verify: Total updates in real-time
   - Add second item to show multiple items work
4. ✅ Verify: Order Total shows sum of all items
5. Click "Create Order" button in modal

**Expected Result:**
- Modal closes
- New order appears in list (or if empty state, list now shows 1 item)
- Toast notification shows success (optional, if implemented)

**Talking Points:**
- "Creating an order automatically reduces inventory for those items"
- "The total is calculated in real-time as we add items"
- "Customer information is validated from our customer database"

#### C. Edit Order (30 seconds)
1. Find the order we just created in the list
2. Click the "Edit" action button (pencil icon)
3. ✅ Verify: Modal opens with existing order data pre-loaded
4. Change quantity on one item (e.g., 2 → 3)
5. ✅ Verify: Total recalculates immediately
6. Click "Update Order"

**Talking Points:**
- "We can modify orders and the system adjusts inventory accordingly"
- "If we increase quantity, more inventory is reserved; if we decrease, inventory is released"

#### D. Delete Order (30 seconds)
1. Find the order again
2. Click the "Delete" action button (trash icon)
3. ✅ Verify: Confirmation dialog appears with message "Inventory will be restored"
4. Click "Delete Order" in confirmation
5. ✅ Verify: Order disappears from list, empty state returns

**Talking Points:**
- "Deleting an order safely restores inventory for all items"
- "This ensures inventory is always accurate across all workflows"

---

### SEGMENT 3: Feature #2 - Financial Reports (1 minute)

**Goal:** Show financial reporting dashboard with credit tracking

**Location:** /admin/reports

**Steps:**
1. Click "Reports" in sidebar under Analytics section
2. ✅ Verify: Page loads with "Financial Reports" heading
3. Show metric cards:
   - Total Revenue (shows —, meaning no data yet; explain it aggregates order amounts)
   - Total Orders (shows count from database)
   - Overdue Orders (tracks past-due credit)
   - Outstanding Amount (credit exposure)
4. Scroll down to see "Credit Reminders" section
5. ✅ Verify: Warning icon shown with message about credit generation
6. Show "Quick Notes" sidebar explaining data sources

**Sub-Feature: Customer Reports**
1. Click "Customer Reports" button (or link in sidebar)
2. ✅ Verify: Shows customer-focused metrics:
   - Total customers count
   - Total orders by customers
   - Top customers table
3. ← Click back or "Reports" in sidebar to return

**Talking Points:**
- "This dashboard aggregates financial metrics from orders and customer activity"
- "Credit reminders help track which customers have overdue payments"
- "Customer reports show activity distribution across your customer base"

---

### SEGMENT 4: Feature #3 & #4 - Notifications Management (1.5 minutes)

**Goal:** Demonstrate notification CRUD and filtering workflows

**Location:** /admin/notifications

**Steps:**
1. Click "Notifications" in sidebar under Operations section
2. ✅ Verify: Page loads with "Notifications" heading
3. Show metric cards:
   - Total notifications (count)
   - Unread alerts (count with warning icon)
   - Read alerts (count with checkmark)
   - Credit reminders (count with clock icon)

#### Filtering & Interaction
1. Show notification inbox with list of notifications
2. ✅ Verify: Each shows timestamp and type badge (e.g., "GENERAL UNREAD")
3. Click "Unread" tab to filter
4. ✅ Verify: List updates to show only unread notifications
5. Click a notification row to mark it as read
6. ✅ Verify: Badge changes from "UNREAD" to "READ", unread count decreases
7. Click "All" tab to see all notifications again

#### Type Filtering
1. Scroll to "Type filter" section
2. Click dropdown showing "All types"
3. ✅ Verify: Can select "General", "CreditReminder", or "LowStock"
4. Select "CreditReminder" to filter
5. ✅ Verify: List shows only credit reminder notifications

#### Mark All Read
1. Go back to "All" tab
2. Click "Mark all read" button (if any unread remain)
3. ✅ Verify: Button becomes disabled after clicking
4. ✅ Verify: All notification badges change to "READ"

**Talking Points:**
- "Notifications keep the team informed of important operational events"
- "We can filter by status (read/unread) or type (credit, stock, general)"
- "Each notification is timestamped for easy tracking"

---

### SEGMENT 5: Feature #5 - AI Prediction Dashboard (1.5 minutes)

**Goal:** Show AI-driven operational insights

**Location:** /admin/ai

**Steps:**
1. Click "AI Predictions" in sidebar under Analytics section
2. ✅ Verify: Page loads with "AI Predictions" heading
3. Show metric cards:
   - Revenue Signal (live dashboard metric)
   - Orders Tracked (current order count)
   - Low Stock Items (count of items below threshold)
   - Prediction Inputs (metadata count)

#### Alert Cards
1. Show "Prediction Alerts" section with multiple alert cards
2. ✅ Verify: Each card shows:
   - Severity badge (HIGH SEVERITY = red, MEDIUM = yellow, LOW = green)
   - Status tag (ACTIVE or RESOLVED)
   - Alert description (e.g., "4 products are below the replenishment threshold")
   - Recommendation text below

**Severity Examples:**
- **HIGH SEVERITY** → Red background, immediate attention needed
- **MEDIUM SEVERITY** → Yellow background, proactive management needed
- **LOW SEVERITY** → Green background, monitoring recommended

#### Recommendations & Insights
1. Show recommendations section on the right
2. Each recommendation tied to an alert
3. Scroll to "Insight Summary" sidebar
4. ✅ Verify: Shows "Current AI Note" with operational text

#### Refresh
1. Click "Refresh Alerts" button
2. ✅ Verify: Metrics reload with latest data

**Talking Points:**
- "The AI dashboard deterministically predicts operational issues based on current state"
- "Severity is derived from inventory and revenue metrics"
- "Recommendations guide the team on prioritized actions"
- "This is lightweight and transparent - no black-box ML, just operational logic"

---

## FINAL SUMMARY (30 seconds - 1 minute)

**Key Achievements to Highlight:**

1. **Full CRUD Implementation** ✅
   - Orders can be created, edited, and deleted
   - All changes reflected in real-time

2. **Inventory Integration** ✅
   - Creating an order reduces inventory
   - Editing updates the delta
   - Deleting restores inventory
   - Prevents data inconsistency

3. **Financial Tracking** ✅
   - Revenue metrics aggregated
   - Customer activity tracked
   - Credit reminders managed

4. **Operational Notifications** ✅
   - Events logged and categorized
   - Filtering and read/unread workflow
   - Unread count highlighted

5. **AI-Driven Insights** ✅
   - Deterministic severity calculation
   - Actionable recommendations
   - Real-time metrics display

6. **Professional UI** ✅
   - Consistent design throughout
   - Responsive layout
   - Intuitive navigation
   - Clear visual hierarchy

---

## HANDLING Q&A

### Q: "Why does the inventory decrease when I create an order?"
**A:** "This is intentional design. When an order is created, we immediately reserve inventory to prevent overselling. If you edit the order (increasing quantity), we reserve more inventory. If you delete the order, we restore it. This keeps inventory accurate across the system."

### Q: "Is the AI actually machine learning?"
**A:** "No, the AI is deterministically calculated based on operational state - stock levels and revenue data. This keeps it transparent and audit-able for coursework purposes. Real ML would be a separate enhancement."

### Q: "Can I search for specific orders?"
**A:** "Yes, the Orders page has a search bar where you can search by order ID, customer name, or customer email. Try typing a customer name."

### Q: "What happens if I mark all notifications as read?"
**A:** "The unread count drops to zero, and all badge indicators change to show 'READ'. The 'Mark all read' button then becomes disabled since there's nothing more to mark."

### Q: "How are credit reminders determined?"
**A:** "When an order's due date passes, the system generates a credit reminder notification. These are tracked separately so the team can follow up on outstanding payments."

---

## TROUBLESHOOTING

### Page takes too long to load
- Backend may be slow to respond
- Check terminal for backend errors
- Refresh browser (Ctrl+R or Cmd+R)

### Notifications show "Loading notifications..."
- Database may be empty
- Try refreshing page
- Check browser console for API errors (F12)

### Orders list is empty
- This is expected - we created and then deleted the order
- Create a new order to populate the list again

### Search not working
- Ensure backend API is running
- Check if you're searching for exact matches
- Try different search terms

### Inventory not decreasing
- Confirm order was actually created (check browser network tab in F12)
- Refresh parts page to see updated stock
- Check backend console for errors

---

## PRESENTATION TIPS

### Timing
- Segment 1: 1 min (auth + dashboard overview)
- Segment 2: 2.5 min (CRUD demo)
- Segment 3: 1 min (financial reports)
- Segment 4: 1.5 min (notifications)
- Segment 5: 1.5 min (AI predictions)
- Summary: 0.5 min (key achievements)
- **Total: 8-10 minutes**

### Pacing
- Don't rush through the Create Order workflow - show the form clearly
- Pause after each major action to let the result sink in
- Highlight the real-time calculation in the Orders total
- Emphasize the inventory management integration (it's the differentiator)

### Engagement
- Ask audience questions: "What would happen if I deleted this order?"
- Point out UI consistency: "Notice the same sidebar and theme across all pages"
- Acknowledge responsive design: "This adapts to mobile and tablet screens"
- Mention code quality: "All built with TypeScript strict mode and best practices"

### Backup Plan
If something goes wrong:
- Have screenshots of each page ready (saved in Demo Screenshots folder)
- Be ready to explain the architecture instead
- Emphasize that the system is fully functional (proven by previous testing)
- Focus on code quality and feature completeness

---

## Post-Demo Talking Points

**What's Implemented:**
- All 5 Saksham coursework requirements ✓
- Full-stack implementation (backend, frontend, database) ✓
- Professional UI design ✓
- Responsive layout ✓
- Type-safe code (TypeScript) ✓
- Comprehensive API integration ✓

**What's Not Implemented (Out of Scope):**
- Real machine learning models
- Real-time WebSocket updates
- Advanced pagination (5000+ records)
- Multi-tenant support
- Production infrastructure setup

**Why This Approach:**
- Focus on coursework requirements ✓
- Demonstrate engineering best practices ✓
- Prioritize stability and UI consistency ✓
- Code is maintainable and extensible ✓

---

## Success Criteria - Demo is Successful If:

- ✅ Authentication works (login → dashboard)
- ✅ Order creation reduces inventory
- ✅ Order editing updates inventory delta
- ✅ Order deletion restores inventory
- ✅ Financial metrics display correctly
- ✅ Notifications can be filtered and marked read
- ✅ AI alerts display with correct severity
- ✅ UI is consistent across all pages
- ✅ No console errors during demo
- ✅ Audience understands system architecture

---

**Document Version:** Final  
**Last Updated:** May 12, 2026  
**Status:** Ready for Presentation

