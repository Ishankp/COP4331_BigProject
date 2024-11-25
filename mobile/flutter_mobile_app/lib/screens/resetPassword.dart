import 'package:flutter/material.dart';
import 'package:flutter_mobile_app/utils/getAPI.dart'; // Adjust path as needed
import 'package:flutter_mobile_app/utils/sendEmail.dart';
import 'dart:math';

class ResetPasswordScreen extends StatefulWidget {
  String token = '';
  ResetPasswordScreen({required this.token});

  @override
  _ResetPasswordScreenState createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final ApiService apiService = ApiService(); // Initialize the API service
  String newPassword = '';
  String confirmPassword = '';
  String message = '';

  void _resetPassword() async {
    if (newPassword == confirmPassword){
      try {
        final response = await ApiService().resetPassword(newPassword, widget.token);
        if (response['success']) {
          setState(() {
            message = 'Password Reset!';
          });
          Navigator.pop(context);
        }
        else {
          setState(() {
            message = 'Error when resetting password, try requesting another token';
          });
        }
      }
      catch (e) {
        setState(() {
          message = 'Error: $e';
        });
      }
    }
    else {
      setState(() {
        message = 'Passwords do not match.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFDD4A5),
      body: Center(
        child: SingleChildScrollView(
          child: SizedBox(
            width: 200,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                const Text(
                  'Register',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFFFD6A6B),
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 20),

                // Password Input
                TextField(
                  obscureText: true,
                  decoration: const InputDecoration(
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(),
                    labelText: 'New Password',
                    hintText: 'Enter New Password',
                  ),
                  onChanged: (text) {
                    newPassword = text;
                  },
                ),
                const SizedBox(height: 10),

                // Confirm Password Input
                TextField(
                  obscureText: true,
                  decoration: const InputDecoration(
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(),
                    labelText: 'Confirm Password',
                    hintText: 'Confirm Tour password',
                  ),
                  onChanged: (text) {
                    confirmPassword = text;
                  },
                ),
                const SizedBox(height: 10),

                // Change Password Button
                ElevatedButton(
                  onPressed: _resetPassword,
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.brown[50]),
                  child: const Text(
                    'Change Password',
                    style: TextStyle(fontSize: 14, color: Colors.black),
                  ),
                ),

                // Back to Login Button
                TextButton(
                  onPressed: () {
                    Navigator.pop(context);
                  },
                  child: const Text(
                    'Back to Login',
                    style: TextStyle(color: Colors.black),
                  ),
                ),
                if (message.isNotEmpty)
                  Text(
                    message,
                    style: TextStyle(
                      color: message.contains('Error') ? Colors.green : Colors.red,
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
