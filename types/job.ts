export interface Job {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  salary?: string;
  jobType: string;
  experience?: string;
  skills?: string;
  requirements?: string;
  benefits?: string;
  isActive: boolean;
  isRemote: boolean;
  applicationDeadline?: string;
  postedById: string;
  createdAt: string;
  updatedAt: string;
}
