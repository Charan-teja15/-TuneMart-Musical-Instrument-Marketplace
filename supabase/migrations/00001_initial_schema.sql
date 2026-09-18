-- TuneMart Initial Schema

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Type Definitions
CREATE TYPE user_role AS ENUM ('buyer', 'seller', 'admin');
CREATE TYPE product_condition AS ENUM ('new', 'used', 'refurbished');
CREATE TYPE product_category AS ENUM (
  'Guitars',
  'Keyboards / Pianos',
  'Drums / Percussion',
  'Violins / String Instruments',
  'Wind Instruments',
  'Traditional Instruments',
  'Microphones / Audio Equipment',
  'Amplifiers / Speakers',
  'Studio Gear',
  'Accessories'
);
CREATE TYPE order_status AS ENUM ('placed', 'confirmed', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE offer_status AS ENUM ('pending', 'accepted', 'rejected', 'countered', 'expired');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');

-- 1. Profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'buyer',
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Seller Profiles
CREATE TABLE seller_profiles (
  id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  shop_name TEXT,
  description TEXT,
  location TEXT,
  verification_status verification_status DEFAULT 'pending',
  rating DECIMAL(3,2) DEFAULT 0.0,
  total_sales INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Seller Verifications
CREATE TABLE seller_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES seller_profiles(id) ON DELETE CASCADE NOT NULL,
  business_details JSONB,
  documents JSONB,
  status verification_status DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name product_category NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES seller_profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE RESTRICT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  original_price DECIMAL(10,2),
  condition product_condition NOT NULL,
  location TEXT NOT NULL,
  specifications JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  is_approved BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Used Condition Report
CREATE TABLE used_condition_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE UNIQUE NOT NULL,
  overall TEXT,
  body TEXT,
  neck TEXT,
  strings TEXT,
  electronics TEXT,
  cosmetic TEXT,
  damage_details TEXT,
  damage_images JSONB DEFAULT '[]'::jsonb,
  year_of_manufacture TEXT,
  modifications TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Product Media
CREATE TABLE product_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  storage_path TEXT NOT NULL,
  media_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Inventory
CREATE TABLE inventory (
  product_id UUID REFERENCES products(id) ON DELETE CASCADE PRIMARY KEY,
  quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Wishlists
CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Wishlist Items
CREATE TABLE wishlist_items (
  wishlist_id UUID REFERENCES wishlists(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (wishlist_id, product_id)
);

-- 10. Carts
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Cart Items
CREATE TABLE cart_items (
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (cart_id, product_id)
);

-- 12. Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES profiles(id) ON DELETE RESTRICT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
  shipping_amount DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (shipping_amount >= 0),
  subtotal_amount DECIMAL(10,2) NOT NULL CHECK (subtotal_amount >= 0),
  shipping_address JSONB NOT NULL,
  payment_status payment_status DEFAULT 'pending',
  status order_status DEFAULT 'placed',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  status order_status NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE RESTRICT NOT NULL,
  seller_id UUID REFERENCES seller_profiles(id) ON DELETE RESTRICT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
  subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE RESTRICT NOT NULL,
  provider_reference TEXT,
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  status payment_status DEFAULT 'pending',
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Offers
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES seller_profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
  counter_amount DECIMAL(10,2) CHECK (counter_amount >= 0),
  message TEXT,
  status offer_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. Conversations
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE conversation_participants (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (conversation_id, user_id)
);

-- 17. Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  seller_id UUID REFERENCES seller_profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (reviewer_id, product_id)
);

-- 19. Reports
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reported_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  admin_resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_offers_buyer ON offers(buyer_id);
CREATE INDEX idx_offers_seller ON offers(seller_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);

-- Create Triggers to update 'updated_at' columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_seller_profiles_modtime BEFORE UPDATE ON seller_profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_products_modtime BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_carts_modtime BEFORE UPDATE ON carts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_orders_modtime BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_offers_modtime BEFORE UPDATE ON offers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_conversations_modtime BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE used_condition_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Security Policies

-- Profiles: Anyone can view profiles (needed for sellers, etc). Users can update own profile.
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Seller Profiles: Public read. Sellers can update own.
CREATE POLICY "Public seller profiles are viewable by everyone." ON seller_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own seller profile." ON seller_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Sellers can update own profile." ON seller_profiles FOR UPDATE USING (auth.uid() = id);

-- Categories: Public read. Admin all.
CREATE POLICY "Categories are viewable by everyone." ON categories FOR SELECT USING (true);

-- Products: 
-- Public read for active and approved.
CREATE POLICY "Products are viewable by everyone if active and approved." ON products FOR SELECT USING (is_active = true AND is_approved = true);
-- Sellers can read their own products (even unapproved/inactive).
CREATE POLICY "Sellers can view own products." ON products FOR SELECT USING (auth.uid() = seller_id);
-- Sellers can insert their own products.
CREATE POLICY "Sellers can insert own products." ON products FOR INSERT WITH CHECK (auth.uid() = seller_id);
-- Sellers can update their own products.
CREATE POLICY "Sellers can update own products." ON products FOR UPDATE USING (auth.uid() = seller_id);
-- Sellers can delete their own products.
CREATE POLICY "Sellers can delete own products." ON products FOR DELETE USING (auth.uid() = seller_id);

-- Used Condition Reports
CREATE POLICY "Public read for condition reports." ON used_condition_reports FOR SELECT USING (true);
CREATE POLICY "Sellers manage condition reports for own products." ON used_condition_reports USING (
  EXISTS (SELECT 1 FROM products WHERE products.id = used_condition_reports.product_id AND products.seller_id = auth.uid())
);

-- Product Media
CREATE POLICY "Public read for product media." ON product_media FOR SELECT USING (true);
CREATE POLICY "Sellers manage media for own products." ON product_media USING (
  EXISTS (SELECT 1 FROM products WHERE products.id = product_media.product_id AND products.seller_id = auth.uid())
);

-- Inventory
CREATE POLICY "Public read for inventory." ON inventory FOR SELECT USING (true);
CREATE POLICY "Sellers manage inventory for own products." ON inventory USING (
  EXISTS (SELECT 1 FROM products WHERE products.id = inventory.product_id AND products.seller_id = auth.uid())
);

-- Wishlists
CREATE POLICY "Users can view own wishlist." ON wishlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wishlist." ON wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wishlist." ON wishlists FOR UPDATE USING (auth.uid() = user_id);

-- Wishlist Items
CREATE POLICY "Users can manage own wishlist items." ON wishlist_items USING (
  EXISTS (SELECT 1 FROM wishlists WHERE wishlists.id = wishlist_items.wishlist_id AND wishlists.user_id = auth.uid())
);

-- Carts
CREATE POLICY "Users can view own cart." ON carts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cart." ON carts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Cart Items
CREATE POLICY "Users can manage own cart items." ON cart_items USING (
  EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
);

-- Orders
CREATE POLICY "Buyers can view own orders." ON orders FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Buyers can insert own orders." ON orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Order Items
CREATE POLICY "Buyers can view own order items." ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.buyer_id = auth.uid())
);
CREATE POLICY "Sellers can view own order items." ON order_items FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Buyers can insert own order items." ON order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.buyer_id = auth.uid())
);

-- Order Status History
CREATE POLICY "Buyers can view own order status history." ON order_status_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_status_history.order_id AND orders.buyer_id = auth.uid())
);

-- Payments
CREATE POLICY "Buyers can view own payments." ON payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = payments.order_id AND orders.buyer_id = auth.uid())
);

-- Offers
CREATE POLICY "Users can view own offers." ON offers FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Buyers can insert offers." ON offers FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Participants can update offers." ON offers FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Conversations and Messages
CREATE POLICY "Participants can view conversations." ON conversations FOR SELECT USING (
  EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_participants.conversation_id = id AND conversation_participants.user_id = auth.uid())
);
CREATE POLICY "Participants can view messages." ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_participants.conversation_id = messages.conversation_id AND conversation_participants.user_id = auth.uid())
);
CREATE POLICY "Participants can insert messages." ON messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_participants.conversation_id = messages.conversation_id AND conversation_participants.user_id = auth.uid())
  AND auth.uid() = sender_id
);
CREATE POLICY "Participants can insert conversation_participants." ON conversation_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Reviews
CREATE POLICY "Reviews are viewable by everyone if approved." ON reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can insert own review." ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Users can update own review." ON reviews FOR UPDATE USING (auth.uid() = reviewer_id);

-- Setup Auth trigger for creating profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'buyer'::user_role)
  );

  IF (NEW.raw_user_meta_data->>'role') = 'seller' THEN
    INSERT INTO public.seller_profiles (id, shop_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Seed Categories
INSERT INTO categories (name, slug, description, image_url) VALUES 
('Guitars', 'guitars', 'Electric, acoustic, and bass guitars', 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800'),
('Keyboards / Pianos', 'keyboards-pianos', 'Synthesizers, digital pianos, and MIDI controllers', 'https://images.unsplash.com/photo-1552422535-c45813c61732?w=800'),
('Drums / Percussion', 'drums-percussion', 'Acoustic kits, electronic drums, and cymbals', 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=800'),
('Studio Gear', 'studio-gear', 'Audio interfaces, monitors, and recording equipment', 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800'),
('Microphones / Audio Equipment', 'microphones', 'Condenser, dynamic, and ribbon microphones', 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800'),
('Accessories', 'accessories', 'Cables, stands, cases, and strings', 'https://images.unsplash.com/photo-1550985543-f47f38aeea53?w=800')
ON CONFLICT DO NOTHING;
