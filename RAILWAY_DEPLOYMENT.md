# 🚀 Railway Deployment Guide

**Complete instructions to deploy Project-Riwi on Railway**

---

## 📋 Prerequisites

### Required Accounts
- **Railway Account**: [Sign up at railway.app](https://railway.app)
- **GitHub Account**: For repository connection
- **PostgreSQL**: Railway provides managed PostgreSQL
- **OpenAI API Key**: For AI analysis features (optional)

### Local Setup
- **Git installed**: For repository management
- **Node.js 18+**: For local testing
- **Railway CLI**: Optional but recommended (`npm install -g @railway/cli`)

---

## 🛠️ Step 1: Prepare Your Project

### 1.1 Update package.json Scripts
```json
{
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "migrate": "node scripts/run-migration.js",
    "seed": "node scripts/seed.js"
  }
}
```

### 1.2 Verify Environment Variables
Create `.env.example` if not exists:
```bash
# Database (Railway provides this automatically)
DATABASE_URL=postgresql://user:password@host:port/database

# JWT Secrets (generate secure random strings)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars

# OpenAI API (optional)
OPENAI_API_KEY=your-openai-api-key

# Server configuration
PORT=3000
NODE_ENV=production
FRONTEND_URL=https://your-app-name.railway.app
```

### 1.3 Update server.js for Railway
```javascript
// src/server.js - Ensure this exists and is properly configured
const express = require('express');
const app = require('./app');
const port = process.env.PORT || 3000;

app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on port ${port}`);
});
```

---

## 🚀 Step 2: Deploy to Railway

### 2.1 Connect Repository to Railway
1. **Go to [railway.app](https://railway.app)**
2. **Click "New Project"**
3. **Select "Deploy from GitHub repo"**
4. **Connect your GitHub account**
5. **Select your Project-Riwi repository**

### 2.2 Configure Railway Project
1. **Project Settings** → **Environment Variables**
2. **Add the following variables**:

```bash
# Railway automatically provides DATABASE_URL
# Just verify it's present

# Add these manually:
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-please-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars-change-this
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-project-name.up.railway.app

# Optional - Add your OpenAI API key
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### 2.3 Configure Database
1. **Go to your Railway project**
2. **Click "New Service"**
3. **Select "PostgreSQL"**
4. **Railway will automatically:**
   - Create a PostgreSQL database
   - Set `DATABASE_URL` environment variable
   - Handle connection pooling

### 2.4 Run Database Migration
1. **Go to your project settings**
2. **Click "Deploy"** to trigger initial deployment
3. **Once deployed, go to "Logs"**
4. **Click "Console"** tab
5. **Run migration command**:
```bash
node scripts/run-migration.js
```

### 2.5 Seed Initial Data
```bash
# In the same console
node scripts/seed.js
```

---

## 🔧 Step 3: Configure Services

### 3.1 Service Configuration
In Railway dashboard, ensure you have:

1. **Backend Service** (main service)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Port**: `3000`

2. **PostgreSQL Service** (database)
   - **Automatically configured by Railway**
   - **Check connection in logs**

### 3.2 Verify Deployment
1. **Check deployment logs** for any errors
2. **Test the application** by visiting your Railway URL
3. **Verify database connection** in logs
4. **Test login functionality**

---

## 🌐 Step 4: Frontend Configuration

### 4.1 Update API Base URL
In `public/assets/js/api.js`, ensure the API base URL works with Railway:

```javascript
// This should work automatically as it uses relative paths
const API_BASE = '/api';
```

### 4.2 Static Files Configuration
Railway automatically serves static files from the `public` directory. No additional configuration needed.

---

## 🔍 Step 5: Testing and Verification

### 5.1 Health Check
```bash
# Test your Railway URL
curl https://your-project-name.up.railway.app/api/health
```

### 5.2 Test Key Features
1. **User Registration**: Create a new interventor account
2. **Login**: Test authentication
3. **Dashboard**: Verify data loads correctly
4. **Search**: Test couder search functionality
5. **AI Analysis**: Test with OpenAI API key (if configured)

### 5.3 Monitor Logs
- **Go to Railway dashboard**
- **Click "Logs" tab**
- **Monitor for any errors**
- **Check database connection logs**

---

## 🚨 Troubleshooting

### Common Issues and Solutions

#### Database Connection Error
```bash
# Check DATABASE_URL in Railway environment variables
# Should look like: postgresql://user:password@host:port/database
```

#### Port Issues
```bash
# Ensure PORT=3000 in environment variables
# Railway automatically maps this to external port
```

#### Static Files Not Loading
```bash
# Verify public folder structure
# Ensure index.html exists in public/
```

#### Migration Errors
```bash
# Run migration manually in Railway console
node scripts/run-migration.js
```

#### OpenAI API Not Working
```bash
# Verify OPENAI_API_KEY is set correctly
# Should start with "sk-"
```

---

## 🔄 Step 6: Custom Domain (Optional)

### 6.1 Add Custom Domain
1. **Go to Railway project settings**
2. **Click "Settings" → "Custom Domains"**
3. **Add your domain** (e.g., `yourapp.yourdomain.com`)
4. **Update DNS records** as instructed by Railway

### 6.2 Update FRONTEND_URL
```bash
# Update environment variable
FRONTEND_URL=https://yourapp.yourdomain.com
```

---

## 📊 Step 7: Monitoring and Maintenance

### 7.1 Railway Monitoring
- **Metrics**: Built-in monitoring dashboard
- **Logs**: Real-time log viewing
- **Alerts**: Set up error notifications
- **Backups**: Automatic database backups

### 7.2 Performance Optimization
```bash
# Enable Railway's built-in caching
# Monitor response times
# Scale resources as needed
```

---

## 💡 Pro Tips

### Environment Variables Security
- **Never commit** `.env` files
- **Use Railway's encrypted** environment variables
- **Rotate secrets** regularly

### Database Management
- **Railway handles** backups automatically
- **Monitor database size** in dashboard
- **Use connection pooling** for better performance

### Cost Optimization
- **Start with free tier** ($5/month)
- **Scale as needed** based on usage
- **Monitor resource usage** in dashboard

---

## 🎯 Quick Deployment Checklist

- [ ] GitHub repository connected to Railway
- [ ] Environment variables configured
- [ ] PostgreSQL service created
- [ ] Database migration completed
- [ ] Initial data seeded
- [ ] Frontend serving correctly
- [ ] Authentication working
- [ ] AI features tested (if using OpenAI)
- [ ] Custom domain configured (optional)
- [ ] Monitoring set up

---

## 🚀 Your Railway URL

After deployment, your app will be available at:
```
https://your-project-name.up.railway.app
```

Replace `your-project-name` with your actual Railway project name.

---

## 📞 Support

### Railway Documentation
- [Railway Docs](https://docs.railway.app/)
- [Railway Discord](https://discord.gg/railway)
- [GitHub Issues](https://github.com/railwayapp/support)

### Project-Riwi Support
- Check the [README.md](./README.md) for project-specific information
- Review environment variables requirements
- Test all features before going to production

---

**🎉 Congratulations! Your Project-Riwi is now live on Railway!**

*Your clinical management system is now accessible globally with secure hosting, automatic scaling, and managed database services.*
