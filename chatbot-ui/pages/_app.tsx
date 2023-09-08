import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';

import { appWithTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';

import { TreeDataProvider } from '@/components/TreeFolder/treeContext';

import '@/styles/globals.css';
import { UserProvider } from '@auth0/nextjs-auth0/client';

const inter = Inter({ subsets: ['latin'] });

function App({ Component, pageProps }: AppProps<{}>) {
  const queryClient = new QueryClient();

  return (
    <div className={inter.className}>
      <Toaster />
      <UserProvider>
        <QueryClientProvider client={queryClient}>
          <TreeDataProvider>
            <Component {...pageProps} />
          </TreeDataProvider>
        </QueryClientProvider>
      </UserProvider>
    </div>
  );
}

export default appWithTranslation(App);
