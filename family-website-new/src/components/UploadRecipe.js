import React, { useState } from 'react';

const UploadRecipe = () => {
  const [recipeName, setRecipeName] = useState('');
  const [recipeUrl, setRecipeUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // כאן תוכל להוסיף לוגיקה לשמירת המתכון
    console.log("שם המתכון:", recipeName);
    console.log("כתובת ה-URL:", recipeUrl);
  };

  return (
    <div>
      <h1>העלאת מתכון</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>שם המתכון:</label>
          <input 
            type="text" 
            value={recipeName} 
            onChange={(e) => setRecipeName(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>כתובת ה-URL:</label>
          <input 
            type="url" 
            value={recipeUrl} 
            onChange={(e) => setRecipeUrl(e.target.value)} 
            required 
          />
        </div>
        <button type="submit">שמור מתכון</button>
      </form>
    </div>
  );
};

export default UploadRecipe; 