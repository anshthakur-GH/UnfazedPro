import React from 'react';
import SidebarPremium from './components/SidebarPremium';
import MainContent from './components/MainContent';
import RightPanel from './components/RightPanel';

import { ThemeProvider } from './context/ThemeContext';

const App = () => {
  return (
    <ThemeProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-base">
        <SidebarPremium />
        <MainContent />
        <RightPanel />
      </div>
    </ThemeProvider>
  );
};

export default App;
