import { useEffect, useState } from "react";

import "./App.scss";

import LoadingFilms from "./LoadingFilms";
import CardFilm from "./CardFilm";

import APP_SETTINGS from "./DATA/AppConfig.json";
import filmsArray from "./DATA/MyFilms.json";

let APP_ALLFILMS = [];
let timerFetchFilm;

class errorClass {
  message = "";
  objectFilm = [];
  indexFetch = -1;

  constructor(message, objectFilm, indexFetch) {
    this.message = message;
    this.objectFilm = objectFilm;
    this.indexFetch = indexFetch;
  }
}

function App() {
  const [loadingFilms, setLoadingFilms] = useState(true);
  const [stateFilms, setStateFilms] = useState([]);

  useEffect(() => {
    componentWillMount(setStateFilms, setLoadingFilms);
  }, []);

  return (
    <div className="App">
      <p>
        Количество фильмов: {filmsArray.length} (Загружено: {stateFilms.length})
      </p>
      <div className="films-wrapper">
        {loadingFilms === true ? (
          <LoadingFilms />
        ) : (
          stateFilms.map((stFilm, index) => {
            return <CardFilm key={index + 1} FilmData={stFilm} />;
          })
        )}
      </div>
    </div>
  );
}

export default App;

function componentWillMount(setStateFilms, setLoadingFilms) {
  let promiseLoading = new Promise((resolve, reject) => {
    for (let j = 0; j < filmsArray.length; j++) {
      let film = filmsArray[j];

      timerFetchFilm = setTimeout(fetchFilm, j * 200, j, film, {
        resolve,
        reject,
      });
    }
  });

  promiseLoading.then((data) => {
    APP_ALLFILMS.pop();

    if (APP_ALLFILMS.length !== filmsArray.length) {
      componentWillMount(setStateFilms, setLoadingFilms);
      return;
    }

    setStateFilms(APP_ALLFILMS);

    setLoadingFilms(false);
  });

  promiseLoading.catch((error) => {
    console.log("___________________ ОШИБКА ______________________");
    console.log(error);
    console.log("___________________ ОШИБКА ______________________");

    componentWillMount(setStateFilms, setLoadingFilms);
  });
}

async function fetchFilm(index, objectFilm, promiseActions) {
  try {
    let queryFilm = await fetch(
      `${APP_SETTINGS["X-API-URL"]}${objectFilm.FilmName[0]}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-API-KEY": APP_SETTINGS["X-API-KEY"],
        },
      }
    );

    if (!queryFilm.ok) {
      throw new errorClass("Ошибка отправленного запроса", objectFilm, index);
    }

    queryFilm = await queryFilm.json();

    if (!queryFilm.films.length) {
      throw new errorClass("Ошибка полученного фильма", objectFilm, index);
    }

    queryFilm = queryFilm.films;

    for (let i = 0; i < queryFilm.length; i++) {
      let filmFetch = queryFilm[i];

      if (
        objectFilm.FilmName.length === 1 &&
        filmFetch.nameRu === objectFilm.FilmName[0] &&
        filmFetch.year === objectFilm.DateYear
      ) {
        APP_ALLFILMS.push(filmFetch);

        if (index + 1 === filmsArray.length) promiseActions.resolve();
      } else if (
        objectFilm.FilmName.length === 2 &&
        filmFetch.nameRu === objectFilm.FilmName[0] &&
        filmFetch.nameEn === objectFilm.FilmName[1] &&
        filmFetch.year === objectFilm.DateYear
      ) {
        APP_ALLFILMS.push(filmFetch);

        if (index + 1 === filmsArray.length) promiseActions.resolve();
      }
    }
  } catch (error) {
    clearInterval(timerFetchFilm);

    promiseActions.reject(error);
    return;
  }
  return;
}
