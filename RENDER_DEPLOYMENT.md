# Deploying to Render

This guide will help you deploy your React + Vite application to Render.com.

## Prerequisites

1. A [Render](https://render.com) account
2. Your project pushed to a GitHub repository

## Step-by-Step Deployment Guide

### 1. Prepare Your Project

1. Make sure your repository has these essential files:
   - `package.json` (already present)
   - `vite.config.ts` (already present)

2. Add a `render.yaml` file at the root of your project with the following content:

```yaml
services:
   - type: web
      name: branch-wise-school-link
      env: node
      buildCommand: npm install && npm audit fix --force && npm run build
      startCommand: npm run preview
      staticPublishPath: ./dist
      envVars:
         - key: NODE_VERSION
            value: 18.0.0
```

### 2. Deploy to Render

1. Log in to your [Render Dashboard](https://dashboard.render.com)

2. Click on the "New +" button and select "Web Service"

3. Connect your GitHub repository
   - Select the repository containing your application
   - Choose the branch you want to deploy (usually `main`)

4. Configure your web service:
   - **Name**: Choose a name for your service (e.g., "branch-wise-school-link")
   - **Region**: Choose the region closest to your users
   - **Branch**: Select your main branch
   - **Runtime**: Node
   - **Build Command**: `npm install && npm audit fix --force && npm run build`
   - **Start Command**: `npm run preview`

5. Environment Variables:
   - Add any necessary environment variables from your `.env` file
   - Make sure to add all required API keys and configuration values

### 3. Configure Build Settings

Render will automatically detect that this is a Node.js application. However, you should verify these settings in the dashboard:

- **Node Version**: 18.x or higher
- **Build Command**: `npm install && npm audit fix --force && npm run build`
- **Start Command**: `npm run preview`

**Note:**
- The build command includes `npm audit fix --force` to automatically fix security vulnerabilities during deployment.
- The project uses Vite 5.x for compatibility with all dependencies. Do not upgrade to Vite 6 or 7 unless all plugins and dev dependencies support it.

### 4. Deploy

1. Click "Create Web Service"
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Build your application
   - Deploy it to a Render URL

### 5. Post-Deployment

1. Once deployment is complete, Render will provide you with a URL for your application
2. Verify that your application is working correctly at the provided URL
3. Set up a custom domain if needed:
   - Go to your web service settings
   - Click on "Custom Domain"
   - Follow the instructions to add your domain

### Troubleshooting

If you encounter any issues:

1. Check the build logs in the Render dashboard
2. Verify all environment variables are set correctly
3. Ensure all dependencies are listed in `package.json`
4. Check that the build and start commands are correct
5. Verify Node.js version compatibility

### Automatic Deployments

Render automatically deploys:
- When you push to your main branch
- When you update environment variables
- When you manually trigger a deploy from the dashboard

## Important Notes

1. Make sure your application doesn't hardcode any local development URLs
2. Keep your environment variables secure and properly configured in Render
3. Monitor your application's logs and metrics in the Render dashboard
4. Consider setting up health checks for better reliability

For more detailed information, refer to [Render's official documentation](https://render.com/docs).