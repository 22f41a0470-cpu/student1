
import { StoredFile } from '../types';

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const downloadBase64File = (storedFile: StoredFile) => {
  const link = document.createElement('a');
  link.href = storedFile.content;
  link.download = storedFile.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
