# Deployment & CI/CD Documentation

## Overview

This guide covers deployment strategies, CI/CD pipeline setup, and operational procedures for the Svelte 5 + Firebase boilerplate application.

## Deployment Targets

### Firebase Hosting (Recommended)
- **Pros**: Seamless Firebase integration, CDN, SSL, easy rollbacks
- **Cons**: Limited to static sites and SPAs
- **Best for**: Production deployments with Firebase backend

### Vercel
- **Pros**: Excellent DX, automatic deployments, serverless functions
- **Cons**: Potential vendor lock-in
- **Best for**: JAMstack applications, rapid prototyping

### Netlify
- **Pros**: Great for static sites, form handling, edge functions
- **Cons**: Less Firebase integration
- **Best for**: Static content with dynamic features

### Self-Hosted (VPS/Docker)
- **Pros**: Full control, cost-effective at scale
- **Cons**: More maintenance overhead
- **Best for**: Enterprise deployments, custom infrastructure

## Firebase Hosting Deployment

### Prerequisites
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project (if not already done)
firebase init hosting
```

### Configuration
**firebase.json**
```json
{
  "hosting": {
    "public": "build",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(eot|otf|ttf|ttc|woff|font.css)",
        "headers": [
          {
            "key": "Access-Control-Allow-Origin",
            "value": "*"
          }
        ]
      },
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      },
      {
        "source": "**/*.@(jpg|jpeg|gif|png)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

### Deployment Commands
```bash
# Build and deploy
npm run build
firebase deploy --only hosting

# Deploy to specific project
firebase use production
firebase deploy --only hosting

# Deploy with message
firebase deploy --only hosting -m "Version 1.2.3 - Feature updates"
```

### Environment-Specific Deployments
```bash
# Development
firebase use dev
npm run build:dev
firebase deploy --only hosting

# Staging
firebase use staging
npm run build:staging
firebase deploy --only hosting

# Production
firebase use production
npm run build:prod
firebase deploy --only hosting
```

## CI/CD Pipeline Setup

### GitHub Actions

**.github/workflows/deploy.yml**
```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main
      - develop
  pull_request:
    branches:
      - main

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run type checking
      run: npm run typecheck
    
    - name: Run tests
      run: npm run test
    
    - name: Build application
      run: npm run build
      env:
        NODE_ENV: production
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v4
      with:
        name: build-files-${{ matrix.node-version }}
        path: build/

  deploy-staging:
    needs: build-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build for staging
      run: npm run build
      env:
        NODE_ENV: staging
        VITE_FIREBASE_CONFIG: ${{ secrets.FIREBASE_CONFIG_STAGING }}
    
    - name: Deploy to Firebase Hosting (Staging)
      uses: FirebaseExtended/action-hosting-deploy@v0
      with:
        repoToken: '${{ secrets.GITHUB_TOKEN }}'
        firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT_STAGING }}'
        projectId: your-project-staging
        channelId: live
        target: staging

  deploy-production:
    needs: build-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20.x'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build for production
      run: npm run build
      env:
        NODE_ENV: production
        VITE_FIREBASE_CONFIG: ${{ secrets.FIREBASE_CONFIG_PRODUCTION }}
    
    - name: Run production tests
      run: npm run test:production
    
    - name: Deploy to Firebase Hosting (Production)
      uses: FirebaseExtended/action-hosting-deploy@v0
      with:
        repoToken: '${{ secrets.GITHUB_TOKEN }}'
        firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT_PRODUCTION }}'
        projectId: your-project-production
        channelId: live

  performance-audit:
    needs: deploy-production
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Audit URLs using Lighthouse CI
      uses: treosh/lighthouse-ci-action@v10
      with:
        configPath: './.lighthouserc.js'
        uploadArtifacts: true
        temporaryPublicStorage: true
```

### GitLab CI/CD

**.gitlab-ci.yml**
```yaml
stages:
  - build
  - test
  - deploy

variables:
  NODE_VERSION: "20"

cache:
  paths:
    - node_modules/

before_script:
  - apt-get update -qq && apt-get install -y -qq git curl
  - curl -sL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
  - apt-get install -y nodejs
  - npm ci

build:
  stage: build
  script:
    - npm run build
  artifacts:
    paths:
      - build/
    expire_in: 1 hour

test:
  stage: test
  script:
    - npm run lint
    - npm run typecheck
    - npm run test
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'

deploy-staging:
  stage: deploy
  script:
    - npm install -g firebase-tools
    - firebase use staging --token $FIREBASE_TOKEN
    - firebase deploy --only hosting --token $FIREBASE_TOKEN
  only:
    - develop
  environment:
    name: staging
    url: https://your-project-staging.web.app

deploy-production:
  stage: deploy
  script:
    - npm install -g firebase-tools
    - firebase use production --token $FIREBASE_TOKEN
    - firebase deploy --only hosting --token $FIREBASE_TOKEN
  only:
    - main
  environment:
    name: production
    url: https://your-project.web.app
  when: manual
```

## Docker Deployment

### Dockerfile
```dockerfile
# Multi-stage build for optimal image size
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf
```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    server {
        listen 80;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Handle SPA routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

### Docker Compose
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.app.rule=Host(`yourdomain.com`)"
      - "traefik.http.routers.app.tls=true"
      - "traefik.http.routers.app.tls.certresolver=letsencrypt"

  traefik:
    image: traefik:v2.10
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
      - "--certificatesresolvers.letsencrypt.acme.email=your-email@example.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "./letsencrypt:/letsencrypt"
```

## Environment Configuration

### Environment Files Structure
```
├── .env.example
├── .env.development
├── .env.staging
├── .env.production
└── .env.local (gitignored)
```

### Package.json Scripts
```json
{
  "scripts": {
    "build:dev": "NODE_ENV=development vite build",
    "build:staging": "NODE_ENV=staging vite build",
    "build:prod": "NODE_ENV=production vite build",
    "deploy:dev": "npm run build:dev && firebase use dev && firebase deploy --only hosting",
    "deploy:staging": "npm run build:staging && firebase use staging && firebase deploy --only hosting",
    "deploy:prod": "npm run build:prod && firebase use production && firebase deploy --only hosting",
    "preview:build": "npm run build && npx serve build",
    "lighthouse": "lighthouse http://localhost:4173 --output=json --output-path=./lighthouse-report.json"
  }
}
```

## Monitoring & Observability

### Performance Monitoring
```typescript
// src/lib/utils/monitoring.ts
export function setupMonitoring() {
  if (typeof window === 'undefined') return;

  // Web Vitals monitoring
  import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
    getCLS((metric) => reportMetric(metric));
    getFID((metric) => reportMetric(metric));
    getFCP((metric) => reportMetric(metric));
    getLCP((metric) => reportMetric(metric));
    getTTFB((metric) => reportMetric(metric));
  });

  // Error monitoring
  window.addEventListener('error', (event) => {
    reportError({
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error?.stack
    });
  });

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    reportError({
      message: event.reason?.message || 'Unhandled promise rejection',
      error: event.reason?.stack
    });
  });
}

function reportMetric(metric: any) {
  // Send to your monitoring service
  console.log(metric);
}

function reportError(error: any) {
  // Send to your error monitoring service
  console.error(error);
}
```

### Health Checks
```typescript
// src/lib/utils/health.ts
export interface HealthCheck {
  service: string;
  status: 'healthy' | 'unhealthy';
  timestamp: number;
  details?: any;
}

export async function performHealthChecks(): Promise<HealthCheck[]> {
  const checks: HealthCheck[] = [];

  // Firebase connection check
  try {
    await import('$lib/services/firebase');
    checks.push({
      service: 'firebase',
      status: 'healthy',
      timestamp: Date.now()
    });
  } catch (error) {
    checks.push({
      service: 'firebase',
      status: 'unhealthy',
      timestamp: Date.now(),
      details: error
    });
  }

  // API availability check
  try {
    const response = await fetch('/api/health');
    checks.push({
      service: 'api',
      status: response.ok ? 'healthy' : 'unhealthy',
      timestamp: Date.now(),
      details: { status: response.status }
    });
  } catch (error) {
    checks.push({
      service: 'api',
      status: 'unhealthy',
      timestamp: Date.now(),
      details: error
    });
  }

  return checks;
}
```

## Rollback Procedures

### Firebase Hosting Rollback
```bash
# List recent deployments
firebase hosting:releases

# Rollback to previous version
firebase hosting:rollback

# Rollback to specific version
firebase hosting:rollback --site your-site --version VERSION_ID
```

### Blue-Green Deployment
```bash
# Deploy to blue environment
firebase use production-blue
firebase deploy --only hosting

# Test blue environment
npm run test:e2e -- --baseUrl=https://blue.your-domain.com

# Switch traffic to blue (green becomes staging)
firebase hosting:channel:deploy blue --expires 30d
firebase hosting:clone blue:live
```

### Automated Rollback Script
```bash
#!/bin/bash
# rollback.sh

set -e

PROJECT_ID=${1:-production}
HEALTH_CHECK_URL="https://${PROJECT_ID}.web.app/health"
MAX_RETRIES=5
RETRY_DELAY=10

echo "Performing health check after deployment..."

for i in $(seq 1 $MAX_RETRIES); do
    if curl -f -s "$HEALTH_CHECK_URL" > /dev/null; then
        echo "Health check passed"
        exit 0
    else
        echo "Health check failed (attempt $i/$MAX_RETRIES)"
        if [ $i -eq $MAX_RETRIES ]; then
            echo "Health check failed after $MAX_RETRIES attempts. Rolling back..."
            firebase use "$PROJECT_ID"
            firebase hosting:rollback
            echo "Rollback completed"
            exit 1
        fi
        sleep $RETRY_DELAY
    fi
done
```

## Security Considerations

### Secrets Management
```bash
# GitHub Actions secrets
FIREBASE_SERVICE_ACCOUNT_STAGING
FIREBASE_SERVICE_ACCOUNT_PRODUCTION
FIREBASE_CONFIG_STAGING
FIREBASE_CONFIG_PRODUCTION

# GitLab CI/CD variables
FIREBASE_TOKEN
STAGING_PROJECT_ID
PRODUCTION_PROJECT_ID
```

### Content Security Policy
```html
<!-- In app.html -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://*.googleapis.com https://*.google.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https://*.googleapis.com https://*.google.com;
  connect-src 'self' https://*.firebase.com https://*.googleapis.com;
  frame-src https://*.google.com;
">
```

## Best Practices

### Deployment Checklist
1. ✅ Run full test suite
2. ✅ Check build output for errors
3. ✅ Verify environment variables
4. ✅ Test build locally with `npm run preview`
5. ✅ Deploy to staging first
6. ✅ Run automated tests against staging
7. ✅ Manual QA on staging
8. ✅ Deploy to production
9. ✅ Monitor deployment health
10. ✅ Update documentation

### Monitoring Setup
- Set up alerts for error rates > 5%
- Monitor response times > 2s
- Track Core Web Vitals
- Set up uptime monitoring
- Configure log aggregation
- Set up performance budgets

---

## Quick Reference Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run preview                # Preview production build

# Testing
npm run test                   # Run tests
npm run test:watch            # Run tests in watch mode
npm run lint                  # Run ESLint
npm run typecheck             # Run TypeScript checks

# Firebase
firebase login                 # Login to Firebase
firebase use <project>         # Switch projects
firebase deploy --only hosting # Deploy to hosting
firebase hosting:rollback      # Rollback deployment

# Analysis
npm run analyze               # Bundle analysis
npm run perf:audit           # Performance audit
```