
// js/scripts.js

// --- 1. GLOBAL THEME LOGIC ---
function applyTheme(theme) {
    const bodyElement = document.body;
    const htmlElement = document.documentElement;
    if (theme === 'light') {
        bodyElement.classList.add('light-mode');
        htmlElement.classList.add('light-mode');
    } else {
        bodyElement.classList.remove('light-mode');
        htmlElement.classList.remove('light-mode');
    }
    localStorage.setItem('theme', theme);
    updateDarkModeToggleState();
}

function updateDarkModeToggleState() {
    const toggle = document.getElementById('dark-mode-switch');
    if (toggle) {
        const currentTheme = localStorage.getItem('theme') || 'dark';
        toggle.checked = currentTheme === 'light';
    }
}

// --- 2. GLOBAL TRANSLATION LOGIC (ROBUST VERSION) ---
function googleTranslateElementInit() {
    new google.translate.TranslateElement({
        pageLanguage: 'en',
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        autoDisplay: false
    }, 'google_translate_element');
    waitForGoogleTranslate();
}

function waitForGoogleTranslate() {
    const maxAttempts = 50; // Wait a maximum of 5 seconds
    let attempts = 0;
    const intervalId = setInterval(function() {
        const translateWidget = document.querySelector('.goog-te-combo');
        if (translateWidget) {
            clearInterval(intervalId);
            applySavedLanguage();
        }
        attempts++;
        if (attempts > maxAttempts) {
            console.warn("Google Translate widget did not initialize in time.");
            clearInterval(intervalId);
        }
    }, 100);
}

function changeLanguage(lang) {
    const translateWidget = document.querySelector('.goog-te-combo');
    if (translateWidget) {
        if (translateWidget.value !== lang) {
            translateWidget.value = lang;
            translateWidget.dispatchEvent(new Event('change'));
        }
    } else {
        console.error("Could not find the Google Translate widget to change language.");
    }
}

function applySavedLanguage() {
    const savedLang = localStorage.getItem('userLanguage');
    if (savedLang && savedLang !== 'en') {
        changeLanguage(savedLang);
    }
}

window.setLanguage = function() {
    const langSelector = document.getElementById('language');
    if (langSelector) {
        const lang = langSelector.value;
        localStorage.setItem('userLanguage', lang);
        changeLanguage(lang);
        document.getElementById('login-dropdown').classList.remove('show');
    }
};

// --- 3. MAIN SCRIPT INITIALIZATION ---
document.addEventListener('DOMContentLoaded', function() {
    
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);

    // --- Logic for Homepage Dropdown & Theme Toggle ---
    const loginButton = document.getElementById('login-button');
    const loginDropdown = document.getElementById('login-dropdown');

    if (loginButton && loginDropdown) {
        
        window.updateLoginUI = function() {
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            let dropdownHTML = '';

            if (isLoggedIn) {
                dropdownHTML = `
                    <a href="#" id="my-profile-link">My Profile</a>
                    <a href="favourites.html">Favourites</a>
                    <div class="dropdown-divider"></div>
                    <div class="dropdown-item" id="logout-link">Logout</div>
                `;
            } else {
                dropdownHTML = `
                    <a href="#" id="login-link">Login</a>
                    <a href="#" id="signup-link">Sign Up / Register</a>
                `;
            }

            dropdownHTML += `
                <div class="dropdown-divider"></div>
                <div class="dark-mode-toggle">
                    <span>Light Mode</span>
                    <label class="switch">
                        <input type="checkbox" id="dark-mode-switch">
                        <span class="slider"></span>
                    </label>
                </div>
                <div class="dropdown-divider"></div>
                <select id="language" onchange="setLanguage()">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                    <option value="zh-CN">Chinese (Simplified)</option>
                    <option value="ja">Japanese</option>
                </select>
            `;

            loginDropdown.innerHTML = dropdownHTML;
            updateDarkModeToggleState();

            const savedLang = localStorage.getItem('userLanguage');
            if (savedLang) {
                const langSelect = document.getElementById('language');
                if(langSelect) langSelect.value = savedLang;
            }
        }

        loginDropdown.addEventListener('click', function(event) {
            const target = event.target;
            if (target && target.id === 'logout-link') {
                localStorage.removeItem('isLoggedIn');
                alert('You have been logged out.');
                updateLoginUI();
            }
            if (target && target.id === 'login-link') {
                localStorage.setItem('isLoggedIn', 'true');
                alert('Login successful! (This is a simulation)');
                updateLoginUI();
            }
            if (target && target.id === 'dark-mode-switch') {
                const newTheme = target.checked ? 'light' : 'dark';
                applyTheme(newTheme);
            }
        });

        loginButton.addEventListener('click', function(event) {
            event.stopPropagation();
            loginDropdown.classList.toggle('show');
        });

        window.addEventListener('click', function(event) {
            if (!loginButton.contains(event.target) && !loginDropdown.contains(event.target)) {
                if (loginDropdown.classList.contains('show')) {
                    loginDropdown.classList.remove('show');
                }
            }
        });
        
        updateLoginUI();
    }
    
    // --- Logic for Recipe Cards and Favourites Pages ---
    const recipeGrid = document.getElementById('recipe-grid');
    const favouritesGrid = document.getElementById('favourites-grid');

    if (recipeGrid || favouritesGrid) {
        function checkLoginForFavouritesButton() {
            const favsContainer = document.getElementById('favourites-link-container');
            if (favsContainer) {
                const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
                if (isLoggedIn) {
                    favsContainer.classList.remove('hidden');
                } else {
                    favsContainer.classList.add('hidden');
                }
            }
        }
        checkLoginForFavouritesButton();

        const getFavourites = () => JSON.parse(localStorage.getItem('burgerFavourites') || '[]');
        const saveFavourites = (favourites) => localStorage.setItem('burgerFavourites', JSON.stringify(favourites));
        
        const toggleFavourite = (recipeName, heartElement) => {
            let favourites = getFavourites();
            if (favourites.includes(recipeName)) {
                favourites = favourites.filter(name => name !== recipeName);
                heartElement.classList.remove('is-favourite');
            } else {
                favourites.push(recipeName);
                heartElement.classList.add('is-favourite');
            }
            saveFavourites(favourites);
            if (favouritesGrid) {
                renderFavouritesPage();
            }
        };

        const recipes = [
            { name: "The Classic Beef Burger", image: "images/Classic_beef.jpg", description: "A timeless, juicy beef patty with melted cheddar, crisp lettuce, and fresh tomato on a brioche bun.", macros: { protein: 35, carbs: 30, fat: 28, calories: 572 }, notes: "Savory, rich, and deeply satisfying.", meltability: 9, tags: ["bulking"], ingredients: ["1/3 lb 80/20 Ground Beef", "1 Brioche Bun", "1 Slice Sharp Cheddar", "2 slices Tomato", "Lettuce Leaf", "2 tbsp Burger Sauce"], instructions: ["Form beef into a patty slightly larger than your bun.", "Cook on a hot griddle for 3-4 minutes per side.", "Melt cheese on top during the last minute of cooking.", "Toast the bun.", "Assemble with sauce, lettuce, and tomato."] },
            { name: "Grilled Chicken & Spinach Burger", image: "images/Grilled_Chicken&Spinach_Burger.jpg", description: "A lean chicken patty with spinach and garlic, served on a whole grain bun.", macros: { protein: 35, carbs: 20, fat: 10, calories: 390 }, notes: "Light, herbaceous, and savory.", meltability: 6, tags: ["healthy", "cutting"], ingredients: ["200g ground chicken", "50g fresh spinach, chopped", "1 garlic clove, minced", "1 whole grain bun", "1 tsp olive oil", "Salt and pepper to taste"], instructions: ["Mix ground chicken, spinach, garlic, salt, and pepper in a bowl.", "Form into a patty and refrigerate for 15 minutes.", "Heat olive oil in a skillet over medium heat.", "Cook patty for 5-6 minutes per side until fully cooked (internal temp 165°F/74°C).", "Serve on a toasted whole grain bun."] },
            { name: "Black Bean & Quinoa Burger", image: "images/Black_Bean&Quinoa_Burger.jpg", description: "A hearty vegan patty made with black beans and quinoa, served on a sesame bun.", macros: { protein: 15, carbs: 35, fat: 8, calories: 380 }, notes: "Earthy and slightly nutty.", meltability: 5, tags: ["vegan", "vegetarian", "dairy-free"], ingredients: ["150g canned black beans, drained and mashed", "50g cooked quinoa", "1 tbsp breadcrumbs", "1 sesame bun", "1 tsp cumin", "1 tbsp olive oil"], instructions: ["Combine mashed black beans, quinoa, breadcrumbs, and cumin.", "Form into a patty and let sit for 10 minutes.", "Heat olive oil in a skillet over medium heat.", "Cook patty for 4-5 minutes per side until crispy.", "Serve on a toasted sesame bun."] },
            { name: "Turkey Bacon & Egg Burger", image: "images/Turkey_Bacon&Egg_Burger.jpg", description: "A turkey patty with crispy bacon and a fried egg, on a brioche bun.", macros: { protein: 40, carbs: 25, fat: 20, calories: 770 }, notes: "Rich and savory with a creamy yolk.", meltability: 8, tags: ["bulking"], ingredients: ["200g 7% ground turkey", "2 slices turkey bacon", "1 egg", "1 brioche bun", "1 tsp black pepper", "1 tbsp butter"], instructions: ["Season turkey with pepper and form into a patty.", "Cook bacon in a skillet until crispy, then set aside.", "Melt butter and cook patty for 5-6 minutes per side.", "Fry egg sunny-side up.", "Assemble with bacon and egg on a toasted brioche bun."] },
            { name: "Portobello Mushroom Burger", image: "images/Portobello_Mushroom_Burger.jpg", description: "Grilled portobello cap with roasted red peppers, on a whole wheat bun.", macros: { protein: 10, carbs: 20, fat: 5, calories: 380 }, notes: "Umami and smoky.", meltability: 4, tags: ["vegan", "dairy-free", "vegetarian", "healthy"], ingredients: ["1 large portobello mushroom cap", "50g roasted red peppers", "1 whole wheat bun", "1 tsp balsamic vinegar", "1 tbsp olive oil"], instructions: ["Brush mushroom with olive oil and vinegar.", "Grill or pan-fry for 4-5 minutes per side until tender.", "Warm red peppers and place on mushroom.", "Serve on a toasted whole wheat bun."] },
            { name: "Salmon & Dill Burger", image: "images/Salmon&Dill_Burger.jpg", description: "A flaky salmon patty with fresh dill, served on a whole grain bun.", macros: { protein: 30, carbs: 15, fat: 12, calories: 480 }, notes: "Fresh and slightly tangy.", meltability: 6, tags: ["healthy", "cutting"], ingredients: ["200g salmon fillet, minced", "1 tsp fresh dill, chopped", "1 whole grain bun", "1 tbsp olive oil", "Salt to taste"], instructions: ["Mix minced salmon, dill, and salt.", "Form into a patty and chill for 15 minutes.", "Heat olive oil in a skillet over medium heat.", "Cook patty for 3-4 minutes per side until opaque.", "Serve on a toasted whole grain bun."] },
            { name: "Lentil & Sweet Potato Burger", image: "images/Lentil&Sweet_Potato_Burger.jpg", description: "A vegan patty with lentils and sweet potato, on a multigrain bun.", macros: { protein: 12, carbs: 30, fat: 6, calories: 420 }, notes: "Sweet and earthy.", meltability: 5, tags: ["vegan", "dairy-free", "vegetarian", "healthy"], ingredients: ["100g cooked lentils, mashed", "100g sweet potato, mashed", "1 multigrain bun", "1 tsp paprika", "1 tbsp olive oil"], instructions: ["Combine lentils, sweet potato, and paprika.", "Form into a patty and let rest for 10 minutes.", "Heat olive oil in a skillet over medium heat.", "Cook patty for 4-5 minutes per side until golden.", "Serve on a toasted multigrain bun."] },
            { name: "Bison & Cheddar Burger", image: "images/Bison&Cheddar_Burger.jpg", description: "A juicy bison patty with sharp cheddar, on a brioche bun.", macros: { protein: 38, carbs: 25, fat: 25, calories: 480 }, notes: "Robust and cheesy.", meltability: 9, tags: ["bulking"], ingredients: ["200g ground bison", "30g cheddar cheese, sliced", "1 brioche bun", "1 tsp garlic powder", "1 tbsp butter"], instructions: ["Season bison with garlic powder and form into a patty.", "Melt butter in a skillet and cook patty for 4-5 minutes per side.", "Add cheese in the last minute to melt.", "Serve on a toasted brioche bun."] },
            { name: "Chickpea & Tahini Burger", image: "images/Chickpea&Tahini_Burger.jpg", description: "A creamy chickpea patty with tahini, served on a pita.", macros: { protein: 14, carbs: 28, fat: 7, calories: 330 }, notes: "Nutty and mild.", meltability: 4, tags: ["vegan", "dairy-free", "vegetarian"], ingredients: ["150g canned chickpeas, mashed", "1 tbsp tahini", "1 pita bread", "1 tsp cumin", "1 tbsp olive oil"], instructions: ["Mix chickpeas, tahini, and cumin.", "Form into a patty and rest for 10 minutes.", "Heat olive oil in a skillet over medium heat.", "Cook patty for 4-5 minutes per side until crisp.", "Serve in a warmed pita."] },
            { name: "Pork & Apple Burger", image: "images/Porkbelly&Apple_NewBurger.jpg", description: "A savory pork patty with apple slices, on a whole wheat bun.", macros: { protein: 30, carbs: 20, fat: 15, calories: 540 }, notes: "Sweet and savory.", meltability: 6, tags: ["bulking"], ingredients: ["200g ground pork", "1 small apple, sliced", "1 whole wheat bun", "1 tsp cinnamon", "1 tbsp olive oil"], instructions: ["Season pork with cinnamon and form into a patty.", "Heat olive oil in a skillet and cook patty for 5-6 minutes per side.", "Add apple slices in the last 2 minutes to soften.", "Serve on a toasted whole wheat bun."] },
            { name: "Tofu & Veggie Burger", image: "images/Tofu&Veggie_Burger.jpg", description: "A grilled tofu patty with mixed veggies, on a sesame bun.", macros: { protein: 12, carbs: 22, fat: 6, calories: 290 }, notes: "Fresh and light.", meltability: 5, tags: ["vegan", "dairy-free", "vegetarian", "healthy"], ingredients: ["150g firm tofu, crumbled", "50g mixed veggies (e.g., carrots, peas)", "1 sesame bun", "1 tsp soy sauce", "1 tbsp olive oil"], instructions: ["Mix tofu, veggies, and soy sauce.", "Form into a patty and let sit for 10 minutes.", "Heat olive oil in a skillet over medium heat.", "Cook patty for 4-5 minutes per side until golden.", "Serve on a toasted sesame bun."] },
            { name: "Lamb & Feta Burger", image: "images/Lamb&Feta_Burger.jpg.JPG", description: "A spiced lamb patty with crumbled feta, on a brioche bun.", macros: { protein: 35, carbs: 20, fat: 22, calories: 400 }, notes: "Bold and tangy.", meltability: 8, tags: ["bulking"], ingredients: ["200g ground lamb", "30g feta cheese, crumbled", "1 brioche bun", "1 tsp rosemary", "1 tbsp butter"], instructions: ["Season lamb with rosemary and form into a patty.", "Melt butter in a skillet and cook patty for 5-6 minutes per side.", "Add feta in the last minute to soften.", "Serve on a toasted brioche bun."] },
            { name: "Edamame & Rice Burger", image: "images/Edamame&Rice_Burger.jpg", description: "A vegan patty with edamame and brown rice, on a whole grain bun.", macros: { protein: 10, carbs: 25, fat: 5, calories: 230 }, notes: "Mild and nutty.", meltability: 4, tags: ["vegan", "dairy-free", "vegetarian", "healthy"], ingredients: ["100g edamame, mashed", "50g cooked brown rice", "1 whole grain bun", "1 tsp sesame oil", "1 tbsp olive oil"], instructions: ["Mix edamame, rice, and sesame oil.", "Form into a patty and rest for 10 minutes.", "Heat olive oil in a skillet over medium heat.", "Cook patty for 4-5 minutes per side until crisp.", "Serve on a toasted whole grain bun."] },
            { name: "Tuna & Avocado Burger", image: "images/Tuna&Avocado_Burger.jpg", description: "A seared tuna patty with avocado, on a whole wheat bun.", macros: { protein: 32, carbs: 15, fat: 10, calories: 410 }, notes: "Rich and creamy.", meltability: 6, tags: ["healthy", "cutting"], ingredients: ["200g tuna steak, minced", "50g avocado, mashed", "1 whole wheat bun", "1 tsp lemon juice", "1 tbsp olive oil"], instructions: ["Mix minced tuna and lemon juice.", "Form into a patty and chill for 15 minutes.", "Heat olive oil in a skillet over medium heat.", "Cook patty for 3-4 minutes per side.", "Top with mashed avocado and serve on a toasted whole wheat bun."] },
            { name: "Beef & Mushroom Burger", image: "images/Beef&Mushroom_NewBurger.jpg", description: "A beef patty blended with mushrooms, on a brioche bun.", macros: { protein: 36, carbs: 22, fat: 20, calories: 530 }, notes: "Savory and umami.", meltability: 7, tags: ["bulking"], ingredients: ["180g ground beef", "50g mushrooms, finely chopped", "1 brioche bun", "1 tsp thyme", "1 tbsp butter"], instructions: ["Mix beef, mushrooms, and thyme.", "Form into a patty and rest for 10 minutes.", "Melt butter in a skillet and cook patty for 4-5 minutes per side.", "Serve on a toasted brioche bun."] },
            { name: "Zucchini & Feta Burger", image: "images/Zucchini&Feta_Burger.jpg", description: "A vegetarian patty with zucchini and feta, on a whole grain bun.", macros: { protein: 12, carbs: 18, fat: 8, calories: 300 }, notes: "Fresh and tangy.", meltability: 6, tags: ["vegetarian", "healthy"], ingredients: ["100g grated zucchini", "30g feta cheese, crumbled", "1 whole grain bun", "1 tsp oregano", "1 tbsp olive oil"], instructions: ["Mix zucchini, feta, and oregano.", "Form into a patty and let sit for 10 minutes.", "Heat olive oil in a skillet over medium heat.", "Cook patty for 4-5 minutes per side until golden.", "Serve on a toasted whole grain bun."] },
            { name: "Chicken & Pineapple Burger", image: "images/Chicken&Pinapple_Burger.jpg", description: "A grilled chicken patty with pineapple, on a sesame bun.", macros: { protein: 34, carbs: 25, fat: 12, calories: 320 }, notes: "Sweet and savory.", meltability: 5, tags: ["healthy", "cutting"], ingredients: ["200g ground chicken", "1 slice pineapple", "1 sesame bun", "1 tsp paprika", "1 tbsp olive oil"], instructions: ["Season chicken with paprika and form into a patty.", "Heat olive oil in a skillet and cook patty for 5-6 minutes per side.", "Grill pineapple slice for 2 minutes per side.", "Serve on a toasted sesame bun with pineapple."] },
            { name: "Quinoa & Black Bean Burger", image: "images/Quinoa&Blackbean_Burger.jpg", description: "A vegan patty with quinoa and black beans, on a whole wheat bun.", macros: { protein: 14, carbs: 30, fat: 7, calories: 440 }, notes: "Hearty and nutty.", meltability: 5, tags: ["vegan", "dairy-free", "vegetarian"], ingredients: ["100g canned black beans, mashed", "50g cooked quinoa", "1 whole wheat bun", "1 tsp chili powder", "1 tbsp olive oil"], instructions: ["Combine black beans, quinoa, and chili powder.", "Form into a patty and rest for 10 minutes.", "Heat olive oil in a skillet over medium heat.", "Cook patty for 4-5 minutes per side until crisp.", "Serve on a toasted whole wheat bun."] },
            { name: "Venison & Onion Burger", image: "images/Venison&Onion_Burger.jpg", description: "A lean venison patty with caramelized onions, on a brioche bun.", macros: { protein: 38, carbs: 20, fat: 18, calories: 480 }, notes: "Gamey and sweet.", meltability: 7, tags: ["bulking"], ingredients: ["200g ground venison", "50g caramelized onions", "1 brioche bun", "1 tsp black pepper", "1 tbsp butter"], instructions: ["Season venison with pepper and form into a patty.", "Melt butter in a skillet and cook patty for 4-5 minutes per side.", "Add caramelized onions in the last minute.", "Serve on a toasted brioche bun."] },
            { name: "Eggplant & Hummus Burger", image: "images/Eggplant&Hummus_Burger.jpg", description: "A grilled eggplant patty with hummus, on a pita.", macros: { protein: 8, carbs: 22, fat: 6, calories: 270 }, notes: "Smoky and creamy.", meltability: 4, tags: ["vegan", "dairy-free", "vegetarian", "healthy"], ingredients: ["1 medium eggplant, sliced", "2 tbsp hummus", "1 pita bread", "1 tsp smoked paprika", "1 tbsp olive oil"], instructions: ["Brush eggplant with olive oil and paprika.", "Grill or pan-fry for 4-5 minutes per side until tender.", "Spread hummus on pita and add eggplant.", "Serve in a warmed pita."] },
            { name: "Turkey & Cranberry Burger", image: "images/Turkey&Cranberry_NewBurger.jpg", description: "A turkey patty with cranberry sauce, on a whole grain bun.", macros: { protein: 32, carbs: 18, fat: 10, calories: 590 }, notes: "Tangy and savory.", meltability: 6, tags: ["healthy", "cutting"], ingredients: ["200g ground turkey", "2 tbsp cranberry sauce", "1 whole grain bun", "1 tsp sage", "1 tbsp olive oil"], instructions: ["Season turkey with sage and form into a patty.", "Heat olive oil in a skillet and cook patty for 5-6 minutes per side.", "Spread cranberry sauce on the bun.", "Serve on a toasted whole grain bun."] }
        ];

        const renderRecipes = (recipesToRender, container) => {
            const favourites = getFavourites();
            container.innerHTML = '';
            if (recipesToRender.length === 0) { 
                container.innerHTML = '<p class="col-12 text-center">No recipes to show. Try changing your filters or adding some favourites!</p>'; 
                return; 
            }
            recipesToRender.forEach(function(recipe) {
                const isFavourite = favourites.includes(recipe.name);
                let tagsHTML = recipe.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
                const cardHTML = `
                <div class="col-lg-4 col-md-6">
                    <div class="recipe-card" data-recipe-name="${recipe.name}">
                        <div class="favourite-heart ${isFavourite ? 'is-favourite' : ''}" data-recipe-name="${recipe.name}">&#x2665;</div>
                        <img src="${recipe.image}" alt="${recipe.name}" class="card-img-top">
                        <div class="recipe-card-content">
                            <h4>${recipe.name}</h4>
                            <p>${recipe.description}</p>
                            <div class="recipe-macros">
                                <div><strong>${recipe.macros.protein}g</strong><br>Protein</div>
                                <div><strong>${recipe.macros.carbs}g</strong><br>Carbs</div>
                                <div><strong>${recipe.macros.fat}g</strong><br>Fat</div>
                                <div><strong>${recipe.macros.calories}</strong><br>Calories</div>
                            </div>
                            <div class="recipe-tags">${tagsHTML}</div>
                        </div>
                    </div>
                </div>`;
                container.innerHTML += cardHTML;
            });
        };

        const modal = document.getElementById('recipe-modal');
        if(modal) {
            const closeModalBtn = modal.querySelector('.close-button');
            function openModal(recipe) {
                document.getElementById('modal-title').innerText = recipe.name;
                document.getElementById('modal-ingredients').innerHTML = `<h4>Ingredients</h4><ul>${recipe.ingredients.map(i => `<li>${i}</li>`).join('')}</ul>`;
                document.getElementById('modal-instructions').innerHTML = `<h4>Instructions</h4><ol>${recipe.instructions.map(i => `<li>${i}</li>`).join('')}</ol>`;
                modal.style.display = 'block';
            }
            function closeModal() { modal.style.display = 'none'; }
            closeModalBtn.addEventListener('click', closeModal);
            window.addEventListener('click', (event) => { if (event.target == modal) closeModal(); });
            
            const grid = recipeGrid || favouritesGrid;
            grid.addEventListener('click', function(event) {
                const heart = event.target.closest('.favourite-heart');
                if (heart) {
                    event.stopPropagation();
                    toggleFavourite(heart.dataset.recipeName, heart);
                    return;
                }
                const card = event.target.closest('.recipe-card');
                if (card) {
                    const recipeData = recipes.find(r => r.name === card.dataset.recipeName);
                    if (recipeData) openModal(recipeData);
                }
            });
        }

        if (recipeGrid) {
            const filterCheckboxes = document.querySelectorAll('.filter-container input[type="checkbox"]');
            function handleFilterChange() {
                const activeFilters = Array.from(filterCheckboxes).filter(cb => cb.checked).map(cb => cb.value);
                const filteredRecipes = activeFilters.length === 0 ? recipes : recipes.filter(r => activeFilters.every(f => r.tags.includes(f)));
                renderRecipes(filteredRecipes, recipeGrid);
            }
            filterCheckboxes.forEach(checkbox => checkbox.addEventListener('change', handleFilterChange));
            renderRecipes(recipes, recipeGrid);
        }

        if (favouritesGrid) {
            function renderFavouritesPage() {
                const favouriteNames = getFavourites();
                const favouriteRecipes = recipes.filter(recipe => favouriteNames.includes(recipe.name));
                renderRecipes(favouriteRecipes, favouritesGrid);
            }
            renderFavouritesPage();
        }
    }

    // --- Logic for Interactive Burger Builder ---
    const burgerBuilder = document.getElementById('burger-builder');
    if (burgerBuilder) {
        const inputs = burgerBuilder.querySelectorAll('input');
        function updateBurgerVisuals() {
            const bun = burgerBuilder.querySelector('input[name="bun"]:checked').value;
            const patty = burgerBuilder.querySelector('input[name="patty"]:checked').value;
            const cheeses = Array.from(burgerBuilder.querySelectorAll('input[name="cheese"]:checked')).map(cb => cb.value);
            const toppings = Array.from(burgerBuilder.querySelectorAll('input[name="topping"]:checked')).map(cb => cb.value);
            
            document.querySelectorAll('.burger-stage img').forEach(img => img.classList.remove('visible-layer'));
            
            if (bun === 'lettuce-wrap') {
                document.getElementById('layer-lettuce-wrap-bottom').classList.add('visible-layer');
                document.getElementById('layer-lettuce-wrap-top').classList.add('visible-layer');
            } else {
                document.getElementById('layer-bun-bottom').classList.add('visible-layer');
                document.getElementById('layer-bun-top').classList.add('visible-layer');
            }
            document.getElementById(`layer-${patty}`).classList.add('visible-layer');
            cheeses.forEach(cheese => document.getElementById(`layer-${cheese}`)?.classList.add('visible-layer'));
            toppings.forEach(topping => document.getElementById(`layer-${topping}`)?.classList.add('visible-layer'));
        }
        inputs.forEach(input => input.addEventListener('change', updateBurgerVisuals));
        updateBurgerVisuals();

        const buildButton = document.getElementById('build-burger-button');
        const outputDiv = document.getElementById('burger-recipe-output');
        buildButton.addEventListener('click', () => {
            let summary = '<h3>Your Custom Burger:</h3><ul>';
            burgerBuilder.querySelectorAll('input:checked').forEach(input => {
                summary += `<li>${input.parentElement.textContent.trim()}</li>`;
            });
            summary += '</ul>';
            outputDiv.innerHTML = summary;
        });
    }

   
    // --- Logic for Community Reviews Carousel (Infinite Loop Version) ---
    const carouselContainer = document.getElementById('carousel-container');
    if (carouselContainer) {
        const reviewsGrid = document.getElementById('reviews-grid');
        const prevButton = document.getElementById('carousel-prev');
        const nextButton = document.getElementById('carousel-next');
        const cards = Array.from(reviewsGrid.children);
        let isTransitioning = false;

        function setupCarousel() {
            const cardsToClone = Math.floor(carouselContainer.offsetWidth / cards[0].offsetWidth) || 1;
            for (let i = 0; i < cardsToClone; i++) { reviewsGrid.appendChild(cards[i].cloneNode(true)); }
            for (let i = cards.length - 1; i >= cards.length - cardsToClone; i--) { reviewsGrid.prepend(cards[i].cloneNode(true)); }
            reviewsGrid.style.transition = 'none';
            const initialOffset = (cards[0].offsetWidth + 25) * cardsToClone;
            reviewsGrid.style.transform = `translateX(-${initialOffset}px)`;
        }

        let currentOffset = 0;
        function slide(direction) {
            if (isTransitioning) return;
            isTransitioning = true;
            reviewsGrid.style.transition = 'transform 0.5s ease-in-out';
            const cardWidth = cards[0].offsetWidth + 25;
            currentOffset = reviewsGrid.style.transform.match(/-?[\d\.]+/)[0];
            if (direction === 'next') { reviewsGrid.style.transform = `translateX(${currentOffset - cardWidth}px)`; } else { reviewsGrid.style.transform = `translateX(${Number(currentOffset) + cardWidth}px)`; }
        }

        reviewsGrid.addEventListener('transitionend', () => {
            isTransitioning = false;
            const cardsToClone = Math.floor(carouselContainer.offsetWidth / cards[0].offsetWidth) || 1;
            const cardWidth = cards[0].offsetWidth + 25;
            if (Math.abs(currentOffset / cardWidth) >= (cards.length + cardsToClone - 1)) { reviewsGrid.style.transition = 'none'; const resetOffset = cardWidth * cardsToClone; reviewsGrid.style.transform = `translateX(-${resetOffset}px)`; currentOffset = -resetOffset; }
            if (Math.abs(currentOffset / cardWidth) < cardsToClone) { reviewsGrid.style.transition = 'none'; const resetOffset = cardWidth * cards.length; reviewsGrid.style.transform = `translateX(-${resetOffset}px)`; currentOffset = -resetOffset; }
        });

        nextButton.addEventListener('click', () => slide('next'));
        prevButton.addEventListener('click', () => slide('prev'));

        let isDown = false;
        let startX;
        let scrollLeft;
        carouselContainer.addEventListener('mousedown', (e) => { isDown = true; startX = e.pageX - carouselContainer.offsetLeft; scrollLeft = carouselContainer.scrollLeft; });
        carouselContainer.addEventListener('mouseleave', () => { isDown = false; });
        carouselContainer.addEventListener('mouseup', () => { isDown = false; });
        carouselContainer.addEventListener('mousemove', (e) => { if (!isDown) return; e.preventDefault(); const x = e.pageX - carouselContainer.offsetLeft; const walk = (x - startX) * 2; carouselContainer.scrollLeft = scrollLeft - walk; });
        
        setTimeout(setupCarousel, 100);
    
    }

    // --- Logic for the form on the "Submit Your Pick" page ---
    const submissionForm = document.getElementById('submission-form');
    if (submissionForm) {
        submissionForm.addEventListener('submit', function(event) {
            event.preventDefault();
            alert("Thank you for your submission!");
            submissionForm.reset();
        });
    }
});