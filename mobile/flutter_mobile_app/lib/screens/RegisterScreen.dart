import 'package:flutter/material.dart';

class RegisterScreen extends StatefulWidget {
  @override
  _RegisterScreenState createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  String firstName = '';
  String lastName = '';
  String username = '';
  String password = '';
  String email = '';
  String shareKey = ''; // Optional field

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFDD4A5),
      body: Center(
        child: SingleChildScrollView(
          child: Container(
            width: MediaQuery.of(context).size.width * 0.9,
            padding: const EdgeInsets.all(16.0),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withOpacity(0.5),
                  spreadRadius: 5,
                  blurRadius: 7,
                  offset: Offset(0, 3),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Header
                const Text(
                  'Register',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
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

                // Username Input
                TextField(
                  decoration: const InputDecoration(
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(),
                    labelText: 'Username',
                    hintText: 'Enter Your Username',
                  ),
                  onChanged: (text) {
                    username = text;
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

                // Share Key Input (Optional)
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
                const SizedBox(height: 20),

                // Register Button
                ElevatedButton(
                  onPressed: () {
                    // Perform register action
                    print(
                        "Registering with $firstName $lastName, $username, $email, $password, Share Key: $shareKey");
                    Navigator.pop(context); // Navigate back to login screen
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.redAccent,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                  ),
                  child: const Text(
                    'Register',
                    style: TextStyle(fontSize: 16, color: Colors.white),
                  ),
                ),
                const SizedBox(height: 10),

                // Back to Login Button
                TextButton(
                  onPressed: () {
                    Navigator.pop(context);
                  },
                  child: const Text(
                    'Back to Login',
                    style: TextStyle(color: Colors.redAccent),
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
