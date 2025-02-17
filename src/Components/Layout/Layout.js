import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import "../../style/layout.css";

import API from "../Api";

const Layout = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState([]);
  const [isLogin, setIsLogin] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await API.get("/category/get-category");
        setCategory(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };

    const checkToken = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLogin(false);
        return;
      }

      try {
        const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
        if (payload.exp * 1000 < Date.now()) {
          localStorage.removeItem("token");
          setIsLogin(false);
        } else {
          setIsLogin(true);
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
        setIsLogin(false);
      }
    };

    checkToken();
    fetchCategory();
  }, [navigate]);

  return (
    <>
      {/* Header */}
      <header className="navbar">
        <h2>My Dossier</h2>
        <nav>
          {isLogin ? (
            <ul>
              <li>
                <button className="bnt" onClick={() => navigate("/")}>
                  Home
                </button>
              </li>
              <li>
                <button className="bnt" onClick={() => navigate("/profile")}>
                  Profile
                </button>
              </li>
              <li>
<<<<<<< HEAD
                <button className="bnt" onClick={() => navigate("/blog/create")}>

                  Create New Blog
                </button>
=======
                <button
                  className="bnt"
                  onClick={() => navigate("/blog/create")}
                >
                  Create New Dossier
>>>>>>> bfe50c5b31611e820b95bb8d2c38f02267fb67ab
                </button>
              </li>
              <li>
                <button className="bnt" onClick={() => navigate("/gallery")}>
                  Gallery
                </button>
              </li>
              <li>
                <button className="bnt" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </ul>
          ) : (
            <ul>
              <li>
                <button className="bnt" onClick={() => navigate("/login")}>
                  Login
                </button>
              </li>
              <li>
                <button className="bnt" onClick={() => navigate("/signup")}>
                  Sign Up
                </button>
              </li>
            </ul>
          )}
        </nav>
      </header>

      {/* Category Dropdown */}
      {isLogin ? (
        <ul className="category">
          {category.map((cate) => (
            <li className="category-item dropdown" key={cate._id}>
              <p onClick={() => navigate(`/category/${cate._id}`)}>{cate.name}</p>
              {cate.subcategories.length > 0 && (
                <ul className="dropdown-menu">
                  {cate.subcategories.map((sub) => (
                    <li
                      key={sub._id}
                      onClick={() => navigate(`/tutorial`)}
                    >
                      {sub.name}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      ) : null}

      {/* Main Content */}
      <main className="container">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} My Dossier. All rights reserved.</p>
      </footer>
    </>
  );
};

export default Layout;
