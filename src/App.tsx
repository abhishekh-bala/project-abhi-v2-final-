import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { ContestDashboard } from './components/ContestDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { LoadingSpinner } from './components/LoadingSpinner';
import { Logo } from './components/Logo';
import { PageLoader } from './components/PageLoader';
import { fetchGuideData } from './utils/fetchData';
import type { Guide, Winner } from './types';
import toast, { Toaster } from 'react-hot-toast';

function App() {
  const [activeTab, setActiveTab] = useState<'contest' | 'admin'>('contest');
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [usedTickets, setUsedTickets] = useState<number[]>([]);
  const [winnerCount, setWinnerCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchGuideData();
        setGuides(data);
      } catch (error) {
        toast.error('Failed to load guide data. Please try again later.');
        console.error('Error loading guide data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleTabChange = (tab: 'contest' | 'admin') => {
    setPageLoading(true);
    setActiveTab(tab);
    setTimeout(() => setPageLoading(false), 800);
  };

  const selectWinner = (): Winner => {
    const availableGuides = guides.filter(guide =>
      guide.tickets.some(ticket => !usedTickets.includes(ticket))
    );
    
    if (availableGuides.length === 0) {
      throw new Error('No more available tickets');
    }
    
    const randomGuide = availableGuides[Math.floor(Math.random() * availableGuides.length)];
    const availableTickets = randomGuide.tickets.filter(ticket => !usedTickets.includes(ticket));
    const winningTicket = availableTickets[Math.floor(Math.random() * availableTickets.length)];
    
    setUsedTickets(prev => [...prev, winningTicket]);
    setWinnerCount(prev => prev + 1);
    
    return {
      guide: randomGuide,
      ticket: winningTicket,
      prize: winnerCount === 0 ? 'Jupiter Scooty' : 'Pulsar Bike'
    };
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-animate bg-gradient-to-br from-fuchsia-500 via-purple-500 to-pink-500 p-8">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <Logo />
          <div className="flex justify-center mb-8">
            <Navigation activeTab={activeTab} onTabChange={handleTabChange} />
          </div>
          
          {pageLoading ? (
            <PageLoader />
          ) : activeTab === 'contest' ? (
            <ContestDashboard guides={guides} onSelectWinner={selectWinner} />
          ) : (
            <AdminDashboard guides={guides} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;