const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const itemRepository = require('./repositories/itemRepository');
const pairingEngine = require('./services/pairingEngine');

const app = express();
const PORT = process.env.PORT || 3001;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin123';

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
app.post('/api/recipes', requireAdmin, async (req, res) => {
    try {
        const { name, nom, category, type, kind, beverage_type, ...rest } = req.body;

        // Determine kind and beverage_type
        const title = name || nom;
        let itemKind = kind;
        let itemBeverageType = beverage_type;

        if (!itemKind) {
            // Infer from category
            const cat = (category || type || '').toLowerCase();
            if (['cocktail', 'mocktail', 'smoothie', 'wine', 'juice'].includes(cat)) {
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
            if (['cocktail', 'mocktail', 'smoothie', 'wine', 'juice'].includes(cat)) {
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
        const ingredients = await itemRepository.getAllIngredients();
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

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ Admin token: ${ADMIN_TOKEN}`);
});
