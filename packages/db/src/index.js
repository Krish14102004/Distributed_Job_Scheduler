// Runtime shim to re-export PrismaClient from @prisma/client
const { PrismaClient } = require('@prisma/client');
module.exports = { PrismaClient };
