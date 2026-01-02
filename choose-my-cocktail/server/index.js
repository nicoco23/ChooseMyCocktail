const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
require('dotenv').config();

const itemRepository = require('./repositories/itemRepository');
const pairingEngine = require('./services/pairingEngine');
const AuthDatabase = require('./authDatabase');
const configurePassport = require('./config/passport');
const { authenticateJWT } = require('./middleware/auth');
const createAuthRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin123';

console.log('--- Server Starting ---'); // Force restart log

// Initialize Auth Database
// Ensure we use the database in the server directory, regardless of where the process was started
const dbPath = process.env.DB_PATH
  ? (path.isAbsolute(process.env.DB_PATH) ? process.env.DB_PATH : path.join(__dirname, process.env.DB_PATH))
  : path.join(__dirname, 'choosemycocktail.db');

const authDb = new AuthDatabase(dbPath);
authDb.initialize().catch(err => console.error('Failed to initialize auth database:', err));

// Configure Passport
configurePassport(authDb);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session middleware (pour OAuth)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 heures
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Auth routes
app.use('/api/auth', createAuthRoutes(authDb));

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Middleware: Admin authentication
function requireAdmin(req, res, next) {
    const token = req.headers['x-admin-token'];
    if (token === ADMIN_TOKEN) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
}

// ===== ROUTES =====

// Upload image
app.post('/api/upload', requireAdmin, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ imageUrl });
});

// Get all recipes/items
app.get('/api/recipes', async (req, res) => {
    try {
        const { admin, kind, beverage_type, search } = req.query;

        // Admin view requires authentication
        const isAdmin = admin === 'true';
        if (isAdmin) {
            const token = req.headers['x-admin-token'];
            if (token !== ADMIN_TOKEN) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
        }

        const filters = {
            kind: kind || undefined,
            beverage_type: beverage_type || undefined,
            validated: isAdmin ? undefined : 1,
            search: search || undefined
        };

        const items = await itemRepository.getAllItems(filters);
        res.json({ message: 'success', data: items });
    } catch (error) {
        console.error('Error fetching recipes:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get single recipe/item
app.get('/api/recipes/:id', async (req, res) => {
    try {
        const item = await itemRepository.getItemById(req.params.id);
        if (!item) {
            return res.status(404).json({ error: 'Item not found' });
        }
        res.json({ message: 'success', data: item });
    } catch (error) {
        console.error('Error fetching recipe:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create recipe/item
app.post('/api/recipes', async (req, res) => {
    try {
        // Check for admin token manually to set validated status
        const token = req.headers['x-admin-token'];
        const isAdmin = token === ADMIN_TOKEN;

        const { name, nom, category, type, kind, beverage_type, ...rest } = req.body;

        // Determine kind and beverage_type
        const title = name || nom;
        let itemKind = kind;
        let itemBeverageType = beverage_type;

        if (!itemKind) {
            // Infer from category
            const cat = (category || type || '').toLowerCase();
            if (['cocktail', 'mocktail', 'smoothie', 'shot', 'punch', 'wine', 'juice'].includes(cat)) {
                itemKind = 'beverage';
                itemBeverageType = cat;
            } else {
                itemKind = 'food';
                itemBeverageType = null;
            }
        }

        const itemData = {
            kind: itemKind,
            beverage_type: itemBeverageType,
            title,
            description: rest.description || null,
            instructions: rest.recette || rest.instructions || null,
            image_url: rest.image || rest.image_url || null,
            preparation_time: rest.preparation_time || 0,
            cooking_time: rest.cooking_time || 0,
            total_time: rest.total_time || 0,
            glass: rest.glass || null,
            validated: isAdmin ? (rest.validated ? 1 : 0) : 0,
            ingredients: rest.ingredients || [],
            steps: rest.steps || rest.etapes || [],
            tags: rest.tags || [],
            equipment: rest.equipment || []
        };

        const itemId = await itemRepository.createItem(itemData);
        res.json({ message: 'success', id: itemId, data: { id: itemId, ...itemData } });
    } catch (error) {
        console.error('Error creating recipe:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update recipe/item
app.put('/api/recipes/:id', requireAdmin, async (req, res) => {
    try {
        const { name, nom, category, type, kind, beverage_type, ...rest } = req.body;

        const title = name || nom;
        let itemKind = kind;
        let itemBeverageType = beverage_type;

        if (!itemKind) {
            const cat = (category || type || '').toLowerCase();
            if (['cocktail', 'mocktail', 'smoothie', 'shot', 'punch', 'wine', 'juice'].includes(cat)) {
                itemKind = 'beverage';
                itemBeverageType = cat;
            } else {
                itemKind = 'food';
                itemBeverageType = null;
            }
        }

        const itemData = {
            kind: itemKind,
            beverage_type: itemBeverageType,
            title,
            description: rest.description || null,
            instructions: rest.recette || rest.instructions || null,
            image_url: rest.image || rest.image_url || null,
            preparation_time: rest.preparation_time || 0,
            cooking_time: rest.cooking_time || 0,
            total_time: rest.total_time || 0,
            glass: rest.glass || null,
            validated: rest.validated ? 1 : 0,
            ingredients: rest.ingredients || [],
            steps: rest.steps || rest.etapes || [],
            tags: rest.tags || [],
            equipment: rest.equipment || []
        };

        await itemRepository.updateItem(req.params.id, itemData);
        res.json({ message: 'success', data: itemData });
    } catch (error) {
        console.error('Error updating recipe:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete recipe/item
app.delete('/api/recipes/:id', requireAdmin, async (req, res) => {
    try {
        await itemRepository.deleteItem(req.params.id);
        res.json({ message: 'deleted' });
    } catch (error) {
        console.error('Error deleting recipe:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all ingredients
app.get('/api/ingredients', async (req, res) => {
    try {
        const { kind } = req.query;
        const ingredients = await itemRepository.getAllIngredients(kind);
        res.json({ data: ingredients });
    } catch (error) {
        console.error('Error fetching ingredients:', error);
        res.status(500).json({ error: error.message });
    }
});

// Pairing recommendations
app.post('/api/pairings', async (req, res) => {
    try {
        const { foodId, topK, allowAlcohol, maxAbv, userIngredients } = req.body;

        if (!foodId) {
            return res.status(400).json({ error: 'foodId is required' });
        }

        const recommendations = await pairingEngine.getPairings(foodId, {
            topK: topK || 5,
            allowAlcohol: allowAlcohol !== false,
            maxAbv: maxAbv || null,
            userIngredients: userIngredients || []
        });

        res.json({
            foodId,
            k: topK || 5,
            recommendations: recommendations.map(r => ({
                itemId: r.beverage.id,
                title: r.beverage.title,
                beverageType: r.beverage.beverage_type,
                score: r.score,
                reasons: r.reasons,
                beverage: r.beverage
            }))
        });
    } catch (error) {
        console.error('Error generating pairings:', error);
        res.status(500).json({ error: error.message });
    }
});

// Pairing feedback
app.post('/api/pairings/feedback', async (req, res) => {
    try {
        const { foodId, beverageId, action, rating, reasonTag, sessionId, meta } = req.body;

        if (!foodId || !beverageId || !action) {
            return res.status(400).json({ error: 'foodId, beverageId, and action are required' });
        }

        const eventId = await pairingEngine.recordFeedback({
            food_id: foodId,
            beverage_id: beverageId,
            action,
            rating: rating || null,
            reason_tag: reasonTag || null,
            session_id: sessionId || null,
            meta: meta || null
        });

        res.json({ message: 'success', eventId });
    } catch (error) {
        console.error('Error recording feedback:', error);
        res.status(500).json({ error: error.message });
    }
});

// User Favorites & Ratings
app.post('/api/favorites/:itemId', authenticateJWT, async (req, res) => {
    try {
        const result = await itemRepository.toggleFavorite(req.user.id, req.params.itemId);
        res.json(result);
    } catch (error) {
        console.error('Error toggling favorite:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/favorites', authenticateJWT, async (req, res) => {
    try {
        const favorites = await itemRepository.getFavorites(req.user.id);
        res.json({ data: favorites });
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/ratings/:itemId', authenticateJWT, async (req, res) => {
    try {
        const { rating, comment, kind } = req.body;
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Invalid rating' });
        }
        // Note: kind is not currently used in the DB but could be useful for analytics or validation
        await itemRepository.setRating(req.user.id, req.params.itemId, rating, comment);
        res.json({ message: 'success' });
    } catch (error) {
        console.error('Error setting rating:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/ratings', authenticateJWT, async (req, res) => {
    try {
        const ratings = await itemRepository.getUserRatings(req.user.id);
        res.json({ data: ratings });
    } catch (error) {
        console.error('Error fetching ratings:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin: Get all users
app.get('/api/users', requireAdmin, async (req, res) => {
    try {
        const users = await authDb.getAllUsers();
        res.json({ message: 'success', data: users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: error.message });
    }
});

// Admin: Delete user
app.delete('/api/users/:id', requireAdmin, async (req, res) => {
    try {
        await authDb.deleteUser(req.params.id);
        res.json({ message: 'deleted' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ Admin token: ${ADMIN_TOKEN}`);
});
