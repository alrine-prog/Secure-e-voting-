import { Router } from 'express';

const router = Router();

// Your route handlers go here
router.get('/', (req, res) => {
  res.send('Auth route working');
});

// Helper function (if still in this file)
export function redirectUserByRole(role: string, routerInstance: any) {
  switch (role) {
    case 'system_owner':
      routerInstance.push('/system-owner/universities');
      break;
    case 'uni_admin':
      routerInstance.push('/admin/dashboard');
      break;
    case 'staff':
      routerInstance.push('/staff/register-voter');
      break;
    case 'voter':
      routerInstance.push('/voter/ballot');
      break;
    case 'observer':
      routerInstance.push('/observer/live-tally');
      break;
    default:
      routerInstance.push('/unauthorized');
      break;
  }
}

export default router;
