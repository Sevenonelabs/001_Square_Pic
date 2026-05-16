import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the public_html directory
app.use(express.static(path.join(__dirname, 'public_html')));

// Fallback for SPA (Single Page Application) routing - 
// sends index.html for any unknown requests (needed for About/FAQ pages if navigated directly)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public_html', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`SquarePic server is running on port ${PORT}`);
});
