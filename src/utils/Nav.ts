import type { NextRouter } from 'next/router';

// Define the valid user roles as a union type
export type UserRole = 
  | 'system_owner' 
  | 'uni_admin' 
  | 'staff' 
  | 'voter' 
  | 'observer';

export function redirectUserByRole(role: UserRole | string, router: NextRouter): void {
  switch (role) {
    case 'system_owner':
      router.push('/system-owner/universities');
      break;
    case 'uni_admin':
      router.push('/admin/dashboard');
      break;
    case 'staff':
      router.push('/staff/register-voter');
      break;
    case 'voter':
      router.push('/voter/ballot');
      break;
    case 'observer':
      router.push('/observer/live-tally');
      break;
    default:
      router.push('/unauthorized');
  }
}
