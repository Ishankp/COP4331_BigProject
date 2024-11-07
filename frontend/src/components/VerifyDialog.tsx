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


interface VerificationDialogProps {
    open: boolean;
    onClose: () => void;
    onVerify: (Token: string) => boolean; // Function to check if the Token is correct
}

const VerifyDialog: React.FC<VerificationDialogProps> = ({open, onClose, onVerify}) => {
    const [Token, setToken] = useState('');
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleVerify = () => {
        const doesTokenMatch = onVerify(Token);
        if (doesTokenMatch) {
            setMessage('Account Verified!'); 
            setErrorMessage('');
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