-- Create a sample newsletter_emails table for email subscriptions
CREATE TABLE IF NOT EXISTS newsletter_emails (
    email TEXT PRIMARY KEY
);

-- Create a system user for seeding data if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE username = 'system') THEN
        INSERT INTO users (username, password, email, display_name, subscription_tier, activity_score, created_at, newsletter_subscription) 
        VALUES ('system', 'not_a_real_password', 'system@blendedcircle.com', 'System', 'free', 0, NOW(), false);
    END IF;
END $$;

-- Get system user id
DO $$
DECLARE
    system_id integer;
BEGIN
    SELECT id INTO system_id FROM users WHERE username = 'system';
    
    -- Sample chat spaces
    INSERT INTO chat_spaces (name, description, is_private, created_by_id, created_at)
    VALUES 
        ('General Discussion', 'A place for all members to discuss general topics', false, system_id, NOW()),
        ('Step-Parenting Support', 'Support and advice for step-parents', false, system_id, NOW()),
        ('Co-Parenting Strategies', 'Strategies and tips for effective co-parenting', false, system_id, NOW()),
        ('Blended Family Success', 'Share your success stories and challenges', false, system_id, NOW())
    ON CONFLICT (id) DO NOTHING;

    -- Sample events
    INSERT INTO events (title, description, event_type, start_date, end_date, image_url, location, is_virtual, max_attendees, created_by_id, created_at)
    VALUES 
        ('Effective Communication in Blended Families', 'Join family therapist Dr. Angela Martinez as she shares practical communication strategies for blended families.', 'workshop', 
         NOW() + INTERVAL '1 month 15 days', NOW() + INTERVAL '1 month 15 days 1 hour 30 minutes', 
         'https://images.unsplash.com/photo-1543269865-cbf427effbad', 'Zoom', true, 100, system_id, NOW()),
         
        ('Virtual Family Game Night', 'Bring the whole family for a fun evening of virtual games designed to strengthen family bonds across households.', 'social',
         NOW() + INTERVAL '1 month 22 days', NOW() + INTERVAL '1 month 22 days 2 hours',
         'https://images.unsplash.com/photo-1529156069898-49953e39b3ac', 'Zoom', true, 50, system_id, NOW()),
         
        ('Co-Parenting Success Strategies', 'Expert panel discussion featuring family counselors and successful co-parents sharing their insights.', 'live',
         NOW() + INTERVAL '2 months 3 days', NOW() + INTERVAL '2 months 3 days 1 hour 30 minutes',
         'https://images.unsplash.com/photo-1573497620053-ea5300f94f21', 'Zoom', true, 200, system_id, NOW())
    ON CONFLICT (id) DO NOTHING;
END $$;

-- Sample products (no user association needed)
INSERT INTO products (name, description, price, image_url, inventory, created_at)
VALUES
    ('DIY Blended Family Painting Kit', 'Custom family painting kit with your submitted family photo printed on canvas - Pre-order Only', 2499, 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b', 0, NOW()),
    ('Blended Family Planner', 'A specialized planner designed for managing blended family schedules', 3499, 'https://images.unsplash.com/photo-1506784365847-bbad939e9335', 50, NOW()),
    ('Family Communication Cards', 'Card prompts to facilitate meaningful conversations between family members', 1999, 'https://images.unsplash.com/photo-1596495718165-fb1f85de159c', 75, NOW())
ON CONFLICT (id) DO NOTHING;