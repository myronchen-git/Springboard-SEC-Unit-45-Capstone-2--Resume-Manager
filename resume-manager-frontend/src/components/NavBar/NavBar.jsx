import { useContext, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  Button,
  Nav,
  NavItem,
  Offcanvas,
  OffcanvasBody,
  OffcanvasHeader,
} from 'reactstrap';

import { UserContext } from '../../contexts.jsx';

import './NavBar.css';

// ==================================================

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const { signoutUser } = useContext(UserContext);

  // --------------------------------------------------

  const toggleNavbar = () => setIsOpen(!isOpen);

  // --------------------------------------------------

  return (
    <>
      {!isOpen && (
        <Button id="NavBar__menu-button" color="primary" onClick={toggleNavbar}>
          ☰ Menu
        </Button>
      )}

      <Offcanvas
        id="NavBar__menu"
        className="shadow"
        isOpen={isOpen}
        toggle={toggleNavbar}
        direction="start"
        tag="aside"
      >
        <OffcanvasHeader toggle={toggleNavbar} wrapTag="header">
          Resume Manager
        </OffcanvasHeader>
        <OffcanvasBody tag="nav">
          <Nav vertical>
            <NavItem className="NavBar__menu__item">
              <NavLink to="/document" onClick={toggleNavbar}>
                Document
              </NavLink>
            </NavItem>
            <NavItem className="NavBar__menu__item">
              <NavLink to="/account" onClick={toggleNavbar}>
                Account
              </NavLink>
            </NavItem>
            <NavItem className="NavBar__menu__item">
              <NavLink to="/" onClick={signoutUser}>
                Sign Out
              </NavLink>
            </NavItem>
          </Nav>
        </OffcanvasBody>
      </Offcanvas>
      <Outlet />
    </>
  );
}

// ==================================================

export default NavBar;
