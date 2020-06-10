/* eslint-disable no-console */
import colors from 'colors';
import app from './app.js';
import connectMongoDB from './config/connectMongoDB.js';

connectMongoDB();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () =>
  console.log(
    colors.yellow.bold(
      `Server is running in ${process.env.NODE_ENV} mode, on port ${PORT}`
    )
  )
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(colors.red('Error: %s'), err.message);
  // Close server & exit process
  server.close(() => process.exit(1));
});
