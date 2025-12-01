# Admin API Reference

> Admin and role management functions

---

## Convex Functions

### Queries

| Function | Description |
|----------|-------------|
| `admin.isCurrentUserAdmin` | Check if current user is admin |
| `admin.getCurrentUserRole` | Get current user's role |
| `admin.getAllUserSubscriptions` | Get all user subscriptions (admin only) |
| `admin.getAllUsers` | Get all users (admin only) |

### Internal Functions

The following functions are internal and not exposed publicly:
- `admin.promoteToAdmin` - Promote a user to admin role
- `admin.promoteFirstUserToAdmin` - Promote first user to admin
- `admin.migrateExistingUsers` - Migrate existing users
- `admin.setDefaultRole` - Set default role for new users
