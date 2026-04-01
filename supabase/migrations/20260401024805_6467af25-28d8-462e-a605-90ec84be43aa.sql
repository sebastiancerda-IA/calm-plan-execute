
-- Drop the overly permissive update policy
drop policy "Authenticated users can update alerts" on public.alerts;

-- More restrictive: authenticated users can only update alerts (for resolving)
-- The WITH CHECK ensures the row remains valid after update
create policy "Authenticated users can resolve alerts" on public.alerts
  for update to authenticated
  using (true)
  with check (resolved = true);
