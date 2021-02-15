require('dotenv').config();
module.exports = {
    'secret': process.env.JWT_SECRET,
    'moreSecret': process.env.StarWars,
    'authRouteEP': process.env.auth_route,
    'userEP': process.env.users_access,
}