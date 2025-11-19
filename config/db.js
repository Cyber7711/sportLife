const mongoose = require("mongoose");

const connectDB = (() => {
  let retryCount = 0;
  const maxRetries = 5;
  const retryDelay = 5000;
  let isConnecting = false;

  return async () => {
    if (isConnecting) {
      console.log("⚠️ Ulanish jarayoni davom etmoqda...".yellow);
      return;
    }

    try {
      isConnecting = true;

      const conn = await mongoose.connect(process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 10,
        minPoolSize: 2,
        socketTimeoutMS: 45000,
        maxIdleTimeMS: 30000,
        retryWrites: true,
        retryReads: true,
      });

      console.log(
        `✅ MongoDB muvaffaqiyatli ulandi: ${conn.connection.host}`.green
      );
      retryCount = 0;
      isConnecting = false;

      mongoose.connection.on("error", (err) => {
        console.error("❌ MongoDB ulanish xatosi:".red, err);
      });

      mongoose.connection.on("disconnected", () => {
        console.log("⚠️ MongoDB ulanishi uzildi".yellow);

        setTimeout(connectDB, retryDelay);
      });

      mongoose.connection.on("reconnected", () => {
        console.log("🔄 MongoDB qayta ulandi".green);
      });

      process.on("SIGINT", async () => {
        await mongoose.connection.close();
        console.log("📦 MongoDB ulanishi yopildi");
        process.exit(0);
      });
    } catch (err) {
      isConnecting = false;
      retryCount++;

      if (retryCount >= maxRetries) {
        console.error(
          `❌ Maksimal qayta urinishlar soniga (${maxRetries}) yetildi`.red
        );
        process.exit(1);
      }

      console.error(
        `❌ MongoDB ulanishida xatolik (${retryCount}/${maxRetries}):`.red,
        err.message
      );
      console.log(
        `🔄 ${retryDelay / 1000} soniyadan keyin qayta ulanilmoqda...`.yellow
      );

      setTimeout(connectDB, retryDelay);
    }
  };
})();

module.exports = connectDB;
