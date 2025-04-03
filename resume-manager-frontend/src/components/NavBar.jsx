import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Collapse, Nav, Navbar, NavbarToggler, NavItem } from 'reactstrap';

// ==================================================

function NavBar({ signoutUser }) {
  const [collapsed, setCollapsed] = useState(true);

  const toggleNavbar = () => setCollapsed(!collapsed);

  return (
    <>
      <Navbar className="NavBar">
        <NavbarToggler onClick={toggleNavbar} />
        <Collapse isOpen={!collapsed} navbar>
          <Nav navbar>
            <NavItem>
              <NavLink to="/document">Document</NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/account">Account</NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/" onClick={signoutUser}>
                Sign Out
              </NavLink>
            </NavItem>
          </Nav>
        </Collapse>
      </Navbar>
      <Outlet />
    </>
  );
}

// ==================================================

export default NavBar;
