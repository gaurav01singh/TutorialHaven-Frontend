import React, { useState, useEffect } from "react";
import API from "../Api";
import "../../style/CreateCategory.css"

const CreateCategory = () => {
  const [name, setName] = useState("");
  const [subName, setSubName] = useState("");
  const [parentCategory, setParentCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editSubCategoryId, setEditSubCategoryId] = useState(null);

  // Fetch all categories along with their subcategories
  const fetchCategories = async () => {
    try {
      const response = await API.get("/category/get-category");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    document.title = "Tutorial Haven | Create Category & Subcategory";
    fetchCategories();
  }, []);

  // Handle category creation or update
  const handleSubmitCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage("Category name is required.");
      return;
    }

    try {
      setLoading(true);
      if (editCategoryId) {
        await API.put(`/category/update-category/${editCategoryId}`, { name: name.trim() });
        setMessage("Category updated successfully.");
      } else {
        await API.post("/category/create-category", { name: name.trim() });
        setMessage("Category created successfully.");
      }
      setName("");
      setEditCategoryId(null);
      fetchCategories();
    } catch (error) {
      setMessage(error.response?.data?.message || "Error saving category.");
    } finally {
      setLoading(false);
    }
  };

  // Handle subcategory creation or update
  const handleSubmitSubCategory = async (e) => {
    e.preventDefault();
    if (!subName.trim() || !parentCategory) {
      setMessage("Both subcategory name and category selection are required.");
      return;
    }

    try {
      setLoading(true);
      if (editSubCategoryId) {
        await API.put(`/subcategory/update/${editSubCategoryId}`, { name: subName.trim(), category: parentCategory });
        setMessage("Subcategory updated successfully.");
      } else {
        await API.post("/subcategory/create", { name: subName.trim(), category: parentCategory });
        setMessage("Subcategory created successfully.");
      }
      setSubName("");
      setParentCategory("");
      setEditSubCategoryId(null);
      fetchCategories();
    } catch (error) {
      setMessage(error.response?.data?.message || "Error saving subcategory.");
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      setLoading(true);
      await API.delete(`/category/delete-category/${id}`);
      setMessage("Category deleted successfully.");
      fetchCategories();
    } catch (error) {
      setMessage(error.response?.data?.message || "Error deleting category.");
    } finally {
      setLoading(false);
    }
  };

  // Delete subcategory
  const handleDeleteSubCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subcategory?")) return;

    try {
      setLoading(true);
      await API.delete(`/subcategory/delete/${id}`);
      setMessage("Subcategory deleted successfully.");
      fetchCategories();
    } catch (error) {
      setMessage(error.response?.data?.message || "Error deleting subcategory.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="category-container">
      <h2 className="heading">Manage Categories & Subcategories</h2>

      {/* Create/Edit Category Form */}
      <form onSubmit={handleSubmitCategory} className="space-y-4">
        <input
          type="text"
          placeholder="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="category-name"
          required
        />
        <button
          type="submit"
          className="btn"
          disabled={loading}
        >
          {loading ? "Saving..." : editCategoryId ? "Update Category" : "Create Category"}
        </button>
      </form>

      {/* Create/Edit Subcategory Form */}
      <form onSubmit={handleSubmitSubCategory} className="space-y-4 mt-6">
        <input
          type="text"
          placeholder="Subcategory Name"
          value={subName}
          onChange={(e) => setSubName(e.target.value)}
          className="subcategory-name"
          required
        />
        <select
          value={parentCategory}
          onChange={(e) => setParentCategory(e.target.value)}
          className="btn"
          required
        >
          <option value="">Select Parent Category</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="btn"
          disabled={loading}
        >
          {loading ? "Saving..." : editSubCategoryId ? "Update Subcategory" : "Create Subcategory"}
        </button>
      </form>

      {/* Display Message */}
      {message && <p className="mt-4 text-center text-red-500">{message}</p>}

      {/* Category & Subcategory List */}
      <div className="category-list">
        <h3 className="category-heading">Categories & Subcategories:</h3>
        <ul className="categories-list">
          {categories.length > 0 ? (
            categories.map((category) => (
              <li key={category._id} className="categories-item">
                {category.name}
                <div>
                  <button
                    onClick={() => {
                      setName(category.name);
                      setEditCategoryId(category._id);
                    }}
                    className="edit-btn"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category._id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
                {category.subcategories && category.subcategories.length > 0 && (
                  <ul className="subcategory-list">
                    {category.subcategories.map((sub) => (
                      <li key={sub._id} className="subcategory-item">
                        {sub.name}
                        <div>
                          <button
                            onClick={() => {
                              setSubName(sub.name);
                              setParentCategory(category._id);
                              setEditSubCategoryId(sub._id);
                            }}
                            className="edit-btn"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSubCategory(sub._id)}
                            className="delete-btn"
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))
          ) : (
            <p>No categories found.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default CreateCategory;
