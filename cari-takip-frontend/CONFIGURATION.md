# Frontend Environment Configuration

## Environment Variables

Create a `.env.local` file in the project root to override default settings:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api

# Application Settings
VITE_APP_NAME=CariTakip
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_DEMO_MODE=true
```

## API Backend Configuration

The frontend connects to the backend API at: **http://localhost:3000**

Ensure your backend is running with:
```bash
# In the backend directory
npm run dev
# or
npm start
```

## Development Server

Start the development server with:
```bash
npm run dev
```

Default URL: `http://localhost:5173`

## Build Configuration

Production build output goes to the `dist/` directory:
```bash
npm run build
```

## Troubleshooting

### Backend not responding
- Ensure backend is running on `http://localhost:3000`
- Check CORS settings in backend
- Verify network connectivity

### Token-related issues
- Clear browser localStorage and try again
- Check token expiration settings in backend
- Verify JWT_SECRET matches between frontend and backend

### Build errors
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite`

## Performance Monitoring

Monitor network requests in browser DevTools:
- Network tab: Check API response times
- Console: Check for JavaScript errors
- Application: Verify localStorage token

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Deploy the `dist/` directory to your web server

3. Update `VITE_API_BASE_URL` to point to production backend:
   ```bash
   VITE_API_BASE_URL=https://api.yourdomain.com
   npm run build
   ```

4. Configure server for SPA (Single Page Application):
   - All routes should redirect to `index.html`
   - Set proper cache headers

## Docker Deployment (Optional)

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t cari-takip-frontend .
docker run -p 80:80 cari-takip-frontend
```
