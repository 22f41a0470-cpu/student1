import { Submission, SubmissionStatus, User } from '../types';
import { supabase } from '../supabaseClient';

/**
 * NOTE on Supabase Setup:
 * This service assumes a specific Supabase backend configuration. Refer to the
 * `supabase_setup.sql` file for the required tables, RLS policies, and storage bucket setup.
 */

export const createSubmission = async (student: User, file: File): Promise<Submission | null> => {
  // Use student.id for the folder path to align with Storage RLS policies
  const filePath = `${student.id}/${Date.now()}-${file.name}`;

  // 1. Upload file to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('uploads')
    .upload(filePath, file);

  if (uploadError) {
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
  submissionId: string,
  status: SubmissionStatus,
  rejectionReason?: string
): Promise<Submission | null> => {
  const updateData: { status: SubmissionStatus; rejection_reason: string | null } = {
    status,
    // Set reason if rejecting, otherwise explicitly set to null to clear the field.
    rejection_reason: status === SubmissionStatus.REJECTED ? (rejectionReason || null) : null,
  };

  const { data, error } = await supabase
    .from('uploads')
    .update(updateData)
    .eq('id', submissionId)
    .select()
    .single();

  if (error) {
    console.error('Error updating submission status:', error.message);
    return null;
  }
  return data as Submission;
};

export const deleteSubmissionForUser = async (userId: string) => {
    // This is now handled within the deleteUser service for better transaction control.
    console.warn("deleteSubmissionForUser is deprecated. Deletion is handled by authService.deleteUser.");
};