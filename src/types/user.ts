export interface UserBase {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar: string;
  status: string;
  last_login_at: string;
  last_login_ip: string;
  created_by: string;
  updated_by: string;
  deleted_at: string | null;
  preferences?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface User extends UserBase {
  permissions: string[];
}

export interface UserShowProps extends UserBase {
  permissions: { id: number; display_name: string }[];
}
