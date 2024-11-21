import app_name from "./Consts";
import emailjs from 'emailjs-com';

export function buildPath(route: string): string {
    return process.env.NODE_ENV !== 'development'
        ? 'http://' + app_name + ':5000/' + route
        : 'http://localhost:5000/' + route;
}

export async function sendEmail(message: string, email_address: string) {
    const result = await emailjs.send(
        'service_qi1sbur',
        'template_xxz17ec',
        {
        user_email: email_address,
        message: message,
        },
        'mfbP6q5wTnsFmAZvR'
    );
    return result;
}

export async function sendResetEmail(link: string, email_address: string) {
    const result = await emailjs.send(
        'service_qi1sbur',
        'template_p1dipwy',
        {
        user_email: email_address,
        link: link,
        },
        'mfbP6q5wTnsFmAZvR'
    );
    return result;
}