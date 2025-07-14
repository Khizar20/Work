import { PostgrestError } from '@supabase/supabase-js';

/**
 * Process and standardize Supabase errors for better error reporting
 */
export function processSupabaseError(error: PostgrestError | Error | unknown): string {
  if (!error) {
    return 'An unknown error occurred';
  }
  
  // Handle Supabase PostgrestError
  if (typeof error === 'object' && error !== null && 'code' in error && 'message' in error && 'details' in error) {
    const pgError = error as PostgrestError;
    
    // Common Postgrest error codes
    switch (pgError.code) {
      case '23505': // unique_violation
        return 'This record already exists';
      case '23503': // foreign_key_violation
        return 'Referenced record does not exist';
      case '42P01': // undefined_table
        return 'Database table not found';
      case '42501': // insufficient_privilege
        return 'Access denied - insufficient permissions';
      default:
        return pgError.message || 'Database error occurred';
    }
  }
  
  // Handle standard Error objects
  if (error instanceof Error) {
    return error.message;
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  // Fallback
  return 'An unexpected error occurred';
}

/**
 * Format and handle storage errors
 */
export function processStorageError(error: any): string {
  if (!error) return 'Unknown storage error';
  
  // Handle storage specific errors
  if (typeof error === 'object' && error !== null) {
    if ('statusCode' in error) {
      switch (error.statusCode) {
        case 400:
          return 'Invalid file or request';
        case 401:
          return 'Unauthorized - please log in again';
        case 403:
          return 'Access denied to this storage bucket';
        case 404:
          return 'File not found';
        case 409:
          return 'File already exists';
        case 413:
          return 'File too large';
        default:
          return error.error || error.message || 'Storage error occurred';
      }
    }
  }
  
  return processSupabaseError(error);
}

/**
 * Extract useful information from auth errors
 */
export function processAuthError(error: any): string {
  if (!error) return 'Unknown authentication error';
  
  // Handle auth specific errors
  if (typeof error === 'object' && error !== null) {
    if ('code' in error) {
      switch (error.code) {
        case 'auth/invalid-email':
          return 'Invalid email address';
        case 'auth/user-not-found':
          return 'No user found with this email';
        case 'auth/wrong-password':
          return 'Incorrect password';
        case 'auth/email-already-in-use':
          return 'Email is already in use';
        case 'auth/weak-password':
          return 'Password is too weak';
        case 'auth/popup-closed-by-user':
          return 'Authentication popup was closed';
        case 'auth/account-exists-with-different-credential':
          return 'An account already exists with the same email address but different sign-in credentials';
        case 'auth/expired-action-code':
          return 'The action code has expired';
        case 'auth/invalid-action-code':
          return 'The action code is invalid';
        case 'auth/invalid-verification-code':
          return 'The verification code is invalid';
        case 'auth/invalid-continue-uri':
          return 'The continue URL is invalid';
        case 'auth/invalid-credential':
          return 'The credential is invalid';
        case 'auth/invalid-verification-id':
          return 'The verification ID is invalid';
        case 'auth/missing-verification-code':
          return 'The verification code is missing';
        case 'auth/credential-already-in-use':
          return 'This credential is already associated with a different user account';
        default:
          return error.message || 'Authentication error';
      }
    }
  }
  
  return processSupabaseError(error);
}

/**
 * General error handler for API responses
 */
export function handleApiError(error: unknown): { message: string; status: number } {
  let message = 'An unexpected error occurred';
  let status = 500;
  
  if (error instanceof Error) {
    message = error.message;
  }
  
  if (typeof error === 'object' && error !== null) {
    if ('statusCode' in error && typeof error.statusCode === 'number') {
      status = error.statusCode;
    }
    
    if ('message' in error && typeof error.message === 'string') {
      message = error.message;
    }
    
    // Handle Supabase auth errors
    if ('error' in error && typeof error.error === 'string') {
      message = error.error;
    }
    
    // Handle Supabase PostgrestError
    if ('code' in error && 'message' in error && 'details' in error) {
      message = processSupabaseError(error);
    }
  }
  
  return { message, status };
}
