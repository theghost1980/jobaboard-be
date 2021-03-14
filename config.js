require('dotenv').config();
module.exports = {
    'secret': process.env.JWT_SECRET,
    'moreSecret': process.env.StarWars,
    'authRouteEP': process.env.auth_route,
    'userEP': process.env.users_access,
    'testingData': process.env.testing_data,
    'apiHive': process.env.apiHive,
    'notiEP': process.env.access_notifications,
    'adminEP': process.env.admin_access,
    'jobEP': process.env.job_access,
    'nft_EP': process.env.nft_EP,
    'cloud_name': process.env.cloud_name,
    'api_key': process.env.api_key,
    'api_secret': process.env.api_secret,
    'SSC_node': process.env.ssc_node,
}