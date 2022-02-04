// __________________________________________________ ВСЕ ТЕХНИЧЕСКИЕ ИМПОРТЫ
import { useEffect, useState } from "react";

// __________________________________________________ СТИЛИ
import "./App.scss"; // Главный файл со стилями

// __________________________________________________ ПОДКЛЮЧАЕМЫЕ КОМПОНЕНТЫ
import LoadingFilms from "./LoadingFilms";
import CardFilm from "./CardFilm";

// __________________________________________________ ИМПОРТЫ НАСТРОЕК
import APP_SETTINGS from "./DATA/AppConfig.json";
import filmsArray from "./DATA/MyFilms.json"; // Загружаем названия и года фильмов из файла

let APP_ALLFILMS = [];

class errorClass {
  message = "";
  objectFilm = [];

  constructor(message, objectFilm) {
    this.message = message;
    this.objectFilm = objectFilm;
  }
}

/**
 * Cамописная функция инициализации данных для компонента
 *
 * Параметры:
 * 1. Все состояния фильмов
 * 2. Функция установки состояния фильмов
 */
function componentWillMount(stateFilms, setStateFilms, setLoadingFilms) {
  // Бегаем по массиву с названиями и годами фильмов

  let promiseLoading = new Promise((resolve, reject) => {
    for (let j = 0; j < filmsArray.length; j++) {
      // Цикл вызывается для каждого элемента массива
      let film = filmsArray[j];

      requestFilm(j, film, setStateFilms, { resolve, reject });
    }
  });

  promiseLoading.then((promiseActions) => {
    for (let j = 0; j < stateFilms.length; j++) {
      for (let i = 0; i < filmsArray.length; i++) {
        if (
          stateFilms[j].nameRu === filmsArray[i].FilmName[0] &&
          stateFilms[j].year === filmsArray[i].DateYear
        ) {
          delete filmsArray[i].isLoad;
        }
      }
    }

    for (let i = 0; i < filmsArray.length; i++) {
      let film = filmsArray[i];

      if (film.isLoad === false) {
        console.log("Вроде бы работает:)");

        requestFilm(i, film, setStateFilms, promiseActions);
      }
    }

    setLoadingFilms(false);
  });

  promiseLoading.catch((error) => {
    window.alert("Очень странная ошибка, смотри 78 строку компонента App.jsx");
  });
}

function requestFilm(index, film, setStateFilms, promiseActions) {
  // Создаем таймаут с разницей в 1/5 от секунды, чтобы создавать разницу запуска функции во времени для каждого элемента массива
  /**
   * Вызываем в таймауте самописную функция для запроса данных о текущем фильме, информацию о которой мы передаем на данную функцию
   *
   * Аргументы:
   * 1. Индекс элемента массива
   * 2. Объект (элемент массива) с названием и годом фильма
   * 3. Функция установки состояния фильмов
   */
  const timerFetchFilm = setTimeout(
    fetchFilm, // Наша вызываемая функция
    index * 200, // Выбранный таймут запуска
    index, // Передаваемые по очереди параметры
    film, // Передаваемые по очереди параметры
    setStateFilms, // Передаваемые по очереди параметры
    promiseActions // Передаваемые по очереди параметры
  );
}

/**
 * Самописная функция для запроса данных о текущем фильме, информацию о которой мы передаем на данную функцию
 *
 * Параметры:
 * 1. Индекс элемента массива
 * 2. Объект (элемент массива) с названием и годом фильма
 * 3. Функция установки состояния фильмов
 */
async function fetchFilm(index, objectFilm, setStateFilms, promiseActions) {
  // Используем блок поиска исключений, чтобы приложение не упало, если будет какая-то ошибка
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
    ); // Отправляем синхронный запрос на получение фильмов по переданному названию

    // Если есть ошибка
    if (!queryFilm.ok) {
      throw new errorClass("Ошибка отправленного запроса", objectFilm); // Создаем исключение, чтобы обработать эту ошибку в блоке catch
    }

    queryFilm = await queryFilm.json(); // Получаем JSON из ответа

    // Бегаем по массиву с полученными фильмами по текущему названию
    for (let i = 0; i < queryFilm.films.length; i++) {
      // Цикл вызывается для каждого полученного фильма по этому названию
      let filmFetch = queryFilm.films[i];

      // Если элемент в локальном массиве имеет только одно название фильма и это название совпало с одним названием какого-либо фильма из полученных по текущему названию и совпал год
      if (
        objectFilm.FilmName.length === 1 &&
        filmFetch.nameRu === objectFilm.FilmName[0] &&
        filmFetch.year === objectFilm.DateYear
      ) {
        APP_ALLFILMS.push(filmFetch); // Положим этот фильм ко всем остальным в глобальную переменную
      } else if (
        objectFilm.FilmName.length === 2 &&
        filmFetch.nameRu === objectFilm.FilmName[0] &&
        filmFetch.nameEn === objectFilm.FilmName[1] &&
        filmFetch.year === objectFilm.DateYear
      ) {
        /* Если элемент в локальном массиве имеет два названия фильма и эти названия совпали с названиями одного из полученных элементов какого-либо фильма из полученных по текущему названию и совпал год */
        APP_ALLFILMS.push(filmFetch); // Положим этот фильм ко всем остальным в глобальную переменную
      }
    }

    if (index + 1 === filmsArray.length) {
      console.log(APP_ALLFILMS);

      console.log(filmsArray);

      APP_ALLFILMS.pop();

      setStateFilms(APP_ALLFILMS);

      promiseActions.resolve(promiseActions);
    }
  } catch (error) {
    console.log("ОШИБКА ");
    console.log(error);
    console.log("__________________________________________________");

    console.log(index, objectFilm);

    filmsArray[index].isLoad = false;
  }
}

// __________________________________________________ ГЛАВНАЯ ФУНКЦИЯ КОМПОНЕНТА
function App() {
  // ________________________________________ ВСЕ СОСТОЯНИЯ КОМПОНЕНТА
  const [loadingFilms, setLoadingFilms] = useState(true);
  const [stateFilms, setStateFilms] = useState([]);

  // ________________________________________ КОГДА КОМПОНЕНТ МОНТИРУЕТСЯ
  useEffect(() => {
    /**
     * Вызываем самописную функцию инициализации данных для компонента
     *
     * Аргументы:
     * 1. Все состояния фильмов
     * 2. Функция установки состояния фильмов
     */
    componentWillMount(stateFilms, setStateFilms, setLoadingFilms);
  }, []);

  return (
    <div className="App">
      <p>Количество фильмов: {stateFilms.length}</p>
      <div className="films-wrapper">
        {loadingFilms === true ? (
          <LoadingFilms />
        ) : (
          stateFilms.map((stFilm, index) => {
            return <CardFilm key={/*stFilm.filmId*/ index} FilmData={stFilm} />;
          })
        )}
      </div>
    </div>
  );
}

export default App;
