import { User, UserRole } from '../types';
import { supabase } from '../supabaseClient';
import { studentData } from '../constants';
import { AuthUser } from '@supabase/supabase-js';

/**
 * NOTE on Supabase Setup:
 * This service assumes a specific Supabase backend configuration. Refer to the
 * `supabase_setup.sql` file for the required tables, triggers, functions, and
 * Row Level Security (RLS) policies.
 */

// This function is obsolete as student registration is handled automatically
// on first login, and there is no admin registration UI.
export const registerUser = async (name: string, email: string, password: string): Promise<User | null> => {
  console.warn("Registration via this form is disabled. Students should log in with their registration number to be automatically registered.");
  return null;
}

export const getAllUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }
  return data as User[];
};

interface LoginResult {
  user: User | null;
  error: string | null;
}

/**
 * Fetches a user's profile from the `profiles` table.
 * It includes a brief retry mechanism in case the database trigger that creates the profile
 * has not completed yet.
 */
const fetchProfile = async (authUser: AuthUser): Promise<User | null> => {
    let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
    
    if (error && error.code === 'PGRST116') { // "No rows found"
        console.warn(`Profile for user ${authUser.id} not found, retrying in 1s...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const { data: retryData, error: retryError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();
        
        if (retryError) {
            console.error('Failed to fetch profile on retry:', retryError);
            return null;
        }
        profile = retryData;
    } else if (error) {
        console.error('Error fetching profile:', error);
        return null;
    }
    
    if (!profile) {
        console.error(`Profile still not found for user ${authUser.id} after retry.`);
        return null;
    }

    return profile as User;
};

const attemptAdminLogin = async (email: string, password: string): Promise<LoginResult> => {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
        console.error('Admin login error:', signInError);
        return { user: null, error: 'Invalid login credentials. Please try again.' };
    }

    if (!signInData.user) {
        return { user: null, error: 'An unexpected error occurred during admin login.' };
    }
    
    const profile = await fetchProfile(signInData.user);
    if (!profile) {
        return { user: null, error: 'Login successful, but your admin profile could not be found.' };
    }

    return { user: profile, error: null };
}

const attemptStudentLogin = async (regNo: string, password: string): Promise<LoginResult> => {
    if (regNo !== password) {
        return { user: null, error: 'For students, Register Number and Password must match.' };
    }

    const studentInfo = studentData.find(s => s.regNo.toLowerCase() === regNo.toLowerCase());
    if (!studentInfo) {
        return { user: null, error: 'Invalid Register Number.' };
    }

    const email = `${studentInfo.regNo}@kec.ac.in`;
    
    // Step 1: Attempt to sign in. This will work for existing users.
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInData.user) {
        const profile = await fetchProfile(signInData.user);
        if (!profile) {
             return { user: null, error: 'Login successful, but your user profile could not be found.' };
        }
        return { user: profile, error: null };
    }

    // Step 2: If sign-in fails, it might be a first-time login. Attempt to sign up.
    if (signInError && signInError.message.toLowerCase().includes('invalid login credentials')) {
        console.log(`First-time login for ${email}. Attempting to create new account.`);
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { name: studentInfo.name, role: UserRole.STUDENT } },
        });

        if (signUpError) {
            console.error('Error auto-creating user during sign up:', signUpError);
            return { user: null, error: 'Could not create your account on first login. It might already exist.' };
        }

        if (!signUpData.user) {
            return { user: null, error: 'Account creation did not return a user. Please contact an administrator.' };
        }

        console.log(`Successfully created user account for ${email}. Now fetching profile.`);
        const profile = await fetchProfile(signUpData.user);
        if (!profile) {
             // This is a critical failure state if the trigger doesn't work.
             return { user: null, error: 'Your account was created, but your profile could not be found.' };
        }
        return { user: profile, error: null };
    } else if (signInError) {
        console.error('Student login error:', signInError);
        return { user: null, error: 'An unexpected error occurred during login.' };
    }
    
    return { user: null, error: 'An unexpected error occurred.' };
}

export const loginUser = async (identifier: string, password: string): Promise<LoginResult> => {
    const trimmedIdentifier = identifier.trim();
    const trimmedPassword = password.trim();

    if (trimmedIdentifier.includes('@')) {
        return attemptAdminLogin(trimmedIdentifier, trimmedPassword);
    } else {
        return attemptStudentLogin(trimmedIdentifier, trimmedPassword);
    }
};

export const logoutUser = async () => {
  await supabase.auth.signOut();
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return null;
  }
  
  return await fetchProfile(session.user);
};

export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    // Step 1: Find all files associated with the user's submissions.
    const { data: submissions, error: submissionsError } = await supabase
      .from('uploads')
      .select('file_path')
      .eq('student_id', userId);

    if (submissionsError) {
      console.error('Could not fetch submissions to clean up storage:', submissionsError);
      alert('Error: Could not retrieve user submissions. Deletion aborted to prevent orphaned files.');
      return false;
    }

    // Step 2: Delete all associated files from Supabase Storage.
    if (submissions && submissions.length > 0) {
      const filePaths = submissions.map(s => s.file_path).filter(p => p);
      if (filePaths.length > 0) {
        console.log(`Deleting ${filePaths.length} files from storage for user ${userId}.`);
        const { error: storageError } = await supabase.storage.from('uploads').remove(filePaths);

        if (storageError) {
          console.error('Failed to delete files from storage:', storageError);
          alert('Error: Failed to clean up all user files from storage. Deletion aborted.');
          return false;
        }
      }
    }

    // Step 3: Call the RPC to delete the user from auth, which cascades to other tables.
    const { error: rpcError } = await supabase.rpc('delete_user', { user_id: userId });

    if (rpcError) {
      console.error('Error deleting user:', rpcError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('An unexpected error occurred during user deletion:', error);
    return false;
  }
};