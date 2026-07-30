import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;
const SECURE_MODE = process.env.SECURE_MODE !== 'false';

console.log('PCI-DSS Mock Server starting in ...')

//Start
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(` Payment UI  → http://localhost:${PORT}`);
    console.log(` API Base    → http://localhost:${PORT}/api`);
    console.log(`  Health     → http://localhost:${PORT}/api/health\n`);
  });
}

export default app;