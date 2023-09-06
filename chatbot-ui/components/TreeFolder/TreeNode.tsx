

import { IconFile, IconFolder } from '@tabler/icons-react';
import React, { useState, MouseEvent } from 'react';
import FileViewer from '../FileViiewer';
import { SERVER_LINK } from '@/utils/app/const';

interface TreeProps {
  treeData: TreeNodeData[] | TreeNodeData;
}

interface TreeNodeProps {
  node: TreeNodeData;
  onOpenClick: (label?: string) => void;
  onDownloadClick: (label?: string) => void;
}

interface TreeNodeData {
  label: string;
  children?: TreeNodeData[];
  isFile?: boolean;
}

const CustomContextMenu: React.FC<{
  isOpen: boolean;
  x: number;
  y: number;
  onOpenClick: () => void;
  onDownloadClick: () => void;
  onCloseContextMenu: () => void;
}> = ({ isOpen, x, y, onOpenClick, onDownloadClick, onCloseContextMenu }) => {
  if (!isOpen) return null;

  const handleContextMenuClick = (e: MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      style={{
        top: y,
        left: x,
      }}
      className="flex flex-col gap-1 rounded-lg border-white/20 border-solid border-[2px] text-white bg-[#202123] fixed z-[1000] "
      onClick={handleContextMenuClick}
    >
      <div onClick={onOpenClick} className='p-2 cursor-pointer hover:bg-[#343541] hover:border-[1px] rounded-md'>
        Open
      </div>
      <div onClick={onDownloadClick} className='p-2 cursor-pointer hover:bg-[#343541] hover:border-[1px] rounded-md' >
        Download
      </div>
      <div onClick={onCloseContextMenu} className='p-2 cursor-pointer hover:bg-[#343541] hover:border-[1px] rounded-md '>
        Close
      </div>
    </div>
  );
};
const TreeNode: React.FC<TreeNodeProps> = ({ node, onOpenClick, onDownloadClick }) => {
  const { children, label, isFile } = node;
  const [showChildren, setShowChildren] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);

  const handleRightClick = (e: MouseEvent) => {
    e.preventDefault();
    if (isFile) {
      setContextMenuPosition({ x: e.clientX, y: e.clientY });
      setIsContextMenuOpen(true);
    }
  };

  const handleCloseContextMenu = () => {
    setIsContextMenuOpen(false);
  };

  return (
    <>
      <div
        onContextMenu={handleRightClick}
        onClick={() => {
          setShowChildren(!showChildren);
          handleCloseContextMenu();
        }}
        className="mb-2"
      >
        <div
          className="flex flex-row grow w-full rounded-lg hover:bg-[#343541] h-11 items-center text-left text-[12.5px] gap-4 p-3 "
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {isFile ? <IconFile size={16} /> : <IconFolder size={16} />}
          <span>{label}</span>
        </div>
      </div>
      {isContextMenuOpen && (
        <CustomContextMenu
          isOpen={isContextMenuOpen}
          x={contextMenuPosition.x}
          y={contextMenuPosition.y}
          onOpenClick={() => {
            console.log(`Open clicked for file: ${label}`);
            handleCloseContextMenu();
            onOpenClick(label); // Pass the label to the function
          }}
          onDownloadClick={() => {
            console.log(`Download clicked for file: ${label}`);
            handleCloseContextMenu();
            onDownloadClick(label); // Pass the label to the function
          }}
          onCloseContextMenu={handleCloseContextMenu}
        />
      )}
      {children && children.length > 0 && showChildren && (
        <ul className="pl-1 border-l-[1px] border-solid border-white/20">
          {children.map((childNode, index) => (
            <TreeNode
              node={childNode}
              onOpenClick={onOpenClick}
              onDownloadClick={onDownloadClick}
              key={index}
            />
          ))}
        </ul>
      )}
    </>
  );
};

const Tree: React.FC<TreeProps> = ({ treeData }) => {
  const dataArray = Array.isArray(treeData) ? treeData : [treeData];
  const [selectedFileContent, setSelectedFileContent] = useState<string | null>(null);
  const [isFileViewerOpen, setIsFileViewerOpen] = useState<boolean>(false);

  const setFileFlags = (node: TreeNodeData) => {
    if (!node.children) {
      node.isFile = true;
    } else {
      node.children.forEach((childNode) => {
        setFileFlags(childNode);
      });
    }
  };

  dataArray.forEach((node) => {
    setFileFlags(node);
  });

  const handleDownloadClick = (userId: string, label: string) => {
    if (label) {
      fetch(`${SERVER_LINK}/download/${userId}/${label}`)
        .then((response) => {
          if (response.ok) {
            window.open(response.url, '_blank');
          } else {
            console.error('Download failed');
          }
        })
        .catch((error) => {
          console.error('Fetch error', error);
        });
    }
  };

  const handleOpenClick = (url: string) => {
    setSelectedFileContent(url);
    setIsFileViewerOpen(true);
  };

  const handleCloseFileViewer = () => {
    setSelectedFileContent(null);
    setIsFileViewerOpen(false);
  };

  return (
    <>
      <ul>
        {dataArray.map((node, index) => (
          <TreeNode
            node={node}
            onOpenClick={(label) => {
              console.log(`Open clicked for file: ${label}`);
              const userId = "1234";
              // Fetch the file content and call handleOpenClick when it's available
              fetch(`${SERVER_LINK}/open/${userId}/${label}`)
                .then((response) => {
                  if (response.ok) {
                    return response.blob(); // Assuming the server sends the file content as a blob
                  } else {
                    console.error('Open failed');
                    return null;
                  }
                })
                .then((fileContent) => {
                  if (fileContent !== null) {
                    const url = URL.createObjectURL(fileContent); // Create a URL for the blob
                    handleOpenClick(url);
                  }
                })
                .catch((error) => {
                  console.error('Fetch error', error);
                });
            }}
            onDownloadClick={(label) => {
              const userId = "1234";
              handleDownloadClick(userId, label || '');
            }}
            key={index}
          />
        ))}
      </ul>

      {/* Display the FileViewer when a file is selected */}
      {isFileViewerOpen && (
        <FileViewer
          file={{
            type: 'application/pdf',
            url: selectedFileContent || '',
          }}
          onClose={handleCloseFileViewer}
        />
      )}
    </>
  );
};

export default Tree;
