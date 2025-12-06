# Deployment Guide - Stitch SageSpace

## 🚀 Production Deployment

### Prerequisites

- Node.js 18+ installed
- npm, yarn, or pnpm package manager
- Git (for version control)

### Build Process

1. **Install Dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Build for Production**:
   \`\`\`bash
   npm run build
   \`\`\`
   
   This creates an optimized production build in the `dist/` directory.

3. **Preview Production Build** (Optional):
   \`\`\`bash
   npm run preview
   \`\`\`

### Deployment Options

#### Option 1: Static Hosting (Recommended for MVP)

**Vercel**:
\`\`\`bash
npm install -g vercel
vercel
\`\`\`

**Netlify**:
\`\`\`bash
npm install -g netlify-cli
netlify deploy --prod
\`\`\`

**GitHub Pages**:
1. Update `vite.config.ts`:
   \`\`\`typescript
   export default defineConfig({
     base: '/your-repo-name/',
     // ... rest of config
   })
   \`\`\`
2. Build and deploy:
   \`\`\`bash
   npm run build
   # Deploy dist/ folder to gh-pages branch
   \`\`\`

#### Option 2: Traditional Web Server

1. Build the project:
   \`\`\`bash
   npm run build
   \`\`\`

2. Upload `dist/` folder contents to your web server

3. Configure server to serve `index.html` for all routes (SPA routing)

**Nginx Configuration**:
\`\`\`nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
\`\`\`

**Apache Configuration** (`.htaccess`):
\`\`\`apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
\`\`\`

### Environment Variables

Create a `.env` file for environment-specific configuration:

\`\`\`env
VITE_API_URL=https://api.yourdomain.com
VITE_APP_NAME=SageSpace
VITE_ENABLE_ANALYTICS=true
\`\`\`

Access in code:
\`\`\`typescript
const apiUrl = import.meta.env.VITE_API_URL
\`\`\`

### Performance Optimization

1. **Code Splitting**: Already configured via Vite
2. **Asset Optimization**: Images should be optimized before deployment
3. **CDN**: Use CDN for static assets
4. **Caching**: Configure proper cache headers

### Security Considerations

1. **HTTPS**: Always use HTTPS in production
2. **CSP Headers**: Configure Content Security Policy
3. **Environment Variables**: Never commit `.env` files
4. **API Keys**: Store securely, never in client code

### Monitoring

1. **Error Tracking**: Integrate Sentry or similar
2. **Analytics**: Add Google Analytics or similar
3. **Performance**: Monitor Core Web Vitals

### CI/CD Pipeline Example

**GitHub Actions** (`.github/workflows/deploy.yml`):
\`\`\`yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - run: npm run preview
\`\`\`

## 📦 Build Output

After building, the `dist/` directory contains:
- `index.html` - Entry point
- `assets/` - Optimized JS, CSS, and assets
- All static files ready for deployment

## 🔧 Troubleshooting

### Build Fails
- Check Node.js version (18+)
- Clear `node_modules` and reinstall
- Check for TypeScript errors: `npm run lint`

### Routing Issues
- Ensure server is configured for SPA routing
- Check base path in `vite.config.ts`

### Environment Variables Not Working
- Ensure variables start with `VITE_`
- Restart dev server after adding variables
