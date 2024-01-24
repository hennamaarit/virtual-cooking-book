// 
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

// Sallitaan yhteys muistakin porteista
app.use(cors());

// Muutetaan JSON string JSON objektiksi
app.use(express.json());

// MongoDB yhteys/tietokanta
const mongoDB = 'mongodb+srv://dbuser:x@cluster0.hvobduv.mongodb.net/recipes';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', function () {
  console.log("Database connected");
});

// Schema
const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  instructions: { type: String, required: true },
  glutenFree: { type: Boolean, default: false },
  dairyFree: { type: Boolean, default: false },
  vegetarian: { type: Boolean, default: false }
});

// Modelnp
const Recipe = mongoose.model('Recipe', recipeSchema);

// Lisätään resepti, POST
app.post('/recipes', async (req, res) => {
  const { name, type, instructions, glutenFree, dairyFree, vegetarian } = req.body;

  const recipe = new Recipe({
    name,
    type,
    instructions,
    glutenFree,
    dairyFree,
    vegetarian,
  });

  try {
    const savedRecipe = await recipe.save();
    res.json(savedRecipe);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Haetaan kaikki reseptit, GET
app.get('/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Haetaan reseptit ID:n perusteella, GET
app.get('/recipes/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (recipe) {
      res.json(recipe);
    } else {
      res.status(404).json({ error: 'Recipe not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Poistetaan reseptejä nimen perusteella, DELETE
app.delete('/recipes/:name', async (req, res) => {
  try {
    const deletedRecipe = await Recipe.findOneAndDelete({ name: req.params.name });
    if (deletedRecipe) {
      res.json(deletedRecipe);
    } else {
      res.status(404).json({ error: 'Recipe not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Muokataan reseptejä id:n perusteella, PUT
app.put('/recipes/:id', async (req, res) => {
  const { name, type, instructions, glutenFree, dairyFree, vegetarian } = req.body;
  const updatedRecipe = {
    name,
    type,
    instructions,
    glutenFree,
    dairyFree,
    vegetarian,
  };
  try {
    const editedRecipe = await Recipe.findByIdAndUpdate(req.params.id, updatedRecipe, { new: true });
    if (editedRecipe) {
      res.json(editedRecipe);
    } else {
      res.status(404).json({ error: 'Recipe not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Startataan serveri
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});