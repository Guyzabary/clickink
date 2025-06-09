import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';

export const formatAppointmentDate = (date: string | Date | Timestamp): string => {
  if (!date) return '';

  try {
    if (date instanceof Timestamp) {
      return format(date.toDate(), 'MMMM d, yyyy');
    }
    if (typeof date === 'string') {
      return format(new Date(date), 'MMMM d, yyyy');
    }
    return format(date, 'MMMM d, yyyy');
  } catch (error) {
    console.error('Error formatting appointment date:', error);
    return '';
  }
};

export const formatAppointmentTime = (time: string): string => {
  if (!time) return '';

  try {
    return format(parse(time, 'HH:mm', new Date()), 'h:mm a');
  } catch (error) {
    console.error('Error formatting appointment time:', error);
    return time;
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
};

export const getStatusText = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export const ensureTimestamp = (date: any): Timestamp => {
  if (!date) return Timestamp.now();

  if (date instanceof Timestamp) {
    return date;
  }

  if (date.seconds) {
    return new Timestamp(date.seconds, date.nanoseconds || 0);
  }

  if (date instanceof Date) {
    return Timestamp.fromDate(date);
  }

  if (typeof date === 'string') {
    return Timestamp.fromDate(new Date(date));
  }

  if (typeof date === 'number') {
    return Timestamp.fromMillis(date);
  }

  return Timestamp.now();
};