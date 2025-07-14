# Document Upload Authorization Fix - Complete Guide

## Issue Summary
The document upload functionality shows "Error: Unauthorized" due to **storage bucket naming inconsistency** and potentially missing RLS policies.

## Root Cause Analysis
1. **Bucket Naming Mismatch**: Code needed to consistently use the existing `hotel_documents` bucket
2. **Missing/Incorrect RLS Policies**: Storage bucket policies may not be properly configured
3. **User-Hotel Association**: User might not be properly associated as a hotel admin

## ✅ Fixes Applied

### 1. Standardized Bucket Naming to `hotel_documents`
- **Fixed**: `app/utils/hotel-documents.ts` - Updated to use `hotel_documents` consistently
- **Fixed**: `app/utils/document-upload.ts` - Updated bucket references
- **Fixed**: `app/utils/document-service.ts` - Updated bucket references
- **Fixed**: `migrations/profiles_and_documents.sql` - Updated bucket name to `hotel_documents`
- **Fixed**: `PROFILE-DOCUMENTS-MIGRATION.md` - Updated bucket references
- **Fixed**: `scripts/setup-supabase.js` - Updated bucket creation and policies
- **Fixed**: `app/utils/supabase-rls-setup.ts` - Updated bucket references
- **Fixed**: `app/dev-tools/storage-explorer/page.tsx` - Updated default bucket

### 2. Created Comprehensive Fix Scripts
- **Created**: `fix-storage-bucket-rls.sql` - Complete storage bucket and RLS setup for `hotel_documents`
- **Created**: `diagnose-upload-authorization.sql` - Diagnostic script to identify issues
- **Created**: `test-upload-debug.js` - Browser-based upload testing

## 🔧 Required Steps to Fix Upload Authorization

### Step 1: Run Storage Bucket Fix (CRITICAL)
Execute the following SQL script in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of fix-storage-bucket-rls.sql
-- This will ensure hotel_documents bucket exists with proper RLS policies
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

### Bucket Name Standardization:
**ALL CODE NOW USES `hotel_documents` (with underscore)**

### File Updates:
1. **`app/utils/hotel-documents.ts`**:
   - ✅ Upload function uses `hotel_documents` bucket
   - ✅ Delete function uses `hotel_documents` bucket

2. **`app/utils/document-upload.ts`**:
   - ✅ Upload storage call uses `hotel_documents`
   - ✅ Error cleanup uses `hotel_documents`

3. **`app/utils/document-service.ts`**:
   - ✅ All storage operations use `hotel_documents`

4. **`migrations/profiles_and_documents.sql`**:
   - ✅ Bucket creation uses `hotel_documents`
   - ✅ RLS policies reference `hotel_documents`

5. **`scripts/setup-supabase.js`**:
   - ✅ Bucket creation uses `hotel_documents`
   - ✅ Storage policies reference `hotel_documents`

### New Files Created:
1. **`fix-storage-bucket-rls.sql`** - Complete bucket setup for `hotel_documents`
2. **`diagnose-upload-authorization.sql`** - Diagnostic queries
3. **`test-upload-debug.js`** - Client-side upload testing

## 🎯 Expected Results After Fix

1. **✅ Bucket Consistency**: All code uses `hotel_documents` bucket name
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
2. Verify `hotel_documents` bucket exists and is private
3. Confirm user has hotel_admin record in database
4. Check browser network tab for detailed error messages

## 📋 Verification Checklist

- [ ] `fix-storage-bucket-rls.sql` executed successfully
- [ ] User appears as hotel admin in diagnostic script
- [ ] `hotel_documents` bucket exists and is private
- [ ] Storage RLS policies include hotel_documents permissions
- [ ] Upload test script runs without 401/403 errors
- [ ] Actual document upload works in the UI

## 🔄 If Problems Persist

Run these additional checks:
1. Clear browser cache and cookies
2. Log out and log back in
3. Check Supabase auth logs for session issues
4. Verify environment variables in `.env.local`
5. Check network tab for API call details

The key fix was **standardizing the storage bucket naming** to use `hotel_documents` consistently throughout the entire codebase, and ensuring the RLS policies match this bucket name.
