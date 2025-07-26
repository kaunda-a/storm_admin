"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var bcryptjs_1 = require("bcryptjs");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var hashedPassword, superAdmin, manager, customers, _a, _b, _c, _d, _e, _f, _g, categories, brands, products, sizes, colors, _i, products_1, product, i;
        var _h, _j, _k, _l;
        return __generator(this, function (_m) {
            switch (_m.label) {
                case 0:
                    console.log('🌱 Starting database seed...');
                    // Clear existing data (in correct order to avoid foreign key constraints)
                    console.log('🧹 Cleaning existing data...');
                    return [4 /*yield*/, prisma.orderItem.deleteMany()];
                case 1:
                    _m.sent();
                    return [4 /*yield*/, prisma.payment.deleteMany()];
                case 2:
                    _m.sent();
                    return [4 /*yield*/, prisma.order.deleteMany()];
                case 3:
                    _m.sent();
                    return [4 /*yield*/, prisma.review.deleteMany()];
                case 4:
                    _m.sent();
                    return [4 /*yield*/, prisma.productImage.deleteMany()];
                case 5:
                    _m.sent();
                    return [4 /*yield*/, prisma.productVariant.deleteMany()];
                case 6:
                    _m.sent();
                    return [4 /*yield*/, prisma.product.deleteMany()];
                case 7:
                    _m.sent();
                    return [4 /*yield*/, prisma.address.deleteMany()];
                case 8:
                    _m.sent();
                    return [4 /*yield*/, prisma.marqueeMessage.deleteMany()];
                case 9:
                    _m.sent();
                    return [4 /*yield*/, prisma.billboard.deleteMany()];
                case 10:
                    _m.sent();
                    return [4 /*yield*/, prisma.analyticsEvent.deleteMany()];
                case 11:
                    _m.sent();
                    return [4 /*yield*/, prisma.session.deleteMany()];
                case 12:
                    _m.sent();
                    return [4 /*yield*/, prisma.account.deleteMany()];
                case 13:
                    _m.sent();
                    return [4 /*yield*/, prisma.customer.deleteMany()];
                case 14:
                    _m.sent();
                    return [4 /*yield*/, prisma.brand.deleteMany()];
                case 15:
                    _m.sent();
                    return [4 /*yield*/, prisma.category.deleteMany()
                        // Create admin user
                    ];
                case 16:
                    _m.sent();
                    // Create admin user
                    console.log('👤 Creating admin user...');
                    return [4 /*yield*/, bcryptjs_1.default.hash('admin123', 12)];
                case 17:
                    hashedPassword = _m.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                email: 'admin@mzansifootwear.com',
                                password: hashedPassword,
                                firstName: 'Super',
                                lastName: 'Admin',
                                role: 'SUPER_ADMIN',
                                emailVerified: new Date()
                            }
                        })];
                case 18:
                    superAdmin = _m.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                email: 'manager@mzansifootwear.com',
                                password: hashedPassword,
                                firstName: 'Store',
                                lastName: 'Manager',
                                role: 'MANAGER',
                                emailVerified: new Date()
                            }
                        })
                        // Create sample customers
                    ];
                case 19:
                    manager = _m.sent();
                    // Create sample customers
                    console.log('👥 Creating sample customers...');
                    _b = (_a = Promise).all;
                    _d = (_c = prisma.customer).create;
                    _h = {};
                    _j = {
                        email: 'john.doe@example.com'
                    };
                    return [4 /*yield*/, bcryptjs_1.default.hash('customer123', 12)];
                case 20:
                    _e = [
                        _d.apply(_c, [(_h.data = (_j.password = _m.sent(),
                                _j.firstName = 'John',
                                _j.lastName = 'Doe',
                                _j.emailVerified = new Date(),
                                _j),
                                _h)])
                    ];
                    _g = (_f = prisma.customer).create;
                    _k = {};
                    _l = {
                        email: 'jane.smith@example.com'
                    };
                    return [4 /*yield*/, bcryptjs_1.default.hash('customer123', 12)];
                case 21: return [4 /*yield*/, _b.apply(_a, [_e.concat([
                            _g.apply(_f, [(_k.data = (_l.password = _m.sent(),
                                    _l.firstName = 'Jane',
                                    _l.lastName = 'Smith',
                                    _l.emailVerified = new Date(),
                                    _l),
                                    _k)])
                        ])])
                    // Create categories
                ];
                case 22:
                    customers = _m.sent();
                    // Create categories
                    console.log('📂 Creating categories...');
                    return [4 /*yield*/, Promise.all([
                            prisma.category.create({
                                data: {
                                    name: 'Sneakers',
                                    slug: 'sneakers',
                                    description: 'Comfortable and stylish sneakers for everyday wear',
                                    isActive: true,
                                    sortOrder: 1
                                }
                            }),
                            prisma.category.create({
                                data: {
                                    name: 'Formal Shoes',
                                    slug: 'formal-shoes',
                                    description: 'Elegant formal shoes for business and special occasions',
                                    isActive: true,
                                    sortOrder: 2
                                }
                            }),
                            prisma.category.create({
                                data: {
                                    name: 'Boots',
                                    slug: 'boots',
                                    description: 'Durable boots for work and outdoor activities',
                                    isActive: true,
                                    sortOrder: 3
                                }
                            }),
                            prisma.category.create({
                                data: {
                                    name: 'Sandals',
                                    slug: 'sandals',
                                    description: 'Comfortable sandals for casual and beach wear',
                                    isActive: true,
                                    sortOrder: 4
                                }
                            })
                        ])
                        // Create brands
                    ];
                case 23:
                    categories = _m.sent();
                    // Create brands
                    console.log('🏷️ Creating brands...');
                    return [4 /*yield*/, Promise.all([
                            prisma.brand.create({
                                data: {
                                    name: 'Mzansi Original',
                                    slug: 'mzansi-original',
                                    description: 'Premium South African footwear brand',
                                    isActive: true
                                }
                            }),
                            prisma.brand.create({
                                data: {
                                    name: 'Ubuntu Shoes',
                                    slug: 'ubuntu-shoes',
                                    description: 'Traditional meets modern footwear',
                                    isActive: true
                                }
                            }),
                            prisma.brand.create({
                                data: {
                                    name: 'Kasi Kicks',
                                    slug: 'kasi-kicks',
                                    description: 'Street-style footwear for the youth',
                                    isActive: true
                                }
                            })
                        ])
                        // Create sample products
                    ];
                case 24:
                    brands = _m.sent();
                    // Create sample products
                    console.log('👟 Creating sample products...');
                    return [4 /*yield*/, Promise.all([
                            prisma.product.create({
                                data: {
                                    name: 'Classic White Sneakers',
                                    slug: 'classic-white-sneakers',
                                    description: 'Timeless white sneakers perfect for any casual outfit',
                                    shortDescription: 'Classic white sneakers for everyday wear',
                                    sku: 'MZ-SNK-001',
                                    categoryId: categories[0].id, // Sneakers
                                    brandId: brands[0].id, // Mzansi Original
                                    status: 'ACTIVE',
                                    isActive: true,
                                    isFeatured: true,
                                    tags: ['casual', 'white', 'comfortable']
                                }
                            }),
                            prisma.product.create({
                                data: {
                                    name: 'Executive Leather Shoes',
                                    slug: 'executive-leather-shoes',
                                    description: 'Premium leather shoes for the modern professional',
                                    shortDescription: 'Premium leather formal shoes',
                                    sku: 'MZ-FRM-001',
                                    categoryId: categories[1].id, // Formal Shoes
                                    brandId: brands[1].id, // Ubuntu Shoes
                                    status: 'ACTIVE',
                                    isActive: true,
                                    isFeatured: true,
                                    tags: ['formal', 'leather', 'business']
                                }
                            }),
                            prisma.product.create({
                                data: {
                                    name: 'Urban Street Boots',
                                    slug: 'urban-street-boots',
                                    description: 'Stylish boots for the urban explorer',
                                    shortDescription: 'Trendy urban boots',
                                    sku: 'MZ-BOT-001',
                                    categoryId: categories[2].id, // Boots
                                    brandId: brands[2].id, // Kasi Kicks
                                    status: 'ACTIVE',
                                    isActive: true,
                                    isFeatured: false,
                                    tags: ['boots', 'urban', 'trendy']
                                }
                            })
                        ])
                        // Create product variants
                    ];
                case 25:
                    products = _m.sent();
                    // Create product variants
                    console.log('📏 Creating product variants...');
                    sizes = ['6', '7', '8', '9', '10', '11', '12'];
                    colors = ['Black', 'White', 'Brown', 'Navy'];
                    _i = 0, products_1 = products;
                    _m.label = 26;
                case 26:
                    if (!(_i < products_1.length)) return [3 /*break*/, 31];
                    product = products_1[_i];
                    i = 0;
                    _m.label = 27;
                case 27:
                    if (!(i < 3)) return [3 /*break*/, 30];
                    return [4 /*yield*/, prisma.productVariant.create({
                            data: {
                                productId: product.id,
                                size: sizes[i + 2], // Start from size 8
                                color: colors[i],
                                sku: "".concat(product.sku, "-").concat(sizes[i + 2], "-").concat(colors[i].toUpperCase()),
                                price: 1299.99 + (i * 200), // Varying prices
                                comparePrice: 1499.99 + (i * 200),
                                costPrice: 800.00 + (i * 100),
                                stock: 50 - (i * 10),
                                lowStockThreshold: 10,
                                weight: 0.8,
                                isActive: true,
                            }
                        })];
                case 28:
                    _m.sent();
                    _m.label = 29;
                case 29:
                    i++;
                    return [3 /*break*/, 27];
                case 30:
                    _i++;
                    return [3 /*break*/, 26];
                case 31:
                    // Create billboards
                    console.log('📢 Creating billboards...');
                    return [4 /*yield*/, Promise.all([
                            prisma.billboard.create({
                                data: {
                                    title: 'Summer Sale 2024',
                                    description: 'Up to 50% off on selected footwear',
                                    type: 'SALE',
                                    position: 'HEADER',
                                    isActive: true,
                                    sortOrder: 1,
                                    createdBy: superAdmin.id
                                }
                            }),
                            prisma.billboard.create({
                                data: {
                                    title: 'New Collection Launch',
                                    description: 'Discover our latest footwear collection',
                                    type: 'PRODUCT_LAUNCH',
                                    position: 'DASHBOARD_TOP',
                                    isActive: true,
                                    sortOrder: 2,
                                    createdBy: manager.id
                                }
                            })
                        ])
                        // Create marquee messages
                    ];
                case 32:
                    _m.sent();
                    // Create marquee messages
                    console.log('📝 Creating marquee messages...');
                    return [4 /*yield*/, Promise.all([
                            prisma.marqueeMessage.create({
                                data: {
                                    title: 'Free Shipping',
                                    message: 'Free shipping on orders over R500',
                                    type: 'PROMOTION',
                                    priority: 1,
                                    isActive: true,
                                    createdBy: superAdmin.id
                                }
                            }),
                            prisma.marqueeMessage.create({
                                data: {
                                    title: 'Store Hours',
                                    message: 'Open Monday to Saturday: 9AM - 6PM',
                                    type: 'INFO',
                                    priority: 2,
                                    isActive: true,
                                    createdBy: manager.id
                                }
                            })
                        ])];
                case 33:
                    _m.sent();
                    console.log('✅ Seed completed successfully!');
                    console.log("Created:");
                    console.log("- ".concat(2, " admin users"));
                    console.log("- ".concat(customers.length, " customers"));
                    console.log("- ".concat(categories.length, " categories"));
                    console.log("- ".concat(brands.length, " brands"));
                    console.log("- ".concat(products.length, " products"));
                    console.log("- ".concat(products.length * 3, " product variants"));
                    console.log("- 2 billboards");
                    console.log("- 2 marquee messages");
                    console.log("\n\uD83D\uDD11 Admin Login:");
                    console.log("Email: admin@mzansifootwear.com");
                    console.log("Password: admin123");
                    console.log("\n\uD83D\uDD11 Manager Login:");
                    console.log("Email: manager@mzansifootwear.com");
                    console.log("Password: admin123");
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
