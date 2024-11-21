import 'package:flutter/material.dart';
import 'package:flutter_mobile_app/utils/getAPI.dart'; // Adjust path as needed

class RegisterScreen extends StatefulWidget {
  @override
  _RegisterScreenState createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final ApiService apiService = ApiService(); // Initialize the API service
  String firstName = '';
  String lastName = '';
  String login = '';
  String password = '';
  String email = '';
  String shareKey = ''; // Optional field
  String message = '';

  void _register() async {
    try {
      final response = await apiService.register(
        firstName: firstName,
        lastName: lastName,
        login: login,
        password: password,
        email: email,
        shareKey: shareKey.isEmpty ? null : shareKey, // Pass shareKey only if it's not empty
      );

      if (response['id'] != null && response['id'] > 0) {
        // Registration successful
        setState(() {
          message = 'Registration successful. Welcome, $firstName!';
        });
        Navigator.pop(context); // Navigate back to the login screen
      } else {
        // Registration failed
        setState(() {
          message = response['error'] ?? 'Registration failed.';
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
                    labelText: 'Share Key (optional)',
                    hintText: 'Enter Share Key (if applicable)',
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
                      color: message.contains('success') ? Colors.green : Colors.red,
                      fontSize: 14,
                    ),
                  ),
                const SizedBox(height: 10),

                // Register Button
                ElevatedButton(
                  onPressed: _register,
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.brown[50]),
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
