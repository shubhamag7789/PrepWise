/**
 * PrepWise Server Entry Point
 * Bootstraps the Express application and starts HTTP server
 */
const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const env = require('./src/config/env');

const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();

    const server = app.listen(env.PORT, () => {
      console.log(`\n🚀 PrepWise Server running in ${env.NODE_ENV} mode`);
      console.log(`📡 Listening on http://localhost:${env.PORT}`);
      console.log(`📋 API Base: http://localhost:${env.PORT}/api/v1\n`);
    });

    // Graceful shutdown handlers
    const shutdown = (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      server.close(() => {
        console.log('✅ HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('❌ Unhandled Rejection:', err.message);
      server.close(() => process.exit(1));
    });

  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();
