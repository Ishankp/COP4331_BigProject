// import 'package:http/http.dart' as http;
// import 'dart:convert';
//
// class CardsData {
//   static Future<String> getJson(String url, String outgoing) async {
//     String ret = "";
//     try {
//       http.Response response = await http.post(
//         Uri.parse(url),
//         body: utf8.encode(outgoing),
//         headers: {
//           "Accept": "application/json",
//           "Content-Type": "application/json",
//         },
//         encoding: Encoding.getByName("utf-8"),
//       );
//       ret = response.body;
//     } catch (e) {
//       print(e.toString());
//     }
//     return ret;
//   }
// }

// ################################################################################
// import 'dart:convert';
// import 'package:http/http.dart' as http;
//
// class ApiService {
//   final String baseUrl = 'http://localhost:5000/api'; // Replace localhost with your server IP or domain
//
//   // General function to make POST requests
//   Future<dynamic> _postRequest(String endpoint, Map<String, dynamic> body) async {
//     final url = Uri.parse('$baseUrl$endpoint');
//     try {
//       final response = await http.post(
//         url,
//         headers: {"Content-Type": "application/json"},
//         body: jsonEncode(body),
//       );
//
//       if (response.statusCode == 200) {
//         return jsonDecode(response.body);
//       } else {
//         throw Exception('API Error: ${response.statusCode}, ${response.body}');
//       }
//     } catch (e) {
//       throw Exception('Failed to connect to the API: $e');
//     }
//   }
//
//   // Login API
//   Future<Map<String, dynamic>> login(String login, String password) async {
//     return await _postRequest('/login', {"login": login, "password": password});
//   }
//
//   // Register API
//   Future<Map<String, dynamic>> register(
//       String firstName, String lastName, String login, String password, String email) async {
//     return await _postRequest('/register', {
//       "FirstName": firstName,
//       "LastName": lastName,
//       "Login": login,
//       "Password": password,
//       "email": email,
//     });
//   }
//
//   // Add Event API
//   Future<Map<String, dynamic>> addEvent(
//       String userId, String event, String desc, String start, String end, List<String> days) async {
//     return await _postRequest('/addEvent', {
//       "UserID": userId,
//       "event": event,
//       "desc": desc,
//       "start": start,
//       "end": end,
//       "days": days,
//     });
//   }
//
//   // View Events API
//   Future<List<dynamic>> viewEvents(String userId) async {
//     final response = await _postRequest('/viewEvent', {"UserID": userId});
//     if (response is Map<String, dynamic> && response.containsKey('events')) {
//       return response['events'];
//     } else {
//       throw Exception('Unexpected response format for events');
//     }
//   }
//
//   // Delete Event API
//   Future<Map<String, dynamic>> deleteEvent(String userId, String eventId) async {
//     return await _postRequest('/deleteEvent', {"UserID": userId, "eventID": eventId});
//   }
//
//   // Get Contacts API
//   Future<List<dynamic>> getContacts(String userId) async {
//     final response = await _postRequest('/getContacts', {"UserID": userId});
//     if (response is Map<String, dynamic> && response.containsKey('contacts')) {
//       return response['contacts'];
//     } else {
//       throw Exception('Unexpected response format for contacts');
//     }
//   }
//   // THIS "getJson" LINE NEEDS TO BE DELETED. ADDED SO CODE WILL RUN
//   static getJson(String s, String payload) {}
// }


// import 'package:http/http.dart' as http;
// import 'dart:convert';
//
// class CardsData {
//   static Future<String> getJson(String url, String outgoing) async {
//     String ret = "";
//     try {
//       http.Response response = await http.post(
//         Uri.parse(url),
//         body: utf8.encode(outgoing),
//         headers: {
//           "Accept": "application/json",
//           "Content-Type": "application/json",
//         },
//         encoding: Encoding.getByName("utf-8"),
//       );
//       ret = response.body;
//     } catch (e) {
//       print(e.toString());
//     }
//     return ret;
//   }
// }

import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  final String baseUrl = 'http://10.0.2.2:5000/api'; // Replace with your actual server URL

  // Login API
  Future<Map<String, dynamic>> login(String login, String password) async {
    final url = Uri.parse('$baseUrl/login');
    try {
      final response = await http.post(
        url,
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"login": login, "password": password}),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to login: ${response.body}');
      }
    } catch (e) {
      throw Exception('Error connecting to API: $e');
    }
  }

  // Register API
  Future<Map<String, dynamic>> register({
    required String firstName,
    required String lastName,
    required String login,
    required String password,
    required String email,
    required String token,
    String? shareKey, // Optional Share Key
  }) async {
    final url = Uri.parse('$baseUrl/register');
    try {
      final response = await http.post(
        url,
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "FirstName": firstName,
          "LastName": lastName,
          "Login": login,
          "Password": password,
          "email": email,
          "token": token,
          "isVerified": false,
          "ShareKey": shareKey ?? '', // Include ShareKey if provided
        }),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to register: ${response.body}');
      }
    } catch (e) {
      throw Exception('Error connecting to API: $e');
    }
  }

  // Login API
  Future<Map<String, dynamic>> verifyUser(String login, String password) async {
    final url = Uri.parse('$baseUrl/verify_user');
    try {
      final response = await http.post(
        url,
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"login": login, "password": password}),
      );

      if (response.statusCode == 200) {
        return jsonDecode(response.body);
      } else {
        throw Exception('Failed to verify: ${response.body}');
      }
    } catch (e) {
      throw Exception('Error connecting to API: $e');
    }
  }
}

