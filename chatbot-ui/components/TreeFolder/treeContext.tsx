import React, { createContext, useContext, useState, useEffect } from 'react';
import { SERVER_LINK } from '@/utils/app/const';

// Create a context for treeData
const TreeDataContext = createContext([]);

export const useTreeData = () => useContext(TreeDataContext);

export const TreeDataProvider = ({ children }:any) => {
  const [treeData, setTreeData] = useState([]);

  const fetchFolderStructure = async () => {
    try {
      const response = await fetch(`${SERVER_LINK}/get_folder_structure/${1234}`);
      if (response.ok) {
        const data = await response.json();
        setTreeData(data);
        console.log("dataFetched", data);
      } else {
        console.error('Failed to fetch folder structure');
      }
    } catch (error) {
      console.error('Error fetching folder structure:', error);
    }
  };

  useEffect(() => {
    fetchFolderStructure();
  }, []);

  return (
    <TreeDataContext.Provider value={treeData}>
      {children}
    </TreeDataContext.Provider>
  );
};