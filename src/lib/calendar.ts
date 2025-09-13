import { google } from 'googleapis';
import connectToDatabase from './mongodb';
import User from '@/models/User';

export async function getGoogleCalendarClient(userId: string) {
  await connectToDatabase();
  
  const user = await User.findById(userId);
  if (!user || !user.accessToken || !user.refreshToken) {
    throw new Error('User not found or not authenticated with Google Calendar');
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.NEXTAUTH_URL + '/api/auth/callback/google'
  );

  oauth2Client.setCredentials({
    access_token: user.accessToken,
    refresh_token: user.refreshToken,
  });

  // Handle token refresh
  oauth2Client.on('tokens', async (tokens) => {
    if (tokens.access_token) {
      user.accessToken = tokens.access_token;
      if (tokens.refresh_token) {
        user.refreshToken = tokens.refresh_token;
      }
      await user.save();
    }
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
}

export async function getCalendarEvents(userId: string, startDate: Date, endDate: Date) {
  try {
    const calendar = await getGoogleCalendarClient(userId);
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items || [];
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    throw error;
  }
}

export async function createCalendarEvent(
  userId: string,
  event: {
    summary: string;
    description?: string;
    start: { dateTime: string; timeZone?: string };
    end: { dateTime: string; timeZone?: string };
    attendees?: { email: string }[];
    conferenceData?: any;
  }
) {
  try {
    const calendar = await getGoogleCalendarClient(userId);
    
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        ...event,
        conferenceData: {
          createRequest: {
            requestId: Math.random().toString(36).substring(7),
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      },
      conferenceDataVersion: 1,
    });

    return response.data;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
}

export async function getFreeBusy(userId: string, startDate: Date, endDate: Date) {
  try {
    const calendar = await getGoogleCalendarClient(userId);
    
    const response = await calendar.freebusy.query({
      requestBody: {
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        items: [{ id: 'primary' }],
      },
    });

    return response.data.calendars?.primary?.busy || [];
  } catch (error) {
    console.error('Error fetching free/busy:', error);
    throw error;
  }
}

export function generateTimeSlots(
  startTime: string,
  endTime: string,
  date: Date,
  busyTimes: any[] = [],
  slotDuration: number = 60 // minutes
): { start: Date; end: Date }[] {
  const slots: { start: Date; end: Date }[] = [];
  
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const startDateTime = new Date(date);
  startDateTime.setHours(startHour, startMinute, 0, 0);
  
  const endDateTime = new Date(date);
  endDateTime.setHours(endHour, endMinute, 0, 0);
  
  let currentTime = new Date(startDateTime);
  
  while (currentTime < endDateTime) {
    const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000);
    
    if (slotEnd <= endDateTime) {
      // Check if this slot conflicts with any busy time
      const isAvailable = !busyTimes.some(busyTime => {
        const busyStart = new Date(busyTime.start);
        const busyEnd = new Date(busyTime.end);
        
        return (
          (currentTime >= busyStart && currentTime < busyEnd) ||
          (slotEnd > busyStart && slotEnd <= busyEnd) ||
          (currentTime <= busyStart && slotEnd >= busyEnd)
        );
      });
      
      if (isAvailable) {
        slots.push({
          start: new Date(currentTime),
          end: new Date(slotEnd),
        });
      }
    }
    
    currentTime = new Date(currentTime.getTime() + slotDuration * 60000);
  }
  
  return slots;
}