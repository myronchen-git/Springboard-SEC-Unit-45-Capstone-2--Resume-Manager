import { useContext, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  Button,
  Nav,
  Navbar,
  NavItem,
  Offcanvas,
  OffcanvasBody,
  OffcanvasHeader,
} from 'reactstrap';

import { UserContext } from '../contexts.jsx';

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
      <Navbar className="NavBar" fixed="top" light>
        {!isOpen && (
          <Button
            className="NavBar__menu-button shadow-sm"
            color="light"
            onClick={toggleNavbar}
            style={{ backgroundColor: 'lightblue' }}
          >
            ☰ Menu
          </Button>
        )}
      </Navbar>

      <Offcanvas
        className="NavBar__menu shadow"
        isOpen={isOpen}
        toggle={toggleNavbar}
        direction="start"
        backdrop={false}
        tag="aside"
        style={{ width: '15em', backgroundColor: '#add8e680', border: 'none' }}
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
