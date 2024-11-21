import 'package:flutter/material.dart';
import 'package:syncfusion_flutter_calendar/calendar.dart';

class CreateScheduleScreen extends StatefulWidget {
  @override
  _CreateScheduleScreenState createState() => _CreateScheduleScreenState();
}

class _CreateScheduleScreenState extends State<CreateScheduleScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Create Schedule'),
        actions: [
          IconButton(
            icon: Icon(Icons.add),
            onPressed: () {
              print('Add Event button pressed');
            },
          ),
          IconButton(
            icon: Icon(Icons.check),
            onPressed: () {
              print('Finish button pressed');
              Navigator.pushNamed(context, '/nextScreen');
            },
          ),
        ],
      ),
      body: SfCalendar(
        view: CalendarView.week,
        showDatePickerButton: false,
        allowedViews: [CalendarView.week],
        headerHeight: 0, // Removes the month header
        viewHeaderStyle: ViewHeaderStyle(
          dateTextStyle: TextStyle(fontSize: 0), // Hides the date text
          dayTextStyle: TextStyle(fontSize: 14, fontWeight: FontWeight.bold), // Keep days visible
        ),
        timeSlotViewSettings: TimeSlotViewSettings(
          timeInterval: Duration(hours: 1),
          timeFormat: 'h a',
          startHour: 6,
          endHour: 22,
          dayFormat: 'EEE', // Display short day names (e.g., Mon, Tue)
        ),
      ),
    );
  }
}
