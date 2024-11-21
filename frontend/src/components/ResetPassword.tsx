import React, { useState } from 'react';

function ResetPassword() {
  const app_name = 'wattareyoudoing.us';

  function buildPath(route:string) : string
  {
    if (process.env.NODE_ENV != 'development')
    {
      return 'http://' + app_name + ':5000/' + route;
    }
    else
    {
      return 'http://localhost:5000/' + route;
    }
  }

  const [message, setMessage] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  async function doResetPassword(event: React.FormEvent) : Promise<void> {
    event.preventDefault();

    if (confirmPassword !== newPassword) {
      setMessage('Passwords do not match!');
    }
    else {
      const searchParams = new URLSearchParams(window.location.search);
      const token = searchParams.get("token");

      const obj = {newPassword: newPassword, resetPasswordToken: token };
      const js = JSON.stringify(obj);

      try {
        const response = await fetch(buildPath('api/resetPassword'), {
          method: 'POST',
          body: js,
          headers: { 'Content-Type': 'application/json' },
        });

        const res = await response.json();

        if (!res.success) {
          console.log(res.status);
          setMessage(res.error);
        } else {
          setMessage('Password successfully reset!');
          window.location.href = '/';
        }
      } catch (error: any) {
        console.error(error);
        setMessage('Error logging in. Please try again.');
      }
    }
  }

  return (
    <div className="center-page">
      <div className="form-container">
        <h2>Reset Password</h2>
        <form onSubmit={doResetPassword}>
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button type="submit">Change Password</button>
        </form>
        {message && <p style={{ color: "red", marginTop: "10px" }}>{message}</p>}
      </div>
    </div>
  );
}

export default ResetPassword;
