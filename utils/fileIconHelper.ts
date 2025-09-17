export const getFileIcon = (fileName: string | null, fileType: string | null): string => {
  if (!fileName && !fileType) {
    return 'draft'; // A generic file icon for unknown cases
  }

  // Check by MIME type first for accuracy
  if (fileType) {
    if (fileType.startsWith('image/')) return 'image';
    if (fileType === 'application/pdf') return 'picture_as_pdf';
    if (fileType === 'application/msword' || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return 'description'; // Word
    if (fileType.startsWith('video/')) return 'videocam';
    if (fileType.startsWith('audio/')) return 'audio_file';
    if (fileType.startsWith('text/')) return 'article';
    if (fileType === 'application/zip' || fileType === 'application/x-rar-compressed' || fileType === 'application/x-7z-compressed') return 'folder_zip';
    if (fileType === 'application/vnd.ms-excel' || fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return 'spreadsheet';
    if (fileType === 'application/vnd.ms-powerpoint' || fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') return 'slideshow';
  }

  // Fallback to file extension from fileName
  if (fileName) {
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'picture_as_pdf';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
      case 'webp':
      case 'bmp':
        return 'image';
      case 'doc':
      case 'docx':
        return 'description';
      case 'xls':
      case 'xlsx':
        return 'spreadsheet';
      case 'ppt':
      case 'pptx':
        return 'slideshow';
      case 'zip':
      case 'rar':
      case '7z':
        return 'folder_zip';
      case 'mp4':
      case 'mov':
      case 'avi':
      case 'mkv':
      case 'webm':
        return 'videocam';
      case 'mp3':
      case 'wav':
      case 'ogg':
      case 'flac':
        return 'audio_file';
      case 'txt':
      case 'md':
      case 'csv':
        return 'article';
      default:
        return 'draft'; // Generic file icon
    }
  }

  return 'draft'; // Default if only fileType was provided but didn't match
};
