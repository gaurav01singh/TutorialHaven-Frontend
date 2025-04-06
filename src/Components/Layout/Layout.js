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
    setDrawerOpen(false); // Close drawer on logout
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
          // navigate("/login");
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
        <div className="logo" onClick={() => { navigate("/"); setDrawerOpen(false); }}>
          <img src="https://res.cloudinary.com/dyl5ibyvg/image/upload/v1740232286/vkx1pz1zozq37tlauoue.png" />
          <h2>My Dossier</h2>
        </div>

        {/* Hamburger Menu (Only visible on mobile) */}
        <button className="hamburger" onClick={() => setDrawerOpen(!drawerOpen)}>
          {drawerOpen ? "✖" : "☰"}
        </button>

        {/* Drawer Menu (Mobile) / Normal Nav (Desktop) */}
        <nav className={`nav-links ${drawerOpen ? "open" : ""}`}>
          <ul className="nav-menu">
            {isLogin ? (
              <>
                <li><button className="bnt" onClick={() => { navigate("/profile"); setDrawerOpen(false); }}>Profile</button></li>
                <li><button className="bnt" onClick={() => { navigate("/tutorial/create"); setDrawerOpen(false); }}>Create Tutorial</button></li>
                <li><button className="bnt" onClick={() => { navigate("/gallery"); setDrawerOpen(false); }}>Gallery</button></li>
                <li><button className="bnt" onClick={handleLogout}>Logout</button></li>
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
      <ul className="category">
        {category.map((cate) => (
          <li className="category-item dropdown" key={cate._id}>
            <p onClick={() => { navigate(`/tutorial/category/${cate.slug}`); setDrawerOpen(false); }}>{cate.name}</p>
            {cate.subcategories.length > 0 && (
              <ul className="dropdown-menu">
                {cate.subcategories.map((sub) => (
                  <li key={sub._id} onClick={() => { navigate(`/tutorial/subcategory/${sub.slug}`); setDrawerOpen(false); }}>
                    {sub.name}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>

      {/* Main Content */}
      <main className="container">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} My Dossier. All rights reserved.</p>
      </footer>
    </>
  );
};

export default Layout;