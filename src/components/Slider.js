function Slider() {
  return (
    <div id="carouselExample" className="carousel slide mb-4">
      <div className="carousel-inner rounded shadow">
        <div className="carousel-item active">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8"
            className="d-block w-100 height-500"
            alt="..."
          />
        </div>
        <div className="carousel-item">
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b"
            className="d-block w-100 height-500"
            alt="..."
          />
        </div>
      </div>
      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target="#carouselExample"
        data-bs-slide="prev"
      >
        <span className="carousel-control-prev-icon"></span>
      </button>
      <button
        className="carousel-control-next"
        type="button"
        data-bs-target="#carouselExample"
        data-bs-slide="next"
      >
        <span className="carousel-control-next-icon"></span>
      </button>
    </div>
  );
}

export default Slider;