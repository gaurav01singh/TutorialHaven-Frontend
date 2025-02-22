import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import "../../style/layout.css";
import API from "../Api";

const Layout = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState([]);
  const [isLogin, setIsLogin] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await API.get("/category/get-category");
        setCategory(response.data);
        console.log(category)
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
        const payload = JSON.parse(atob(token.split(".")[1]));
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

        {/* Hamburger Menu (Only visible on mobile) */}
        <button className="hamburger" onClick={() => setDrawerOpen(!drawerOpen)}>
          {drawerOpen ? "✖" : "☰"}
        </button>

        {/* Drawer Menu (Mobile) / Normal Nav (Desktop) */}
        <nav className={`nav-links ${drawerOpen ? "open" : ""}`}>
          <ul>
            {isLogin ? (
              <>
                <li><button className="bnt" onClick={() => { navigate("/"); setDrawerOpen(false); }}>Home</button></li>
                <li><button className="bnt" onClick={() => { navigate("/profile"); setDrawerOpen(false); }}>Profile</button></li>
                <li><button className="bnt" onClick={() => { navigate("/blog/create"); setDrawerOpen(false); }}>Create New Dossier</button></li>
                <li><button className="bnt" onClick={() => { navigate("/gallery"); setDrawerOpen(false); }}>Gallery</button></li>
                <li><button className="bnt" onClick={() => { handleLogout(); setDrawerOpen(false); }}>Logout</button></li>
              </>
            ) : (
              <>
                <li><button className="bnt" onClick={() => { navigate("/login"); setDrawerOpen(false); }}>Login</button></li>
                <li><button className="bnt" onClick={() => { navigate("/signup"); setDrawerOpen(false); }}>Sign Up</button></li>
              </>
            )}
          </ul>
        </nav>
      </header>

      {/* Category Dropdown */}
      {isLogin && (
        <ul className="category">
          {category.map((cate) => (
            <li className="category-item dropdown" key={cate._id} >
              <p onClick={() => navigate(`/tutorial/category/${cate._id}`)}>{cate.name}</p>
              {cate.subcategories.length > 0 && (
                <ul className="dropdown-menu">
                  {cate.subcategories.map((sub) => (
                    <li key={sub._id} onClick={() => navigate(`/tutorial/subcategory/${sub._id}`)}>
                      {sub.name}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}

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
