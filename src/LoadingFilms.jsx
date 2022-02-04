// __________________________________________________ СТИЛИ
import "./LoadingFilms.scss"; // Главный файл со стилями

// __________________________________________________ ИМПОРТ ДАННЫХ
import loadingLogo from "./logo.svg";

function LoadingFilms() {
  return (
    <div className="LoadingFilms">
      <img src={loadingLogo} className="loaging-logo" alt="logo" />
      <span className="loading-text">Загружаем фильмы...</span>
    </div>
  );
}

export default LoadingFilms;
