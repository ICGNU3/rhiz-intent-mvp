// Local type definitions for the web app
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  attendees: Array<{
    email: string;
    name?: string;
    responseStatus: 'accepted' | 'declined' | 'tentative' | 'needsAction';
  }>;
  organizer: {
    email: string;
    name?: string;
  };
  location?: string;
  source: 'google' | 'outlook' | 'ics';
}
