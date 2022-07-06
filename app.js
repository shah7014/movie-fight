const { default: axios } = require("axios");
const { createAutoComplete } = require("./autocomplete");

const fetchMovies = async (filmName) => {
  const response = await axios.get("https://www.omdbapi.com/", {
    params: {
      apikey: "4608549e",
      s: filmName,
    },
  });
  if (response.data.Error) {
    return [];
  }
  return response.data.Search;
};

const renderMovieAsOption = (movie) => {
  const imgSrc = movie.poster === "N/A" ? "" : movie.Poster;
  return `
        <img src="${imgSrc}" />
        ${movie.Title} (${movie.Year})
      `;
};

let leftMovie;
let rightMovie;

const fetchMovieDetail = async (movie) => {
  const movieDetail = await axios.get("https://www.omdbapi.com/", {
    params: {
      apikey: "4608549e",
      i: movie.imdbID,
    },
  });
  return movieDetail;
};

const onLeftMovieSelect = async (movie) => {
  const selectedMovie = await fetchMovieDetail(movie);

  leftMovie = selectedMovie.data;

  const tutsElement = document.querySelector(".tutorial");
  tutsElement.classList.add("is-hidden");

  document.querySelector("#left-summary").innerHTML = movieTemplate(
    selectedMovie.data
  );

  runComparison();
};
const onRightMovieSelect = async (movie) => {
  const selectedMovie = await fetchMovieDetail(movie);

  rightMovie = selectedMovie.data;

  const tutsElement = document.querySelector(".tutorial");
  tutsElement.classList.add("is-hidden");

  document.querySelector("#right-summary").innerHTML = movieTemplate(
    selectedMovie.data
  );

  runComparison();
};

const autoCompleteConfig = {
  renderOption: renderMovieAsOption,
  inputValue(movie) {
    return movie.Title;
  },
  fetchData: fetchMovies,
};

createAutoComplete({
  ...autoCompleteConfig,
  root: document.querySelector("#left-autocomplete"),
  onOptionSelect: onLeftMovieSelect,
});

createAutoComplete({
  ...autoCompleteConfig,
  root: document.querySelector("#right-autocomplete"),
  onOptionSelect: onRightMovieSelect,
});

const movieTemplate = (movieDetail) => {
  const dollarsEarned = movieDetail.BoxOffice?.substring(1).replaceAll(",", "");

  const metaScore = movieDetail.Metascore;
  const imdbRating = movieDetail.imdbRating;
  const imdbVotes = movieDetail.imdbVotes.replaceAll(",", "");

  let awardsGot = 0;
  movieDetail.Awards.split(" ").forEach((word) => {
    const parsedWord = parseInt(word);
    if (!isNaN(parsedWord)) {
      awardsGot = awardsGot + parsedWord;
    }
  });

  return `
    <article class="media">
      <figure class="media-left">
        <p class="image">
          <img src="${movieDetail.Poster}" >
        </p>
      </figure>
      <div class="media-content">
        <div class="content">
          <h1>${movieDetail.Title}</h1>
          <h4>${movieDetail.Genre}</h4>
          <p>${movieDetail.Plot}</p>
        </div>
      </div>
    </article>
    <article class="notification is-primary data-value=${awardsGot}">
      <p class="title">${movieDetail.Awards}</p>
      <p class="subtitle">Awards</p>
    </article>
    <article class="notification is-primary" data-value=${dollarsEarned}>
      <p class="title">${movieDetail.BoxOffice}</p>
      <p class="subtitle">Box Office</p>
    </article>
    <article class="notification is-primary" data-value=${metaScore}>
      <p class="title">${movieDetail.Metascore}</p>
      <p class="subtitle">Metascore</p>
    </article>
    <article class="notification is-primary" data-value=${imdbRating}>
      <p class="title">${movieDetail.imdbRating}</p>
      <p class="subtitle">IMDB Rating</p>
    </article>
    <article class="notification is-primary" data-value=${imdbVotes}>
      <p class="title">${movieDetail.imdbVotes}</p>
      <p class="subtitle">IMDB Votes</p>
    </article>
  `;
};

const runComparison = () => {
  if (leftMovie && rightMovie) {
    const leftMovieStats = document.querySelectorAll(
      "#left-summary article.notification"
    );
    const rightMovieStats = document.querySelectorAll(
      "#right-summary article.notification"
    );
    leftMovieStats.forEach((leftStat, i) => {
      const rightStat = rightMovieStats[i];
      const leftSideValue = parseInt(leftStat.dataset.value);
      const rightSideValue = parseInt(rightStat.dataset.value);

      if (rightSideValue > leftSideValue) {
        leftStat.classList.remove("is-primary");
        leftStat.classList.add("is-warning");
      } else {
        rightStat.classList.remove("is-primary");
        rightStat.classList.add("is-warning");
      }
    });
  }
};

//https://my-json-server.typicode.com/shah7014/mock_data/genres/2/movies
function getLatestSeraches() {
  const ul = document.querySelector(".links");
  axios
    .get("https://my-json-server.typicode.com/shah7014/mock_data/genres")
    .then((genres) => {
      const sortedGenres = genres.data.sort((a, b) => a.upVotes - b.upVotes);
      const topGenre = sortedGenres[sortedGenres.length - 1];
      axios
        .get(
          "https://my-json-server.typicode.com/shah7014/mock_data/genres/" +
            topGenre.id +
            "/movies"
        )
        .then((response) => {
          const movies = response.data;
          for (let i = 0; i < movies.length; i += 2) {
            const li = document.createElement("li");
            li.innerHTML = `
            <a>${movies[i].Title} vs ${movies[i + 1].Title}</a>
          `;
            ul.appendChild(li);
            li.addEventListener("click", () => {
              onLeftMovieSelect(movies[i]);
              onRightMovieSelect(movies[i + 1]);
            });
          }
        });
    });
}

getLatestSeraches();
