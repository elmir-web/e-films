// __________________________________________________ СТИЛИ
import "./CardFilm.scss"; // Главный файл со стилями

function CardFilm({ FilmData }) {
  return (
    <div className="CardFilm">
      <div className="film-wrapper">
        <div className="poster-wrapper">
          <div
            className="backgroundPosterImg"
            style={{
              backgroundImage: `url(${FilmData.posterUrl})`,
            }}
          ></div>
        </div>

        <div className="film-information">
          <div className="FilmRating">
            <span>Рейтинг {FilmData.rating}</span>
          </div>
          <div className="Name">{FilmData.nameRu}</div>
          <div className="Type">
            {FilmData.type === "FILM" ? "Фильм" : "Сериал"}
          </div>
          <div className="Meta">
            <div className="genre">
              {FilmData.genres.map((genre) => {
                return <span>{genre.genre} </span>;
              })}
            </div>
            <div className="Date"> {FilmData.year}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CardFilm;
