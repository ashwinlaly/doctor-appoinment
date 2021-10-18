const errorFormatter = ({location, msg, param, value, nestedErrors}) => {
    return { msg, param }
}

module.exports = {
    errorFormatter
}