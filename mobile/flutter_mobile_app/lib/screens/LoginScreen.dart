import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_mobile_app/screens/RegisterScreen.dart';
import 'package:flutter_mobile_app/utils/getAPI.dart'; // Adjust import path if needed
import 'package:shared_preferences/shared_preferences.dart'; // Import for local storage

class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final ApiService apiService = ApiService(); // Initialize the API service
  String loginName = '';
  String password = '';
  String message = '';

  Future<void> _login() async {
    try {
      final response = await apiService.login(loginName, password);

      if (response['id'] != null && response['id'] > 0) {
        // Successful login
        await _saveUserData(response); // Save user data locally
        setState(() {
          message = 'Welcome, ${response['firstName']}!';
        });
        Navigator.pushNamed(context, '/create'); // Navigate to the next screen
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

  Future<void> _saveUserData(Map<String, dynamic> userData) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();

    // Save user data to SharedPreferences
    await prefs.setString('firstName', userData['firstName'] ?? '');
    await prefs.setString('lastName', userData['lastName'] ?? '');
    await prefs.setString('id', userData['id'].toString());
    await prefs.setBool('isVerified', userData['isVerified'] ?? false);
    await prefs.setString('token', userData['token'] ?? '');
    await prefs.setString('email', userData['email'] ?? '');
    await prefs.setString('ShareKey', userData['ShareKey'] ?? '');
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
              const SizedBox(height: 10),
              if (message.isNotEmpty)
                Text(
                  message,
                  style: const TextStyle(color: Colors.red, fontSize: 14),
                ),
              const SizedBox(height: 10),
              ElevatedButton(
                onPressed: _login,
                style:
                    ElevatedButton.styleFrom(backgroundColor: Colors.brown[50]),
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
                style:
                    ElevatedButton.styleFrom(backgroundColor: Colors.brown[50]),
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
