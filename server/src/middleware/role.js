/**
 * Role-Based Access Control (RBAC) middleware
 * Ensures user has one of the allowed roles (USER, VERIFIER, ADMIN)
 */
const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Single string or array of strings
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to roles [${roles.join(', ')}]. Current role: ${req.user.role}`
      });
    }

    next();
  };
};

module.exports = { authorize };
