"use strict";
/**
 * Database Seed Script with Auth Users
 *
 * Seeds the database with sample users for testing.
 * Run with: npx ts-node src/scripts/seed-users.ts
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const user_utils_1 = require("../lib/user-utils");
const db_1 = __importDefault(require("../lib/db"));
function seedUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🌱 Seeding users...\\n');
        const users = [
            {
                name: 'Admin User',
                email: 'admin@xsprint.com',
                password: 'admin123',
                role: client_1.Role.ADMIN,
            },
            {
                name: 'John Umpire',
                email: 'umpire@xsprint.com',
                password: 'umpire123',
                role: client_1.Role.UMPIRE,
            },
            {
                name: 'Sarah Organizer',
                email: 'organizer@xsprint.com',
                password: 'organizer123',
                role: client_1.Role.ORGANIZER,
            },
            {
                name: 'Mike Viewer',
                email: 'viewer@xsprint.com',
                password: 'viewer123',
                role: client_1.Role.VIEWER,
            },
        ];
        const results = yield (0, user_utils_1.createUsers)(users);
        console.log('📊 Results:\\n');
        results.forEach((result, index) => {
            if (result.success && result.user) {
                console.log(`✅ Created: ${result.user.email} (${result.user.role})`);
            }
            else {
                console.log(`⚠️  Skipped: ${result.email} - ${result.error}`);
            }
        });
        console.log('\\n✨ Seeding complete!\\n');
        console.log('📝 Test Credentials:');
        console.log('   Admin:     admin@xsprint.com / admin123');
        console.log('   Umpire:    umpire@xsprint.com / umpire123');
        console.log('   Organizer: organizer@xsprint.com / organizer123');
        console.log('   Viewer:    viewer@xsprint.com / viewer123');
    });
}
seedUsers()
    .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.default.$disconnect();
}));
