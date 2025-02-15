import '../styles/global.css';
import 'react-toastify/dist/ReactToastify.css';
import 'moment';
import type { AppProps } from 'next/app';
import Image from 'next/image';
import { UnsupportedChainIdError, Web3ReactProvider } from '@web3-react/core';
import Web3 from 'web3';
import { GoogleAnalytics } from 'nextjs-google-analytics';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { DEXSettingsContextProvider } from '../contexts/dex/settings';
import { Web3ContextProvider, useWeb3Context } from '../contexts/web3';
import { APIContextProvider } from '../contexts/api';

function getLibrary(provider: any) {
  return new Web3(provider);
}

const AppContent = ({ children }: any) => {
  const { active, error } = useWeb3Context();
  return (
    <div className="bg-[url('/images/bg.svg')] bg-no-repeat bg-cover h-screen scroll-smooth flex flex-col w-screen overflow-hidden">
      <Header />
      <div className="overflow-auto flex-1 backdrop-opacity-10 backdrop-invert bg-[#000]/70">
        {!active ? (
          <div className="flex justify-center items-center w-full my-[100px]">
            <div className="flex flex-col-reverse justify-center items-center gap-6">
              <span className="text-white font-[700] text-[18px] md:text-[50px] font-Montserrat">Connect your wallet!</span>
              <Image src="/images/connect_wallet.svg" width={398.34} height={378} alt="connect_wallet" />
            </div>
          </div>
        ) : (
          <>
            {!!error && error instanceof UnsupportedChainIdError ? (
              <div className="flex flex-col justify-center items-center w-full">
                <span className="text-white/70 font-[700] text-[50px] font-Montserrat">{error.message}</span>
              </div>
            ) : (
              <>{children}</>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <GoogleAnalytics gaMeasurementId={process.env.NEXT_PUBLIC_GA_KEY} trackPageViews />
      <Web3ReactProvider getLibrary={getLibrary}>
        <Web3ContextProvider>
          <DEXSettingsContextProvider>
            <APIContextProvider>
              <AppContent>
                <Component {...pageProps} />
              </AppContent>
            </APIContextProvider>
          </DEXSettingsContextProvider>
        </Web3ContextProvider>
      </Web3ReactProvider>
    </>
  );
}
