import React, { useState } from 'react';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import './index.css';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' or 'dashboard'
  const [selectedPattern, setSelectedPattern] = useState(null);
  const [selectedSymbol, setSelectedSymbol] = useState('RELIANCE');

  const handlePatternClick = (pattern) => {
    setSelectedPattern(pattern);
    setSelectedSymbol(pattern.symbol);
    setCurrentView('dashboard');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    setSelectedPattern(null);
  };

return (
    <div className="App">
      {currentView === 'landing' ? (
        <React.Fragment>
          <Header showSymbolSelector={false} />
          <LandingPage onPatternClick={handlePatternClick} />
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Header 
            selectedSymbol={selectedSymbol}
            onSymbolChange={setSelectedSymbol}
            onBackToLanding={handleBackToLanding}
            showSymbolSelector={true}
          />
          <Dashboard 
            initialSelectedSymbol={selectedSymbol}
            initialSelectedPattern={selectedPattern}
            onBackToLanding={handleBackToLanding}
          />
        </React.Fragment>
      )}
      <Footer />
    </div>
  );
}

export default App;
