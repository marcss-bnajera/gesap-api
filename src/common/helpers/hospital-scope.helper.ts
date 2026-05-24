// Helper reutilizable para filtrado por hospital.
// SUPER_AUDITOR ve todo el sistema; todos los demás roles ven solo su hospital asignado.
// Uso: where: { ...getHospitalScope(user), ...otrosFilters }

export interface HospitalScopedUser {
    roleName: string;
    hospitalId: number | null;
}

export function getHospitalScope(user: HospitalScopedUser): { hospitalId?: number } {
    if (user.roleName === 'SUPER_AUDITOR') {
        return {};
    }
    return { hospitalId: user.hospitalId ?? undefined };
}
