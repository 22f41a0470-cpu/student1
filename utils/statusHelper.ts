import { SubmissionStatus } from '../types';

export const formatStatus = (status: SubmissionStatus | 'Not Submitted'): string => {
  if (status === 'Not Submitted') {
    return status;
  }
  
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};
