// Helper function used in your Login form submit handler
export function redirectUserByRole(role: string, router: any) {
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
      break;
  }
}
export default authRouter;
