export type JwtAdminPayload = { sub: string; role: 'admin'; email: string };
export type JwtTeamPayload = { sub: string; role: 'team'; teamId: string; sessionId: string };