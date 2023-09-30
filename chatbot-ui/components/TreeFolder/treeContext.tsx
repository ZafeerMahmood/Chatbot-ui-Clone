import React, { createContext, useContext, useEffect, useState } from 'react';

import { SERVER_LINK } from '@/utils/app/const';
import fetchToken from '@/utils/app/fetchToken';

import { useUser } from '@auth0/nextjs-auth0/client';

// Create a context for treeData
const TreeDataContext = createContext([]);

export const useTreeData = () => useContext(TreeDataContext);

export const TreeDataProvider = ({ children }: any) => {
  const [treeData, setTreeData] = useState([]);
  const { user ,isLoading} = useUser();

  const fetchFolderStructure = async () => {
    const accessToken = await fetchToken();
    const userId = user?.name;
    if (userId && accessToken) {
      try {
        const response = await fetch(
          `${SERVER_LINK}/get_folder_structure/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            method: 'GET',
          },
        );
        if (response.ok) {
          const data = await response.json();
          setTreeData(data);
          console.log('dataFetched', data);
        } else {
          console.error('Failed to fetch folder structure');
        }
      } catch (error) {
        console.error('Error fetching folder structure:', error);
      }
    }
  };

  useEffect(() => {
    fetchFolderStructure();
  }, [user]);

  return (
    <TreeDataContext.Provider value={treeData}>
      {children}
    </TreeDataContext.Provider>
  );
};
