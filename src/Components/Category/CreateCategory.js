import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CreateCategory = () => {
  const [name, setName] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch all categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get('https://tutorial-haven-backend.vercel.app/api/category/get-category');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Handle form submission to create category
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setMessage('Category name is required.');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('https://tutorial-haven-backend.vercel.app/api/category/create-category', { name: name.trim() });
      setMessage(response.data.message);
      setName('');
      fetchCategories(); // Refresh the category list after adding a new one
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error creating category.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Create Category</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border p-2 w-full rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white w-full py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Category'}
        </button>
      </form>

      {message && <p className="mt-4 text-center text-red-500">{message}</p>}

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-2">Categories List:</h3>
        <ul className="list-disc pl-5">
          {categories.length > 0 ? (
            categories.map((category) => (
              <li key={category._id} className="py-1">{category.name}</li>
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
