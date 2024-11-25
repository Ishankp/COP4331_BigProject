import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_mobile_app/screens/resetPassword.dart';
import 'package:flutter_mobile_app/utils/getAPI.dart';
import 'package:flutter_mobile_app/utils/sendEmail.dart';

class ForgotPasswordPage extends StatefulWidget {
  @override
  _ForgotPasswordPageState createState() => _ForgotPasswordPageState();
}

class _ForgotPasswordPageState extends State<ForgotPasswordPage> {
  final TextEditingController emailController = TextEditingController();
  String message = '';
  String token = '';
  String email = '';

  void forgotPassword() async {
    // Example of resetting the password
    String email = emailController.text.trim();
    if (email.isNotEmpty) {
      try {
        // Add logic to handle password reset using email
        final result = await ApiService().resetPasswordRequest(email, token);
        token = result['resetPasswordToken'];
        final emailSent = await EmailService.sendEmail(userEmail: email, message: token);
        if (emailSent) {
          setState(() {
            message = 'Password reset email sent!';
          });
          _showVerificationDialog();
        }
        else {
          setState(() {
            message = 'Problem trying to reset password. Try again later.';
          });
        }
      }
      catch (e) {
        setState(() {
          message = 'Error: $e';
        });
      }
    } else {
      setState(() {
        message = 'Please enter a valid email.';
      });
    }
  }

  void _showVerificationDialog() {
    TextEditingController codeController = TextEditingController();
    String errorMessage = '';

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return StatefulBuilder(
          builder: (context, setState) {
            return AlertDialog(
              title: const Text('Reset Password'),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'A 6-digit code has been sent to your email. Please enter it below:',
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: codeController,
                    keyboardType: TextInputType.number,
                    maxLength: 6,
                    decoration: InputDecoration(
                      labelText: '6-digit Code',
                      counterText: '',
                      errorText: errorMessage.isNotEmpty ? errorMessage : null,
                    ),
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () {
                    Navigator.of(context).pop();
                  },
                  child: const Text('Cancel'),
                ),
                ElevatedButton(
                  onPressed: () {
                    String code = codeController.text;

                    // Validate the code
                    if (code.isEmpty) {
                      setState(() {
                        errorMessage = 'Code cannot be empty!';
                      });
                    } else if (code.length != 6) {
                      setState(() {
                        errorMessage = 'Code must be 6 digits!';
                      });
                    } else if (code != token) {
                      setState(() {
                        errorMessage = 'Code does not match!';
                      });
                    } else {
                      setState(() {
                        errorMessage = '';
                      });
                      Navigator.of(context).pop();
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Enter new Password'),
                        ),
                      );
                      Navigator.of(context).pop();
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => ResetPasswordScreen(token: token)),
                      );
                    }
                  },
                  child: Text('Verify'),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFDD4A5),
      appBar: AppBar(
        title: Text('Forgot Password'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              "Enter the email associated with your account to receive a token",
              style: TextStyle(
                color: Color(0xFFFD6A6B),
                fontSize: 16,
              ),
            ),
            SizedBox(height: 20),
            TextField(
              controller: emailController,
              decoration: InputDecoration(
                labelText: 'Enter your email',
                border: OutlineInputBorder(),
              ),
            ),
            SizedBox(height: 20),
            ElevatedButton(
              onPressed: forgotPassword,
              child: Text('Send Email'),
            ),
            SizedBox(height: 20),
            if (message.isNotEmpty)
              Text(
                message,
                style: TextStyle(
                  color: message.contains('sent') ? Colors.green : Colors.red,
                ),
              ),
          ],
        ),
      ),
    );
  }
}