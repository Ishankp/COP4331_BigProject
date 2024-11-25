import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class RegisterScreen extends StatefulWidget {
  @override
  _RegisterScreenState createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final String registerUrl = 'http://wattareyoudoing.us:5000/api/register';

  String firstName = '';
  String lastName = '';
  String login = '';
  String password = '';
  String email = '';
  String shareKey = '';
  String message = '';

  /// Validate all fields
  bool _validateFields() {
    if (firstName.trim().isEmpty ||
        lastName.trim().isEmpty ||
        login.trim().isEmpty ||
        password.trim().isEmpty ||
        email.trim().isEmpty ||
        shareKey.trim().isEmpty) {
      setState(() {
        message = 'All fields are required.';
      });
      return false;
    }
    return true;
  }

  /// Save user data locally after successful registration
  Future<void> _saveUserData(Map<String, dynamic> userData) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();

    await prefs.setString('firstName', userData['FirstName'] ?? '');
    await prefs.setString('lastName', userData['LastName'] ?? '');
    await prefs.setString('id', userData['id'].toString());
    await prefs.setString('email', userData['email'] ?? '');
    await prefs.setString('shareKey', userData['ShareKey'] ?? '');
    await prefs.setBool('isVerified', userData['isVerified'] ?? false);
    await prefs.setString('token', userData['token'] ?? '');
  }

  /// Register the user
  void _register() async {
    if (!_validateFields()) return;

    try {
      final response = await http.post(
        Uri.parse(registerUrl),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "FirstName": firstName.trim(),
          "LastName": lastName.trim(),
          "Login": login.trim(),
          "Password": password.trim(),
          "email": email.trim(),
          "ShareKey": shareKey.trim(),
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);

        if (data['success'] == true) {
          await _saveUserData(data); // Save user data locally
          setState(() {
            message = 'Registration successful! Redirecting...';
          });

          // Redirect to login screen
          await Future.delayed(Duration(seconds: 2));
          Navigator.pushNamed(context, '/login');
        } else {
          setState(() {
            message = data['error'] ?? 'Registration failed.';
          });
        }
      } else {
        setState(() {
          message = 'Failed to register. Error: ${response.body}';
        });
      }
    } catch (e) {
      setState(() {
        message = 'Error: $e';
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

                // First Name Input
                TextField(
                  decoration: const InputDecoration(
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(),
                    labelText: 'First Name',
                    hintText: 'Enter Your First Name',
                  ),
                  onChanged: (text) {
                    firstName = text;
                  },
                ),
                const SizedBox(height: 10),

                // Last Name Input
                TextField(
                  decoration: const InputDecoration(
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(),
                    labelText: 'Last Name',
                    hintText: 'Enter Your Last Name',
                  ),
                  onChanged: (text) {
                    lastName = text;
                  },
                ),
                const SizedBox(height: 10),

                // Login Input
                TextField(
                  decoration: const InputDecoration(
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(),
                    labelText: 'Login Name',
                    hintText: 'Enter Your Login Name',
                  ),
                  onChanged: (text) {
                    login = text;
                  },
                ),
                const SizedBox(height: 10),

                // Password Input
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
                const SizedBox(height: 10),

                // Email Input
                TextField(
                  decoration: const InputDecoration(
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(),
                    labelText: 'Email',
                    hintText: 'Enter Your Email',
                  ),
                  onChanged: (text) {
                    email = text;
                  },
                ),
                const SizedBox(height: 10),

                // Share Key Input
                TextField(
                  decoration: const InputDecoration(
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(),
                    labelText: 'Share Key',
                    hintText: 'Enter Share Key',
                  ),
                  onChanged: (text) {
                    shareKey = text;
                  },
                ),
                const SizedBox(height: 10),

                // Error/Success Message
                if (message.isNotEmpty)
                  Text(
                    message,
                    style: TextStyle(
                      color: message.contains('successful')
                          ? Colors.green
                          : Colors.red,
                      fontSize: 14,
                    ),
                  ),
                const SizedBox(height: 10),

                // Register Button
                ElevatedButton(
                  onPressed: _register,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.brown[50],
                  ),
                  child: const Text(
                    'Register',
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
              ],
            ),
          ),
        ),
      ),
    );
  }
}
