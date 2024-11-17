import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_mobile_app/screens/RegisterScreen.dart';
import 'package:flutter_mobile_app/utils/getAPI.dart'; // Adjust import path if needed

class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  String loginName = '';
  String password = '';
  String message = '';

  void _login() async {
    String payload = '{"login":"$loginName", "password":"$password"}';

    try {
      // Call the login API
      String response = await ApiService.getJson('http://wattareyoudoing.us/api/login', payload);

      // Parse the response
      var jsonResponse = jsonDecode(response);

      if (jsonResponse['id'] != null && jsonResponse['id'] > 0) {
        // Successful login
        Navigator.pushNamed(context, '/cards'); // Navigate to the next screen
      } else {
        // Display error message
        setState(() {
          message = jsonResponse['error'] ?? 'Login failed';
        });
      }
    } catch (e) {
      setState(() {
        message = 'An error occurred. Please try again.';
      });
    }
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
              // Header Text
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

              // Login Name Input
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

              // Display error message
              if (message.isNotEmpty)
                Text(
                  message,
                  style: TextStyle(color: Colors.red, fontSize: 14),
                ),
              const SizedBox(height: 10),

              // Login Button
              ElevatedButton(
                onPressed: _login, // Fixed: Now matches the expected type
                style: ElevatedButton.styleFrom(backgroundColor: Colors.brown[50]),
                child: const Text(
                  'Login',
                  style: TextStyle(fontSize: 14, color: Colors.black),
                ),
              ),
              const SizedBox(height: 10),

              // Navigate to Register Button
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
