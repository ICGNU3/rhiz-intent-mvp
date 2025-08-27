declare module 'ical' {
  interface ICalEvent {
    type: string;
    uid?: string;
    summary?: string;
    description?: string;
    start?: Date;
    end?: Date;
    attendee?: Array<{
      value: string;
      params?: {
        CN?: string;
        PARTSTAT?: string;
      };
    }>;
    organizer?: {
      value: string;
      params?: {
        CN?: string;
      };
    };
    location?: string;
  }

  interface ICalData {
    [key: string]: ICalEvent;
  }

  function parseICS(icsData: string): ICalData;
  
  export = {
    parseICS
  };
}
