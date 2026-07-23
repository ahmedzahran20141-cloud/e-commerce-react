function About() {
  return (
    <div className="container py-5">
      <div className="text-center mb-4">
        <h1>About Us</h1>
        <p className="text-muted">Learn more about our store and mission</p>
      </div>
      <div className="row align-items-center">
        <div className="col-md-6">
          <img
            src="https://images.unsplash.com/photo-1542831371-d531d36971e6"
            alt="About"
            className="img-fluid rounded shadow"
          />
        </div>
        <div className="col-md-6">
          <h3>Who We Are</h3>
          <p>We are an online store offering high‑quality products at affordable prices.</p>
          <h3 className="mt-4">Our Vision</h3>
          <p>To become one of the most trusted online shopping platforms.</p>
          <h3 className="mt-4">Why Choose Us?</h3>
          <ul>
            <li>Fast and secure shopping</li>
            <li>High‑quality products</li>
            <li>Affordable prices</li>
            <li>Friendly customer support</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default About;