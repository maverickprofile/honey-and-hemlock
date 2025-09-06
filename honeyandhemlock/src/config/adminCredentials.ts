
// Admin login credentials for Honey & Hemlock Productions
// These credentials should be created in Supabase Auth manually

export const ADMIN_CREDENTIALS = {
  email: 'admin',
  password: 'Neurobit@123',
  // Alternative admin email (backup)
  alternativeEmail: 'admin@honeyandhemlock.productions'
} as const;

// Note: These credentials need to be manually created in your Supabase Auth dashboard
// Go to: Authentication > Users > Add User
// Use username: admin
// Use password: Neurobit@123
// Make sure to set user_metadata.role = 'admin' for proper role assignment
