export const BD_DEPENDENCIA_ID = 29;
export const BD_OFICINA_ID = '20502004000200S';

export const canAccessDocumentosModulos = (user) => {
  if (!user) return false;
  if (String(user.profile) === '1') return true;
  if (Number(user.dependencia_id) === BD_DEPENDENCIA_ID) return true;
  const oficinaId = user.dependencia?.oficina_id || user.oficina_id;
  return String(oficinaId || '') === BD_OFICINA_ID;
};
