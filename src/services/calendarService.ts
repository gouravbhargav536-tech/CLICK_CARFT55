/**
 * Google Calendar Integration Module
 * Connects to Google Calendar API using Firebase Auth / OAuth credentials.
 */

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  location?: string;
  htmlLink?: string;
  status?: string;
  creator?: {
    email?: string;
  };
}

export interface ScheduleEventParams {
  summary: string;
  description?: string;
  start: string; // ISO string or natural date time
  end?: string;   // ISO string
  durationMinutes?: number;
  location?: string;
  accessToken?: string;
}

const GOOGLE_ACCESS_TOKEN_KEY = 'googleAccessToken';

export function getStoredGoogleAccessToken(): string | null {
  try {
    return localStorage.getItem(GOOGLE_ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredGoogleAccessToken(token: string): void {
  try {
    localStorage.setItem(GOOGLE_ACCESS_TOKEN_KEY, token);
  } catch (err) {
    console.error('Failed to store Google access token:', err);
  }
}

/**
 * Fetch upcoming events from Google Calendar API
 */
export async function listUpcomingEvents(
  maxResults = 10,
  tokenOverride?: string
): Promise<{ success: boolean; items: CalendarEvent[]; message?: string }> {
  const accessToken = tokenOverride || getStoredGoogleAccessToken() || undefined;

  try {
    const response = await fetch('/api/calendar/list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken, maxResults }),
    });

    if (!response.ok) {
      throw new Error(`Calendar list request failed with status ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      items: data.items || [],
      message: data.message,
    };
  } catch (error: any) {
    console.error('Error fetching Google Calendar events:', error);
    return {
      success: false,
      items: [],
      message: error?.message || 'Failed to connect to Google Calendar.',
    };
  }
}

/**
 * Schedule a new meeting/event directly on Google Calendar API
 */
export async function scheduleCalendarEvent(
  params: ScheduleEventParams
): Promise<{ success: boolean; event?: CalendarEvent; message?: string }> {
  const accessToken = params.accessToken || getStoredGoogleAccessToken() || undefined;

  try {
    const response = await fetch('/api/calendar/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accessToken,
        summary: params.summary,
        description: params.description,
        start: params.start,
        end: params.end,
        durationMinutes: params.durationMinutes || 30,
        location: params.location,
      }),
    });

    if (!response.ok) {
      throw new Error(`Calendar create request failed with status ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to schedule event');
    }

    return {
      success: true,
      event: data.event,
      message: data.message || `Successfully scheduled "${params.summary}" on Google Calendar.`,
    };
  } catch (error: any) {
    console.error('Error scheduling Google Calendar event:', error);
    return {
      success: false,
      message: error?.message || 'Failed to schedule meeting on Google Calendar.',
    };
  }
}
