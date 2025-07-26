# Git Setup and Push Commands

## Step 1: Navigate to admin directory
```bash
cd admin
```

## Step 2: Initialize git repository (if not already initialized)
```bash
git init
```

## Step 3: Add the remote repository
```bash
git remote add origin https://github.com/kaunda-a/Storm_admin.git
```

## Step 4: Add all files to staging
```bash
git add .
```

## Step 5: Commit the changes
```bash
git commit -m "Fix product creation issues with variant SKU conflicts

- Fixed default variant SKU generation to avoid conflicts
- Updated product update logic to target default variants correctly
- Removed non-existent isDefault field references
- Cleaned up variant form component"
```

## Step 6: Push to GitHub
```bash
git push -u origin main
```

## Alternative: If main branch doesn't exist, try master
```bash
git push -u origin master
```

## If you get authentication errors, you might need to:
1. Set up your git credentials:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

2. Or use a personal access token instead of password when prompted.

## To check current status at any time:
```bash
git status
git remote -v
```
