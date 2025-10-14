export default () => ({
    port: parseInt(process.env.PORT || '8080', 10),
    jwtAdminSecret: process.env.JWT_ADMIN_SECRET,
    jwtTeamSecret: process.env.JWT_TEAM_SECRET,
    jwtExpAdmin: process.env.JWT_EXP_ADMIN || '15m',
    jwtExpTeam: process.env.JWT_EXP_TEAM || '60m',
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL
    });