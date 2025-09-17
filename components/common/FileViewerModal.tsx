import React, { useState, useEffect } from 'react';
import { Submission, SubmissionStatus, EnrichedSubmission } from '../../types';
import { getFileSignedUrl } from '../../services/submissionService';
import { getFileIcon } from '../../utils/fileIconHelper';

interface FileViewerModalProps {
  submission: EnrichedSubmission | null;
  onClose: () => void;
  onApprove: (submissionId: string) => void;
  onReject: (submission: Submission) => void;
}

const FileViewerModal: React.FC<FileViewerModalProps> = ({ submission, onClose, onApprove, onReject }) => {
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        if (submission && submission.file_path) {
            setIsLoading(true);
            setError(null);
            setFileUrl(null);

            const fetchUrl = async () => {
                const url = await getFileSignedUrl(submission.file_path!);
                if (url) {
                    setFileUrl(url);
                } else {
                    setError('Could not load file preview.');
                }
                setIsLoading(false);
            };
            
            fetchUrl();
        }
    }, [submission]);
    
    if (!submission) return null;
    
    const canPreview = submission.file_type?.startsWith('image/') || submission.file_type === 'application/pdf';
    
    const renderPreview = () => {
        if (isLoading) return <div className="flex items-center justify-center h-full"><p className="dark:text-gray-300">Loading preview...</p></div>;
        if (error) return <div className="flex items-center justify-center h-full"><p className="text-red-500">{error}</p></div>;
        if (!fileUrl) return <div className="flex items-center justify-center h-full"><p className="dark:text-gray-300">No file URL available.</p></div>;

        if (submission.file_type?.startsWith('image/')) {
            return <img src={fileUrl} alt={submission.file_name!} className="max-h-full max-w-full object-contain mx-auto" />;
        }
        
        if (submission.file_type === 'application/pdf') {
            return <iframe src={fileUrl} className="w-full h-full border-0" title={submission.file_name!}></iframe>;
        }

        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                 <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">visibility_off</span>
                 <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200">Preview not available</h3>
                 <p className="text-gray-500 dark:text-gray-400 mt-1">This file type ({submission.file_type || 'unknown'}) cannot be displayed in the browser.</p>
                 <p className="text-gray-500 dark:text-gray-400">Please download the file to view it.</p>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-3" title={submission.file_name || ''}>
                            <span className="material-symbols-outlined text-2xl text-gray-500 dark:text-gray-400" aria-hidden="true">
                                {getFileIcon(submission.file_name, submission.file_type)}
                            </span>
                            <span className="truncate">{submission.file_name}</span>
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Submitted by: {submission.studentName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 dark:hover:bg-gray-700 dark:hover:text-gray-200">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-2 sm:p-4 flex-grow bg-gray-50 dark:bg-gray-900/50 overflow-auto">
                    {renderPreview()}
                </div>

                {/* Footer with actions */}
                {submission.status === SubmissionStatus.PENDING && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end items-center gap-3 flex-shrink-0">
                        <button onClick={() => onReject(submission)} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium flex items-center gap-2">
                             <span className="material-symbols-outlined !text-base">cancel</span> Reject
                        </button>
                        <button onClick={() => onApprove(submission.id)} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium flex items-center gap-2">
                            <span className="material-symbols-outlined !text-base">check_circle</span> Approve
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileViewerModal;