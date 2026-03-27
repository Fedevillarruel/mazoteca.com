// Production server for Hostinger Node.js hosting
// This file starts the Next.js standalone server

process.env.PORT = process.env.PORT || "3000";
process.env.HOSTNAME = "0.0.0.0";

require("./.next/standalone/server.js");
