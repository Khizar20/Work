# 📋 Document Upload Fix Checklist

## 🎯 Quick Fix Checklist

### Phase 1: Check Current State
- [ ] Run `fix-storage-bucket-simple.sql` in Supabase SQL Editor
- [ ] Note down the results (especially user_id and hotel_admin status)

### Phase 2: Dashboard Configuration  
- [ ] Go to Supabase Dashboard → Storage
- [ ] Verify `hotel_documents` bucket exists (create if missing)
- [ ] Set bucket to **Private** (not public)
- [ ] Configure allowed MIME types (PDF, images, documents)
- [ ] Set file size limit to 10MB

### Phase 3: Storage Policies
- [ ] Go to Storage → Policies tab
- [ ] Delete any conflicting policies for `hotel_documents`
- [ ] Create 4 new policies:
  - [ ] INSERT policy for hotel admins
  - [ ] SELECT policy for hotel admins  
  - [ ] UPDATE policy for hotel admins
  - [ ] DELETE policy for hotel admins

### Phase 4: User Permissions
- [ ] Go to Table Editor → `hotel_admins`
- [ ] Check if your user_id exists in the table
- [ ] If not, create a new row with your auth user_id
- [ ] Assign yourself to any existing hotel_id with 'admin' role

### Phase 5: Test Upload
- [ ] Go to your app's document upload page
- [ ] Try uploading a small PDF file
- [ ] Check browser console for errors
- [ ] Verify upload succeeds without "Unauthorized" error

## 🚨 If You Get Stuck

**Most Common Issues:**
1. **Bucket doesn't exist** → Create it manually in dashboard
2. **User not hotel admin** → Add yourself to hotel_admins table
3. **Wrong bucket name** → Ensure it's `hotel_documents` (with underscore)
4. **Policies not working** → Double-check policy SQL expressions

**Quick Test Commands:**
```sql
-- Check if you're logged in
SELECT auth.uid();

-- Check if you're a hotel admin
SELECT * FROM hotel_admins WHERE user_id = auth.uid();

-- Check bucket exists
SELECT * FROM storage.buckets WHERE id = 'hotel_documents';
```

## ✅ Success = Upload Works!
When the document upload form submits without showing "Unauthorized" error, you're done! 🎉
