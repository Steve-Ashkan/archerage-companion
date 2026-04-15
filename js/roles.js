// ─── ROLES ────────────────────────────────────────────────────────────────────
// Single source of truth for the role hierarchy and permission checks.
// Every role inherits all permissions of roles below it.
//
// Hierarchy (lowest → highest):
//   free → pro → curator → staff → admin → dev

export const ROLE_LEVEL = {
  free:     0,
  pro:      1,
  curator:  2,
  staff:    3,
  admin:    4,
  dev:      5,
};

export const ROLE_LABELS = {
  free:     'Free',
  pro:      'Pro',
  curator:  'Curator',
  staff:    'Staff',
  admin:    'Admin',
  dev:      'Dev',
};

export const ROLE_COLORS = {
  free:     '#566174',
  pro:      '#ffd166',
  curator:  '#86efac',
  staff:    '#93c5fd',
  admin:    '#f472b6',
  dev:      '#c084fc',
};

// What each role can do — used by the admin panel and backend.
export const ROLE_PERMISSIONS = {
  free: [
    'access_free_features',
  ],
  pro: [
    'access_free_features',
    'access_pro_features',
    'submit_prices',
  ],
  curator: [
    'access_free_features',
    'access_pro_features',
    'submit_prices',
    'approve_items',
    'review_prices',
  ],
  staff: [
    'access_free_features',
    'access_pro_features',
    'submit_prices',
    'approve_items',
    'review_prices',
    'push_price_data',
    'run_scanner',
  ],
  admin: [
    'access_free_features',
    'access_pro_features',
    'submit_prices',
    'approve_items',
    'review_prices',
    'push_price_data',
    'run_scanner',
    'manage_users',
    'grant_pro',
    'assign_roles',
    'access_admin_panel',
  ],
  dev: [
    'access_free_features',
    'access_pro_features',
    'submit_prices',
    'approve_items',
    'review_prices',
    'push_price_data',
    'run_scanner',
    'manage_users',
    'grant_pro',
    'assign_roles',
    'access_admin_panel',
    'access_dev_tools',
    'force_states',
  ],
};

// Returns true if userRole meets or exceeds requiredRole.
export function hasRole(userRole, requiredRole) {
  return (ROLE_LEVEL[userRole] ?? 0) >= (ROLE_LEVEL[requiredRole] ?? 0);
}

// Returns true if the user has a specific permission.
export function hasPermission(userRole, permission) {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false;
}

// Returns true if userRole is exactly the given role (no inheritance).
export function isRole(userRole, role) {
  return userRole === role;
}

// All valid role keys lowest → highest (for logic/iteration).
export const ALL_ROLES = Object.keys(ROLE_LEVEL);

// All valid role keys highest → lowest (for display in dropdowns/pickers).
export const ALL_ROLES_DISPLAY = [...ALL_ROLES].reverse();
