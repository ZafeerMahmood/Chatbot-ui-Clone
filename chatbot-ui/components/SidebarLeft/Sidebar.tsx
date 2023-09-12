import {
  IconFile,
  IconFolder,
  IconFolderPlus,
  IconMistOff,
  IconPlus,
  IconUpload,
} from '@tabler/icons-react';
import { IconArrowBarLeft, IconArrowBarRight } from '@tabler/icons-react';
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import { SERVER_LINK } from '@/utils/app/const';

import {
  CloseSidebarButton,
  OpenSidebarButton,
} from './components/OpenCloseButton';

import Search from '../Search';
import TreeNode from '../TreeFolder';

interface SidebarRefType extends HTMLDivElement {}

interface TreeProps {
  treeData: TreeNodeData[] | TreeNodeData; // Allow a single node or an array of nodes
}
interface TreeNodeProps {
  node: TreeNodeData;
}

interface TreeNodeData {
  label: string;
  children?: TreeNodeData[];
  isFile?: boolean; // Add isFile property
}
interface Props<T> {
  isOpen: boolean;
  addItemButtonTitle: string;
  side: 'left' | 'right';
  items: T[];
  itemComponent: ReactNode;
  folderComponent: ReactNode;
  footerComponent?: ReactNode;
  searchTerm: string;
  handleSearchTerm: (searchTerm: string) => void;
  toggleOpen: () => void;
  handleCreateItem: () => void;
  handleCreateFolder: () => void;
  handleDrop: (e: any) => void;
  treeData: TreeNodeData[];
}

const Sidebar = <T,>({
  isOpen,
  addItemButtonTitle,
  side,
  items,
  itemComponent,
  folderComponent,
  footerComponent,
  searchTerm,
  handleSearchTerm,
  toggleOpen,
  handleCreateItem,
  handleCreateFolder,
  handleDrop,
  treeData,
}: Props<T>) => {
  const { t } = useTranslation('promptbar');

  const allowDrop = (e: any) => {
    e.preventDefault();
  };

  const highlightDrop = (e: any) => {
    e.target.style.background = '#343541';
  };

  const removeHighlight = (e: any) => {
    e.target.style.background = 'none';
  };

  //* starting my changes here
  const sidebarRef = useRef<SidebarRefType>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(260);

  const handleFolderUpload = (formData: FormData) => {
    //TODO add api to upload files
    fetch(`${SERVER_LINK}/upload`, {
      method: 'POST',
      body: formData,
    })
      .then((response) => {
        // Handle the response from the server
        if (response.ok) {
          console.log('Files uploaded successfully.');
        } else {
          console.error('File upload failed.');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    //TODO select all files then send to server over an api
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }
    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    formData.append('userId', '1234');
    handleFolderUpload(formData);
  };

  const startResizing = useCallback((mouseDownEvent: MouseEvent) => {
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing && sidebarRef.current) {
        setSidebarWidth(
          mouseMoveEvent.clientX -
            sidebarRef.current.getBoundingClientRect().left,
        );
      }
    },
    [isResizing],
  );

  useEffect(() => {
    window.addEventListener('mousemove', resize);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resize, stopResizing]);

  // Set the isFile flag for each node in treeData
  return isOpen ? (
    <div className="flex flex-row">
      <div
        className={`fixed top-0 left-0 h-full grow-0 shrink-0 min-w-[260px] max-w-[600px] flex border-r-2 flex-none border-white/20 flex-col space-y-2 bg-[#202123] p-2 text-[14px]  sm:relative sm:top-0 cursor-col-resize z-40`}
        style={{ width: sidebarWidth }}
        onMouseDown={(e: any) => {
          const distanceFromEdge = 255;
          if (e.clientX > distanceFromEdge) {
            e.preventDefault();
            startResizing(e);
          }
        }}
        ref={sidebarRef}
      >
        <div className="flex items-center">
          <button
            className="text-sidebar flex w-full cursor-pointer select-none items-center gap-3 rounded-md border border-white/20 p-3 text-white transition-colors duration-200 hover:bg-gray-500/10"
            onClick={() => {
              handleCreateItem();
              handleSearchTerm('');
            }}
          >
            <IconPlus size={16} />
            {addItemButtonTitle}
          </button>
          <button
            className="ml-2 flex flex-shrink-0 cursor-pointer items-center gap-3 rounded-md border border-white/20 p-3 text-sm text-white transition-colors duration-200 hover:bg-gray-500/10"
            onClick={handleCreateFolder}
          >
            <IconFolderPlus size={16} />
          </button>

          <button
            className="ml-2 flex flex-shrink-0 cursor-pointer items-center gap-3 rounded-md border border-white/20 p-3 text-sm text-white transition-colors duration-200 hover:bg-gray-500/10"
            onClick={handleClick}
          >
            <input
              type="file"
              className="hidden"
              ref={inputRef}
              onChange={handleFileChange}
            />
            <IconUpload size={16} />
          </button>
          <button className="ml-2 flex flex-shrink-0 cursor-pointer items-center gap-3 rounded-md border border-white/20 p-3 text-sm text-white transition-colors duration-200 hover:bg-gray-500/10"
            onClick={toggleOpen}
          >
            <IconArrowBarLeft size={16} />
          </button>
        </div>

        <Search
          placeholder={t('Search...') || ''}
          searchTerm={searchTerm}
          onSearch={handleSearchTerm}
        />

        <div className="flex-grow overflow-auto">
          {treeData?.length > 0 && (
            <div className="text-white cursor-pointer  w-full  border-b border-white/20 pb-2 ">
              <TreeNode treeData={treeData} />
            </div>
          )}
          {items?.length > 0 && (
            <div className="flex border-b border-white/20 pb-2">
              {folderComponent}
            </div>
          )}

          {items?.length > 0 ? (
            <div
              className="pt-2"
              onDrop={handleDrop}
              onDragOver={allowDrop}
              onDragEnter={highlightDrop}
              onDragLeave={removeHighlight}
            >
              {itemComponent}
            </div>
          ) : (
            <div className="mt-8 select-none text-center text-white opacity-50">
              <IconMistOff className="mx-auto mb-3" />
              <span className="text-[14px] leading-normal">
                {t('No data.')}
              </span>
            </div>
          )}
        </div>
        {footerComponent}
      </div>
      {/* <CloseSidebarButton onClick={toggleOpen} side={side} /> */}
    </div>
  ) : (
    <OpenSidebarButton onClick={toggleOpen} side={side} />
  );
};

export default Sidebar;
