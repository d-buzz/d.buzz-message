const { utils } = require("./../services");
const CONSTANTS = require("../config/constants");

module.exports = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.json(
      utils.jsonResponse(
        null,
        CONSTANTS.SIGN_INVALID,
        CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
      )
    );
  }
  try {
    const validateToken = utils.validateJwt(token);
    if (validateToken) {
      req.body.useKeychain = validateToken.useKeychain
      req.body.hash = validateToken.hash;
      if (validateToken.useKeychain) {
        return next();
      } else {
        if (validateToken.hash) {
          return next();
        } else {
          return res.json(
            utils.jsonResponse(
              null,
              CONSTANTS.SIGN_INVALID,
              CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
            )
          );
        }
      }
    } else {
      return res.json(
        utils.jsonResponse(
          null,
          CONSTANTS.SIGN_INVALID,
          CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
        )
      );
    }
  } catch (error) {
    return res.json(
      utils.jsonResponse(
        null,
        error.message,
        CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE
      )
    );
  }
};
