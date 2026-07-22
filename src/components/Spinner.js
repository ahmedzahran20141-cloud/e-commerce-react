function Spinner({ text = "Loading..." }) {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center py-5">
      <div
        className="spinner-border text-primary"
        role="status"
        style={{ width: "4rem", height: "4rem" }}
      >
        <span className="visually-hidden">Loading...</span>
      </div>

      <h5 className="mt-3 text-muted">{text}</h5>
    </div>
  );
}

export default Spinner;