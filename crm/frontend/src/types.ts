export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  cohort: string;
  enrollment_date: string;
  status: 'Active' | 'Completed' | 'Withdrawn';
}
