import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
) => {
  try {
    const sendEmailFunction = httpsCallable(functions, 'sendEmail');
    await sendEmailFunction({ to, subject, html });
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const generateAppointmentEmail = (
  type: 'confirmation' | 'rejection',
  data: {
    clientName: string;
    artistName: string;
    date: string;
    time: string;
    description: string;
  }
) => {
  const { clientName, artistName, date, time, description } = data;

  if (type === 'confirmation') {
    return {
      subject: 'Your ClickInk Appointment is Confirmed!',
      html: `
        <h1>Appointment Confirmed</h1>
        <p>Hi ${clientName},</p>
        <p>Your appointment with ${artistName} has been confirmed!</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li>Date: ${date}</li>
          <li>Time: ${time}</li>
          <li>Description: ${description}</li>
        </ul>
        <p>We look forward to seeing you!</p>
      `
    };
  }

  return {
    subject: 'ClickInk Appointment Update',
    html: `
      <h1>Appointment Status Update</h1>
      <p>Hi ${clientName},</p>
      <p>Unfortunately, ${artistName} is unable to accommodate your appointment request at this time.</p>
      <p><strong>Requested Details:</strong></p>
      <ul>
        <li>Date: ${date}</li>
        <li>Time: ${time}</li>
        <li>Description: ${description}</li>
      </ul>
      <p>Please try booking another time or explore other artists on ClickInk.</p>
    `
  };
};