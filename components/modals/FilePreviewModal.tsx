import React, { useRef, useState, useEffect } from 'react';
import { StudyMaterial } from '../../types';
import { useLanguage } from '../../languageContext';
import { XIcon, DownloadIcon, PrinterIcon, ArrowsPointingOutIcon, DocumentIcon } from '../icons';

interface FilePreviewModalProps {
  material: StudyMaterial;
  onClose: () => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ material, onClose }) => {
    const { t } = useLanguage();
    const previewRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    useEffect(() => {
        let objectUrl: string | null = null;
        if (material.fileType === 'application/pdf' && material.content.startsWith('data:')) {
            try {
                const [meta, data] = material.content.split(',');
                if (!data) throw new Error("Invalid Data URL for PDF");
                
                const byteString = atob(data);
                const mimeString = meta.split(':')[1].split(';')[0];
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                const blob = new Blob([ab], { type: mimeString });
                objectUrl = URL.createObjectURL(blob);
                setPdfUrl(objectUrl);
            } catch (e) {
                console.error("Failed to create blob URL for PDF", e);
                setPdfUrl(null); 
            }
        }
        
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [material.content, material.fileType]);


    const handlePrint = () => {
        if (material.fileType === 'application/pdf' && iframeRef.current) {
            iframeRef.current.contentWindow?.print();
        } else if (material.fileType?.startsWith('image/')) {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`<html><head><title>${material.title}</title></head><body style="margin:0;"><img src="${material.content}" style="width:100%;"></body></html>`);
                printWindow.document.close();
                printWindow.focus();
                printWindow.print();
            }
        }
    };
    
    const handleFullscreen = () => {
        previewRef.current?.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    };

    const renderPreview = () => {
        if (!material.fileType) {
            return (
                <div className="text-center p-8 text-white">
                    <DocumentIcon className="w-16 h-16 mx-auto text-gray-500" />
                    <p className="mt-4">{t('previewNotAvailable')}</p>
                    <p className="text-sm text-gray-400 mt-2">{material.fileName}</p>
                </div>
            );
        }

        if (material.fileType.startsWith('image/')) {
            return <img src={material.content} alt={material.title} className="max-h-full max-w-full object-contain"/>;
        }

        if (material.fileType === 'application/pdf') {
            if (pdfUrl) {
                return <iframe ref={iframeRef} src={pdfUrl} className="w-full h-full border-0" title={material.title}></iframe>;
            }
            return <div className="text-white">{t('previewNotAvailable')}</div>
        }
        
        if (material.fileType.startsWith('video/')) {
            return <video src={material.content} controls className="max-h-full max-w-full"></video>
        }

        return (
            <div className="text-center p-8 text-white">
                <DocumentIcon className="w-16 h-16 mx-auto text-gray-500" />
                <p className="mt-4">{t('previewNotAvailable')}</p>
                <p className="text-sm text-gray-400 mt-2">{material.fileName}</p>
            </div>
        );
    };

    return (
      <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex flex-col p-4 animate-fade-in">
        <header className="flex-shrink-0 flex justify-between items-center text-white pb-4">
          <h2 className="text-lg font-bold truncate pr-4">{material.title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 flex-shrink-0"><XIcon className="w-6 h-6"/></button>
        </header>
        <main ref={previewRef} className="flex-grow bg-black/50 rounded-lg flex items-center justify-center overflow-hidden min-h-0">
          {renderPreview()}
        </main>
        <footer className="flex-shrink-0 flex justify-center items-center gap-2 sm:gap-4 text-white pt-4 flex-wrap">
            <a href={material.content} download={material.fileName} className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm">
                <DownloadIcon className="w-5 h-5"/> {t('download')}
            </a>
            {(material.fileType === 'application/pdf' || material.fileType?.startsWith('image/')) &&
                <button onClick={handlePrint} className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm">
                    <PrinterIcon className="w-5 h-5"/> {t('print')}
                </button>
            }
            <button onClick={handleFullscreen} className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm">
                <ArrowsPointingOutIcon className="w-5 h-5"/> {t('fullscreen')}
            </button>
        </footer>
      </div>
    );
};

export default FilePreviewModal;