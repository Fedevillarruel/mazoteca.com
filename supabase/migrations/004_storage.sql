-- =============================================================================
-- Mazoteca — Storage Buckets & Policies
-- =============================================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 2097152, -- 2MB
   ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('cards', 'cards', true, 5242880, -- 5MB
   ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('listings', 'listings', true, 5242880,
   ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('physical-cards', 'physical-cards', false, 5242880,
   ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- ─── Avatars ──────────────────────────────────────────────────────────────────

-- Anyone can view avatars
CREATE POLICY "avatars_select_public" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- Users can upload their own avatar
CREATE POLICY "avatars_insert_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can update their own avatar
CREATE POLICY "avatars_update_own" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own avatar
CREATE POLICY "avatars_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ─── Cards (catalog images — admin only) ─────────────────────────────────────

CREATE POLICY "cards_select_public" ON storage.objects
  FOR SELECT USING (bucket_id = 'cards');

CREATE POLICY "cards_admin_manage" ON storage.objects
  FOR ALL USING (
    bucket_id = 'cards'
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ─── Listings (marketplace photos) ───────────────────────────────────────────

CREATE POLICY "listings_select_public" ON storage.objects
  FOR SELECT USING (bucket_id = 'listings');

CREATE POLICY "listings_insert_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'listings'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "listings_update_own" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'listings'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "listings_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'listings'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ─── Physical Cards (private album photos) ───────────────────────────────────

CREATE POLICY "physical_select_own" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'physical-cards'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "physical_insert_own" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'physical-cards'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "physical_update_own" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'physical-cards'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "physical_delete_own" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'physical-cards'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
