import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../Api";
import "../../style/tutoriallist.css";
import SEO from "../SEO/SEO";

const SkeletonLoader = () => (
  <div className="skeleton-container">
    {[...Array(6)].map((_, index) => (
      <div key={index} className="skeleton-card">
        <div className="skeleton-image"></div>
        <div className="skeleton-content">
          <div className="skeleton-title"></div>
          <div className="skeleton-title skeleton-title-short"></div>
        </div>
      </div>
    ))}
  </div>
);

const Pagination = ({ currentPage, totalPages, onPageChange, hasNextPage, hasPrevPage }) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevPage}
      >
        Previous
      </button>

      {getVisiblePages().map((page, index) => (
        <button
          key={index}
          className={`pagination-btn ${page === currentPage ? 'active' : ''} ${page === '...' ? 'dots' : ''}`}
          onClick={() => typeof page === 'number' ? onPageChange(page) : null}
          disabled={page === '...'}
        >
          {page}
        </button>
      ))}

      <button
        className="pagination-btn"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
      >
        Next
      </button>
    </div>
  );
};

const TutorialList = () => {
  const [tutorials, setTutorials] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'my'
  const navigate = useNavigate();

  const checkUserAuth = useCallback(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        console.log(payload);
        setIsAdmin(payload.role === "Admin");
        setCurrentUser({
          id: payload.userId || payload.id,
          username: payload.username,
          role: payload.role
        });
      } catch (error) {
        console.error("Invalid token:", error);
        setIsAdmin(false);
        localStorage.removeItem("token");
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    document.title = "Tutorial Haven | All Tutorials";
    checkUserAuth();
  }, [checkUserAuth]);

  // Fetch tutorials with pagination
  const fetchTutorials = useCallback(async (page = 1, limit = itemsPerPage, mode = viewMode) => {
    try {
      setIsLoading(true);
      
      let endpoint;
      if (mode === 'my' && currentUser) {
        // Use the user-specific endpoint
        endpoint = `/tutorial/user/${currentUser.id}?page=${page}&limit=${limit}`;
      } else {
        // Use the all tutorials endpoint
        endpoint = `/tutorial/all?page=${page}&limit=${limit}`;
      }
      
      const response = await API.get(endpoint);
      
      // Handle the new API response format
      if (response.data.success) {
        setTutorials(response.data.data);
        setPagination(response.data.pagination);
      } else if (response.data.tutorials) {
        // Fallback for old format
        setTutorials(response.data.tutorials);
        setPagination(response.data.pagination);
      } else {
        // Old format (array directly)
        setTutorials(response.data);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: response.data.length,
          hasNextPage: false,
          hasPrevPage: false
        });
      }
    } catch (error) {
      console.error("Error fetching tutorials:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else if (error.response?.status === 403) {
        alert("Access denied. You can only view your own tutorials.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [itemsPerPage, viewMode, currentUser, navigate]);

  // Initial load
  useEffect(() => {
    if (currentUser) {
      fetchTutorials(1, itemsPerPage, viewMode);
    }
  }, [fetchTutorials, currentUser, itemsPerPage, viewMode]);

  // Handle page changes
  const handlePageChange = useCallback((page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchTutorials(page, itemsPerPage, viewMode);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [fetchTutorials, pagination.totalPages, itemsPerPage, viewMode]);

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setItemsPerPage(newLimit);
    fetchTutorials(1, newLimit, viewMode);
  };

  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setSearchTerm(""); // Clear search when switching modes
    fetchTutorials(1, itemsPerPage, mode);
  };

  // Search functionality
  const filteredTutorials = tutorials.filter(tutorial =>
    tutorial.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id, title) => {
    const confirmMessage = `Are you sure you want to delete "${title}"? This action cannot be undone.`;
    if (window.confirm(confirmMessage)) {
      try {
        await API.delete(`/tutorial/delete/${id}`);
        // If this was the last item on current page and we're not on page 1, go to previous page
        if (tutorials.length === 1 && pagination.currentPage > 1) {
          fetchTutorials(pagination.currentPage - 1, itemsPerPage, viewMode);
        } else {
          fetchTutorials(pagination.currentPage, itemsPerPage, viewMode);
        }
        // Show success message
        alert("Tutorial deleted successfully!");
      } catch (error) {
        console.error("Error deleting tutorial:", error);
        alert("Failed to delete tutorial. Please try again.");
      }
    }
  };

  return (
    <div className="tutorial-list-container">
      <SEO
        title={viewMode === 'my' ? "My Tutorials" : "All Tutorials & Learning Paths"}
        description="Browse our comprehensive library of programming tutorials covering Web Development, React, Node.js, AI/ML, and Interview Preparation."
        canonical="/tutorial"
        noindex={viewMode === 'my'}
      />
      <div className="tutorial-list-header">
        <div className="header-content">
          <h1>
            {viewMode === 'my' ? 'My Tutorials' : 'All Tutorials'}
          </h1>
          <div className="header-stats">
            <span className="total-count">
              {pagination.totalItems} tutorial{pagination.totalItems !== 1 ? 's' : ''} 
              {viewMode === 'my' ? ' created by you' : ' total'}
            </span>
          </div>
        </div>
        
        <div className="header-actions">
          {/* View Mode Toggle */}
          <div className="view-mode-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'all' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('all')}
            >
              All Tutorials
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'my' ? 'active' : ''}`}
              onClick={() => handleViewModeChange('my')}
            >
              My Tutorials
            </button>
          </div>

          {(isAdmin || viewMode === 'my') && (
            <button 
              onClick={() => navigate("/tutorial/create")} 
              className="create-btn"
            >
              + Create Tutorial
            </button>
          )}
        </div>
      </div>

      <div className="tutorial-controls">
        <div className="search-control">
          <input
            type="text"
            placeholder={`Search ${viewMode === 'my' ? 'your' : ''} tutorials...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="items-control">
          <label htmlFor="items-per-page">Show:</label>
          <select
            id="items-per-page"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="items-per-page-select"
          >
            <option value={6}>6 per page</option>
            <option value={12}>12 per page</option>
            <option value={24}>24 per page</option>
            <option value={48}>48 per page</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <SkeletonLoader />
      ) : filteredTutorials.length > 0 ? (
        <>
          {searchTerm && (
            <div className="search-results-info">
              <p>
                Found {filteredTutorials.length} tutorial{filteredTutorials.length !== 1 ? 's' : ''} 
                matching "{searchTerm}" 
                {viewMode === 'my' ? ' in your tutorials' : ''}
              </p>
              {filteredTutorials.length !== tutorials.length && (
                <button 
                  className="clear-search-btn"
                  onClick={() => setSearchTerm("")}
                >
                  Clear search
                </button>
              )}
            </div>
          )}

          <ul className="tutorials">
            {filteredTutorials.map((tutorial) => (
              <li key={tutorial._id} className="tutorial-item">
                <div 
                  className="tutorial-card" 
                  onClick={() => navigate(`/tutorial/${tutorial.slug}`)}
                >
                  <div className="tutorial-image-container">
                    <img 
                      className="tamplateImg" 
                      src={tutorial.templateImg}
                      alt={tutorial.title}
                      loading="lazy"
                    />
                  </div>
                  
                  <div className="tutorial-content">
                    <h3 className="tutorial-title">{tutorial.title}</h3>
                    
                    <div className="tutorial-meta">
                      {tutorial.category && (
                        <span className="tutorial-category">
                          {tutorial.category.name}
                        </span>
                      )}
                      {tutorial.createdBy && viewMode === 'all' && (
                        <span className="tutorial-author">
                          By {tutorial.createdBy.username}
                        </span>
                      )}
                      <span className="tutorial-date">
                        {new Date(tutorial.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {(isAdmin || (viewMode === 'my' && currentUser && tutorial.createdBy._id === currentUser.id)) && (
                  <div className="admin-actions">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/tutorial/edit/${tutorial.slug}`);
                      }}
                      className="edit-btn"
                      title="Edit Tutorial"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(tutorial._id, tutorial.title);
                      }}
                      className="delete-btn"
                      title="Delete Tutorial"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* Only show pagination if not searching */}
          {!searchTerm && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
              hasNextPage={pagination.hasNextPage}
              hasPrevPage={pagination.hasPrevPage}
            />
          )}
        </>
      ) : (
        <div className="no-tutorials">
          <div className="no-tutorials-content">
            <h3>
              {searchTerm 
                ? `No tutorials found matching "${searchTerm}"` 
                : viewMode === 'my'
                  ? "You haven't created any tutorials yet"
                  : "No tutorials available"
              }
            </h3>
            <p>
              {searchTerm 
                ? "Try adjusting your search terms or browse all tutorials." 
                : viewMode === 'my'
                  ? "Get started by creating your first tutorial!"
                  : "Check back later for new tutorials."
              }
            </p>
            {searchTerm ? (
              <button 
                className="clear-search-btn"
                onClick={() => setSearchTerm("")}
              >
                Clear search
              </button>
            ) : viewMode === 'my' || isAdmin ? (
              <button 
                className="create-btn"
                onClick={() => navigate("/tutorial/create")}
              >
                Create First Tutorial
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorialList;