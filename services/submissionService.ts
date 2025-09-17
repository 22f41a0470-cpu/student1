import { Submission, SubmissionStatus, User } from '../types';
import { supabase, supabaseUrl, supabaseAnonKey } from '../supabaseClient';

/**
 * NOTE on Supabase Setup:
 * This service assumes a specific Supabase backend configuration. Refer to the
 * `supabase_setup.sql` file for the required tables, RLS policies, and storage bucket setup.
 */

const uploadFileWithProgress = (filePath: string, file: File, onProgress: (percentage: number) => void): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return reject(new Error('User not authenticated for file upload.'));
    }

    const accessToken = session.access_token;
    const url = `${supabaseUrl}/storage/v1/object/uploads/${filePath}`;

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);

    // Set headers for Supabase Storage
    xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
    xhr.setRequestHeader('x-upsert', 'false'); // Do not overwrite existing files
    xhr.setRequestHeader('apikey', supabaseAnonKey);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentage = Math.round((event.loaded / event.total) * 100);
        onProgress(percentage);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100); // Ensure it completes at 100%
        resolve();
      } else {
        let error;
        try {
          error = JSON.parse(xhr.responseText);
        } catch (e) {
          error = { message: xhr.responseText };
        }
        console.error('File upload failed with status:', xhr.status, error);
        reject(new Error(error.message || `File upload failed with status ${xhr.status}.`));
      }
    };

    xhr.onerror = () => {
      console.error('Network error during file upload.');
      reject(new Error('Network error during file upload.'));
    };

    xhr.send(file);
  });
};


export const createSubmission = async (
  student: User, 
  file: File,
  onProgress: (percentage: number) => void
): Promise<Submission | null> => {
  // Use student.id for the folder path to align with Storage RLS policies
  const filePath = `${student.id}/${Date.now()}-${file.name}`;

  // 1. Upload file to Supabase Storage
  try {
    await uploadFileWithProgress(filePath, file, onProgress);
  } catch (uploadError: any) {
    console.error('Error uploading file:', uploadError.message);
    return null;
  }

  // 2. Insert submission record into the database
  const newSubmissionData = {
    student_id: student.id,
    file_name: file.name,
    file_path: filePath,
    file_size: file.size,
    file_type: file.type,
    status: SubmissionStatus.PENDING,
  };

  const { data, error: insertError } = await supabase
    .from('uploads')
    .insert(newSubmissionData)
    .select()
    .single();

  if (insertError) {
    console.error('Error creating submission record:', insertError.message);
    // Self-healing: Delete the orphaned file from storage if DB insert fails
    console.log(`Attempting to delete orphaned file: ${filePath}`);
    const { error: removeError } = await supabase.storage
        .from('uploads')
        .remove([filePath]);
    
    if (removeError) {
        console.error('Failed to delete orphaned file. Manual cleanup may be required.', removeError.message);
    } else {
        console.log('Successfully deleted orphaned file.');
    }
    return null;
  }

  return data as Submission;
};

export const getSubmissionForUser = async (userId: string): Promise<Submission | null> => {
  const { data, error } = await supabase
    .from('uploads')
    .select('*')
    .eq('student_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { // Ignore 'No rows found' error
    console.error('Error fetching user submission:', error.message);
  }

  return data as Submission | null;
};

export const getSubmissionsForUser = async (userId: string): Promise<Submission[]> => {
  const { data, error } = await supabase
    .from('uploads')
    .select('*')
    .eq('student_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user submissions:', error.message);
    return [];
  }

  return data as Submission[];
};


export const getAllSubmissions = async (): Promise<Submission[]> => {
  const { data, error } = await supabase
    .from('uploads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all submissions:', error.message);
    return [];
  }
  return data as Submission[];
};

export const updateSubmissionStatus = async (
  submission: Submission,
  status: SubmissionStatus,
  feedback?: string
): Promise<Submission | null> => {
  const updateData: Partial<Submission> = {
    status,
    rejection_reason: feedback || null,
  };

  const { data, error } = await supabase
    .from('uploads')
    .update(updateData)
    .eq('id', submission.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating submission status:', error.message);
    return null;
  }
  return data as Submission;
};

export const getFileSignedUrl = async (filePath: string): Promise<string | null> => {
  const { data, error } = await supabase.storage
    .from('uploads')
    .createSignedUrl(filePath, 300); // URL valid for 5 minutes

  if (error) {
    console.error('Error creating signed URL:', error.message);
    return null;
  }

  return data.signedUrl;
};

export const deleteSubmissionForUser = async (userId: string) => {
    // This is now handled within the deleteUser service for better transaction control.
    console.warn("deleteSubmissionForUser is deprecated. Deletion is handled by authService.deleteUser.");
};