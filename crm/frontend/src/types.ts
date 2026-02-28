export interface Student {
  id: string;
  tenant_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  age_grade?: string;
  education_level?: string;
  program_interest?: string[];
  experience_level?: string;
  language?: string;
  hear_about_us?: string;
  goals?: string;
  comments?: string;
  cohort: string;
  enrollment_date: string;
  status: 'Active' | 'Completed' | 'Withdrawn' | 'Inquiry';
}
