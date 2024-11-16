import React, {useState} from "react";
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

const VerifyDialog: React.FC<VerificationDialogProps> = ({open, login, password, email, onClose, onVerify}) => {
    const [token, setToken] = useState('');
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const handleVerify = async () => {
        const doesTokenMatch = onVerify(token);
        console.log(email);
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
                value={token}
                onChange={(e) => setToken(e.target.value)}
                error={!!errorMessage}
                helperText={
                    errorMessage && 
                    <span>
                        <Typography variant="body2">
                            {errorMessage}
                        </Typography>
                        <Link
                        component="button"
                        variant="body2"
                        onClick={() => {sendEmail(token, email)}}
                        >
                        Resend Code
                        </Link>
                    </span>
                    || ' '}
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