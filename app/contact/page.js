export default function Contact() {
  return (
    <div className="container">
      <h2 className="section-title">Contact</h2>
      <div className="contact-info">
        <div className="contact-item">
          <div>
            <div className="label">Email</div>
            {/* TODO: Replace with your email */}
            <div className="value">your.email@example.com</div>
          </div>
        </div>
        <div className="contact-item">
          <div>
            <div className="label">GitHub</div>
            {/* TODO: Replace with your GitHub */}
            <div className="value">github.com/yourusername</div>
          </div>
        </div>
        <div className="contact-item">
          <div>
            <div className="label">LinkedIn</div>
            {/* TODO: Replace with your LinkedIn */}
            <div className="value">linkedin.com/in/yourusername</div>
          </div>
        </div>
        <div className="contact-item">
          <div>
            <div className="label">Location</div>
            {/* TODO: Replace with your location */}
            <div className="value">City, State</div>
          </div>
        </div>
      </div>
    </div>
  )
}
