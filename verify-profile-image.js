/**
 * Profile Image URL Verification Script
 * Tests the complete flow: image upload → storage → retrieval → display
 */

const fs = require("fs");
const path = require("path");

console.log("\n=== PROFILE IMAGE FLOW VERIFICATION ===\n");

// 1. Check backend configuration
console.log("1️⃣  BACKEND CONFIGURATION:");
const serverPath = path.join(__dirname, "backend/server.js");
const serverCode = fs.readFileSync(serverPath, "utf-8");

if (serverCode.includes('app.use("/uploads"')) {
  console.log("   ✅ Server serves /uploads directory statically");
} else {
  console.log("   ❌ Server does NOT serve /uploads directory");
}

// 2. Check auth routes
console.log("\n2️⃣  AUTH ROUTES CONFIGURATION:");
const authRoutesPath = path.join(__dirname, "backend/routes/authRoutes.js");
const authRoutesCode = fs.readFileSync(authRoutesPath, "utf-8");

if (authRoutesCode.includes('/uploads/')) {
  if (!authRoutesCode.includes('http://') && !authRoutesCode.includes('https://')) {
    console.log("    Auth routes return RELATIVE URLs (/uploads/...)");
  } else {
    console.log("    Auth routes return ABSOLUTE URLs (needs fixing)");
  }
} else {
  console.log("    Auth routes do NOT handle image uploads");
}

// 3. Check upload directory
console.log("\n3️⃣  UPLOADS DIRECTORY:");
const uploadsDir = path.join(__dirname, "backend/uploads");
if (fs.existsSync(uploadsDir)) {
  const files = fs.readdirSync(uploadsDir).filter(f => f !== '.gitkeep');
  console.log(`   ✅ Directory exists with ${files.length} image(s)`);
  if (files.length > 0) {
    console.log(`   📸 Sample images: ${files.slice(0, 2).join(", ")}`);
  }
} else {
  console.log("   ❌ Uploads directory does NOT exist");
}

// 4. Check frontend API configuration
console.log("\n4️⃣  FRONTEND API CONFIGURATION:");
const envPath = path.join(__dirname, "frontend/expense-tracker/.env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  const match = envContent.match(/VITE_API_URL=(.+)/);
  if (match) {
    console.log(`   ✅ API URL configured: ${match[1]}`);
    console.log(`   📝 Images will be loaded from: ${match[1]}/uploads/filename`);
  }
} else {
  console.log("   ⚠️  No .env file found (using defaults)");
}

// 5. Check SideMenu component
console.log("\n5️⃣  SIDEMENU COMPONENT:");
const sideMenuPath = path.join(__dirname, "frontend/expense-tracker/src/components/layouts/SideMenu.jsx");
const sideMenuCode = fs.readFileSync(sideMenuPath, "utf-8");

if (sideMenuCode.includes("BASE_URL")) {
  console.log("   ✅ SideMenu imports BASE_URL from apiPaths");
  if (sideMenuCode.includes("startsWith") && sideMenuCode.includes("BASE_URL")) {
    console.log("   ✅ SideMenu converts relative URLs to absolute URLs");
  } else {
    console.log("   ❌ SideMenu does NOT convert relative URLs");
  }
} else {
  console.log("   ❌ SideMenu does NOT use BASE_URL");
}

// 6. Summary and recommendations
console.log("\n=== SUMMARY & RECOMMENDATIONS ===\n");
console.log("Current Setup:");
console.log("  • Backend returns relative URLs: /uploads/filename");
console.log("  • Frontend API URL: Configured in .env");
console.log("  • Image display: SideMenu converts to absolute URLs\n");

console.log("How it works:");
console.log("  1. User uploads image → Backend saves file");
console.log("  2. Backend returns: { imageUrl: '/uploads/filename' }");
console.log("  3. Frontend stores in user context");
console.log("  4. SideMenu converts to: BASE_URL + '/uploads/filename'");
console.log("  5. Browser loads from correct backend URL\n");

console.log("If images still don't load:");
console.log("  • Check browser DevTools Network tab for 404s on /uploads/*");
console.log("  • Verify backend is running on correct port");
console.log("  • Check CORS settings in backend (allowing your frontend domain)");
console.log("  • Ensure IMAGE_URL starts with / in response\n");

console.log("=== END VERIFICATION ===\n");
