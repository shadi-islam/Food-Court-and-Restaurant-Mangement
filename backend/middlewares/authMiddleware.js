import jwt from "jsonwebtoken";
export const protect=(req,res,next)=>{
   const token=req.cookies.token;
   console.log("[protect] Checking auth - Token present:", !!token, "Request from:", req.get('origin'));
   if(!token){
      console.log("[protect] No token - returning 401");
      return res.status(401).json({message:"Not Authorized",success:false})
   }
   try {
      const decoded=jwt.verify(token,process.env.JWT_SECRET);
      req.user=decoded;
      console.log("[protect] Token verified successfully for user:", decoded.id || decoded.email);
      next();
   } catch (error) {
      console.log("[protect] Token verification failed:", error.message);
      res.status(401).json({ message: "Invalid token" });
   }
}

export const adminOnly=(req,res,next)=>{
   const token=req.cookies.token;
    if(!token){
      console.log("[adminOnly] No token found in cookies");
      return res.status(401).json({message:"Not Authorized",success:false})
   }
   try {
      const decoded=jwt.verify(token,process.env.JWT_SECRET);
      req.user=decoded;

      // Accept either an explicit admin role or a matching configured admin email
      const isAdminRole = req.user?.adminLevel === "admin" || req.user?.adminLevel === "super_admin";
      const isAdminEmail =
        !!req.user?.email && req.user.email === process.env.ADMIN_EMAIL;

      // Debug logging (only in non-production)
      if (process.env.NODE_ENV !== "production") {
        console.log("[adminOnly] User:", {
          email: req.user?.email,
          adminLevel: req.user?.adminLevel,
          isAdminRole,
          isAdminEmail,
          configAdminEmail: process.env.ADMIN_EMAIL
        });
      }

      if (!isAdminRole && !isAdminEmail) {
        console.log("[adminOnly] Access denied - insufficient permissions");
        return res
          .status(403)
          .json({ message: "Admin access required", success: false });
      }

      return next();
   } catch (error) {
      console.log("[adminOnly] Token verification error:", error.message);
      res.status(401).json({ message: "Invalid token" });
   }
}

export const superAdminOnly = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Not Authorized", success: false });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Only super_admin can access this
    const isSuperAdmin = req.user?.adminLevel === "super_admin";
    const isSuperAdminEmail =
      !!req.user?.email && req.user.email === process.env.SUPER_ADMIN_EMAIL;

    if (!isSuperAdmin && !isSuperAdminEmail) {
      return res
        .status(403)
        .json({ message: "Super admin access required", success: false });
    }

    return next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
