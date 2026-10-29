export const SOFTWARE_DEPENDENCIA_ID = 2347;
export const SOFTWARE_OFICINA_ID = '22904003000100L';
export const SOFTWARE_DIRECCION_ID = '22904003000000L';
export const SOFTWARE_SECRETARIA_ID = '229';

export const canAccessDocumentosModulos = (user) => {
  if (!user) return false;

  if (Number(user.dependencia_id) === SOFTWARE_DEPENDENCIA_ID) return true;

  const oficinaId = user.dependencia?.oficina_id || user.oficina_id;
  if (String(oficinaId || '') === SOFTWARE_OFICINA_ID) return true;

  const direccionId = user.dependencia?.direccion_id || user.direccion_id;
  const secretariaId = user.dependencia?.secretaria_id || user.secretaria_id;

  return (
    String(secretariaId || '') === SOFTWARE_SECRETARIA_ID &&
    String(direccionId || '') === SOFTWARE_DIRECCION_ID &&
    String(oficinaId || '') === SOFTWARE_OFICINA_ID
  );
};
