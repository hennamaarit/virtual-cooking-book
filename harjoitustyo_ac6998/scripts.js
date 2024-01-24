
// Ladataan kaikki reseptit -funktio
function loadAll() {
  let infoText = document.getElementById('infoText');
  infoText.innerHTML = 'Ladataan reseptit palvelimelta, odota...';
  loadRecipes();
}

// Ladataan reseptit -funktio
async function loadRecipes() {
  try {
    const response = await fetch('http://localhost:3000/recipes');
    const recipes = await response.json();
    console.log(recipes);
    showRecipes(recipes);
  } catch (error) {
    console.error('Error loading recipes:', error);
  }
}

// Näytetään reseptit
function showRecipes(recipes) {
  let recipeList = document.getElementById('recipeList');
  let infoText = document.getElementById('infoText');

  // Tyhjennetään reseptilista ennen päivitystä
  recipeList.innerHTML = '';

  // Ilmoitus jos reseptejä ei löydy
  if (recipes.length === 0) {
    infoText.innerHTML = 'Ei reseptejä';
  } else {
    // Reseptilista käännetään päinvastaiseksi
    recipes.reverse().forEach(recipe => {
      let li = createRecipeListItem(recipe);
      recipeList.appendChild(li);
    });
    infoText.innerHTML = '';
  }
}

// Funktio reseptin listaukseen
function createRecipeListItem(recipe) {
  let div = document.createElement('div');
  div.classList.add('recipe-item');

  // Nimi
  let name = document.createElement('p');
  name.textContent = `Nimi: ${recipe.name}`;
  div.appendChild(name);

  // Tyyppi
  let type = document.createElement('p');
  type.textContent = `Tyyppi: ${recipe.type}`;
  div.appendChild(type);

  // Ohjeet
  let instructions = document.createElement('p');
  instructions.textContent = `Ohjeet: ${recipe.instructions}`;
  div.appendChild(instructions);

  // Erityisvalinnat
  if (recipe.glutenFree) {
    let glutenFree = document.createElement('p');
    glutenFree.textContent = `Gluteeniton: Kyllä`;
    div.appendChild(glutenFree);
  }

  if (recipe.dairyFree) {
    let dairyFree = document.createElement('p');
    dairyFree.textContent = `Maidoton: Kyllä`;
    div.appendChild(dairyFree);
  }

  if (recipe.vegetarian) {
    let vegetarian = document.createElement('p');
    vegetarian.textContent = `Vegetaarinen: Kyllä`;
    div.appendChild(vegetarian);
  }

  // Muokkauspainike
  let editButton = document.createElement('button');
  editButton.textContent = 'Muokkaa';
  editButton.addEventListener('click', () => editRecipe(recipe._id));
  div.appendChild(editButton);

  return div;
}

// Muokataan reseptiä -funktio
async function editRecipe(recipeId) {
  try {
    // Haetaan reseptin nykyiset tiedot palvelimelta
    const response = await fetch(`http://localhost:3000/recipes/${recipeId}`);
    if (response.ok) {
      const recipe = await response.json();

      //Muokkausmahdollisuus nimeen ja ohjeeseen
      const newName = prompt('Anna uusi nimi:', recipe.name);
      const newInstructions = prompt('Anna uudet ohjeet:', recipe.instructions);

      // Objekti uusilla tiedoilla
      const updatedData = {
        name: newName,
        instructions: newInstructions,
      };

      // Lähetetään päivityspyyntö palvelimelle
      const updateResponse = await fetch(`http://localhost:3000/recipes/${recipeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (updateResponse.ok) {
        const editedRecipe = await updateResponse.json();
        console.log('Recipe edited:', editedRecipe);

        // Ladataan reseptit uudelleen päivitettyjen tietojen näyttämiseksi
        loadRecipes();
      } else {
        console.error('Error editing recipe:', updateResponse.status, updateResponse.statusText);
      }
    } else {
      console.error('Error fetching recipe for editing:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error editing recipe:', error);
  }
}

// Reseptin lähetys tietokantaan / uuden reseptin luominen
async function submitRecipe() {
  // Muuttujien tiedot
  let recipeName = document.getElementById('recipeName').value;
  let recipeType = document.getElementById('recipeType').value;
  let recipeInstructions = document.getElementById('recipeInstructions').value;
  let glutenFree = document.getElementById('glutenFree').checked;
  let dairyFree = document.getElementById('dairyFree').checked;
  let vegetarian = document.getElementById('vegetarian').checked;

  const data = {
    name: recipeName,
    type: recipeType,
    instructions: recipeInstructions,
    glutenFree: glutenFree,
    dairyFree: dairyFree,
    vegetarian: vegetarian,
  };
  // Lähetetään reseptin tiedot tietokantaan
  try {
    const response = await fetch('http://localhost:3000/recipes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const recipe = await response.json();
    console.log('Recipe added:', recipe);

    // Tyhjennetään input-kentät onnistuneen lisäyksen jälkeen
    document.getElementById('recipeName').value = '';
    document.getElementById('recipeType').value = '';
    document.getElementById('recipeInstructions').value = '';
    document.getElementById('glutenFree').checked = false;
    document.getElementById('dairyFree').checked = false;
    document.getElementById('vegetarian').checked = false;

    // Lataa reseptit uudelleen, jotta näytöllä näkyvät ajan tasalla olevat tiedot
    loadRecipes();
  } catch (error) {
    console.error('Error adding recipe:', error);
  }
}

// Poistetaan resepti -funktio
async function deleteRecipe() {
  let deleteRecipeInput = document.getElementById('deleteRecipeName').value;

  if (!deleteRecipeInput) {
    alert("Syötä reseptin nimi, jonka haluat poistaa.");
    return;
  }
  //Poistetaan
  try {
    const response = await fetch(`http://localhost:3000/recipes/${deleteRecipeInput}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      const deletedRecipe = await response.json();
      console.log('Recipe deleted:', deletedRecipe);

      //Ladataan uudelleen päivitetty lista resepteistä
      loadRecipes()
      //Tyhjennetään poistettavan reseptin nimi -kohta
      document.getElementById('deleteRecipeName').value = '';
    } else {
      console.error('Error deleting recipe:', response.status, response.statusText);
      // Päivitetään infoText, jos poisto epäonnistui
      let infoText = document.getElementById('infoText');
      infoText.innerHTML = 'Reseptin poistaminen epäonnistui, tarkista antamasi nimi';
      //Tyhjennetään poistettavan reseptin nimi -kohta
      document.getElementById('deleteRecipeName').value = ''
    }
  } catch (error) {
    console.error('Error deleting recipe:', error);
  }
}











