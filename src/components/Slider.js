function Slider() {
  return (
    <div id="carouselExample" className="carousel slide mb-4">
      <div className="carousel-inner rounded shadow">
        <div className="carousel-item active">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8"
            className="d-block w-100"
            style={{ height: "400px", objectFit: "cover" }}
            alt="Slider 1"
          />
        </div>
      </div>
    </div>
  );
}

export default Slider;