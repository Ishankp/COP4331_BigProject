import React, {useState} from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    TextField
  } from '@mui/material';
import buildPath from "../helpers/HelperFunctions";

interface VerificationDialogProps {
    open: boolean;
    login: string;
    password: string;
    onClose: () => void;
    onVerify: (Token: string) => boolean;
}

const VerifyDialog: React.FC<VerificationDialogProps> = ({open, login, password, onClose, onVerify}) => {
    const [Token, setToken] = useState('');
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleVerify = async () => {
        const doesTokenMatch = onVerify(Token);
        if (doesTokenMatch) {
            const obj = { login: login, password: password};
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
                }
            }
            catch (error) {
                console.error('Error:', error);
                setMessage('Verification failed. Please try again later.');
            }   
            finally {
                window.location.href = '/cards';
            }
        }
        else {
            setErrorMessage('Token does not match: Resend Token');
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
    else {
        return (
            <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Enter Verification Code</DialogTitle>
            <DialogContent>
              <Typography variant="body2">
                Please enter the verification Code sent to your email.
              </Typography>
              <TextField
                label="Verification Token"
                variant="outlined"
                fullWidth
                margin="normal"
                value={Token}
                onChange={(e) => setToken(e.target.value)}
                error={!!errorMessage}
                helperText={errorMessage || ' '}
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
    }
}

export default VerifyDialog;