import React, { useState } from 'react';
import VerifyDialog from './VerifyDialog';
import {buildPath} from '../helpers/HelperFunctions';
import {Link} from '@mui/material';
import ResetPasswordDialog from './ResetPasswordDialog';

function Login() {

  const [message, setMessage] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setPassword] = useState('');
  const [userEmail, setUserEmail] = useState(''); 
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [token, setToken] = useState('');

  async function doLogin(event: React.FormEvent) : Promise<void> {
    event.preventDefault();

    const obj = { login: loginName, password: loginPassword };
    const js = JSON.stringify(obj);

    try {
      const response = await fetch(buildPath('api/login'), {
        method: 'POST',
        body: js,
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await response.json();

      if (res.id <= 0) {
        setMessage('User/Password combination incorrect');
      } else {
        const user = { 
          firstName: res.firstName, 
          lastName: res.lastName, 
          id: String(res.id),
          isVerified: res.isVerified,
          token: res.token,
          email: res.email,
          ShareKey: res.ShareKey
        };
        setToken(user.token);
        setUserEmail(user.email);
        localStorage.setItem('user_data', JSON.stringify(user));
        if (user.isVerified) {
          setMessage('');
          window.location.href = '/dashboard';
        }
        else {
          setVerifyDialogOpen(true);
        }
      }
    } catch (error: any) {
      console.error(error);
      setMessage('Error logging in. Please try again.');
    }
  }

  const handleVerifyToken = (enteredToken: string): boolean => {
    return enteredToken === token;
  };

  return (
    <div className="center-page">
      <div className="form-container">
        <h2>Login</h2>
        <form onSubmit={doLogin}>
          <input
            type="text"
            placeholder="Username"
            value={loginName}
            onChange={(e) => setLoginName(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={loginPassword}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Link 
            variant='body2'
            onClick={() => {setResetPasswordDialogOpen(true)}}
            style={{ cursor: 'pointer', textDecoration: 'underline' }}
          >
          Forgot Password?
          </Link>
          <button type="submit">Login</button>
        </form>
        {message && <p>{message}</p>}
      </div>
      <VerifyDialog
        open={verifyDialogOpen}
        onClose={() => {setVerifyDialogOpen(false)}}
        onVerify={handleVerifyToken}
        login={loginName}
        password={loginPassword}
        email={userEmail} 
      />
      <ResetPasswordDialog
        open={resetPasswordDialogOpen}
        onClose={() => {setResetPasswordDialogOpen(false)}}
      />
    </div>
  );
}

export default Login;