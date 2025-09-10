import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../style/home.css";
import API from "./Api";
import Markdown from "react-markdown";

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

const Home = () => {
  const navigate = useNavigate();
  const [tutorials, setTutorials] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    document.title = "Tutorial Haven | Home";
  }, []);

  // Fetch tutorials with pagination
  const fetchTutorials = useCallback(async (page = 1, limit = itemsPerPage) => {
    try {
      setIsLoading(true);
      const response = await API.get(`/tutorial/all?page=${page}&limit=${limit}`);
      
      // Handle both old and new API response formats
      if (response.data.tutorials) {
        // New paginated format
        setTutorials(response.data.tutorials);
        setPagination(response.data.pagination);
      } else {
        // Old format (array directly)
        setTutorials(response.data);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalCount: response.data.length,
          hasNextPage: false,
          hasPrevPage: false
        });
      }
    } catch (error) {
      console.error("Error fetching tutorials:", error);
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        // navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  }, [itemsPerPage]);

  // Initial load
  useEffect(() => {
    fetchTutorials(1, itemsPerPage);
  }, [fetchTutorials]);

  // Handle page changes
  const handlePageChange = useCallback((page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchTutorials(page, itemsPerPage);
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [fetchTutorials, pagination.totalPages, itemsPerPage]);

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setItemsPerPage(newLimit);
    fetchTutorials(1, newLimit); // Reset to page 1 with new limit
  };

  // Debounced search handler
  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleDateChange = useCallback((e) => {
    setSelectedDate(e.target.value);
  }, []);

  // Filter tutorials based on search term and date (client-side filtering)
  const filteredTutorials = useMemo(() => {
    return tutorials.filter((tutorial) => {
      const isDateMatch = selectedDate
        ? new Date(tutorial.createdAt).toLocaleDateString() ===
          new Date(selectedDate).toLocaleDateString()
        : true;
      const isSearchMatch = tutorial.title.toLowerCase().includes(searchTerm.toLowerCase());
      return isSearchMatch && isDateMatch;
    });
  }, [tutorials, searchTerm, selectedDate]);

  return (
    <>
      <div className="search-container">
        <input
          type="text"
          placeholder="Search Tutorials..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input"
        />
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="date-input"
        />
        <select
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
          className="items-per-page-select"
        >
          <option value={6}>6 per page</option>
          <option value={10}>10 per page</option>
          <option value={20}>20 per page</option>
          <option value={50}>50 per page</option>
        </select>
      </div>

      <div className="tutorial-container">
        {isLoading ? (
          <SkeletonLoader />
        ) : filteredTutorials.length > 0 ? (
          <>
            {/* <div className="results-info">
              <p>
                Showing {filteredTutorials.length} of {pagination.totalCount} tutorials
                {searchTerm && ` for "${searchTerm}"`}
              </p>
            </div> */}
            
            <ul className="tutorial-items">
              {filteredTutorials.map((tutorial) => (
                console.log(tutorial),
                <li key={tutorial._id} className="tutorial-item">
                  <div className="tutorial-card" onClick={() => navigate(`/tutorial/${tutorial.slug}`)}>
                    <img 
                      className="tamplateImg" 
                      src={tutorial.templateImg}
                      alt={tutorial.title}
                      loading="lazy"
                    />
                    <div className="tutorial-info">
                      <h3>{tutorial.title}</h3>
                      {tutorial.category && (
                        <span className="tutorial-category">{tutorial.category.name}</span>
                      )}
                      {tutorial.createdBy && (
                        <span className="tutorial-author">By {tutorial.createdBy.username}</span>
                      )}
                      <span className="tutorial-date">
                        {new Date(tutorial.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Only show pagination if not filtering */}
            {!searchTerm && !selectedDate && (
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
          <div className="no-results">
            <p>No tutorials found {searchTerm || selectedDate ? 'for your search' : ''}.</p>
            {(searchTerm || selectedDate) && (
              <button 
                className="clear-filters-btn"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedDate("");
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Home;