import 'package:flutter/material.dart';
// import 'package:flutter_app/screens/LoginScreen.dart';
// import 'package:flutter_app/screens/CardsScreen.dart';

import '../screens/CardsScreen.dart';
import '../screens/LoginScreen.dart';
import '../screens/RegisterScreen.dart';


class Routes {
  static const String LOGINSCREEN = '/login';
  static const String CARDSSCREEN = '/cards';
  static const String REGISTERSCREEN = '/register';

  // routes of pages in the app
  static Map<String, Widget Function(BuildContext)> get getroutes => {
    '/': (context) => LoginScreen(),
    LOGINSCREEN: (context) => LoginScreen(),
    CARDSSCREEN: (context) => CreateScheduleScreen(),
    REGISTERSCREEN: (context) => RegisterScreen(),
  };
}
