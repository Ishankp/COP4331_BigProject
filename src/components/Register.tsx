import React, { useState } from 'react';

const Register: React.FC = () => {
  const app_name = 'cop4331-3.com';

  function buildPath(route: string): string {
    return process.env.NODE_ENV !== 'development'
      ? 'http://' + app_name + ':5000/' + route
      : 'http://localhost:5000/' + route;
  }

  const [message, setMessage] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [shareKey, setShareKey] = useState(''); // Optional field

  async function doRegister(event: React.FormEvent) {
    event.preventDefault();

    const newUser = { FirstName: firstName, LastName: lastName, Login: login, Password: password, email, ShareKey: shareKey };
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
        // Redirect user or clear the form if needed
      } else {
        setMessage(res.error || 'Registration failed.');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('Registration failed. Please try again later.');
    }
  }

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
          <input
            type="text"
            placeholder="Share Key (optional)"
            value={shareKey}
            onChange={(e) => setShareKey(e.target.value)}
          />
          <button type="submit">Register</button>
        </form>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default Register;

