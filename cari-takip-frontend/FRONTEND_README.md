## CariTakip Frontend

Professional, responsive React frontend for the Cari Takip (Accounts Receivable Tracking) System.

### 🚀 Features

- **Authentication System**
  - User login/register with JWT tokens
  - Token-based API authentication
  - Auto-logout on token expiration
  - Persistent login state (localStorage)

- **Dashboard**
  - Total customer statistics
  - Comprehensive debt & payment statistics in multiple currencies (TL, USD, Gold)
  - Recent transaction display
  - Multi-currency financial overview

- **Customer Management**
  - List, search, filter customers
  - Add new customers with credit limits
  - Edit customer information
  - Soft delete with restore capability
  - Pagination support

- **Transaction Management**
  - Record debt (borç) and payment (ödeme) transactions
  - Support for multiple currencies (TL, USD, Altın)
  - Transaction filtering by customer, date, and type
  - Edit and delete transactions with soft delete
  - Restore deleted transactions

- **User Experience**
  - Responsive design for desktop and mobile
  - Real-time notifications (toast messages)
  - Loading states and spinners
  - Clean, professional UI with TailwindCSS
  - Role-based features (Admin vs User)
  - Pagination for large datasets
  - Search and filter capabilities

### 📁 Project Structure

```
src/
├── components/
│   ├── UI.tsx                    # Basic UI components (Button, Input, Modal, etc.)
│   └── Layout.tsx                # Layout components (Header, Sidebar, Navigation, etc.)
├── pages/
│   ├── LoginPage.tsx             # User authentication page
│   ├── DashboardPage.tsx         # Main dashboard with statistics
│   ├── CustomersPage.tsx         # Customer management interface
│   └── TransactionsPage.tsx      # Transaction management interface
├── services/
│   └── api.ts                    # API client with axios configuration
├── context/
│   └── AuthContext.tsx           # Global authentication state management
├── hooks/
│   └── useCommon.ts              # Custom hooks (notifications, forms, pagination, etc.)
├── types/
│   └── index.ts                  # TypeScript interfaces and types
├── utils/
│   └── helpers.ts                # Utility functions (formatting, validation, etc.)
├── App.tsx                       # Main app component with routing
├── main.tsx                      # Application entry point
└── index.css                     # TailwindCSS styles
```

### 🛠 Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios
- **State Management**: React Context API (AuthContext)

### 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Backend API running on `http://localhost:3000`

### 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

3. **Build for Production**
   ```bash
   npm run build
   ```

4. **Preview Production Build**
   ```bash
   npm run preview
   ```

### 🔐 Authentication

- JWT tokens are automatically attached to all API requests
- Token stored in localStorage for persistence
- Expired tokens trigger automatic redirect to login
- Demo credentials available on login page

### 📊 API Integration

All API calls are managed through `/src/services/api.ts`:

**API Endpoints Consumed:**
- `POST /api/user/register` - User registration
- `POST /api/user/login` - User login
- `GET /api/user/profile` - Get user profile
- `POST /api/user/logout` - User logout
- `GET /api/cari` - List all customers
- `GET /api/cari/:id` - Get single customer
- `POST /api/cari` - Create customer
- `PUT /api/cari/:id` - Update customer
- `DELETE /api/cari/:id` - Delete customer
- `POST /api/cari/:id/restore` - Restore customer
- `GET /api/islem` - List transactions
- `GET /api/islem/cari/:cariId` - Get customer transactions
- `GET /api/islem/cari/:cariId/filter` - Filter transactions
- `POST /api/islem/cari/:cariId` - Create transaction
- `PUT /api/islem/:islemId` - Update transaction
- `DELETE /api/islem/:islemId` - Delete transaction
- `POST /api/islem/:islemId/restore` - Restore transaction
- `GET /api/dashboard` - Get dashboard statistics
- `GET /api/health` - Health check

### 🎨 UI Components

**Basic Components** (UI.tsx):
- Button (with variants: primary, secondary, danger, success, warning)
- Input field (with validation & error display)
- Select dropdown
- Card (container component)
- Badge (for status display)
- Alert (notification display)
- Modal (dialog component)
- Spinner (loading indicator)
- EmptyState (no-data display)
- Checkbox

**Layout Components** (Layout.tsx):
- Header (with user menu)
- Sidebar (navigation menu)
- DataTable (reusable table with sorting)
- Pagination (page navigation)
- SearchBar (search input)
- NotificationContainer (toast notifications)
- ProtectedRoute (route guard)
- LoadingScreen (full-page loader)

### 🪝 Custom Hooks

**useNotification**: Manage toast notifications
```typescript
const { addNotification } = useNotification();
addNotification('Success message', 'success');
```

**useForm**: Handle form state & validation
```typescript
const form = useForm({ name: '', email: '' });
```

**usePagination**: Manage pagination state
```typescript
const { page, nextPage, prevPage } = usePagination(1, 10);
```

**useSelect**: Manage select/dropdown state
```typescript
const { value, handleChange } = useSelect('option1');
```

**useAttempt**: Manage loading states
```typescript
const { isLoading, startLoading, stopLoading } = useLoading();
```

### 🛡️ Type Safety

All components and functions are fully typed with TypeScript:
- User & Authentication types
- Customer (Cari) types
- Transaction (İşlem) types
- API Response types
- Form input types

### 📱 Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Flexible grid layouts
- Touch-friendly interactions

### 🌐 Internationalization

All UI text and messages are in Turkish (tr-TR):
- Date/currency formatting
- Error messages
- Button labels
- Form placeholders

### 🔄 State Management

**Global State**:
- AuthContext: User authentication & authorization

**Local State**:
- Component-level state with useState
- Form state with useForm hook
- Pagination state with usePagination

### 🚨 Error Handling

- API error responses captured and displayed
- Network error fallbacks
- Form validation with error messages
- Automatic retry for failed requests
- User-friendly error notifications

### 📈 Performance Optimization

- Code splitting with React Router
- Lazy loading of routes
- Axios request/response interceptors
- Debounced search functionality
- Efficient re-renders with React hooks

### 🔒 Security

- JWT token authentication
- Secured API routes with ProtectedRoute
- Token stored securely in localStorage
- CORS handled server-side
- SQL injection prevention via parameterized queries

### 🧪 Testing (Optional)

To add testing:
```bash
npm install --save-dev vitest @testing-library/react
```

### 📝 Development Guidelines

1. **Component Structure**
   - Keep components focused and reusable
   - Use TypeScript for type safety
   - Add JSDoc comments

2. **API Calls**
   - Use apiService from `/services/api.ts`
   - Always handle errors with try-catch
   - Use notifications for user feedback

3. **Form Handling**
   - Use useForm hook for consistency
   - Validate before submission
   - Clear errors on user input

### 🤝 Backend Integration

Frontend expects backend at `http://localhost:3000`:

```typescript
// src/services/api.ts
const apiClient: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api',
  // ... config
});
```

To change backend URL, modify this file.

### 📚 Learn More

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [React Router Documentation](https://reactrouter.com/docs)
- [Axios Documentation](https://axios-http.com/docs)

### 📄 License

ISC

### 👨‍💻 Support

For issues or questions, contact the development team.
