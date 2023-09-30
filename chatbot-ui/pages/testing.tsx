import React, { useEffect } from 'react';
import { SERVER_LINK } from '@/utils/app/const';
import fetchToken from '@/utils/app/fetchToken';

const Testing: React.FC = () => {
  console.log(SERVER_LINK);
  
  useEffect(() => { 
    const fetchdata = async () => {
      const token = await fetchToken();
      console.log(token);
    };
    fetchdata();
  }, []);
  return (
    <div className="text-white">
      <a href='api/auth/login'>login</a>
      <a href='api/auth/logout'>logout</a>
    </div>
  );
};

export default Testing;
