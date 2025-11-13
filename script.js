const resultsEl = document.getElementById('results');
const favsEl = document.getElementById('favourites');
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');

searchBtn.addEventListener('click', ()=> searchFood());
searchInput.addEventListener('keyup', (e)=> { if(e.key==='Enter') searchFood(); });

function searchFood(){
  const q = (searchInput.value || '').trim();
  if(!q){ resultsEl.innerHTML = '<p class="small">Type a cuisine or dish and press Search.</p>'; return; }

  resultsEl.innerHTML = '<p class="small">Searching…</p>';
  fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(q)}`)
    .then(r=>r.json())
    .then(data=>{
      resultsEl.innerHTML='';
      if(!data.meals){ resultsEl.innerHTML='<p class="small">No dishes found.</p>'; return; }
      data.meals.forEach(meal=>{
        const rating = (Math.random()*2+3).toFixed(1); // fake rating 3.0-5.0
        const address = fakeAddress(meal);
        const card = document.createElement('div'); card.className='card';
        card.innerHTML = `
          <img src="${meal.strMealThumb}" alt="${escapeHtml(meal.strMeal)}" />
          <h3>${escapeHtml(meal.strMeal)}</h3>
          <div class="meta">Category: ${escapeHtml(meal.strCategory || '-') } · Area: ${escapeHtml(meal.strArea || '-') }</div>
          <div class="meta">Rating: ${rating} · Address: ${address}</div>
          <div class="row">
            <button class="btn btn-outline" onclick="viewRecipe('${meal.idMeal}')">View</button>
            <button class="btn btn-primary" onclick="toggleFav('${meal.idMeal}')">❤ Favourite</button>
          </div>
        `;
        resultsEl.appendChild(card);
      });
    })
    .catch(err=>{ resultsEl.innerHTML='<p class="small">Error fetching data.</p>'; console.error(err); });
}

function viewRecipe(id){
  fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
    .then(r=>r.json()).then(data=>{
      if(!data.meals) return alert('No recipe found');
      const m = data.meals[0];
      const ingredients = [];
      for(let i=1;i<=20;i++){
        if(m['strIngredient'+i]) ingredients.push(m['strIngredient'+i] + ' - ' + (m['strMeasure'+i]||''));
      }
      alert(m.strMeal + '\n\nCategory: ' + m.strCategory + '\nArea: ' + m.strArea + '\n\nIngredients:\n' + ingredients.join('\n\n'));
    });
}

function fakeAddress(meal){
  const cities = ['Hyderabad','Visakhapatnam','Vijayawada','Tirupati','Chennai','Bengaluru','Mumbai'];
  const streets = ['MG Road','Station Road','Fort Street','Lake View','Market Lane','Hilltop Ave'];
  return streets[Math.floor(Math.random()*streets.length)] + ', ' + cities[Math.floor(Math.random()*cities.length)];
}

function toggleFav(id){
  let favs = JSON.parse(localStorage.getItem('favs')||'[]');
  if(!favs.includes(id)) favs.push(id);
  else favs = favs.filter(x=>x!==id);
  localStorage.setItem('favs', JSON.stringify(favs));
  loadFavs();
}

function loadFavs(){
  const favs = JSON.parse(localStorage.getItem('favs')||'[]');
  favsEl.innerHTML = '';
  if(favs.length===0){ favsEl.innerHTML = '<p class="small">No favourites yet.</p>'; return; }
  favs.forEach(id=>{
    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
      .then(r=>r.json()).then(data=>{
        if(!data.meals) return;
        const m = data.meals[0];
        const card = document.createElement('div'); card.className='card';
        card.innerHTML = `
          <img src="${m.strMealThumb}" alt="${escapeHtml(m.strMeal)}" />
          <h3>${escapeHtml(m.strMeal)}</h3>
          <div class="meta">Category: ${escapeHtml(m.strCategory || '-') }</div>
          <div class="row">
            <button class="btn btn-outline" onclick="viewRecipe('${m.idMeal}')">View</button>
            <button class="btn" onclick="toggleFav('${m.idMeal}')">Remove</button>
          </div>
        `;
        favsEl.appendChild(card);
      });
  });
}

function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; }); }

loadFavs();
