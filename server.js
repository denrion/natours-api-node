import colors from 'colors';
import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
  // eslint-disable-next-line no-console
  console.log(
    colors.yellow.bold(
      `Server is running in ${process.env.NODE_ENV} mode, on port ${PORT}`
    )
  )
);
