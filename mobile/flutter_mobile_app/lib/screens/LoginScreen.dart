import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_mobile_app/screens/ForgotPassword.dart';
import 'package:flutter_mobile_app/screens/RegisterScreen.dart';
import 'package:flutter_mobile_app/utils/getAPI.dart'; // Adjust import path if needed


class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final ApiService apiService = ApiService(); // Initialize the API service
  String loginName = '';
  String password = '';
  String message = '';
  String token = '';

  void _login() async {
    try {
      final response = await apiService.login(loginName, password);

      if (response['id'] != null && response['id'] > 0) {
        token = response['token'];
        if(!response['isVerified']) {
          _showVerificationDialog();
        }
        else {
          // Successful login
          await _saveUserData(response); // Save user data locally
          setState(() {
            message = 'Welcome, ${response['firstName']}!';
          });
          Navigator.pushNamed(context, '/create'); // Navigate to the next screen
        }
      } else {
        // Failed login
        setState(() {
          message = response['error'] ?? 'Invalid credentials';
        });
      }
    } catch (e) {
      setState(() {
        message = 'Error: $e';
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
              title: const Text('Verify Your Email'),
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
                      final response = ApiService().verifyUser(loginName, password);
                      Navigator.of(context).pop();
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Verification successful!'),
                        ),
                      );
                      Navigator.pushNamed(context, '/create'); // Navigate to the next screen
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
      body: Center(
        child: SizedBox(
          width: 200,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              const Text(
                'Welcome to Time Link!',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFFFD6A6B),
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),
              TextField(
                decoration: const InputDecoration(
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(),
                  labelText: 'Login Name',
                  hintText: 'Enter Your Login Name',
                ),
                onChanged: (text) {
                  loginName = text;
                },
              ),
              const SizedBox(height: 10),
              TextField(
                obscureText: true,
                decoration: const InputDecoration(
                  filled: true,
                  fillColor: Colors.white,
                  border: OutlineInputBorder(),
                  labelText: 'Password',
                  hintText: 'Enter Your Password',
                ),
                onChanged: (text) {
                  password = text;
                },
              ),
              GestureDetector(
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => ForgotPasswordPage()),
                  );
                },
                child: const Text(
                  'Forgot Password?',
                  style: TextStyle(
                    color: Colors.blue,
                    decoration: TextDecoration.underline,
                  ),
                ),
              ),
              const SizedBox(height: 10),
              if (message.isNotEmpty)
                Text(
                  message,
                  style: const TextStyle(color: Colors.red, fontSize: 14),
                ),
              const SizedBox(height: 10),
              ElevatedButton(
                onPressed: _login,
                style: ElevatedButton.styleFrom(backgroundColor: Colors.brown[50]),
                child: const Text(
                  'Login',
                  style: TextStyle(fontSize: 14, color: Colors.black),
                ),
              ),
              const SizedBox(height: 10),
              ElevatedButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => RegisterScreen()),
                  );
                },
                style: ElevatedButton.styleFrom(backgroundColor: Colors.brown[50]),
                child: const Text(
                  'Register',
                  style: TextStyle(color: Colors.black),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
