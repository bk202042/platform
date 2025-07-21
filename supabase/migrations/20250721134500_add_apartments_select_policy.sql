CREATE POLICY "Allow read access to authenticated users" ON public.apartments FOR SELECT TO authenticated USING (true);
