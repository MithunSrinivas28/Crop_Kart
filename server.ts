import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import bcrypt from "bcryptjs";
import PDFDocument from "pdfkit";
import firebaseConfig from "./firebase-applet-config.json" assert { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
const adminApp = !admin.apps.length 
  ? admin.initializeApp({ projectId: firebaseConfig.projectId })
  : admin.app();

const db = getFirestore(adminApp, firebaseConfig.firestoreDatabaseId);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- Middleware: Verify JWT (Firebase ID Token) ---
  const authenticate = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      next();
    } catch (error) {
      console.error("Token verification error:", error);
      return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
  };

  // --- API Routes ---

  // GET /user/profile
  app.get("/user/profile", authenticate, async (req: any, res: any) => {
    try {
      const uid = req.user.uid;
      const userDoc = await db.collection("users").doc(uid).get();

      if (!userDoc.exists) {
        return res.status(404).json({ error: "User not found" });
      }

      const userData = userDoc.data();
      // Remove sensitive data
      if (userData) {
        delete userData.password;
      }
      
      console.log(`✅ Profile fetched for user: ${uid}`);
      res.json(userData);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // PUT /user/profile
  app.put("/user/profile", authenticate, async (req: any, res: any) => {
    try {
      const uid = req.user.uid;
      const { name, email, location, password } = req.body;

      const updateData: any = {
        name,
        email,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (location) {
        updateData.location = location;
      }

      // If password is provided, hash it and update in Auth + Firestore
      if (password && password.trim() !== "") {
        const hashedPassword = await bcrypt.hash(password, 10);
        updateData.password = hashedPassword;
        
        // Update password in Firebase Auth as well
        await admin.auth().updateUser(uid, {
          password: password,
        });
        console.log(`🔑 Password updated for user: ${uid}`);
      }

      // Update email in Firebase Auth if it changed
      if (email && email !== req.user.email) {
        await admin.auth().updateUser(uid, {
          email: email,
        });
        console.log(`📧 Email updated for user: ${uid}`);
      }

      await db.collection("users").doc(uid).update(updateData);

      console.log(`✅ Profile updated for user: ${uid}`);
      res.json({ message: "Profile updated successfully", user: updateData });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // DELETE /crops/:id
  app.delete("/crops/:id", authenticate, async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const uid = req.user.uid;
      const cropDoc = await db.collection("crops").doc(id).get();

      if (!cropDoc.exists) {
        return res.status(404).json({ error: "Crop not found" });
      }

      if (cropDoc.data()?.farmerId !== uid) {
        return res.status(403).json({ error: "Unauthorized: You do not own this crop" });
      }

      await db.collection("crops").doc(id).delete();
      console.log(`🗑️ Crop deleted: ${id} by user: ${uid}`);
      res.json({ message: "Crop deleted successfully" });
    } catch (error) {
      console.error("Error deleting crop:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // DELETE /products/:id
  app.delete("/products/:id", authenticate, async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const uid = req.user.uid;
      const productDoc = await db.collection("products").doc(id).get();

      if (!productDoc.exists) {
        return res.status(404).json({ error: "Product not found" });
      }

      if (productDoc.data()?.supplierId !== uid) {
        return res.status(403).json({ error: "Unauthorized: You do not own this product" });
      }

      await db.collection("products").doc(id).delete();
      console.log(`🗑️ Product deleted: ${id} by user: ${uid}`);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // GET /orders/:id/certificate
  app.get("/orders/:id/certificate", authenticate, async (req: any, res: any) => {
    try {
      const { id } = req.params;
      const uid = req.user.uid;
      const orderDoc = await db.collection("orders").doc(id).get();

      if (!orderDoc.exists) {
        return res.status(404).json({ error: "Order not found" });
      }

      const orderData = orderDoc.data();
      if (orderData?.farmerId !== uid) {
        return res.status(403).json({ error: "Unauthorized: You do not own this order" });
      }

      // Fetch Farmer details
      const farmerDoc = await db.collection("users").doc(uid).get();
      const farmerName = farmerDoc.data()?.name || "Valued Farmer";

      // Fetch Product details
      const productIds = orderData.products || [];
      const productNames: string[] = [];
      for (const pid of productIds) {
        const pDoc = await db.collection("products").doc(pid).get();
        if (pDoc.exists) {
          productNames.push(pDoc.data()?.name || "Agri Product");
        }
      }

      // Generate PDF
      const doc = new PDFDocument({ margin: 50 });
      let filename = `Certificate_${id}.pdf`;
      filename = encodeURIComponent(filename);

      res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"');
      res.setHeader('Content-type', 'application/pdf');

      doc.pipe(res);

      // Certificate Border
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke("#16a34a");

      // Logo/Title
      doc.fillColor("#16a34a").fontSize(40).text("CropKart", { align: "center" });
      doc.moveDown();

      doc.fillColor("#1e293b").fontSize(26).text("Certificate of Authentic Purchase", { align: "center" });
      doc.moveDown(2);

      doc.fontSize(16).text("This is to certify that", { align: "center" });
      doc.moveDown();
      doc.fontSize(22).font("Helvetica-Bold").text(farmerName, { align: "center" });
      doc.moveDown();
      doc.font("Helvetica").fontSize(16).text("has successfully purchased the following genuine agricultural products:", { align: "center" });
      doc.moveDown();

      // Product List
      doc.fontSize(14).font("Helvetica-Bold");
      productNames.forEach((name, index) => {
        doc.text(`${index + 1}. ${name}`, { align: "center" });
      });
      doc.moveDown();

      doc.font("Helvetica").fontSize(14);
      doc.text(`Total Amount: $${orderData.totalAmount}`, { align: "center" });
      doc.text(`Order ID: ${id}`, { align: "center" });
      doc.text(`Certificate ID: CK-${id.slice(0, 8).toUpperCase()}`, { align: "center" });
      doc.text(`Date of Purchase: ${new Date(orderData.date).toLocaleDateString()}`, { align: "center" });
      doc.moveDown(2);

      doc.fontSize(12).font("Helvetica-Oblique").text(
        "This certifies that the above products were purchased through CropKart and are verified as genuine.",
        { align: "center" }
      );

      doc.moveDown(4);
      doc.font("Helvetica").fontSize(10).text("Verified by CropKart Quality Assurance Team", { align: "center" });

      doc.end();

    } catch (error) {
      console.error("Error generating certificate:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
