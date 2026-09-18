-- TuneMart Schema Fix, Storage Setup & Seed Data

-- 1. Fix handle_new_user function with search_path and exception handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  user_role_val public.user_role := 'buyer';
  user_name TEXT;
BEGIN
  user_name := COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  
  IF NEW.raw_user_meta_data->>'role' = 'seller' THEN
    user_role_val := 'seller'::public.user_role;
  ELSIF NEW.raw_user_meta_data->>'role' = 'admin' THEN
    user_role_val := 'admin'::public.user_role;
  ELSE
    user_role_val := 'buyer'::public.user_role;
  END IF;

  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    user_name,
    COALESCE(NEW.email, ''),
    user_role_val
  )
  ON CONFLICT (id) DO UPDATE
  SET name = EXCLUDED.name,
      email = EXCLUDED.email;

  IF user_role_val = 'seller' THEN
    INSERT INTO public.seller_profiles (id, shop_name)
    VALUES (NEW.id, user_name)
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user trigger error: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 2. Add full_name column to profiles for compatibility
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
UPDATE public.profiles SET full_name = name WHERE full_name IS NULL;

-- 3. Seed Remaining Categories
INSERT INTO public.categories (name, slug, description, image_url) VALUES
('Violins / String Instruments', 'violins-strings', 'Acoustic and electric violins, cellos, double basses, and harps', 'https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?w=800'),
('Wind Instruments', 'wind-instruments', 'Flutes, saxophones, clarinets, trumpets, and harmonicas', 'https://images.unsplash.com/photo-1573871669414-010dbf73ca84?w=800'),
('Traditional Instruments', 'traditional-instruments', 'Sitars, tablas, harmoniums, veenas, and ethnic folk instruments', 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800'),
('Amplifiers / Speakers', 'amplifiers-speakers', 'Guitar amps, bass amps, stage monitors, and PA speaker systems', 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800')
ON CONFLICT (slug) DO NOTHING;

-- 4. Storage Buckets Setup
INSERT INTO storage.buckets (id, name, public) VALUES 
('product-images', 'product-images', true),
('product-videos', 'product-videos', true),
('profile-images', 'profile-images', true),
('seller-documents', 'seller-documents', false)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Storage Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access for Product Images' AND tablename = 'objects') THEN
    CREATE POLICY "Public Access for Product Images" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload Product Images' AND tablename = 'objects') THEN
    CREATE POLICY "Authenticated users can upload Product Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access for Product Videos' AND tablename = 'objects') THEN
    CREATE POLICY "Public Access for Product Videos" ON storage.objects FOR SELECT USING (bucket_id = 'product-videos');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload Product Videos' AND tablename = 'objects') THEN
    CREATE POLICY "Authenticated users can upload Product Videos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-videos' AND auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access for Profile Images' AND tablename = 'objects') THEN
    CREATE POLICY "Public Access for Profile Images" ON storage.objects FOR SELECT USING (bucket_id = 'profile-images');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload their own Profile Images' AND tablename = 'objects') THEN
    CREATE POLICY "Users can upload their own Profile Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'profile-images' AND auth.role() = 'authenticated');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Sellers can view own documents' AND tablename = 'objects') THEN
    CREATE POLICY "Sellers can view own documents" ON storage.objects FOR SELECT USING (bucket_id = 'seller-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Sellers can upload own documents' AND tablename = 'objects') THEN
    CREATE POLICY "Sellers can upload own documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'seller-documents' AND auth.uid()::text = (storage.foldername(name))[1]);
  END IF;
END $$;
