<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Roles
        $roles = [
            ['name' => 'SUPER_ADMIN', 'display_name' => 'Super Administrator', 'description' => 'Full unrestricted system access'],
            ['name' => 'ADMIN', 'display_name' => 'Administrator', 'description' => 'General store administration'],
            ['name' => 'PRODUCT_MANAGER', 'display_name' => 'Product Manager', 'description' => 'Catalog, category, and collection management'],
            ['name' => 'INVENTORY_MANAGER', 'display_name' => 'Inventory Manager', 'description' => 'Stock balance adjustments and warehouse tracking'],
            ['name' => 'ORDER_MANAGER', 'display_name' => 'Order Manager', 'description' => 'Order fulfillment and shipping updates'],
            ['name' => 'MARKETING_MANAGER', 'display_name' => 'Marketing Manager', 'description' => 'Coupons, offers, hero banners, and popups'],
        ];

        foreach ($roles as $role) {
            DB::table('roles')->updateOrInsert(['name' => $role['name']], array_merge($role, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // 2. Seed Granular Permissions
        $permissions = [
            // Catalog
            ['name' => 'products.view', 'module' => 'catalog', 'description' => 'View products'],
            ['name' => 'products.create', 'module' => 'catalog', 'description' => 'Create products and variants'],
            ['name' => 'products.update', 'module' => 'catalog', 'description' => 'Update products and variants'],
            ['name' => 'products.delete', 'module' => 'catalog', 'description' => 'Delete products'],
            
            ['name' => 'categories.view', 'module' => 'catalog', 'description' => 'View categories'],
            ['name' => 'categories.create', 'module' => 'catalog', 'description' => 'Create categories'],
            ['name' => 'categories.update', 'module' => 'catalog', 'description' => 'Update categories'],
            ['name' => 'categories.delete', 'module' => 'catalog', 'description' => 'Delete categories'],

            // Inventory
            ['name' => 'inventory.view', 'module' => 'inventory', 'description' => 'View inventory stock balances'],
            ['name' => 'inventory.update', 'module' => 'inventory', 'description' => 'Adjust stock and record inventory transactions'],

            // Orders
            ['name' => 'orders.view', 'module' => 'orders', 'description' => 'View order history'],
            ['name' => 'orders.update', 'module' => 'orders', 'description' => 'Update order processing status'],
            ['name' => 'orders.cancel', 'module' => 'orders', 'description' => 'Cancel orders'],
            ['name' => 'orders.refund', 'module' => 'orders', 'description' => 'Issue order refunds'],

            // Customers
            ['name' => 'customers.view', 'module' => 'customers', 'description' => 'View customer profiles'],
            ['name' => 'customers.update', 'module' => 'customers', 'description' => 'Update customer status'],

            // Reviews
            ['name' => 'reviews.view', 'module' => 'reviews', 'description' => 'View product reviews'],
            ['name' => 'reviews.moderate', 'module' => 'reviews', 'description' => 'Approve or reject customer reviews'],

            // Coupons & Offers
            ['name' => 'coupons.view', 'module' => 'marketing', 'description' => 'View promo coupons'],
            ['name' => 'coupons.create', 'module' => 'marketing', 'description' => 'Create coupons'],
            ['name' => 'coupons.update', 'module' => 'marketing', 'description' => 'Update coupons'],
            ['name' => 'coupons.delete', 'module' => 'marketing', 'description' => 'Disable or delete coupons'],

            ['name' => 'offers.view', 'module' => 'marketing', 'description' => 'View promotional offers'],
            ['name' => 'offers.create', 'module' => 'marketing', 'description' => 'Create offers'],
            ['name' => 'offers.update', 'module' => 'marketing', 'description' => 'Update offers'],
            ['name' => 'offers.delete', 'module' => 'marketing', 'description' => 'Delete offers'],

            // CMS
            ['name' => 'homepage.view', 'module' => 'cms', 'description' => 'View homepage section layouts'],
            ['name' => 'homepage.update', 'module' => 'cms', 'description' => 'Update homepage sections'],
            ['name' => 'banners.view', 'module' => 'cms', 'description' => 'View hero banners'],
            ['name' => 'banners.create', 'module' => 'cms', 'description' => 'Create hero banners'],
            ['name' => 'banners.update', 'module' => 'cms', 'description' => 'Update hero banners'],
            ['name' => 'banners.delete', 'module' => 'cms', 'description' => 'Delete hero banners'],
            ['name' => 'popups.view', 'module' => 'cms', 'description' => 'View promotional popups'],
            ['name' => 'popups.create', 'module' => 'cms', 'description' => 'Create popups'],
            ['name' => 'popups.update', 'module' => 'cms', 'description' => 'Update popups'],
            ['name' => 'popups.delete', 'module' => 'cms', 'description' => 'Delete popups'],

            // Reports & Settings
            ['name' => 'reports.view', 'module' => 'reports', 'description' => 'View sales & analytics dashboard reports'],
            ['name' => 'settings.view', 'module' => 'settings', 'description' => 'View system settings'],
            ['name' => 'settings.update', 'module' => 'settings', 'description' => 'Update store settings'],

            // Admin Users & RBAC
            ['name' => 'users.view', 'module' => 'users', 'description' => 'View admin users'],
            ['name' => 'users.create', 'module' => 'users', 'description' => 'Create admin users'],
            ['name' => 'users.update', 'module' => 'users', 'description' => 'Update admin users and roles'],
            ['name' => 'users.delete', 'module' => 'users', 'description' => 'Disable or remove admin users'],
        ];

        foreach ($permissions as $perm) {
            DB::table('permissions')->updateOrInsert(['name' => $perm['name']], array_merge($perm, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // 3. Role-Permission Matrix Assignment
        $roleMap = [
            'SUPER_ADMIN' => DB::table('permissions')->pluck('name')->toArray(),
            'ADMIN' => DB::table('permissions')->where('name', 'not like', 'users.%')->pluck('name')->toArray(),
            'PRODUCT_MANAGER' => ['products.view', 'products.create', 'products.update', 'products.delete', 'categories.view', 'categories.create', 'categories.update', 'categories.delete'],
            'INVENTORY_MANAGER' => ['inventory.view', 'inventory.update'],
            'ORDER_MANAGER' => ['orders.view', 'orders.update', 'orders.cancel', 'orders.refund'],
            'MARKETING_MANAGER' => [
                'coupons.view', 'coupons.create', 'coupons.update', 'coupons.delete',
                'offers.view', 'offers.create', 'offers.update', 'offers.delete',
                'homepage.view', 'homepage.update', 'banners.view', 'banners.create', 'banners.update', 'banners.delete',
                'popups.view', 'popups.create', 'popups.update', 'popups.delete'
            ],
        ];

        foreach ($roleMap as $roleName => $permNames) {
            $roleId = DB::table('roles')->where('name', $roleName)->value('id');
            $permIds = DB::table('permissions')->whereIn('name', $permNames)->pluck('id');

            foreach ($permIds as $pId) {
                DB::table('permission_role')->updateOrInsert([
                    'permission_id' => $pId,
                    'role_id' => $roleId,
                ]);
            }
        }

        // 4. Seed Super Admin User
        $superAdminRoleId = DB::table('roles')->where('name', 'SUPER_ADMIN')->value('id');

        // Update any legacy admin email to admin@arilha.com if present
        DB::table('users')->where('email', 'admin@femmeera.com')->update([
            'email' => 'admin@arilha.com',
            'name' => 'ARILHA Administrator',
        ]);

        $existingAdmin = DB::table('users')->where('email', 'admin@arilha.com')->orWhere('phone', '9999999999')->first();

        if ($existingAdmin) {
            DB::table('users')->where('id', $existingAdmin->id)->update([
                'email' => 'admin@arilha.com',
                'name' => 'ARILHA Administrator',
                'password' => Hash::make('Admin@Arilha2026!'),
                'user_type' => 'ADMIN',
                'status' => 'ACTIVE',
                'updated_at' => now(),
            ]);
            $adminId = $existingAdmin->id;
        } else {
            $adminId = DB::table('users')->insertGetId([
                'name' => 'ARILHA Administrator',
                'email' => 'admin@arilha.com',
                'phone' => '9999999999',
                'password' => Hash::make('Admin@Arilha2026!'),
                'user_type' => 'ADMIN',
                'status' => 'ACTIVE',
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $adminId = DB::table('users')->where('email', 'admin@arilha.com')->value('id');

        if ($adminId) {
            DB::table('role_user')->updateOrInsert([
                'role_id' => $superAdminRoleId,
                'user_id' => $adminId,
            ]);
        }

        // 5. Seed Dynamic Categories for ARILHA Jewellery
        $womenRootId = DB::table('categories')->where('slug', 'women')->value('id');

        if (!$womenRootId) {
            $womenRootId = DB::table('categories')->insertGetId([
                'parent_id' => null,
                'name' => 'Women',
                'slug' => 'women',
                'description' => 'ARILHA Jewellery Catalogue',
                'sort_order' => 1,
                'status' => 'ACTIVE',
                'seo_title' => 'Jewellery Collection | ARILHA',
                'seo_description' => 'Discover modern Indian jewellery by Irsa Khan at ARILHA.',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $tradId = DB::table('categories')->where('slug', 'kundan-festive')->value('id');
        if (!$tradId) {
            $tradId = DB::table('categories')->insertGetId([
                'parent_id' => $womenRootId,
                'name' => 'Kundan & Festive Jewellery',
                'slug' => 'kundan-festive',
                'description' => 'Exquisite handcrafted Kundan chokers, bridal necklaces, and royal festive jewellery.',
                'sort_order' => 1,
                'status' => 'ACTIVE',
                'seo_title' => 'Kundan & Bridal Jewellery | ARILHA',
                'seo_description' => 'Explore handcrafted Kundan chokers and royal bridal jewellery at ARILHA.',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            DB::table('categories')->where('id', $tradId)->update([
                'name' => 'Kundan & Festive Jewellery',
                'description' => 'Exquisite handcrafted Kundan chokers, bridal necklaces, and royal festive jewellery.',
                'seo_title' => 'Kundan & Bridal Jewellery | ARILHA',
                'seo_description' => 'Explore handcrafted Kundan chokers and royal bridal jewellery at ARILHA.',
            ]);
        }

        $westId = DB::table('categories')->where('slug', 'everyday-jewellery')->value('id');
        if (!$westId) {
            $westId = DB::table('categories')->insertGetId([
                'parent_id' => $womenRootId,
                'name' => 'Everyday & Anti-Tarnish Jewellery',
                'slug' => 'everyday-jewellery',
                'description' => 'Modern anti-tarnish hoops, gold-plated stacking rings, layered chains, and daily bangles.',
                'sort_order' => 2,
                'status' => 'ACTIVE',
                'seo_title' => 'Anti-Tarnish & Gold-Plated Jewellery | ARILHA',
                'seo_description' => 'Explore modern anti-tarnish and gold-plated everyday jewellery by Irsa Khan.',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            DB::table('categories')->where('id', $westId)->update([
                'name' => 'Everyday & Anti-Tarnish Jewellery',
                'description' => 'Modern anti-tarnish hoops, gold-plated stacking rings, layered chains, and daily bangles.',
                'seo_title' => 'Anti-Tarnish & Gold-Plated Jewellery | ARILHA',
                'seo_description' => 'Explore modern anti-tarnish and gold-plated everyday jewellery by Irsa Khan.',
            ]);
        }

        // 6. Seed Demo Products, Variants & Inventory (ARILHA Jewellery Catalogue)
        $productsData = [
            [
                'category_id' => $tradId,
                'name' => 'Royal Kundan Choker Necklace Set',
                'slug' => 'royal-kundan-choker-necklace-set',
                'sku' => 'ARL-KUN-CHK-001',
                'short_description' => 'Handcrafted Kundan choker set with matching drop earrings.',
                'description' => 'Immerse yourself in royal elegance with our Royal Kundan Choker Necklace Set. Featuring intricate Kundan stone setting, pearl drops, and an adjustable drawstring closure for weddings and festive occasions.',
                'brand' => 'ARILHA',
                'gender' => 'WOMEN',
                'status' => 'ACTIVE',
                'is_featured' => 1,
                'is_new' => 1,
                'is_best_seller' => 1,
                'images' => [
                    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1200&auto=format&fit=crop',
                    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1200&auto=format&fit=crop',
                ],
                'variants' => [
                    ['sku' => 'ARL-CHK-001-GLD-FS', 'size' => 'Free Size', 'color' => 'Royal Gold', 'mrp' => 4999.00, 'price' => 3499.00, 'stock' => 20],
                    ['sku' => 'ARL-CHK-001-GRN-FS', 'size' => 'Free Size', 'color' => 'Emerald Green', 'mrp' => 4999.00, 'price' => 3499.00, 'stock' => 15],
                ]
            ],
            [
                'category_id' => $tradId,
                'name' => 'Handcrafted Pearl Drop Jhumkas',
                'slug' => 'handcrafted-pearl-drop-jhumkas',
                'sku' => 'ARL-JHM-PRL-001',
                'short_description' => 'Traditional gold-plated jhumkas with pearl drop fringe.',
                'description' => 'Add timeless grace to your outfit with our Handcrafted Pearl Drop Jhumkas. Designed with intricate gold-plating and lightweight pearl droplets for day-long comfort.',
                'brand' => 'ARILHA',
                'gender' => 'WOMEN',
                'status' => 'ACTIVE',
                'is_featured' => 1,
                'is_new' => 1,
                'is_best_seller' => 1,
                'images' => [
                    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1200&auto=format&fit=crop',
                ],
                'variants' => [
                    ['sku' => 'ARL-JHM-001-GLD-FS', 'size' => 'Free Size', 'color' => 'Gold', 'mrp' => 2299.00, 'price' => 1599.00, 'stock' => 30],
                ]
            ],
            [
                'category_id' => $westId,
                'name' => 'Floral Gold-Plated Cuff Bracelet',
                'slug' => 'floral-gold-plated-cuff-bracelet',
                'sku' => 'ARL-BRC-FLR-001',
                'short_description' => 'Textured floral gold-plated cuff bracelet for everyday elegance.',
                'description' => 'Elevate your daily wristwear with our Floral Gold-Plated Cuff Bracelet. Features delicate embossed floral motifs and a comfortable slip-on fit.',
                'brand' => 'ARILHA',
                'gender' => 'WOMEN',
                'status' => 'ACTIVE',
                'is_featured' => 1,
                'is_new' => 1,
                'is_best_seller' => 1,
                'images' => [
                    'https://images.unsplash.com/photo-1611591475140-4388636a26f6?q=80&w=1200&auto=format&fit=crop',
                ],
                'variants' => [
                    ['sku' => 'ARL-BRC-001-GLD-FS', 'size' => 'Free Size', 'color' => 'Warm Gold', 'mrp' => 2499.00, 'price' => 1899.00, 'stock' => 25],
                ]
            ],
            [
                'category_id' => $westId,
                'name' => 'Anti-Tarnish Daily Gold Hoops',
                'slug' => 'anti-tarnish-daily-gold-hoops',
                'sku' => 'ARL-EAR-HOP-001',
                'short_description' => 'Sleek anti-tarnish gold-plated daily hoop earrings.',
                'description' => 'Designed for everyday wear, these lightweight anti-tarnish gold hoops resist water splashes and skin oil discoloration. Perfect for work, brunch, and workouts.',
                'brand' => 'ARILHA',
                'gender' => 'WOMEN',
                'status' => 'ACTIVE',
                'is_featured' => 1,
                'is_new' => 1,
                'is_best_seller' => 1,
                'images' => [
                    'https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=1200&auto=format&fit=crop',
                ],
                'variants' => [
                    ['sku' => 'ARL-HOP-001-GLD-FS', 'size' => 'Free Size', 'color' => 'Classic Gold', 'mrp' => 1799.00, 'price' => 1299.00, 'stock' => 40],
                ]
            ],
            [
                'category_id' => $westId,
                'name' => 'Rose Gold Stacking Ring Set',
                'slug' => 'rose-gold-stacking-ring-set',
                'sku' => 'ARL-RNG-STK-001',
                'short_description' => '3-piece stackable rose gold rings with crystal accents.',
                'description' => 'Style them together or separately. This 3-piece Rose Gold Stacking Ring Set features textured bands and solitaire crystal studs.',
                'brand' => 'ARILHA',
                'gender' => 'WOMEN',
                'status' => 'ACTIVE',
                'is_featured' => 1,
                'is_new' => 1,
                'is_best_seller' => 0,
                'images' => [
                    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1200&auto=format&fit=crop',
                ],
                'variants' => [
                    ['sku' => 'ARL-RNG-001-RSG-FS', 'size' => 'Free Size', 'color' => 'Rose Gold', 'mrp' => 1499.00, 'price' => 999.00, 'stock' => 35],
                ]
            ],
        ];

        foreach ($productsData as $prodData) {
            $variants = $prodData['variants'];
            unset($prodData['variants']);
            $images = $prodData['images'] ?? [];
            unset($prodData['images']);

            $productId = DB::table('products')->where('sku', $prodData['sku'])->value('id');

            if (!$productId) {
                $productId = DB::table('products')->insertGetId(array_merge($prodData, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ]));
            } else {
                DB::table('products')->where('id', $productId)->update(array_merge($prodData, [
                    'updated_at' => now(),
                ]));
            }

            foreach ($images as $sortIdx => $imgUrl) {
                DB::table('product_images')->updateOrInsert(
                    ['product_id' => $productId, 'image_url' => $imgUrl],
                    ['sort_order' => $sortIdx + 1, 'is_primary' => $sortIdx === 0 ? 1 : 0, 'created_at' => now(), 'updated_at' => now()]
                );
            }

            foreach ($variants as $var) {
                $variantId = DB::table('product_variants')->where('sku', $var['sku'])->value('id');

                if (!$variantId) {
                    $variantId = DB::table('product_variants')->insertGetId([
                        'product_id' => $productId,
                        'sku' => $var['sku'],
                        'size' => $var['size'],
                        'color' => $var['color'],
                        'mrp' => $var['mrp'],
                        'price' => $var['price'],
                        'stock' => $var['stock'],
                        'low_stock_threshold' => 5,
                        'status' => 'ACTIVE',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                DB::table('inventory')->updateOrInsert(
                    ['variant_id' => $variantId],
                    [
                        'available_quantity' => $var['stock'],
                        'reserved_quantity' => 0,
                        'low_stock_threshold' => 5,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
        }

        // 7. Seed Default System Settings for ARILHA
        $settings = [
            ['group_name' => 'general', 'key_name' => 'store_name', 'value_content' => 'ARILHA'],
            ['group_name' => 'general', 'key_name' => 'store_currency', 'value_content' => 'INR'],
            ['group_name' => 'general', 'key_name' => 'currency_symbol', 'value_content' => '₹'],
            ['group_name' => 'shipping', 'key_name' => 'free_shipping_threshold', 'value_content' => '1499'],
            ['group_name' => 'seo', 'key_name' => 'default_meta_title', 'value_content' => 'ARILHA — Modern Indian Jewellery | Anti-Tarnish & Everyday Jewellery'],
            ['group_name' => 'seo', 'key_name' => 'default_meta_description', 'value_content' => 'Discover ARILHA by Irsa Khan — modern Indian jewellery designed for everyday wear, celebrations and every version of you.'],
        ];

        foreach ($settings as $setting) {
            DB::table('settings')->updateOrInsert(['key_name' => $setting['key_name']], array_merge($setting, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // 8. Seed Homepage Sections
        $homepageSections = [
            ['type' => 'HERO', 'title' => 'ARILHA Jewellery Collection 2026', 'subtitle' => 'Modern Indian Jewellery by Irsa Khan', 'sort_order' => 1, 'status' => 'ACTIVE'],
            ['type' => 'CATEGORY_GRID', 'title' => 'Shop By Category', 'subtitle' => 'Explore Kundan, Anti-Tarnish & Everyday Edits', 'sort_order' => 2, 'status' => 'ACTIVE'],
            ['type' => 'PRODUCT_GRID', 'title' => 'Fresh New Arrivals', 'subtitle' => 'Handpicked for You', 'sort_order' => 3, 'status' => 'ACTIVE'],
            ['type' => 'BANNER', 'title' => 'Flat 10% Off Your First Order', 'subtitle' => 'Use code WELCOME10 at checkout', 'sort_order' => 4, 'status' => 'ACTIVE'],
        ];

        foreach ($homepageSections as $sec) {
            DB::table('homepage_sections')->updateOrInsert(['type' => $sec['type'], 'title' => $sec['title']], array_merge($sec, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // 9. Seed Shipping Methods
        $shippingMethods = [
            ['name' => 'Standard Delivery', 'description' => 'Reliable doorstep delivery across India in 3–5 business days.', 'price' => 49.00, 'estimated_min_days' => 3, 'estimated_max_days' => 5, 'status' => 'ACTIVE'],
            ['name' => 'Express Delivery', 'description' => 'Priority express delivery in 1–2 business days.', 'price' => 99.00, 'estimated_min_days' => 1, 'estimated_max_days' => 2, 'status' => 'ACTIVE'],
        ];

        foreach ($shippingMethods as $method) {
            DB::table('shipping_methods')->updateOrInsert(['name' => $method['name']], array_merge($method, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // 10. Seed Tax Rules
        $taxRules = [
            ['name' => 'GST Jewellery 3%', 'rate_percentage' => 3.00, 'is_inclusive' => 0, 'status' => 'ACTIVE'],
        ];

        foreach ($taxRules as $tax) {
            DB::table('tax_rules')->updateOrInsert(['name' => $tax['name']], array_merge($tax, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // 11. Seed Sample Coupons & Offers
        $coupons = [
            [
                'code' => 'WELCOME10',
                'name' => 'Welcome 10% Discount',
                'description' => 'Get 10% off on your first order.',
                'discount_type' => 'PERCENTAGE',
                'discount_value' => 10.00,
                'minimum_order_amount' => 499.00,
                'maximum_discount_amount' => 500.00,
                'usage_limit' => 1000,
                'usage_limit_per_customer' => 1,
                'start_at' => now()->subDays(1),
                'end_at' => now()->addMonths(6),
                'status' => 'ACTIVE',
            ],
            [
                'code' => 'ARILHA10',
                'name' => 'ARILHA Launch Offer 10% Off',
                'description' => 'Enjoy 10% flat discount on orders above ₹999.',
                'discount_type' => 'PERCENTAGE',
                'discount_value' => 10.00,
                'minimum_order_amount' => 999.00,
                'maximum_discount_amount' => 500.00,
                'usage_limit' => 500,
                'usage_limit_per_customer' => 2,
                'start_at' => now()->subDays(1),
                'end_at' => now()->addMonths(3),
                'status' => 'ACTIVE',
            ]
        ];

        foreach ($coupons as $c) {
            DB::table('coupons')->updateOrInsert(['code' => $c['code']], array_merge($c, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // 12. Seed Watch and Shop 9:16 Jewellery Reels
        $reels = [
            [
                'title' => 'Royal Kundan Choker Styling',
                'video_url' => 'https://assets.mixkit.co/videos/preview/mixkit-woman-posing-for-the-camera-in-a-studio-41337-large.mp4',
                'poster_url' => 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop',
                'product_url' => '/product/royal-kundan-choker-necklace-set',
                'button_text' => 'View Product',
                'sort_order' => 1,
                'status' => 'ACTIVE',
            ],
            [
                'title' => 'Handcrafted Pearl Drop Jhumkas',
                'video_url' => 'https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-red-dress-41334-large.mp4',
                'poster_url' => 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop',
                'product_url' => '/product/handcrafted-pearl-drop-jhumkas',
                'button_text' => 'View Product',
                'sort_order' => 2,
                'status' => 'ACTIVE',
            ],
            [
                'title' => 'Anti-Tarnish Everyday Hoops',
                'video_url' => 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-posing-in-a-flower-field-41335-large.mp4',
                'poster_url' => 'https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=600&auto=format&fit=crop',
                'product_url' => '/product/anti-tarnish-daily-gold-hoops',
                'button_text' => 'View Product',
                'sort_order' => 3,
                'status' => 'ACTIVE',
            ],
        ];

        foreach ($reels as $r) {
            DB::table('watch_and_shop_videos')->updateOrInsert(['title' => $r['title']], array_merge($r, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // 13. Seed Collections & Collection-Product Associations
        $collectionsSeed = [
            [
                'name' => 'Earrings',
                'slug' => 'earrings',
                'description' => 'Explore Arilha\'s collection of elegant earrings designed for everyday wear and special occasions.',
                'image_url' => 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop',
                'banner_url' => 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1600&auto=format&fit=crop',
                'seo_title' => 'Earrings | Anti-Tarnish & Gold Plated Jewellery | Arilha',
                'seo_description' => 'Explore Arilha\'s collection of elegant earrings designed for everyday wear and special occasions.',
                'sort_order' => 1,
                'status' => 'ACTIVE',
            ],
            [
                'name' => 'Chains',
                'slug' => 'chains',
                'description' => 'Sleek layered chains, gold pendants, and daily worn neckpieces.',
                'image_url' => 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
                'banner_url' => 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1600&auto=format&fit=crop',
                'seo_title' => 'Gold & Layered Chains | Arilha Jewellery',
                'seo_description' => 'Discover delicate, waterproof daily chains and statement gold neckpieces.',
                'sort_order' => 2,
                'status' => 'ACTIVE',
            ],
            [
                'name' => 'Rings',
                'slug' => 'rings',
                'description' => 'Minimal stacking rings, solitaire crystal bands, and bold statement rings.',
                'image_url' => 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop',
                'banner_url' => 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1600&auto=format&fit=crop',
                'seo_title' => 'Stackable & Statement Rings | Arilha',
                'seo_description' => 'Shop handcrafted gold and rose gold stacking rings for women.',
                'sort_order' => 3,
                'status' => 'ACTIVE',
            ],
            [
                'name' => 'Bracelets',
                'slug' => 'bracelets',
                'description' => 'Modern anti-tarnish cuffs, floral bangles, and delicate wrist charms.',
                'image_url' => 'https://images.unsplash.com/photo-1611591475140-4388636a26f6?q=80&w=800&auto=format&fit=crop',
                'banner_url' => 'https://images.unsplash.com/photo-1611591475140-4388636a26f6?q=80&w=1600&auto=format&fit=crop',
                'seo_title' => 'Gold-Plated Bracelets & Cuffs | Arilha',
                'seo_description' => 'Discover elegant wrist cuffs, adjustable charm bracelets and bangles.',
                'sort_order' => 4,
                'status' => 'ACTIVE',
            ],
            [
                'name' => 'Necklaces',
                'slug' => 'necklaces',
                'description' => 'Royal Kundan chokers, bridal sets, and handcrafted statement necklaces.',
                'image_url' => 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
                'banner_url' => 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1600&auto=format&fit=crop',
                'seo_title' => 'Bridal & Kundan Necklaces | Arilha',
                'seo_description' => 'Exquisite Kundan choker sets and traditional bridal necklaces.',
                'sort_order' => 5,
                'status' => 'ACTIVE',
            ],
            [
                'name' => 'Watches',
                'slug' => 'watches',
                'description' => 'Timeless luxury watches and jewellery-inspired wristwear.',
                'image_url' => 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop',
                'banner_url' => 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1600&auto=format&fit=crop',
                'seo_title' => 'Women\'s Watches & Luxury Timepieces | Arilha',
                'seo_description' => 'Explore luxury watches and statement wristpieces from Arilha.',
                'sort_order' => 6,
                'status' => 'ACTIVE',
            ],
            [
                'name' => 'New Arrivals',
                'slug' => 'new-arrivals',
                'description' => 'Freshly dropped anti-tarnish and festive jewellery designs.',
                'image_url' => 'https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=800&auto=format&fit=crop',
                'banner_url' => 'https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=1600&auto=format&fit=crop',
                'seo_title' => 'New Arrivals Jewellery | Arilha',
                'seo_description' => 'Shop the latest drop of anti-tarnish gold jewellery and Kundan pieces.',
                'sort_order' => 7,
                'status' => 'ACTIVE',
            ],
            [
                'name' => 'Best Sellers',
                'slug' => 'best-sellers',
                'description' => 'Our most loved and iconic jewellery pieces as rated by customers.',
                'image_url' => 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop',
                'banner_url' => 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1600&auto=format&fit=crop',
                'seo_title' => 'Best Seller Jewellery | Arilha',
                'seo_description' => 'Explore Arilha\'s top trending and most popular jewellery items.',
                'sort_order' => 8,
                'status' => 'ACTIVE',
            ],
            [
                'name' => 'Diwali Collection',
                'slug' => 'diwali',
                'description' => 'Festive jewellery for your Diwali celebrations. Celebrate every moment in gold.',
                'image_url' => 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
                'banner_url' => 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1600&auto=format&fit=crop',
                'seo_title' => 'Diwali Jewellery Collection | Arilha',
                'seo_description' => 'Discover festive jewellery from Arilha, featuring elegant pieces for Diwali celebrations.',
                'sort_order' => 9,
                'status' => 'ACTIVE',
            ],
            [
                'name' => 'Exclusive 999 Collection',
                'slug' => 'exclusive-999',
                'description' => 'Premium budget-friendly luxury jewellery under ₹999.',
                'image_url' => 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop',
                'banner_url' => 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=1600&auto=format&fit=crop',
                'seo_title' => 'Exclusive 999 Jewellery Collection | Arilha',
                'seo_description' => 'Explore high-grade gold plated daily wear jewellery all under ₹999.',
                'sort_order' => 10,
                'status' => 'ACTIVE',
            ],
        ];

        foreach ($collectionsSeed as $col) {
            DB::table('collections')->updateOrInsert(['slug' => $col['slug']], array_merge($col, [
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }

        // Attach products to multiple collections
        $productCollectionsMap = [
            'ARL-KUN-CHK-001' => ['necklaces', 'diwali', 'best-sellers', 'new-arrivals'],
            'ARL-JHM-PRL-001' => ['earrings', 'diwali', 'best-sellers', 'new-arrivals'],
            'ARL-BRC-FLR-001' => ['bracelets', 'new-arrivals', 'best-sellers'],
            'ARL-EAR-HOP-001' => ['earrings', 'exclusive-999', 'best-sellers'],
            'ARL-RNG-STK-001' => ['rings', 'exclusive-999', 'new-arrivals'],
        ];

        foreach ($productCollectionsMap as $sku => $slugs) {
            $pId = DB::table('products')->where('sku', $sku)->value('id');
            if ($pId) {
                foreach ($slugs as $orderIdx => $slug) {
                    $cId = DB::table('collections')->where('slug', $slug)->value('id');
                    if ($cId) {
                        DB::table('collection_product')->updateOrInsert(
                            ['collection_id' => $cId, 'product_id' => $pId],
                            ['sort_order' => $orderIdx + 1, 'created_at' => now(), 'updated_at' => now()]
                        );
                    }
                }
            }
        }
    }
}
