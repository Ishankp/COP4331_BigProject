import 'package:emailjs/emailjs.dart' as emailjs;

class EmailService {
  static const String serviceId = 'service_qi1sbur';
  static const String templateId = 'template_xxz17ec';
  static const String publicKey = 'mfbP6q5wTnsFmAZvR';

  static Future<String> sendEmail({
    required String userEmail,
    required String message,
  }) async {
    Map<String, dynamic> templateParams = {
      'user_email': userEmail,
      'message': message
    };

    try {
      final result = await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        const emailjs.Options(
          publicKey: publicKey,
          privateKey: 'rF0X7uDNsJ-wfHhbcWrVD'
        ),
      );
      return result.toString();
    } catch (error) {
      return error.toString();
    }
  }
}