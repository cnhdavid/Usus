import { useState, useEffect } from 'react'
import './App.css'
import Login from '../components/Login'
import Signup from '../components/Signup'
import Home from '../components/Home'

function App() {
  const [showLogin, setShowLogin] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const userId = localStorage.getItem('userId')
    setIsLoggedIn(!!userId)
  }, [])

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
  }

  if (isLoggedIn) {
    return <Home />
  }

  return (
    <>
      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button
          onClick={() => setShowLogin(!showLogin)}
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {showLogin ? 'Need an account? Sign Up' : 'Already have an account? Login'}
        </button>
      </div>
      {showLogin ? <Login onLoginSuccess={handleLoginSuccess} /> : <Signup />}
    </>
  )
}

export default App
