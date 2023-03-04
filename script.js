// -------- For searching movies and fetching indivisual Movie Details
//Two API is used because of daily limit of a API key Usage
const OMDB_API_KEY = "d35e4f1f";
const OMDB_API_KEY_SECOND = "a9a1037a";

//For finding Popular Movies and Movies by genere
const RAPID_API_KEY = {
  method: 'GET',
	headers: {
		'X-RapidAPI-Key': 'd1662bb0c7mshd8dd223519be344p19818ejsn8b06c3747251',
		'X-RapidAPI-Host': 'moviesminidatabase.p.rapidapi.com'
	}
};

//Variable to hold the Current Screen Name
var displayedScreen = 'homePage';


//Searching Functionality ------------------ STARTS -------------------- ///////////////
//Search result display table 
const searchResultDisplay = document.getElementById("movieDisplayTable");
const moviesDisplayContainer = document.getElementById('movies-container');

// code for hiding the search result when clicking outside of searchbox and making it visible on input box click
let pageContainer = document.getElementById('page-container');
pageContainer.addEventListener('click', (e) => {
  if(e.target.id === 'movieSearchInput') {
    document.getElementById('movieDisplayTable').style.visibility = 'visible';
  } else {
    document.getElementById('movieDisplayTable').style.visibility = 'hidden';
  }
});

//Movie Search box
const movieSearchInput = document.getElementById("movieSearchInput");
movieSearchInput.addEventListener("input", (e) => {
  handleMovieSearch(e.target.value);
});

//function for handle the movie search
async function handleMovieSearch(movieName) {
  let movieList = await searchMovie(movieName);
  // console.log(movieList);

  //Resetting the table for every Search
  searchResultDisplay.textContent = "";

  if (Boolean(movieList)) {
    setSearchMovieResult(movieList);
  }
}

//function for serching movie from api
async function searchMovie(movieName) {
  if (Boolean(movieName)) {
    let url = `https://omdbapi.com/?s=${movieName}&apikey=${OMDB_API_KEY_SECOND}`;

    let result = await fetch(url);
    result = await result.json();

    if (result.Response === "True") {
      return result.Search;
    }
  }
  return false;
}

//----------- function for displaying the movie search result -----------------
async function setSearchMovieResult(movieList) {
  //Creating and appeding row(card) for each movie in the search result table
  for (let i = 0; i < movieList.length; i++) {
    let searchMovieResultCard = await createSearchResultMovieCard(movieList[i]);
    searchResultDisplay.append(searchMovieResultCard);
  }
}

//function for creating search result movie card ----- STARTS ----------
async function createSearchResultMovieCard(movieData) {
  //creating row and setting onClick event to open movie Details Page
  let tr = document.createElement("tr");
  tr.setAttribute("id", movieData.imdbID);
  tr.addEventListener("click", (e) => {
    showMovieDetails(movieData.imdbID);
  });

  let movieImage = createSearchResultMovieImage(movieData.Poster);
  let movieTitle = createSearchResultMovieTitle(movieData.Title);
  let favouriteButton = await createSearchResultMovieFavouriteButton(movieData.imdbID, movieData);

  tr.append(movieImage, movieTitle, favouriteButton);
  return tr;
}

function createSearchResultMovieImage(movieImageUrl) {
  let imageContainer = document.createElement("td");
  let img = document.createElement("img");
  img.classList.add("movie-img");
  if (movieImageUrl === "N/A") {
    img.setAttribute(
      "src",
      `https://picsum.photos/20${Math.floor(Math.random() * 9)}`
    );
  } else {
    img.setAttribute("src", movieImageUrl);
  }
  imageContainer.appendChild(img);
  return imageContainer;
}

function createSearchResultMovieTitle(movieTitle) {
  let td = document.createElement("td");
  let textNode = document.createTextNode(movieTitle);
  td.classList.add("movie-title");
  td.appendChild(textNode);

  return td;
}

async function createSearchResultMovieFavouriteButton(imdbID, movieDetails) {
  let favouritesButtonContainer = document.createElement('td');
  favouritesButtonContainer.classList.add('favourites-button');

  let favoriteButton = document.createElement('img');
  let alreadyInFavouritesList = isPresentInFavouritesList(imdbID);
  if (alreadyInFavouritesList) {
    favoriteButton.setAttribute('src', 'images/favourite.png');
  } else {
    favoriteButton.setAttribute('src', 'images/add-to-favourite.png');
  }

  favoriteButton.addEventListener('click', async (e) => {
    //fetching the image name
    let imageName = e.target.src.split('/');
    imageName = imageName[imageName.length - 1];

    //depend on name add/remove from the list and changing image sources
    if (imageName === "add-to-favourite.png") {
      await addIntoFavouriteList(imdbID);
      e.target.src = 'images/favourite.png';
      //Adding movie Into Favourites Page 
      (displayedScreen === 'favouritesPage') && addMovieCardIntoDocument(movieDetails);
    } else {
      removeFromFavouriteList(imdbID);
      e.target.src = 'images/add-to-favourite.png';
      //Removing movie Into Favourites Page 
      (displayedScreen === 'favouritesPage') && document.querySelector(`div#${imdbID}`).remove();
    }
    e.stopPropagation();
    e.cancelable = true; //for IE browser
  });

  favouritesButtonContainer.appendChild(favoriteButton);
  return favouritesButtonContainer;
}
//function for creating search result movie card ----- ENDS ----------


//---------------------------Searching Functionality ------------------ ENDS --------------------


//--------------Home Page Function Starts-------------
var popularMovieIds = [];

async function setPopularMoviesList() {
  let result = await fetchPopularMovies();
  popularMovieIds = result;
  // console.log(popularMovieIds);
  setHomePage();
}

//Fetching Movies For Home Page
async function fetchPopularMovies() {
  let result = [];
  await fetch('https://moviesminidatabase.p.rapidapi.com/movie/order/byRating/', RAPID_API_KEY)
	.then(response => response.json())
	.then(response => result = response.results)
	.catch(err => console.error(err));
  // console.log(result);
  
  let popularMovieIds = [];
  for(let i = 0; i < result.length; i++) {
    popularMovieIds.push(result[i].imdb_id);
  }

  return popularMovieIds;
}

// calling this method each time to fetch Home Page data
setPopularMoviesList();

// ---------------- Home page Button ------------------
let homePageButton = document.getElementById('homeButton');
homePageButton.addEventListener('click', () => {
  displayedScreen = 'homePage';
  moviesDisplayContainer.textContent = '';
  showSpinner();
  setHomePage();
})

//Setting the Data into Home Page
async function setHomePage() {
  document.querySelector('#movies-container').textContent = '';
  let start = Math.floor(Math.random() * 40);

  for (let i = start; i < start+8; i++) {
    let movieDetails = await fetchMovieDetails(popularMovieIds[i]);
    addMovieCardIntoDocument(movieDetails);
  }
}

//--------------Home Page Function ENDs-------------

//-------------------------- favourites page Functions STARTS ----------------- 
let showFavouriteMoviesButton = document.getElementById('showFavouriteMoviesButton');
showFavouriteMoviesButton.addEventListener('click', () => {
  displayedScreen = 'favouritesPage';

  moviesDisplayContainer.textContent = '';
  showSpinner();
  setFavouritesMovies();
})

// Setting the Favourites Movies into the list
async function setFavouritesMovies() {
  let favouriteMoviesIdList = await fetchFavouritesList();

  if( favouriteMoviesIdList.length > 0 ) {
    for (let i = 0; i < favouriteMoviesIdList.length; i++) {
      let result = await fetchMovieDetails(favouriteMoviesIdList[i]);
      addMovieCardIntoDocument(result)
    }
  } else {
    alert('No Movies Present in Favourites List, Please go to Home Page');
    hideSpinner();
  } 
}
//-------------------------- favourites page Functions ENDS -----------------


//-------------------------- Movie By Genere Feature - Functions STARTS -----------------
let movieGenre = document.querySelectorAll('.fetchByGenere');

// Setting onclick event on each Movie Genere Option And Adding Functionalities on that
for(let i = 0; i < movieGenre.length; i++) {
  // console.log(movieGenre[i]);
  let genere = movieGenre[i].textContent;
  movieGenre[i].addEventListener('click', async() => {
    document.querySelector('#movies-container').textContent = '';
    showSpinner();


    let result = await fetchMovieByGenere(genere);
    for(let i = 0; i < result.length; i++) {
      let movieDetails = await fetchMovieDetails(result[i]);
      addMovieCardIntoDocument(movieDetails);
    }
  })
}

async function fetchMovieByGenere(genere) {
  let result = [];
  await fetch(`https://moviesminidatabase.p.rapidapi.com/movie/byGen/${genere}/`, RAPID_API_KEY)
	.then(response => response.json())
	.then(response => result = response.results)
	.catch(err => console.error(err));

  let start = Math.floor(Math.random() * 40);
  let movideIdsByGenere = [];
  for(let i = start; i < result.length && i < start+8; i++) {
    movideIdsByGenere.push(result[i].imdb_id);
  }
  return movideIdsByGenere;
}
//-------------------------- Movie By Genere Feature - Functions ENDS -----------------

// -------------------------ADDING Movies card into DOM Function -- STARTS -----------------
function addMovieCardIntoDocument(movieDetails) {
  // console.log(movieDetails);
  let movieCard = createHomePageMovieCard(movieDetails.Poster);
    movieCard.setAttribute('id', movieDetails.imdbID);

    let movieDataContainer = createMovieDataContainer();

    let movieCardData = createMovieCardData(movieDetails.Title, movieDetails.Released);

    let movieCardButton = createMovieCardButton(movieDetails.imdbID)

    movieDataContainer.append(movieCardData, movieCardButton);

    movieCard.append(movieDataContainer);
    moviesDisplayContainer.append(movieCard);
    hideSpinner();
}

function createHomePageMovieCard(movieImageUrl) {
  let div = document.createElement('div');
  div.classList.add('homePageMovieCard');

  let img = document.createElement('img');
  img.classList.add('homePageMovieCardImage');
  img.setAttribute('src', `${movieImageUrl}`);
  img.setAttribute('alt', 'Movie Image');

  div.append(img);
  return div;
}

function createMovieDataContainer() {
  let div = document.createElement('div');
  div.classList.add('homePageMovieCardContent');
  return div;
}

function createMovieCardData(title, releaseDate) {
  let container = document.createElement('div');
  container.classList.add('homePage-movieCard-data');

  let movieTitle = document.createElement('div');
  movieTitle.classList.add('homePage-movieCard-title');
  movieTitle.textContent = title;

  let MovieReleaseDate = document.createElement('div');
  MovieReleaseDate.classList.add('homePage-movieCard-releaseDate');
  MovieReleaseDate.textContent = releaseDate;

  container.append(movieTitle, MovieReleaseDate);

  return container;
}

function createMovieCardButton(imdbID) {

  let container = document.createElement('div');
  container.classList.add('homePage-movieCard-buttons');

  let movieDetailsButton = document.createElement('button');
  movieDetailsButton.classList.add('btn', 'btn-warning', 'more-button');
  movieDetailsButton.setAttribute('id', `${imdbID}`);
  movieDetailsButton.addEventListener('click', () => {
    showMovieDetails(imdbID);
  })
  movieDetailsButton.textContent = 'Details';

  let favouriteButton = document.createElement('button');
  favouriteButton.classList.add('btn', 'btn-danger', 'more-button', 'mt-2');
  favouriteButton.setAttribute('id', `${imdbID}`)

  let favouriteButtonText = '';
  let alreadyInFavouritesList = isPresentInFavouritesList(imdbID);
  if(alreadyInFavouritesList){
    favouriteButtonText = 'Remove From Favourites';
  } else {
    favouriteButtonText ='ADD To Favourites';
  }
  favouriteButton.textContent = favouriteButtonText;

  favouriteButton.addEventListener('click',(e) => {
    let alreadyInFavouritesList = isPresentInFavouritesList(e.target.id);
    
    if(alreadyInFavouritesList) {
        removeFromFavouriteList(e.target.id);

        //Removing From The Screen if Favourites page is being displayed
        if(displayedScreen === 'favouritesPage') {
          let buttonCotainer = e.target.parentElement;
          let contentCotainer = buttonCotainer.parentElement;
          let movieCard = contentCotainer.parentElement;
          movieCard.remove();
        }
        e.target.textContent = 'ADD To Favourites';
    } else {
      addIntoFavouriteList(e.target.id);
      e.target.textContent = 'Remove From Favourites';
    }
  })

  container.append(movieDetailsButton, favouriteButton);
  return container;
}
// ------------- ADDING Movies card into DOM Function -- ENDS -----------------


//--------------Function for setting Movie ids into storage for display Indivisual Movie Details ------------
function showMovieDetails(imdbID) {
  sessionStorage.setItem('movieIdToShowDetails', `${imdbID}`);
  window.open('movieDetails.html');
}

// -------------------------- Helper function ----------------------------- //
// Function for Fetching Movie Details
async function fetchMovieDetails(imdbID) {
  let url = `https://omdbapi.com/?i=${imdbID}&apikey=${OMDB_API_KEY_SECOND}`
  let result;
  await fetch(url).then(response => response.json()).then(data => {
    result = data;
  })
  return result;
}

// Function for Fetching Movie Details
function fetchFavouritesList() {
  let favouritesList = [];
  let result = localStorage.getItem('favouritesList');
  if (Boolean(result)) {
    favouritesList = result.split(',');
  }
  return favouritesList;
}

// Function for Cheking If movie already Present in the favorites list or not
function isPresentInFavouritesList(imdbID) {
  let favouritesList = fetchFavouritesList();
  let result = favouritesList.find(element => element === imdbID);
  return Boolean(result);
}

// Function for Adding Movie Into Favourites list
async function addIntoFavouriteList(imdbID) {
  let favouritesList = await fetchFavouritesList();
  favouritesList.push(imdbID);
  setFavouritesListToLocalStorage(favouritesList);
}

// Function for Removing Movie From Favourites list
async function removeFromFavouriteList(imdbID) {
  let favouritesList = await fetchFavouritesList();
  favouritesList = favouritesList.filter((item) => item !== imdbID);
  setFavouritesListToLocalStorage(favouritesList);
}

// Function for Storing the Favourites list into local storage
function setFavouritesListToLocalStorage(favouritesList) {
  localStorage.setItem('favouritesList', favouritesList.toString());
}

//Function for showing Spinner
function showSpinner() {
  let spinner = document.createElement('div');
  spinner.classList.add('spinner', 'spinner-border');
  spinner.setAttribute('role','status');
  moviesDisplayContainer.appendChild(spinner);
}

//Function for Hiding Spinner
function hideSpinner() {
  let spinner = document.querySelector('.spinner');
  if(spinner) {
    spinner.remove();
  }
}

