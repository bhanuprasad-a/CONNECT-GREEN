const getRegistrationRole = (requestedRole) => {
    if (requestedRole === undefined || requestedRole === null || requestedRole === '') {
        return 'tourist';
    }
    return ['tourist', 'business'].includes(requestedRole) ? requestedRole : null;
};

module.exports = { getRegistrationRole };