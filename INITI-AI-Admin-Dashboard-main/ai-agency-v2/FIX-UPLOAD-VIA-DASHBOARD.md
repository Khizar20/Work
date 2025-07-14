# 🔧 Fix Document Upload Authorization - Supabase Dashboard Method

## Problem
Getting "ERROR: 42501: must be owner of table objects" when running SQL scripts. This means we need to use the Supabase Dashboard interface instead.

## ✅ Step-by-Step Fix via Supabase Dashboard

### Step 1: Create/Configure Storage Bucket
1. **Go to Supabase Dashboard** → Your Project → **Storage**
2. **Check if `hotel_documents` bucket exists**:
   - If it exists, click on it and go to Settings
   - If it doesn't exist, click **"New bucket"**
3. **Create/Configure bucket with these settings**:
   - **Name**: `hotel_documents`
   - **Public**: ❌ **UNCHECKED** (Private bucket)
   - **File size limit**: `10485760` (10MB)
   - **Allowed MIME types**: Add these one by one:
     ```
     application/pdf
     image/png
     image/jpeg
     image/jpg
     application/msword
     application/vnd.openxmlformats-officedocument.wordprocessingml.document
     application/vnd.openxmlformats-officedocument.presentationml.presentation
     application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
     text/plain
     ```

### Step 2: Set Up Storage Policies
1. **Go to** → **Storage** → **Policies** tab
2. **Delete any conflicting policies** for `hotel_documents` bucket
3. **Create new policies** by clicking **"New policy"**:

#### Policy 1: Upload Permission
- **Policy name**: `Hotel admins can upload documents`
- **Allowed operation**: `INSERT`
- **Target roles**: `authenticated`
- **USING expression**: Leave empty
- **WITH CHECK expression**:
```sql
bucket_id = 'hotel_documents' AND 
EXISTS (
  SELECT 1 FROM hotel_admins 
  WHERE user_id = auth.uid()
)
```

#### Policy 2: Read Permission
- **Policy name**: `Hotel admins can read their hotel documents`
- **Allowed operation**: `SELECT`
- **Target roles**: `authenticated`
- **USING expression**:
```sql
bucket_id = 'hotel_documents' AND
EXISTS (
  SELECT 1 FROM hotel_admins ha
  WHERE ha.user_id = auth.uid()
)
```

#### Policy 3: Update Permission
- **Policy name**: `Hotel admins can update their hotel documents`
- **Allowed operation**: `UPDATE`
- **Target roles**: `authenticated`
- **USING expression**:
```sql
bucket_id = 'hotel_documents' AND
EXISTS (
  SELECT 1 FROM hotel_admins ha
  WHERE ha.user_id = auth.uid()
)
```

#### Policy 4: Delete Permission
- **Policy name**: `Hotel admins can delete their hotel documents`
- **Allowed operation**: `DELETE`
- **Target roles**: `authenticated`
- **USING expression**:
```sql
bucket_id = 'hotel_documents' AND
EXISTS (
  SELECT 1 FROM hotel_admins ha
  WHERE ha.user_id = auth.uid()
)
```

### Step 3: Verify User is Hotel Admin
1. **Go to** → **Table Editor** → **hotel_admins** table
2. **Check if your current user exists**:
   - Look for a row where `user_id` matches your auth user ID
   - If not found, you need to create one

#### To Find Your User ID:
1. **Go to** → **Authentication** → **Users**
2. **Find your email** and copy the **ID** (UUID format)

#### To Create Hotel Admin Record:
1. **Go to** → **Table Editor** → **hotel_admins**
2. **Click "Insert" → "Insert row"**
3. **Fill in**:
   - `user_id`: Your auth user ID (UUID)
   - `hotel_id`: Any existing hotel ID from the `hotels` table
   - `role`: `admin`
4. **Save**

### Step 4: Test the Upload
1. **Go to your application**
2. **Try uploading a document**
3. **Check browser console** for any errors

## 🚨 Alternative: Quick User Assignment via SQL

If you can run basic SQL queries, try this simple user assignment:

```sql
-- Run this in SQL Editor to make yourself a hotel admin
INSERT INTO hotel_admins (user_id, hotel_id, role)
SELECT 
  auth.uid() as user_id,
  (SELECT id FROM hotels LIMIT 1) as hotel_id,
  'admin' as role
WHERE NOT EXISTS (
  SELECT 1 FROM hotel_admins WHERE user_id = auth.uid()
);
```

## 🔍 Troubleshooting

### If upload still fails:
1. **Check browser Network tab** during upload attempt
2. **Look for specific error messages**
3. **Verify bucket exists and is private**
4. **Confirm you have hotel_admin record**
5. **Check that policies are active** (green checkmark in dashboard)

### If you can't create policies in dashboard:
1. **Make sure you're the project owner**
2. **Check if someone else needs to give you permissions**
3. **Try refreshing the dashboard**

## ✅ Success Indicators
- ✅ `hotel_documents` bucket exists and is private
- ✅ 4 storage policies created for the bucket
- ✅ You have a record in `hotel_admins` table
- ✅ Document upload works without "Unauthorized" error

This dashboard method avoids all permission issues with SQL scripts!
