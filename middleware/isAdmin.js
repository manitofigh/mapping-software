export function isAdmin(req, res, next) {
    if (req.user && req.user.role === 'admin') {
      return next();
    }
    res.redirect('/404');
}