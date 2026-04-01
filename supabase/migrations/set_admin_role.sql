-- ============================================================
-- Asignar rol admin a un usuario por su email
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- Reemplazá 'TU_EMAIL@ejemplo.com' con el email con el que te registraste
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'TU_EMAIL@ejemplo.com'
);

-- Verificar que se aplicó correctamente:
SELECT p.id, p.username, p.role, u.email
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE p.role = 'admin';
