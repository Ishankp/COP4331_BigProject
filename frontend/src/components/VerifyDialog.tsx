// export default VerifyDialog;
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Link
} from '@mui/material';
import { buildPath, sendEmail } from "../helpers/HelperFunctions";

interface VerificationDialogProps {
  open: boolean;
  login: string;
  password: string;
  email: string;
  onClose: () => void;
  onVerify: (token: string) => boolean;
}

const VerifyDialog: React.FC<VerificationDialogProps> = ({ open, login, password, email, onClose, onVerify }) => {
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLoginAfterVerify = async () => {
    const loginPayload = { login, password };

    try {
      const response = await fetch(buildPath('api/login'), {
        method: 'POST',
        body: JSON.stringify(loginPayload),
        headers: { 'Content-Type': 'application/json' },
      });

      const res = await response.json();

      if (response.ok && res.id > 0) {
        // Store user data in local storage
        localStorage.setItem(
          'user_data',
          JSON.stringify({
            id: res.id,
            firstName: res.firstName,
            lastName: res.lastName,
            shareKey: res.shareKey, // Ensure shareKey is returned from the login API
          })
        );

        // Redirect to the schedule builder
        window.location.href = '/schedulebuilder';
      } else {
        console.error('Login after verification failed:', res.error);
        setMessage('Account verified, but login failed. Please try logging in manually.');
      }
    } catch (error) {
      console.error('Error logging in after verification:', error);
      setMessage('Verification successful, but login failed. Please log in manually.');
    }
  };

  const handleVerify = async () => {
    const doesTokenMatch = onVerify(token);

    if (doesTokenMatch) {
      const obj = { login, password };
      const js = JSON.stringify(obj);

      try {
        const response = await fetch(buildPath('api/verify_user'), {
          method: 'POST',
          body: js,
          headers: { 'Content-Type': 'application/json' },
        });

        const res = await response.json();

        if (response.ok && res.success) {
          setMessage('Account Verified!');
          setErrorMessage('');

          // Call login after successful verification
          await handleLoginAfterVerify();
        } else {
          setMessage('Verification failed. Please try again.');
        }
      } catch (error) {
        console.error('Error during verification:', error);
        setMessage('Verification failed. Please try again later.');
      }
    } else {
      setErrorMessage('Token does not match');
      setMessage('');
    }
  };

  const handleClose = () => {
    setToken('');
    setMessage('');
    onClose();
  };

  if (!open) {
    return null;
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Enter Verification Code</DialogTitle>
      <DialogContent>
        <Typography variant="body2">
          Please enter the verification code sent to your email.
        </Typography>
        <TextField
          label="Verification Token"
          variant="outlined"
          fullWidth
          margin="normal"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          error={!!errorMessage}
          helperText={
            errorMessage ? (
              <span>
                <Typography variant="body2">{errorMessage}</Typography>
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => sendEmail(token, email)}
                >
                  Resend Code
                </Link>
              </span>
            ) : (
              ' '
            )
          }
        />
        {message && (
          <Typography color="success" variant="body1">
            {message}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleVerify} color="primary" variant="contained">
          Verify
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VerifyDialog;
