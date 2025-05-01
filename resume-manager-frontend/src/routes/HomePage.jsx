import { Link } from 'react-router-dom';
import { Button } from 'reactstrap';

// ==================================================

/**
 * Displays the home page.
 */
function HomePage() {
  return (
    <main className="HomePage">
      <h1>Resume Manager</h1>
      <p>
        Store all of your information in one resume and create tailored resumes
        and templates from it that automatically update themselves.
      </p>
      <div>
        <Link to="/register">
          <Button color="primary">Register</Button>
        </Link>
        <Link to="/signin">
          <Button color="primary">Sign In</Button>
        </Link>
      </div>
    </main>
  );
}

// ==================================================

export default HomePage;
