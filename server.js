// server.js
import jsonServer from "json-server";
import auth from "json-server-auth";
import cors from "cors";

const app = jsonServer.create();
const router = jsonServer.router("db.json");

// Middleware
app.db = router.db;
app.use(cors());
app.use(jsonServer.bodyParser);
app.use(auth);
app.use(router);

// Khởi chạy server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`);
});
