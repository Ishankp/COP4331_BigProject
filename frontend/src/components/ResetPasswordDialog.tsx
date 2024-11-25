import React, {useState} from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    Button,
    Typography,
    TextField,
  } from '@mui/material';
import { buildPath,sendResetEmail } from "../helpers/HelperFunctions";

interface ResetPasswordDialogProps {
    open: boolean;
    onClose: () => void;
}

const ResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({open, onClose}) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSend = async () => {
      const obj = { email: email};
      const js = JSON.stringify(obj);
      try {
        const response = await fetch(buildPath('api/resetPasswordRequest'), {
          method: 'POST',
          body: js,
          headers: { 'Content-Type': 'application/json' },
        });
        
        const res = await response.json();
    
        if (res.success) {
          const token = res.resetPasswordToken;
          const resetLink = `http://wattareyoudoing.us/reset-password?token=${token}`;
          await sendResetEmail(resetLink, email);

          setMessage("If the email you entered is associated with an account, you will receive an email to reset your password")
          setErrorMessage('');
        }
        else {
          setErrorMessage("There was a problem trying to reset your password. Try again later");
          setMessage('');
        }
      }
      catch (error) {
        console.log("Problem resetting password: ", error);
        setErrorMessage("Failed to send email"); 
      }
    }

    const handleClose = () => {
        setEmail('');
        setMessage('');
        onClose();
    };

    if (!open) {
        return null;
    }
    else {
        return (
            <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogContent>
              <Typography variant="body2">
                Please enter the email linked with your account to get instructions to reset your password
              </Typography>
              <TextField
                label="Email Address"
                variant="outlined"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!errorMessage}
                helperText={
                    errorMessage || ' '}
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
              <Button onClick={handleSend} color="primary" variant="contained">
                Send Email
              </Button>
            </DialogActions>
          </Dialog>
        );
    }
}

export default ResetPasswordDialog;