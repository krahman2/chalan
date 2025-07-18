import React, { useState, useEffect } from 'react';
import dadAndMeImage from './dad and me.jpg';
import { validatePasscode, isSecureEnvironment } from '../utils/passcodeSecurity';

interface PasscodeLockProps {
  onUnlock: () => void;
}

const PasscodeLock: React.FC<PasscodeLockProps> = ({ onUnlock }) => {
  const [passcode, setPasscode] = useState('');
  const [isIncorrect, setIsIncorrect] = useState(false);
  const [attempts, setAttempts] = useState(0);
  
  // Security check - basic protection against dev tools inspection
  const [securityWarning, setSecurityWarning] = useState(false);
  
  const handleNumberPress = (number: string) => {
    if (passcode.length < 8) {
      const newPasscode = passcode + number;
      setPasscode(newPasscode);
      
      // Check if passcode is complete
      if (newPasscode.length === 8) {
        setTimeout(() => {
          if (validatePasscode(newPasscode)) {
            onUnlock();
          } else {
            setIsIncorrect(true);
            setAttempts(prev => prev + 1);
            setPasscode('');
            
            // Clear error after 2 seconds
            setTimeout(() => {
              setIsIncorrect(false);
            }, 2000);
          }
        }, 300); // Small delay for better UX
      }
    }
  };
  
  const handleDelete = () => {
    setPasscode(prev => prev.slice(0, -1));
    setIsIncorrect(false);
  };
  
  const handleClear = () => {
    setPasscode('');
    setIsIncorrect(false);
  };
  
  // Security check on mount
  useEffect(() => {
    if (!isSecureEnvironment()) {
      setSecurityWarning(true);
    }
  }, []);
  
  // Auto-clear passcode after 5 attempts
  useEffect(() => {
    if (attempts >= 5) {
      setPasscode('');
      setAttempts(0);
      setIsIncorrect(false);
    }
  }, [attempts]);
  
  const numberPadStyle = {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    border: 'none',
    fontSize: '24px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  
  const deleteButtonStyle = {
    ...numberPadStyle,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    fontSize: '18px',
  };
  
  const clearButtonStyle = {
    ...numberPadStyle,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: 'white',
    fontSize: '16px',
  };
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundImage: `url(${dadAndMeImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Semi-transparent overlay for better text readability */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
      }} />
      
      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '40px',
        color: 'white',
      }}>
        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            margin: '0 0 8px 0',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          }}>
            Chalan Inventory
          </h1>
          <p style={{
            fontSize: '16px',
            margin: 0,
            opacity: 0.9,
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          }}>
            Enter passcode to continue
          </p>
        </div>
        
        {/* Passcode dots */}
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '20px',
        }}>
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: i < passcode.length ? 'white' : 'rgba(255, 255, 255, 0.3)',
                border: '2px solid rgba(255, 255, 255, 0.5)',
                transition: 'all 0.2s',
              }}
            />
          ))}
        </div>
        
        {/* Error message */}
        {isIncorrect && (
          <div style={{
            color: '#ef4444',
            fontSize: '14px',
            fontWeight: '600',
            textAlign: 'center',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
            animation: 'shake 0.5s ease-in-out',
          }}>
            Incorrect passcode. Please try again.
          </div>
        )}
        
        {/* Security warning */}
        {securityWarning && (
          <div style={{
            color: '#f59e0b',
            fontSize: '12px',
            fontWeight: '600',
            textAlign: 'center',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
            maxWidth: '300px',
          }}>
            ⚠️ Security Warning: Developer tools detected. Please close them for enhanced security.
          </div>
        )}
        
        {/* Number pad */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
          maxWidth: '280px',
        }}>
          {/* Row 1 */}
          <button
            onClick={() => handleNumberPress('1')}
            style={{
              ...numberPadStyle,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            1
          </button>
          <button
            onClick={() => handleNumberPress('2')}
            style={{
              ...numberPadStyle,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            2
          </button>
          <button
            onClick={() => handleNumberPress('3')}
            style={{
              ...numberPadStyle,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            3
          </button>
          
          {/* Row 2 */}
          <button
            onClick={() => handleNumberPress('4')}
            style={{
              ...numberPadStyle,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            4
          </button>
          <button
            onClick={() => handleNumberPress('5')}
            style={{
              ...numberPadStyle,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            5
          </button>
          <button
            onClick={() => handleNumberPress('6')}
            style={{
              ...numberPadStyle,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            6
          </button>
          
          {/* Row 3 */}
          <button
            onClick={() => handleNumberPress('7')}
            style={{
              ...numberPadStyle,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            7
          </button>
          <button
            onClick={() => handleNumberPress('8')}
            style={{
              ...numberPadStyle,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            8
          </button>
          <button
            onClick={() => handleNumberPress('9')}
            style={{
              ...numberPadStyle,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            9
          </button>
          
          {/* Row 4 */}
          <button
            onClick={handleClear}
            style={clearButtonStyle}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            Clear
          </button>
          <button
            onClick={() => handleNumberPress('0')}
            style={{
              ...numberPadStyle,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            0
          </button>
          <button
            onClick={handleDelete}
            style={deleteButtonStyle}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            ←
          </button>
        </div>
      </div>
      
      {/* CSS for shake animation */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
};

export default PasscodeLock; 