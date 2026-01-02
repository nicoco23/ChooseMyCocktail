const db = require('./database');
const { normalizeIngredient } = require('./utils/normalization');

const sampleItems = [
  // --- BEVERAGES ---
  {
    title: 'Mojito',
    kind: 'beverage',
    beverage_type: 'cocktail',
    description: 'Le classique cubain rafraîchissant.',
    ingredients: [
      { nom: 'Rhum blanc', quantite: 5, unite: 'cl' },
      { nom: 'Menthe', quantite: 10, unite: 'feuilles' },
      { nom: 'Citron vert', quantite: 0.5, unite: 'unité' },
      { nom: 'Sucre de canne', quantite: 2, unite: 'c.à.c' },
      { nom: 'Eau gazeuse', quantite: null, unite: 'top' }
    ],
    tags: ['rafraîchissant', 'mentholé', 'agrumes', 'sucré'],
    equipment: ['Pilon', 'Verre Highball', 'Cuillère à mélange'],
    profile: { freshness: 5, acidity: 3, sweetness: 3, abv: 10, sparkling_level: 3 },
    validated: 1
  },
  {
    title: 'Margarita',
    kind: 'beverage',
    beverage_type: 'cocktail',
    description: 'Tequila, citron vert et sel.',
    ingredients: [
      { nom: 'Tequila', quantite: 5, unite: 'cl' },
      { nom: 'Triple sec', quantite: 2, unite: 'cl' },
      { nom: 'Jus de citron vert', quantite: 3, unite: 'cl' }
    ],
    tags: ['acide', 'agrumes', 'fort', 'acidulé'],
    equipment: ['Shaker', 'Verre à Margarita'],
    profile: { acidity: 5, abv: 15, sweetness: 2, freshness: 3 },
    validated: 1
  },
  {
    title: 'Cosmopolitan',
    kind: 'beverage',
    beverage_type: 'cocktail',
    description: 'Vodka, cranberry et citron vert.',
    ingredients: [
      { nom: 'Vodka', quantite: 4, unite: 'cl' },
      { nom: 'Triple sec', quantite: 2, unite: 'cl' },
      { nom: 'Jus de cranberry', quantite: 3, unite: 'cl' },
      { nom: 'Jus de citron vert', quantite: 1, unite: 'cl' }
    ],
    tags: ['fruité', 'sucré', 'acide'],
    equipment: ['Shaker', 'Verre à Martini'],
    profile: { sweetness: 3, acidity: 3, abv: 12 },
    validated: 1
  },
  {
    title: 'Old Fashioned',
    kind: 'beverage',
    beverage_type: 'cocktail',
    description: 'Whisky, bitter et sucre.',
    ingredients: [
      { nom: 'Whisky', quantite: 6, unite: 'cl' },
      { nom: 'Angostura bitters', quantite: 2, unite: 'traits' },
      { nom: 'Sucre', quantite: 1, unite: 'morceau' }
    ],
    tags: ['fort', 'amer', 'classique'],
    equipment: ['Verre Old Fashioned', 'Cuillère à mélange'],
    profile: { abv: 30, bitterness: 3, sweetness: 2, body: 5 },
    validated: 1
  },
  {
    title: 'Cola Artisanal',
    kind: 'beverage',
    beverage_type: 'soft',
    description: 'Soda pétillant au cola.',
    ingredients: [{ nom: 'Sirop de cola', quantite: 3, unite: 'cl' }, { nom: 'Eau gazeuse', quantite: 20, unite: 'cl' }],
    tags: ['sucré', 'pétillant', 'sans alcool'],
    equipment: ['Verre Highball'],
    profile: { sweetness: 5, sparkling_level: 5, abv: 0 },
    validated: 1
  },
  {
    title: 'Piña Colada',
    kind: 'beverage',
    beverage_type: 'cocktail',
    description: 'Un cocktail tropical crémeux à base de rhum, coco et ananas.',
    ingredients: [
      { nom: 'Rhum blanc', quantite: 4, unite: 'cl' },
      { nom: 'Jus d\'ananas', quantite: 12, unite: 'cl' },
      { nom: 'Lait de coco', quantite: 4, unite: 'cl' },
      { nom: 'Glace pilée', quantite: null, unite: 'top' }
    ],
    steps: [
      { description: 'Mettre tous les ingrédients dans un blender avec de la glace pilée.' },
      { description: 'Mixer jusqu\'à obtenir une texture onctueuse.' },
      { description: 'Verser dans un verre Hurricane et décorer avec un morceau d\'ananas.' }
    ],
    tags: ['fruité', 'crémeux', 'sucré', 'exotique'],
    equipment: ['Blender', 'Verre Hurricane'],
    profile: { sweetness: 4, creaminess: 4, freshness: 3, abv: 8 },
    validated: 1
  },
  {
    title: 'Daiquiri',
    kind: 'beverage',
    beverage_type: 'cocktail',
    description: 'L\'équilibre parfait entre le rhum, le citron vert et le sucre.',
    ingredients: [
      { nom: 'Rhum blanc', quantite: 6, unite: 'cl' },
      { nom: 'Jus de citron vert', quantite: 3, unite: 'cl' },
      { nom: 'Sirop de sucre', quantite: 2, unite: 'cl' }
    ],
    steps: [
      { description: 'Verser le rhum, le jus de citron vert et le sirop de sucre dans un shaker rempli de glaçons.' },
      { description: 'Shaker vigoureusement pendant 10 secondes.' },
      { description: 'Filtrer dans un verre à cocktail rafraîchi.' }
    ],
    tags: ['acide', 'rafraîchissant', 'classique'],
    equipment: ['Shaker', 'Verre à cocktail'],
    profile: { acidity: 4, sweetness: 2, abv: 15, freshness: 4 },
    validated: 1
  },
  {
    title: 'Gin Tonic',
    kind: 'beverage',
    beverage_type: 'cocktail',
    description: 'Simple, efficace et indémodable.',
    ingredients: [
      { nom: 'Gin', quantite: 5, unite: 'cl' },
      { nom: 'Eau tonique', quantite: 12, unite: 'cl' },
      { nom: 'Citron vert', quantite: 1, unite: 'quartier' }
    ],
    steps: [
      { description: 'Remplir un verre Highball de glaçons.' },
      { description: 'Verser le gin.' },
      { description: 'Compléter avec l\'eau tonique.' },
      { description: 'Remuer doucement et garnir d\'un quartier de citron vert.' }
    ],
    tags: ['amer', 'rafraîchissant', 'pétillant'],
    equipment: ['Verre Highball', 'Cuillère à mélange'],
    profile: { bitterness: 3, freshness: 5, sparkling_level: 4, abv: 10 },
    validated: 1
  },
  {
    title: 'Aperol Spritz',
    kind: 'beverage',
    beverage_type: 'cocktail',
    description: 'Le roi de l\'apéritif italien.',
    ingredients: [
      { nom: 'Aperol', quantite: 6, unite: 'cl' },
      { nom: 'Prosecco', quantite: 9, unite: 'cl' },
      { nom: 'Eau gazeuse', quantite: 3, unite: 'cl' },
      { nom: 'Orange', quantite: 1, unite: 'tranche' }
    ],
    steps: [
      { description: 'Remplir un grand verre à vin de glaçons.' },
      { description: 'Verser le Prosecco, puis l\'Aperol.' },
      { description: 'Ajouter un trait d\'eau gazeuse.' },
      { description: 'Mélanger délicatement et ajouter une tranche d\'orange.' }
    ],
    tags: ['amer', 'pétillant', 'rafraîchissant', 'apéritif'],
    equipment: ['Verre à vin'],
    profile: { bitterness: 2, sweetness: 3, sparkling_level: 4, abv: 8 },
    validated: 1
  },
  {
    title: 'Spritz Saint-Germain',
    kind: 'beverage',
    beverage_type: 'cocktail',
    description: 'Une variante florale et élégante du Spritz classique.',
    ingredients: [
      { nom: 'Liqueur St-Germain', quantite: 4, unite: 'cl' },
      { nom: 'Prosecco', quantite: 6, unite: 'cl' },
      { nom: 'Eau gazeuse', quantite: 6, unite: 'cl' },
      { nom: 'Citron jaune', quantite: 1, unite: 'tranche' }
    ],
    steps: [
      { description: 'Remplir un grand verre à vin de glaçons.' },
      { description: 'Verser le Prosecco, puis la liqueur St-Germain.' },
      { description: 'Compléter avec l\'eau gazeuse.' },
      { description: 'Mélanger délicatement et garnir d\'une tranche de citron.' }
    ],
    tags: ['floral', 'pétillant', 'rafraîchissant', 'chic'],
    equipment: ['Verre à vin'],
    profile: { sweetness: 4, floral: 5, sparkling_level: 4, abv: 8, freshness: 4 },
    validated: 1
  },
  {
    title: 'Moscow Mule',
    kind: 'beverage',
    beverage_type: 'cocktail',
    description: 'Vodka et gingembre pour un coup de fouet.',
    ingredients: [
      { nom: 'Vodka', quantite: 5, unite: 'cl' },
      { nom: 'Ginger Beer', quantite: 15, unite: 'cl' },
      { nom: 'Jus de citron vert', quantite: 1, unite: 'cl' }
    ],
    steps: [
      { description: 'Remplir un mug en cuivre (ou un verre) de glaçons.' },
      { description: 'Verser la vodka et le jus de citron vert.' },
      { description: 'Compléter avec la Ginger Beer.' },
      { description: 'Mélanger et garnir d\'une rondelle de citron vert.' }
    ],
    tags: ['épicé', 'rafraîchissant', 'pétillant'],
    equipment: ['Mug en cuivre'],
    profile: { spice_heat: 3, freshness: 4, sparkling_level: 3, abv: 10 },
    validated: 1
  },
  {
    title: 'Negroni',
    kind: 'beverage',
    beverage_type: 'cocktail',
    description: 'Un cocktail amer et complexe pour les connaisseurs.',
    ingredients: [
      { nom: 'Gin', quantite: 3, unite: 'cl' },
      { nom: 'Campari', quantite: 3, unite: 'cl' },
      { nom: 'Vermouth rouge', quantite: 3, unite: 'cl' }
    ],
    steps: [
      { description: 'Verser tous les ingrédients dans un verre Old Fashioned rempli de glaçons.' },
      { description: 'Remuer doucement pendant 20 secondes pour diluer et rafraîchir.' },
      { description: 'Garnir d\'un zeste d\'orange.' }
    ],
    tags: ['amer', 'fort', 'classique'],
    equipment: ['Verre Old Fashioned', 'Cuillère à mélange'],
    profile: { bitterness: 5, sweetness: 2, abv: 25, body: 4 },
    validated: 1
  },
  {
    title: 'Whisky Sour',
    kind: 'beverage',
    beverage_type: 'cocktail',
    description: 'L\'onctuosité du blanc d\'oeuf rencontre le caractère du whisky.',
    ingredients: [
      { nom: 'Whisky', quantite: 5, unite: 'cl' },
      { nom: 'Jus de citron', quantite: 3, unite: 'cl' },
      { nom: 'Sirop de sucre', quantite: 1.5, unite: 'cl' },
      { nom: 'Blanc d\'oeuf', quantite: 1, unite: 'unité' }
    ],
    steps: [
      { description: 'Verser tous les ingrédients dans un shaker sans glace.' },
      { description: 'Shaker vigoureusement (Dry Shake) pour émulsionner le blanc d\'oeuf.' },
      { description: 'Ajouter des glaçons et shaker à nouveau pour rafraîchir.' },
      { description: 'Filtrer dans un verre rempli de glaçons.' }
    ],
    tags: ['acide', 'onctueux', 'classique'],
    equipment: ['Shaker'],
    profile: { acidity: 3, creaminess: 3, abv: 15, body: 3 },
    validated: 1
  },
  {
    title: 'Mai Tai',
    kind: 'beverage',
    beverage_type: 'cocktail',
    description: 'Le cocktail Tiki par excellence.',
    ingredients: [
      { nom: 'Rhum blanc', quantite: 3, unite: 'cl' },
      { nom: 'Rhum ambré', quantite: 3, unite: 'cl' },
      { nom: 'Triple sec', quantite: 1.5, unite: 'cl' },
      { nom: 'Sirop d\'orgeat', quantite: 1, unite: 'cl' },
      { nom: 'Jus de citron vert', quantite: 2, unite: 'cl' }
    ],
    steps: [
      { description: 'Verser tous les ingrédients (sauf le rhum ambré) dans un shaker avec de la glace.' },
      { description: 'Shaker et verser dans un verre Tiki rempli de glace pilée.' },
      { description: 'Verser délicatement le rhum ambré sur le dessus (float).' },
      { description: 'Décorer avec de la menthe fraîche et une tranche de citron vert.' }
    ],
    tags: ['fruité', 'fort', 'exotique'],
    equipment: ['Shaker', 'Verre Tiki'],
    profile: { sweetness: 3, abv: 20, freshness: 3, body: 4 },
    validated: 1
  },
  {
    title: 'Espresso Martini',
    kind: 'beverage',
    beverage_type: 'cocktail',
    description: 'Pour se réveiller et faire la fête.',
    ingredients: [
      { nom: 'Vodka', quantite: 4, unite: 'cl' },
      { nom: 'Liqueur de café', quantite: 2, unite: 'cl' },
      { nom: 'Café expresso', quantite: 1, unite: 'tasse' },
      { nom: 'Sirop de sucre', quantite: 1, unite: 'cl' }
    ],
    steps: [
      { description: 'Préparer un expresso et le laisser refroidir légèrement.' },
      { description: 'Verser tous les ingrédients dans un shaker rempli de glaçons.' },
      { description: 'Shaker très fort pour créer une belle mousse.' },
      { description: 'Filtrer finement dans un verre à Martini.' }
    ],
    tags: ['café', 'fort', 'énergisant'],
    equipment: ['Shaker', 'Verre à Martini'],
    profile: { bitterness: 3, sweetness: 3, abv: 15, body: 3 },
    validated: 1
  },
  {
    title: 'Bloody Mary',
    kind: 'beverage',
    beverage_type: 'cocktail',
    description: 'Le remède des lendemains difficiles.',
    ingredients: [
      { nom: 'Vodka', quantite: 4, unite: 'cl' },
      { nom: 'Jus de tomate', quantite: 12, unite: 'cl' },
      { nom: 'Jus de citron', quantite: 1, unite: 'cl' },
      { nom: 'Tabasco', quantite: 3, unite: 'gouttes' },
      { nom: 'Sauce Worcestershire', quantite: 2, unite: 'traits' },
      { nom: 'Sel de céleri', quantite: 1, unite: 'pincée' }
    ],
    steps: [
      { description: 'Dans un verre Highball rempli de glaçons, verser la vodka et le jus de tomate.' },
      { description: 'Ajouter le jus de citron et les épices.' },
      { description: 'Mélanger avec une cuillère à mélange.' },
      { description: 'Décorer avec une branche de céleri.' }
    ],
    tags: ['salé', 'épicé', 'brunch'],
    equipment: ['Verre Highball', 'Cuillère à mélange'],
    profile: { spice_heat: 4, saltiness: 4, body: 4, abv: 10 },
    validated: 1
  },
  {
    title: 'Blue Lagoon',
    kind: 'beverage',
    beverage_type: 'cocktail',
    description: 'Un cocktail bleu électrique au goût d\'agrumes.',
    ingredients: [
      { nom: 'Vodka', quantite: 4, unite: 'cl' },
      { nom: 'Curaçao bleu', quantite: 2, unite: 'cl' },
      { nom: 'Jus de citron', quantite: 2, unite: 'cl' },
      { nom: 'Limonade', quantite: null, unite: 'top' }
    ],
    steps: [
      { description: 'Verser la vodka, le curaçao et le jus de citron dans un shaker avec des glaçons.' },
      { description: 'Shaker et filtrer dans un verre rempli de glaçons.' },
      { description: 'Compléter avec de la limonade.' }
    ],
    tags: ['fruité', 'sucré', 'coloré'],
    equipment: ['Shaker', 'Verre Hurricane'],
    profile: { sweetness: 4, acidity: 2, abv: 10, freshness: 3 },
    validated: 1
  },
  {
    title: 'Tequila Sunrise',
    kind: 'beverage',
    beverage_type: 'cocktail',
    description: 'Les couleurs du lever de soleil dans un verre.',
    ingredients: [
      { nom: 'Tequila', quantite: 4, unite: 'cl' },
      { nom: 'Jus d\'orange', quantite: 10, unite: 'cl' },
      { nom: 'Sirop de grenadine', quantite: 1, unite: 'cl' }
    ],
    steps: [
      { description: 'Verser la tequila et le jus d\'orange dans un verre rempli de glaçons.' },
      { description: 'Verser doucement le sirop de grenadine pour qu\'il tombe au fond.' },
      { description: 'Ne pas mélanger pour conserver l\'effet dégradé.' }
    ],
    tags: ['fruité', 'sucré', 'dégradé'],
    equipment: ['Verre Highball'],
    profile: { sweetness: 4, abv: 10, freshness: 3 },
    validated: 1
  },
  {
    title: 'Caïpirinha',
    kind: 'beverage',
    beverage_type: 'cocktail',
    description: 'Le cocktail national du Brésil.',
    ingredients: [
      { nom: 'Cachaça', quantite: 5, unite: 'cl' },
      { nom: 'Citron vert', quantite: 1, unite: 'unité' },
      { nom: 'Sucre en poudre', quantite: 2, unite: 'c.à.c' }
    ],
    steps: [
      { description: 'Couper le citron vert en dés et le mettre dans le verre.' },
      { description: 'Ajouter le sucre et piler pour extraire le jus.' },
      { description: 'Remplir le verre de glace pilée.' },
      { description: 'Verser la cachaça et mélanger.' }
    ],
    tags: ['acide', 'fort', 'rafraîchissant'],
    equipment: ['Pilon', 'Verre Old Fashioned'],
    profile: { acidity: 4, sweetness: 3, abv: 20, freshness: 4 },
    validated: 1
  },
  {
    title: 'Cuba Libre',
    kind: 'beverage',
    beverage_type: 'cocktail',
    description: 'Rhum et Cola, simple et efficace.',
    ingredients: [
      { nom: 'Rhum ambré', quantite: 5, unite: 'cl' },
      { nom: 'Cola', quantite: 12, unite: 'cl' },
      { nom: 'Citron vert', quantite: 1, unite: 'quartier' }
    ],
    steps: [
      { description: 'Presser le quartier de citron dans un verre rempli de glaçons.' },
      { description: 'Verser le rhum.' },
      { description: 'Compléter avec le cola et mélanger.' }
    ],
    tags: ['sucré', 'pétillant', 'facile'],
    equipment: ['Verre Highball'],
    profile: { sweetness: 4, sparkling_level: 4, abv: 10 },
    validated: 1
  },
  {
    title: 'Mimosa',
    kind: 'beverage',
    beverage_type: 'cocktail',
    description: 'Le cocktail incontournable des brunchs.',
    ingredients: [
      { nom: 'Champagne', quantite: 8, unite: 'cl' },
      { nom: 'Jus d\'orange', quantite: 8, unite: 'cl' }
    ],
    steps: [
      { description: 'Verser le jus d\'orange dans une flûte.' },
      { description: 'Compléter doucement avec le champagne bien frais.' }
    ],
    tags: ['pétillant', 'fruité', 'brunch'],
    equipment: ['Flûte à champagne'],
    profile: { sweetness: 3, sparkling_level: 5, abv: 8, freshness: 4 },
    validated: 1
  },
  {
    title: 'Virgin Mojito',
    kind: 'beverage',
    beverage_type: 'mocktail',
    description: 'Toute la fraîcheur du Mojito, sans l\'alcool.',
    ingredients: [
      { nom: 'Menthe', quantite: 10, unite: 'feuilles' },
      { nom: 'Citron vert', quantite: 0.5, unite: 'unité' },
      { nom: 'Sucre de canne', quantite: 2, unite: 'c.à.c' },
      { nom: 'Eau gazeuse', quantite: null, unite: 'top' },
      { nom: 'Limonade', quantite: 2, unite: 'cl' }
    ],
    steps: [
      { description: 'Placer la menthe, le citron vert en dés et le sucre dans le verre.' },
      { description: 'Piler délicatement sans broyer la menthe.' },
      { description: 'Ajouter de la glace pilée.' },
      { description: 'Verser la limonade et compléter avec l\'eau gazeuse.' }
    ],
    tags: ['rafraîchissant', 'mentholé', 'sans alcool'],
    equipment: ['Pilon', 'Verre Highball'],
    profile: { freshness: 5, acidity: 3, sweetness: 3, abv: 0, sparkling_level: 3 },
    validated: 1
  },
  {
    title: 'Virgin Colada',
    kind: 'beverage',
    beverage_type: 'mocktail',
    description: 'Voyage sous les tropiques sans alcool.',
    ingredients: [
      { nom: 'Jus d\'ananas', quantite: 12, unite: 'cl' },
      { nom: 'Lait de coco', quantite: 4, unite: 'cl' },
      { nom: 'Sirop de sucre', quantite: 1, unite: 'cl' }
    ],
    steps: [
      { description: 'Mettre tous les ingrédients dans un blender avec de la glace.' },
      { description: 'Mixer jusqu\'à obtenir une texture lisse.' },
      { description: 'Servir dans un grand verre.' }
    ],
    tags: ['crémeux', 'fruité', 'exotique', 'sans alcool'],
    equipment: ['Blender', 'Verre Hurricane'],
    profile: { sweetness: 4, creaminess: 4, freshness: 3, abv: 0 },
    validated: 1
  },
  {
    title: 'Shirley Temple',
    kind: 'beverage',
    beverage_type: 'mocktail',
    description: 'Le mocktail le plus célèbre du monde.',
    ingredients: [
      { nom: 'Ginger Ale', quantite: 15, unite: 'cl' },
      { nom: 'Sirop de grenadine', quantite: 2, unite: 'cl' },
      { nom: 'Cerise confite', quantite: 1, unite: 'unité' }
    ],
    steps: [
      { description: 'Remplir un verre de glaçons.' },
      { description: 'Verser le Ginger Ale puis la grenadine.' },
      { description: 'Mélanger et décorer avec une cerise.' }
    ],
    tags: ['sucré', 'pétillant', 'sans alcool'],
    equipment: ['Verre Highball'],
    profile: { sweetness: 5, sparkling_level: 4, abv: 0 },
    validated: 1
  },
  {
    title: 'Cinderella',
    kind: 'beverage',
    beverage_type: 'mocktail',
    description: 'Un mélange fruité pour les princesses et les princes.',
    ingredients: [
      { nom: 'Jus d\'orange', quantite: 4, unite: 'cl' },
      { nom: 'Jus d\'ananas', quantite: 4, unite: 'cl' },
      { nom: 'Jus de citron', quantite: 2, unite: 'cl' },
      { nom: 'Sirop de grenadine', quantite: 1, unite: 'cl' },
      { nom: 'Eau gazeuse', quantite: 4, unite: 'cl' }
    ],
    steps: [
      { description: 'Verser les jus et le sirop dans un shaker avec des glaçons.' },
      { description: 'Shaker vigoureusement.' },
      { description: 'Filtrer dans un verre et allonger d\'un trait d\'eau gazeuse.' }
    ],
    tags: ['fruité', 'sucré', 'sans alcool'],
    equipment: ['Shaker', 'Verre Tulipe'],
    profile: { sweetness: 4, acidity: 3, abv: 0, freshness: 4 },
    validated: 1
  },
  {
    title: 'Bora Bora',
    kind: 'beverage',
    beverage_type: 'mocktail',
    description: 'Exotisme garanti.',
    ingredients: [
      { nom: 'Jus d\'ananas', quantite: 10, unite: 'cl' },
      { nom: 'Jus de fruit de la passion', quantite: 6, unite: 'cl' },
      { nom: 'Jus de citron', quantite: 1, unite: 'cl' },
      { nom: 'Sirop de grenadine', quantite: 1, unite: 'cl' }
    ],
    steps: [
      { description: 'Shaker tous les ingrédients avec de la glace.' },
      { description: 'Servir dans un verre rempli de glaçons.' }
    ],
    tags: ['exotique', 'fruité', 'sans alcool'],
    equipment: ['Shaker', 'Verre Hurricane'],
    profile: { sweetness: 4, acidity: 3, abv: 0, freshness: 3 },
    validated: 1
  },
  {
    title: 'Virgin Mary',
    kind: 'beverage',
    beverage_type: 'mocktail',
    description: 'La version sobre du Bloody Mary.',
    ingredients: [
      { nom: 'Jus de tomate', quantite: 15, unite: 'cl' },
      { nom: 'Jus de citron', quantite: 1, unite: 'cl' },
      { nom: 'Tabasco', quantite: 2, unite: 'gouttes' },
      { nom: 'Sauce Worcestershire', quantite: 2, unite: 'traits' },
      { nom: 'Sel de céleri', quantite: 1, unite: 'pincée' }
    ],
    steps: [
      { description: 'Mélanger tous les ingrédients dans un verre avec des glaçons.' },
      { description: 'Assaisonner selon le goût.' },
      { description: 'Décorer avec une branche de céleri.' }
    ],
    tags: ['salé', 'épicé', 'sans alcool'],
    equipment: ['Verre Highball'],
    profile: { spice_heat: 3, saltiness: 4, body: 3, abv: 0 },
    validated: 1
  },
  {
    title: 'Limonade Maison',
    kind: 'beverage',
    beverage_type: 'mocktail',
    description: 'Rien ne vaut une bonne limonade fraîche.',
    ingredients: [
      { nom: 'Jus de citron', quantite: 4, unite: 'cl' },
      { nom: 'Eau', quantite: 20, unite: 'cl' },
      { nom: 'Sucre', quantite: 2, unite: 'c.à.c' },
      { nom: 'Menthe', quantite: 2, unite: 'feuilles' }
    ],
    steps: [
      { description: 'Dissoudre le sucre dans le jus de citron.' },
      { description: 'Ajouter l\'eau et mélanger.' },
      { description: 'Servir très frais avec des feuilles de menthe.' }
    ],
    tags: ['acide', 'rafraîchissant', 'sans alcool'],
    equipment: ['Carafe'],
    profile: { acidity: 4, sweetness: 3, freshness: 5, abv: 0 },
    validated: 1
  },
  {
    title: 'Thé Glacé Pêche',
    kind: 'beverage',
    beverage_type: 'mocktail',
    description: 'Le goûter parfait.',
    ingredients: [
      { nom: 'Thé noir infusé', quantite: 20, unite: 'cl' },
      { nom: 'Sirop de pêche', quantite: 3, unite: 'cl' },
      { nom: 'Jus de citron', quantite: 1, unite: 'cl' }
    ],
    steps: [
      { description: 'Faire infuser le thé et le laisser refroidir.' },
      { description: 'Mélanger avec le sirop et le jus de citron.' },
      { description: 'Servir avec beaucoup de glaçons.' }
    ],
    tags: ['rafraîchissant', 'fruité', 'sans alcool'],
    equipment: ['Verre Highball'],
    profile: { sweetness: 3, freshness: 4, abv: 0 },
    validated: 1
  },
  {
    title: 'Smoothie Fraise-Banane',
    kind: 'beverage',
    beverage_type: 'smoothie',
    description: 'Le classique des smoothies.',
    ingredients: [
      { nom: 'Fraise', quantite: 100, unite: 'g' },
      { nom: 'Banane', quantite: 1, unite: 'unité' },
      { nom: 'Yaourt nature', quantite: 1, unite: 'pot' },
      { nom: 'Miel', quantite: 1, unite: 'c.à.c' }
    ],
    steps: [
      { description: 'Laver et équeuter les fraises.' },
      { description: 'Mettre tous les ingrédients dans le blender.' },
      { description: 'Mixer jusqu\'à obtenir une texture lisse.' }
    ],
    tags: ['fruité', 'crémeux', 'petit-déjeuner'],
    equipment: ['Blender'],
    profile: { sweetness: 3, creaminess: 4, body: 4, abv: 0 },
    validated: 1
  },
  {
    title: 'Smoothie Vert Détox',
    kind: 'beverage',
    beverage_type: 'smoothie',
    description: 'Pour faire le plein de vitamines.',
    ingredients: [
      { nom: 'Épinard', quantite: 1, unite: 'poignée' },
      { nom: 'Pomme verte', quantite: 1, unite: 'unité' },
      { nom: 'Concombre', quantite: 0.5, unite: 'unité' },
      { nom: 'Jus de citron', quantite: 1, unite: 'cl' }
    ],
    steps: [
      { description: 'Laver les légumes et les couper en morceaux.' },
      { description: 'Mixer tous les ingrédients au blender.' },
      { description: 'Ajouter un peu d\'eau si la texture est trop épaisse.' }
    ],
    tags: ['sain', 'végétal', 'frais'],
    equipment: ['Blender'],
    profile: { freshness: 5, acidity: 3, sweetness: 2, abv: 0 },
    validated: 1
  },
  {
    title: 'Smoothie Tropical',
    kind: 'beverage',
    beverage_type: 'smoothie',
    description: 'Un rayon de soleil dans votre verre.',
    ingredients: [
      { nom: 'Mangue', quantite: 0.5, unite: 'unité' },
      { nom: 'Ananas', quantite: 2, unite: 'tranches' },
      { nom: 'Fruit de la passion', quantite: 1, unite: 'unité' },
      { nom: 'Jus d\'orange', quantite: 10, unite: 'cl' }
    ],
    steps: [
      { description: 'Couper les fruits en morceaux.' },
      { description: 'Récupérer la pulpe du fruit de la passion.' },
      { description: 'Mixer le tout avec le jus d\'orange.' }
    ],
    tags: ['exotique', 'fruité', 'vitaminé'],
    equipment: ['Blender'],
    profile: { sweetness: 4, acidity: 3, freshness: 4, abv: 0 },
    validated: 1
  },
  {
    title: 'Smoothie Rouge',
    kind: 'beverage',
    beverage_type: 'smoothie',
    description: 'Explosion de fruits rouges.',
    ingredients: [
      { nom: 'Framboise', quantite: 50, unite: 'g' },
      { nom: 'Myrtille', quantite: 50, unite: 'g' },
      { nom: 'Fraise', quantite: 50, unite: 'g' },
      { nom: 'Lait d\'amande', quantite: 15, unite: 'cl' }
    ],
    steps: [
      { description: 'Laver les fruits.' },
      { description: 'Mixer avec le lait d\'amande.' },
      { description: 'Servir immédiatement.' }
    ],
    tags: ['fruité', 'antioxydant'],
    equipment: ['Blender'],
    profile: { sweetness: 3, acidity: 3, freshness: 4, abv: 0 },
    validated: 1
  },
  {
    title: 'Smoothie Protéiné',
    kind: 'beverage',
    beverage_type: 'smoothie',
    description: 'Idéal après le sport.',
    ingredients: [
      { nom: 'Banane', quantite: 1, unite: 'unité' },
      { nom: 'Beurre de cacahuète', quantite: 1, unite: 'c.à.s' },
      { nom: 'Lait', quantite: 20, unite: 'cl' },
      { nom: 'Cacao en poudre', quantite: 1, unite: 'c.à.c' }
    ],
    steps: [
      { description: 'Mettre tous les ingrédients dans le blender.' },
      { description: 'Mixer jusqu\'à homogénéité.' }
    ],
    tags: ['riche', 'protéiné', 'gourmand'],
    equipment: ['Blender'],
    profile: { sweetness: 3, creaminess: 4, body: 5, abv: 0 },
    validated: 1
  },
  {
    title: 'Lassi Mangue',
    kind: 'beverage',
    beverage_type: 'smoothie',
    description: 'Boisson traditionnelle indienne.',
    ingredients: [
      { nom: 'Mangue', quantite: 1, unite: 'unité' },
      { nom: 'Yaourt nature', quantite: 1, unite: 'pot' },
      { nom: 'Lait', quantite: 10, unite: 'cl' },
      { nom: 'Cardamome', quantite: 1, unite: 'pincée' }
    ],
    steps: [
      { description: 'Peler et couper la mangue.' },
      { description: 'Mixer avec le yaourt, le lait et la cardamome.' },
      { description: 'Servir très frais.' }
    ],
    tags: ['crémeux', 'exotique', 'indien'],
    equipment: ['Blender'],
    profile: { sweetness: 4, creaminess: 5, body: 4, abv: 0 },
    validated: 1
  },
  {
    title: 'Milkshake Vanille',
    kind: 'beverage',
    beverage_type: 'milk-shake',
    description: 'La gourmandise à l\'état pur.',
    ingredients: [
      { nom: 'Glace vanille', quantite: 2, unite: 'boules' },
      { nom: 'Lait', quantite: 15, unite: 'cl' },
      { nom: 'Chantilly', quantite: null, unite: 'top' }
    ],
    steps: [
      { description: 'Mixer la glace et le lait.' },
      { description: 'Verser dans un grand verre.' },
      { description: 'Recouvrir de chantilly.' }
    ],
    tags: ['gourmand', 'sucré', 'dessert'],
    equipment: ['Blender'],
    profile: { sweetness: 5, creaminess: 5, body: 5, abv: 0 },
    validated: 1
  },

  // --- FOOD ---
  {
    title: 'Salade César',
    kind: 'food',
    beverage_type: 'entrée',
    description: 'Laitue romaine, parmesan, croûtons et sauce César.',
    steps: [
        { titre: 'Préparation', description: 'Laver la salade et couper le poulet en dés.' },
        { titre: 'Cuisson', description: 'Faire dorer le poulet à la poêle.' },
        { titre: 'Assemblage', description: 'Mélanger la salade, le poulet, les croûtons et la sauce. Saupoudrer de parmesan.' }
    ],
    ingredients: [
      { nom: 'Laitue romaine', quantite: 1, unite: 'pièce' },
      { nom: 'Parmesan', quantite: 50, unite: 'g' },
      { nom: 'Poulet', quantite: 150, unite: 'g' },
      { nom: 'Sauce César', quantite: 5, unite: 'cl' }
    ],
    tags: ['frais', 'léger', 'umami', 'salé', 'Salade', 'Viande', 'Fromage'],
    equipment: ['Saladier', 'Poêle'],
    profile: { freshness: 4, creaminess: 2, body: 2 },
    validated: 1
  },
  {
    title: 'Pâtes Carbonara',
    kind: 'food',
    beverage_type: 'plat',
    description: 'La vraie recette italienne sans crème.',
    steps: [
        { titre: 'Cuisson des pâtes', description: 'Faire cuire les pâtes al dente.' },
        { titre: 'Préparation de la sauce', description: 'Mélanger les jaunes d\'oeufs et le pecorino.' },
        { titre: 'Cuisson du guanciale', description: 'Faire revenir le guanciale (ou lardons) à la poêle.' },
        { titre: 'Assemblage', description: 'Mélanger les pâtes avec le guanciale et la sauce hors du feu.' }
    ],
    ingredients: [
      { nom: 'Spaghetti', quantite: 200, unite: 'g' },
      { nom: 'Guanciale', quantite: 100, unite: 'g' },
      { nom: 'Oeufs', quantite: 2, unite: 'jaunes' },
      { nom: 'Pecorino', quantite: 50, unite: 'g' }
    ],
    tags: ['riche', 'salé', 'umami', 'Pâtes', 'Viande', 'Fromage'],
    equipment: ['Casserole', 'Poêle'],
    profile: { creaminess: 5, saltiness: 4, body: 5 },
    validated: 1
  },
  {
    title: 'Tiramisu',
    kind: 'food',
    beverage_type: 'dessert',
    description: 'Le dessert italien au café.',
    steps: [
        { titre: 'Préparation de la crème', description: 'Mélanger les jaunes d\'oeufs et le sucre, puis ajouter le mascarpone.' },
        { titre: 'Montage des blancs', description: 'Monter les blancs en neige et les incorporer délicatement.' },
        { titre: 'Trempage', description: 'Tremper les biscuits dans le café.' },
        { titre: 'Montage', description: 'Alterner couches de biscuits et de crème.' }
    ],
    ingredients: [
      { nom: 'Mascarpone', quantite: 250, unite: 'g' },
      { nom: 'Oeufs', quantite: 3, unite: 'unité' },
      { nom: 'Sucre', quantite: 50, unite: 'g' },
      { nom: 'Café', quantite: 1, unite: 'tasse' },
      { nom: 'Biscuits à la cuillère', quantite: 12, unite: 'unité' }
    ],
    tags: ['sucré', 'crémeux', 'café', 'Dessert'],
    equipment: ['Saladier', 'Batteur électrique'],
    profile: { sweetness: 4, creaminess: 5, body: 4 },
    validated: 1
  },
  {
    title: 'Burger Maison',
    kind: 'food',
    beverage_type: 'plat',
    description: 'Un bon burger juteux.',
    steps: [
        { titre: 'Cuisson de la viande', description: 'Faire cuire le steak haché à la poêle.' },
        { titre: 'Préparation des pains', description: 'Toaster les pains à burger.' },
        { titre: 'Assemblage', description: 'Monter le burger avec la sauce, la salade, la tomate, la viande et le fromage.' }
    ],
    ingredients: [
      { nom: 'Pain à burger', quantite: 1, unite: 'unité' },
      { nom: 'Steak haché', quantite: 1, unite: 'unité' },
      { nom: 'Cheddar', quantite: 1, unite: 'tranche' },
      { nom: 'Tomate', quantite: 1, unite: 'tranche' },
      { nom: 'Salade', quantite: 1, unite: 'feuille' }
    ],
    tags: ['riche', 'salé', 'viande', 'Fast Food'],
    equipment: ['Poêle'],
    profile: { saltiness: 3, body: 5, creaminess: 3 },
    validated: 1
  }
];

async function upsertIngredient(name) {
  if (!name) return null;
  const normalized = normalizeIngredient(name);

  // Check if exists
  const existing = await db.get('SELECT id FROM ingredients WHERE normalized_name = ?', [normalized]);
  if (existing) return existing.id;

  // Insert
  const result = await db.run('INSERT INTO ingredients (name, normalized_name) VALUES (?, ?)', [name, normalized]);
  return result.lastID;
}

async function upsertTag(name) {
  if (!name) return null;
  const row = await db.get('SELECT id FROM tags WHERE name = ?', [name]);
  if (row) return row.id;
  const res = await db.run('INSERT INTO tags (name) VALUES (?)', [name]);
  return res.lastID;
}

async function upsertEquipment(name) {
  if (!name) return null;
  const row = await db.get('SELECT id FROM equipment WHERE name = ?', [name]);
  if (row) return row.id;
  const res = await db.run('INSERT INTO equipment (name) VALUES (?)', [name]);
  return res.lastID;
}

async function seed() {
  try {
    console.log('Starting safe seed (import)...');

    // DO NOT DELETE EXISTING DATA
    // await db.run('DELETE FROM ...');

    for (const item of sampleItems) {
      // Check if item exists
      const existingItem = await db.get('SELECT id FROM items WHERE title = ?', [item.title]);

      if (existingItem) {
          console.log(`Skipping existing item: ${item.title}`);
          continue;
      }

      console.log(`Importing new item: ${item.title}`);

      const now = new Date().toISOString();
      const insert = await db.run(
        `INSERT INTO items (kind, beverage_type, title, description, validated, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          item.kind,
          item.beverage_type || null,
          item.title,
          item.description || null,
          item.validated ? 1 : 0,
          now,
          now
        ]
      );
      const itemId = insert.lastID;

      // Ingredients
      for (const ing of item.ingredients || []) {
        const ingId = await upsertIngredient(ing.nom);
        if (!ingId) continue;
        await db.run(`INSERT OR REPLACE INTO item_ingredients (item_id, ingredient_id, quantity, unit) VALUES (?, ?, ?, ?)`,
          [itemId, ingId, ing.quantite ? Number(ing.quantite) : null, ing.unite || null]);
      }

      // Tags
      for (const tag of item.tags || []) {
        const tagId = await upsertTag(tag);
        if (tagId) {
          await db.run(`INSERT OR IGNORE INTO item_tags (item_id, tag_id) VALUES (?, ?)`, [itemId, tagId]);
        }
      }

      // Equipment
      for (const eq of item.equipment || []) {
        const eqId = await upsertEquipment(eq);
        if (eqId) {
          await db.run(`INSERT OR IGNORE INTO item_equipment (item_id, equipment_id) VALUES (?, ?)`, [itemId, eqId]);
        }
      }

      // Steps
      if (item.steps && item.steps.length > 0) {
          for (let i = 0; i < item.steps.length; i++) {
              const step = item.steps[i];
              await db.run(
                  `INSERT INTO item_steps (item_id, step_order, title, description) VALUES (?, ?, ?, ?)`,
                  [itemId, i + 1, step.titre || `Étape ${i+1}`, step.description]
              );
          }
      }

      // Profile
      if (item.profile) {
        const p = item.profile;
        await db.run(`
            INSERT INTO item_profiles (item_id, sweetness, acidity, bitterness, body, spice_heat, creaminess, smokiness, freshness, sparkling_level, abv, served_cold)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            itemId,
            p.sweetness || 0, p.acidity || 0, p.bitterness || 0, p.body || 0, p.spice_heat || 0,
            p.creaminess || 0, p.smokiness || 0, p.freshness || 0, p.sparkling_level || 0, p.abv || 0, p.served_cold || 0
        ]);
      }
    }

    console.log('Safe seed completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
