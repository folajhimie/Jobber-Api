// import { UnAuthenticatedError } from "../errors/index.js";

const checkPermission = (requestUser, resourceUserId) => {
  if (requestUser._id === resourceUserId.toString()) 
  return res.status(401).json({
    status: false,
    message: 'Not authorized to access this route'
})
  
}

module.exports = checkPermission;