-- Adds the default categories for your (only) user.
-- Run this AFTER you created your user in Authentication > Users.
insert into public.categories (user_id, name, bucket, icon, color, sort_order)
select u.id, c.name, c.bucket, c.icon, c.color, c.sort_order
from (select id from auth.users order by created_at limit 1) u
cross join (values
  ('Housing','essentials','home','#38bdf8',1),
  ('Utilities','essentials','zap','#38bdf8',2),
  ('Groceries','essentials','shopping-basket','#38bdf8',3),
  ('Transport','essentials','car','#38bdf8',4),
  ('Insurance','essentials','shield','#38bdf8',5),
  ('Health','essentials','heart-pulse','#38bdf8',6),
  ('Dining Out','lifestyle','utensils','#a78bfa',7),
  ('Entertainment','lifestyle','clapperboard','#a78bfa',8),
  ('Subscriptions','lifestyle','repeat','#a78bfa',9),
  ('Shopping','lifestyle','shopping-bag','#a78bfa',10),
  ('Fitness','lifestyle','dumbbell','#a78bfa',11),
  ('Education','growth','graduation-cap','#34d399',12),
  ('Side Project','growth','rocket','#34d399',13),
  ('Savings Transfers','growth','piggy-bank','#34d399',14),
  ('Investments','growth','trending-up','#34d399',15),
  ('Debt Payments','growth','credit-card','#34d399',16),
  ('Gifts & Donations','other','gift','#fbbf24',17),
  ('Travel','other','plane','#fbbf24',18),
  ('Misc','other','circle','#fbbf24',19)
) as c(name, bucket, icon, color, sort_order);
