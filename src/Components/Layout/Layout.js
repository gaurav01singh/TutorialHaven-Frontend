import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import "../../style/layout.css";
import axios from "axios";

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
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "https://tutorial-haven-backend.vercel.app/api/category/get-category",
          {
            headers: {
              Authorization: token,
            },
          }
        );
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
        }else{
          setIsLogin(true);
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
        setIsLogin(false);
      }
    };
    console.log(isLogin)
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
                <button
                  className="bnt"
                  onClick={() => navigate("/blog/create")}
                >
                  Create New Dossier
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
                <button
                  className="bnt"
                  onClick={() => {
                    navigate("/login");
                  }}
                >
                  Login
                </button>
              </li>
              <li>
                <button
                  className="bnt"
                  onClick={() => {
                    navigate("/signup");
                  }}
                >
                  SignUp
                </button>
              </li>
            </ul>
          )}
        </nav>
      </header>
      <ul className="category">
        {category.map((cate) => (
          <li
            className="category-item"
            key={cate._id}
            onClick={() => navigate(`/category/${cate._id}`)}
          >
            <p>{cate.name}</p>
          </li>
        ))}
      </ul>

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
