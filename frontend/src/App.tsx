import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, isLoading } = useAuth();
  const [view, setView] = useState<'login' | 'signup'>('login');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-deep-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return view === 'login'
      ? <Login onSwitchToSignup={() => setView('signup')} />
      : <Signup onSwitchToLogin={() => setView('login')} />;
  }

  return <Dashboard />;
}

export default App;
