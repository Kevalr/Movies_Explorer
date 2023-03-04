//Fetching Movie Id from storage 
let movie = sessionStorage.getItem('movieIdToShowDetails');


if(Boolean(movie)) {
  document.getElementsByClassName('movieCard')[0].style.display = 'none'
  fetchMovieDetails(movie);
} else {
  alert('Unable to fetch Data');
    window.location('index.html');
}

async function fetchMovieDetails(movie) {
  let url = `https://omdbapi.com/?i=${movie}&apikey=a9a1037a`
  await fetch(url).then(response => response.json()).then(data => {

  if (data.Response === 'True') {
    //Setting the Movie data if Response is true
    setMovieData(data);

    //Removing the spinner and Showing the Movie Details Card
    document.getElementsByClassName('spinner')[0].style.display = 'none'
    document.getElementsByClassName('movieCard')[0].style.display = 'flex'
  } else {
    alert('Unable to fetch Data, Plase Go Back');
    window.location('index.html');
  }
})
}

//Setting the Movie Details into the Dom
function setMovieData(data) {
  let imageContainer = document.getElementById('movieImage-container');
  if (data.Poster === "N/A") {
    data.Poster = `no-image-found.jpeg`
  }
  
  imageContainer.style.backgroundImage = `url(${data.Poster})`;

  let title = document.getElementById('movieTitle');
  title.textContent = data.Title;

  let movieYear = document.getElementById('releasedDate');
  movieYear.textContent = data.Released;

  let movieDetails = document.getElementById('plot');
  movieDetails.textContent = data.Plot;

  let movieGenere = document.getElementById('genere');
  movieGenere.textContent = data.Genre;

  let actors = document.getElementById('actors');
  actors.textContent = data.Actors;

  let ratings = document.getElementById('imdbRatings');
  ratings.textContent = data.imdbRating;

  let awards = document.getElementById('awards');
  awards.textContent = data.Awards;

  let director = document.getElementById('director');
  director.textContent = data.Director;
}
