-- Create authentication function for contractors
CREATE OR REPLACE FUNCTION public.authenticate_contractor(contractor_email TEXT, contractor_password TEXT)
RETURNS TABLE(id UUID, email TEXT, name TEXT, status contractor_status) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.email, c.name, c.status
  FROM public.contractors c
  WHERE c.email = contractor_email
  AND c.password_hash = crypt(contractor_password, c.password_hash)
  AND c.status = 'approved';
END;
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.authenticate_contractor(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.authenticate_contractor(TEXT, TEXT) TO authenticated;