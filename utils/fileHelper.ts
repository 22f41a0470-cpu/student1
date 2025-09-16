import { supabase } from '../supabaseClient';

export const downloadFile = async (filePath: string, fileName: string) => {
  try {
    const { data, error } = await supabase.storage
      .from('uploads') // NOTE: 'uploads' is the required bucket name in Supabase Storage.
      .download(filePath);

    if (error) {
      throw error;
    }

    if (data) {
      const blob = new Blob([data], { type: data.type });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    }
  } catch (error) {
    console.error('Error downloading file:', error);
    alert('Failed to download file.');
  }
};