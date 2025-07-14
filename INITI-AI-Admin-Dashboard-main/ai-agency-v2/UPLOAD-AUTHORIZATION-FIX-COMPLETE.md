# Document Upload Authorization Fix - Complete Guide

## Issue Summary
The document upload functionality shows "Error: Unauthorized" due to **storage bucket naming inconsistency** and potentially missing RLS policies.

## Root Cause Analysis
1. **Bucket Naming Mismatch**: Setup scripts create `hotel-documents` bucket, but upload code uses `hotel_documents`
2. **Missing/Incorrect RLS Policies**: Storage bucket policies may not be properly configured
3. **User-Hotel Association**: User might not be properly associated as a hotel admin

## ✅ Fixes Applied

### 1. Fixed Bucket Naming Consistency
- **Fixed**: `app/utils/hotel-documents.ts` - Updated to use `hotel-documents` consistently
- **Fixed**: `migrations/profiles_and_documents.sql` - Updated bucket name to `hotel-documents`
- **Fixed**: `PROFILE-DOCUMENTS-MIGRATION.md` - Updated bucket references

### 2. Created Comprehensive Fix Scripts
- **Created**: `fix-storage-bucket-rls.sql` - Complete storage bucket and RLS setup
- **Created**: `diagnose-upload-authorization.sql` - Diagnostic script to identify issues
- **Created**: `test-upload-debug.js` - Browser-based upload testing

## 🔧 Required Steps to Fix Upload Authorization

### Step 1: Run Storage Bucket Fix (CRITICAL)
Execute the following SQL script in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of fix-storage-bucket-rls.sql
```

### Step 2: Verify User-Hotel Assignment
Run the diagnostic script to check if the current user is properly assigned as a hotel admin:

```sql
-- Copy and paste the contents of diagnose-upload-authorization.sql
```

### Step 3: If User Not Hotel Admin, Run Assignment Script
If the diagnostic shows the user is not a hotel admin, run:

```sql
-- Copy and paste the contents of setup-auto-user-assignment.sql
```

### Step 4: Test Upload Functionality
1. Open browser developer console
2. Navigate to the documents upload page
3. Paste and run the contents of `test-upload-debug.js`

## 🔍 Key Changes Made

### File Updates:
1. **`app/utils/hotel-documents.ts`**:
   - ✅ Changed `hotel_documents` → `hotel-documents` in storage calls
   - ✅ Fixed upload and delete functions

2. **`migrations/profiles_and_documents.sql`**:
   - ✅ Updated bucket creation to use `hotel-documents`
   - ✅ Updated RLS policies to reference correct bucket name

3. **`PROFILE-DOCUMENTS-MIGRATION.md`**:
   - ✅ Updated documentation to use consistent naming

### New Files Created:
1. **`fix-storage-bucket-rls.sql`** - Complete bucket setup and RLS configuration
2. **`diagnose-upload-authorization.sql`** - Diagnostic queries
3. **`test-upload-debug.js`** - Client-side upload testing

## 🎯 Expected Results After Fix

1. **✅ Bucket Consistency**: All code uses `hotel-documents` bucket name
2. **✅ Proper RLS Policies**: Storage objects have correct permissions for hotel admins
3. **✅ User Authorization**: Users properly associated with hotels can upload documents
4. **✅ Upload Success**: Document upload form works without authorization errors

## 🚨 Critical Next Steps

### Immediate Actions Required:
1. **Run `fix-storage-bucket-rls.sql`** in Supabase SQL Editor (MOST IMPORTANT)
2. **Verify user authentication** using the diagnostic script
3. **Test upload** using the debug script
4. **Check console errors** in browser developer tools during upload

### If Still Getting Errors:
1. Check Supabase dashboard > Storage > Policies
2. Verify `hotel-documents` bucket exists and is private
3. Confirm user has hotel_admin record in database
4. Check browser network tab for detailed error messages

## 📋 Verification Checklist

- [ ] `fix-storage-bucket-rls.sql` executed successfully
- [ ] User appears as hotel admin in diagnostic script
- [ ] `hotel-documents` bucket exists and is private
- [ ] Storage RLS policies include hotel-documents permissions
- [ ] Upload test script runs without 401/403 errors
- [ ] Actual document upload works in the UI

## 🔄 If Problems Persist

Run these additional checks:
1. Clear browser cache and cookies
2. Log out and log back in
3. Check Supabase auth logs for session issues
4. Verify environment variables in `.env.local`
5. Check network tab for API call details

The key fix is the **storage bucket naming consistency**. The upload was failing because the code was trying to access a bucket (`hotel_documents`) that doesn't exist with the proper RLS policies.
