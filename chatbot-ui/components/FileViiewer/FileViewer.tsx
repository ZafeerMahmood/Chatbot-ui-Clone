
import React from 'react';
import { IconX } from '@tabler/icons-react';

interface FileViewerProps {
  file: {
    type: string;
    url: string; // URL to the PDF file
  };
  onClose: () => void;
}

const FileViewer: React.FC<FileViewerProps> = ({ file, onClose }) => {
  const { type, url } = file;

  const renderFileContent = () => {
    if (type === 'application/pdf') {
      return (
        <embed
          src={url}
          width="100%"
          height="100%"
          title={`File Viewer - PDF`}
        />
      );
    } else {
      return <p>Unsupported file type</p>;
    }
  };

  return (
    <div className="z-[1500] h-screen w-2/5 top-1 right-0 fixed mx-auto bg-[#202123] rounded-lg">
      <div className="w-full h-10 items-center flex justify-end bg-[#202123] pr-5">
        <button className="w-16 h-7 rounded-lg bg-[#202123] hover:bg-[#343541] flex flex-row justify-center items-center " onClick={onClose}>
            Close <IconX size={16}/> 
        </button>
      </div>
      <div className="h-full w-full">
        {renderFileContent()}
      </div>
    </div>
  );
};

export default FileViewer;