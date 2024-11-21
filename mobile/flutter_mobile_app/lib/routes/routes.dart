import 'package:flutter/material.dart';
// import 'package:flutter_app/screens/LoginScreen.dart';
// import 'package:flutter_app/screens/CreateScreen.dart';

import '../screens/CreateScreen.dart';
import '../screens/LoginScreen.dart';
import '../screens/RegisterScreen.dart';
import '../screens/DashboardScreen.dart';


class Routes {
  static const String LOGINSCREEN = '/login';
  static const String CREATESCREEN = '/create';
  static const String REGISTERSCREEN = '/register';
  static const String DASHBOARDSCREEN = '/dashboard';

  // routes of pages in the app
  static Map<String, Widget Function(BuildContext)> get getroutes => {
    '/': (context) => LoginScreen(),
    LOGINSCREEN: (context) => LoginScreen(),
    CREATESCREEN: (context) => CreateScheduleScreen(),
    REGISTERSCREEN: (context) => RegisterScreen(),
    // DASHBOARDSCREEN: (context) => DashboardScreen(),
  };
}
