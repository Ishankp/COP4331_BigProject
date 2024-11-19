import React, { useState } from 'react';
import VerifyDialog from './VerifyDialog';
import { sendEmail } from '../helpers/HelperFunctions';

const Register: React.FC = () => {
  const app_name = 'wattareyoudoing.us';

  function buildPath(route: string): string {
    return process.env.NODE_ENV !== 'development'
      ? 'http://' + app_name + ':5000/' + route
      : 'http://localhost:5000/' + route;
  }

  async function generateToken(): Promise<string> {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  const [message, setMessage] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [shareKey, setShareKey] = useState(''); // Optional field
  const [token, setToken] = useState('');
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);

  async function doRegister(event: React.FormEvent) {
    event.preventDefault();
    const genToken = await generateToken();

    setToken(genToken);
    const newUser = { FirstName: firstName, LastName: lastName, Login: login, Password: password, email, ShareKey: shareKey, isVerified: false, token:genToken };
    const userJson = JSON.stringify(newUser);

    try {
      const response = await fetch(buildPath('api/register'), {
        method: 'POST',
        body: userJson,
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await response.json();

      if (response.ok && res.success) {
        setMessage('Registration successful!');
        const result = await sendEmail(genToken, email);
        if (result.status === 200) {
          setVerifyDialogOpen(true);
        }
      } else {
        setMessage(res.error || 'Registration failed.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Registration failed. Please try again later.');
    }
  }

  const handleVerifyToken = (enteredToken: string): boolean => {
    return enteredToken === token;
  };

  return (
    <div className="center-page">
      <div id="registerDiv">
        <h2>Register</h2>
        <form onSubmit={doRegister}>
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Username"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <input
              type="text"
              placeholder="Share Key"
              value={shareKey}
              onChange={(e) => setShareKey(e.target.value)}
              onMouseEnter={() => setTooltipVisible(true)} // Show tooltip on hover
              onMouseLeave={() => setTooltipVisible(false)} // Hide tooltip when not hovering
              required
            />
            {tooltipVisible && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: '#555',
                  color: '#fff',
                  padding: '8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  whiteSpace: 'nowrap',
                  zIndex: 1000,
                }}
              >
                A Share Key is a unique code you can share with others to let them add you as a friend.
              </div>
            )}
          </div>
          <button type="submit">Register</button>
        </form>
        {message && <p>{message}</p>}
      </div>
      <VerifyDialog
        login={login}
        password={password}
        email={email}
        open={verifyDialogOpen}
        onClose={() => {
          setVerifyDialogOpen(false);
        }}
        onVerify={handleVerifyToken}
      />
    </div>
  );
};

export default Register;