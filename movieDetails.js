let movie = sessionStorage.getItem('movieIdToShowDetails');
// alert(movie);
if(Boolean(movie)) {
  document.getElementsByClassName('movieCard')[0].style.display = 'none'
let url = `https://omdbapi.com/?i=${movie}&apikey=a9a1037a`
fetch(url).then(response => response.json()).then(data => {
  console.log(data);
//   document.getElementById('movieDetailsDisplay').style.display = 'flex';
//   document.getElementById('loader').innerText = '';
//   document.getElementById('loader').display = 'none';
//   document.getElementById('loader').style.height = '0px';

  if (data.Response === 'True') {
    setMovieData(data);
    document.getElementsByClassName('spinner')[0].style.display = 'none'
    document.getElementsByClassName('movieCard')[0].style.display = 'flex'
  } else {
    alert('Unable to fetch Data');
    window.location('index.html');
  }
})
}

function setMovieData(data) {
  let imageContainer = document.getElementById('movieImage-container');
  if (data.Poster === "N/A") {
    data.Poster = `no-image-found.jpeg`
  }
  console.log(imageContainer);
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
