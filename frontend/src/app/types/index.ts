export type User = {
  _id: string;
  name: string;
  email: string;
  role: 'client' | 'provider';
  availability?: {
    days: string[];
    startHour: number;
    endHour: number;
  };
};

export type Booking = {
  _id: string;
  client: User;
  provider: User;
  startTime: string;
  endTime: string;
  status: string;
};