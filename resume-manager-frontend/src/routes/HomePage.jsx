import { Link } from 'react-router-dom';
import { Button } from 'reactstrap';

import './HomePage.css';

// ==================================================

/**
 * Displays the home page.
 */
function HomePage() {
  return (
    <main className="HomePage">
      <div className="HomePage-backdrop">
        <h1 className="HomePage-title">Resume Manager</h1>
        <p className="HomePage-description">
          Store all of your information in one resume and create tailored
          resumes from it that automatically update themselves.
        </p>
        <div className="HomePage-buttons">
          <Link to="/register">
            <Button color="primary">Register</Button>
          </Link>
          <Link to="/signin">
            <Button color="primary">Sign In</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

// ==================================================

export default HomePage;
