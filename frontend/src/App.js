import { useState, useEffect, useRef, useCallback } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Routes, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Container from "react-bootstrap/Container";
import { Navbar, Nav } from "react-bootstrap";

import PetList from "./components/PetList";
import Pet from "./components/Pet";
import Favorites from "./components/Favorite";
import Login from "./components/Login";
import Logout from "./components/Logout";
import UploadPet from "./components/UploadPet";
import AddComment from "./components/AddComment";
import MyUploads from "./components/MyUploads";
import EditPet from "./components/EditPet";

import "./App.css";

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let loginData = JSON.parse(localStorage.getItem("login"));
    if (loginData) {
      let loginExp = loginData.exp;
      let now = Date.now() / 1000;
      if (now < loginExp) {
        setUser(loginData);
      } else {
        //expired
        localStorage.setItem("login", null);
      }
    }
  }, []);

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="App">
        <Navbar bg="info" expand="lg" sticky="top" variant="dark">
          <Container className="container-fluid">
            <Navbar.Brand href="/">
              <img
                src="/images/pet-logo.png"
                alt="pet logo"
                className="petLogo"
              />
              PetFinder
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
              <Nav className="ml-auto">
                <Nav.Link as={Link} to="/pets">
                  Pets
                </Nav.Link>
                {user && (
                  <Nav.Link as={Link} to="/favorites">
                    Favorites
                  </Nav.Link>
                )}
                {user && (
                  <Nav.Link as={Link} to="/my-uploads">
                    My Uploads
                  </Nav.Link>
                )}
              </Nav>
            </Navbar.Collapse>
            {user ? (
              <Logout setUser={setUser} clientId={clientId} />
            ) : (
              <Login setUser={setUser} />
            )}
          </Container>
        </Navbar>

        <Routes>
          <Route exact path="/" element={<PetList />} />
          <Route exact path="/pets" element={<PetList />} />
          <Route path="/pets/:id" element={<Pet user={user} />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/add-pet" element={<UploadPet user={user} />} />
          <Route
            path="/pets/:id/comment"
            element={<AddComment user={user} />}
          />
          <Route path="/my-uploads" element={<MyUploads />} />
          <Route path="/edit-pet/:id" element={<EditPet />} />
        </Routes>
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
