# CariTakip Frontend - Quick Start Guide

## 🎯 5-Minute Setup

### Step 1: Install Dependencies
```bash
cd cari-takip-frontend
npm install
```

### Step 2: Ensure Backend is Running
```bash
# In another terminal window
cd cari-takip-api
npm run dev
# Expected: API running on http://localhost:3000
```

### Step 3: Start Development Server
```bash
npm run dev
# Expected: Frontend running on http://localhost:5173
```

### Step 4: Login
Open `http://localhost:5173` in your browser

**Demo Credentials:**
- Username: `admin` or `user`
- Password: `123456`

## 📖 How to Use

### Navigation
- **Dashboard** - View statistics and recent transactions
- **Müşteriler** - Manage customers (add, edit, delete)
- **İşlemler** - Record borç (debt) and ödeme (payment) transactions

### Customer Management
1. Click "Müşteriler" in sidebar
2. Click "+ Yeni Müşteri" to add a new customer
3. Fill in customer details (name, email, phone, address, credit limit)
4. Click "Kaydet" to save

### Recording Transactions  
1. Click "İşlemler" in sidebar
2. Select a customer from the dropdown
3. Click "+ Yeni İşlem" to add transaction
4. Choose transaction type (Borç = Debt, Ödeme = Payment)
5. Enter amount and currency
6. Optional: Add description
7. Click "Kaydet" to save

### Viewing Statistics
- Dashboard shows:
  - Total number of customers
  - Total debt and payments in TL, USD, and Gold
  - Recent transactions
  - Balance summary by currency

## 🔧 Project Structure Overview

```
cari-takip-frontend/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Page components (Login, Dashboard, etc.)
│   ├── services/           # API integration
│   ├── context/            # Global state (Authentication)
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Helper functions
│   ├── App.tsx             # Main app with routing
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles (TailwindCSS)
├── index.html              # HTML entry point
├── tailwind.config.js      # TailwindCSS configuration
├── vite.config.ts          # Vite configuration
└── package.json            # Project dependencies
```

## 🎨 UI Features

### Components Used Throughout
- **Cards**: Data containers with shadows
- **Tables**: Display lists with pagination
- **Modals**: Forms for creating/editing
- **Buttons**: Actions with color variants
- **Alerts**: Notifications for success/error/warning
- **Spinners**: Loading indicators
- **Badges**: Status indicators

### Responsive Breakpoints
- Mobile (< 640px)
- Tablet (640px - 1024px)
- Desktop (> 1024px)

## 🔐 Authentication Flow

1. User enters credentials on login page
2. API validates and returns JWT token
3. Token stored in browser localStorage
4. All API requests include token in Authorization header
5. If token expires, user is redirected to login
6. Token automatically cleared on logout

## 🐛 Troubleshooting

### "Cannot reach API" error
```
✓ Check backend is running: npm run dev (in api directory)
✓ Verify backend port is 3000
✓ Check browser console for CORS errors
```

### Page stays blank after login
```
✓ Clear browser cache and localStorage
✓ Check browser DevTools console for errors
✓ Verify no JavaScript errors in console
```

### "Network error" on save
```
✓ Check API is responding: curl http://localhost:3000/api/health
✓ Verify form data is valid
✓ Check browser network tab in DevTools
```

### Login fails
```
✓ Verify credentials: admin/123456 or user/123456
✓ Check backend database has users
✓ Look at browser console for error details
```

## 📚 Key Concepts

### State Management
- **Global**: AuthContext manages user login state
- **Local**: Components manage their own form/UI state
- **Hooks**: Custom hooks for common operations

### Data Flow
```
User Action → Component State Update → API Call → Response → UI Update → Notification
```

### Component Interaction
```
App.tsx (Router)
  ├── LoginPage (Public)
  ├── DashboardPage (Protected)
  ├── CustomersPage (Protected)
  └── TransactionsPage (Protected)
```

## ✅ Checklist Before Deployment

- [ ] Backend API running and tested
- [ ] All dependencies installed: `npm install`
- [ ] Build succeeds: `npm run build`
- [ ] No console errors in development
- [ ] Tests pass (if configured)
- [ ] Environment variables configured
- [ ] API endpoints match backend
- [ ] JWT secret matches backend

## 🚀 Next Steps

1. **Understanding the Code**
   - Explore `src/components/UI.tsx` for component examples
   - Check `src/services/api.ts` for API integration
   - Review `src/context/AuthContext.tsx` for auth logic

2. **Adding Features**
   - Create new page in `src/pages/`
   - Add route in `App.tsx`
   - Use existing components and hooks

3. **Customization**
   - Update colors in `tailwind.config.js`
   - Modify text in Turkish language files
   - Add new utility functions in `src/utils/`

## 📞 Support

For questions about:
- **React & TypeScript**: Check React documentation
- **TailwindCSS**: Visit Tailwind docs
- **Backend API**: Review backend README
- **Deployment**: Check CONFIGURATION.md

---

**Happy developing! 🎉**
