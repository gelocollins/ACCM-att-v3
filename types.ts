
export interface Branch {
  id: string;
  name: string;
}

export interface Employee {
  id: string;
  name: string;
  registration_photo_url: string;
  branch_id: string;
}

export interface AttendanceRecord {
  id: string;
  time_in: string;
  time_in_photo_url: string;
  time_out: string | null;
  time_out_photo_url: string | null;
  employee_id: string;
  employee: {
      name: string;
      registration_photo_url: string;
  };
}

export type AppView = 'BRANCH_SELECT' | 'HOME' | 'REGISTER' | 'TIME_CLOCK' | 'ADMIN';
