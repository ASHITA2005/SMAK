import React, { useMemo } from 'react';
import api from '../services/api';
import './GroceryList.css';

function GroceryList({ selectedRecipes }) {
  // Aggregate all ingredients dynamically depending on selected arrays
  const groceryItems = useMemo(() => {
    if (!selectedRecipes || selectedRecipes.length === 0) return [];
    
    const recipesData = api.getMockRecipes();
    const agg = {};

    selectedRecipes.forEach(recipeName => {
      const recipe = recipesData[recipeName];
      if (recipe && recipe.ingredients) {
        recipe.ingredients.forEach(ing => {
          const key = `${ing.item.toLowerCase().trim()}_${ing.unit.toLowerCase().trim()}`;
          if (!agg[key]) {
            agg[key] = {
              item: ing.item,
              amount: 0,
              unit: ing.unit,
              usedIn: new Set()
            };
          }
          agg[key].amount += ing.amount;
          agg[key].usedIn.add(recipeName);
        });
      }
    });

    return Object.values(agg).sort((a, b) => a.item.localeCompare(b.item));
  }, [selectedRecipes]);

  if (groceryItems.length === 0) {
    return null;
  }

  return (
    <div className="grocery-list-container">
      <h2 className="grocery-list-header">
        <span role="img" aria-label="cart">🛒</span> Grocery List
      </h2>
      <p className="grocery-list-subtitle">
        Consolidated ingredients required to cook the {selectedRecipes.length} selected recipes.
      </p>

      <ul className="grocery-list-items">
        {groceryItems.map((ing, idx) => (
          <li key={idx} className="grocery-item">
            <div className="grocery-item-left">
              <input type="checkbox" className="grocery-checkbox" />
              <div>
                <div className="grocery-item-name">{ing.item}</div>
                <div className="grocery-item-sources">
                  For: {[...ing.usedIn].map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(', ')}
                </div>
              </div>
            </div>
            <div className="grocery-item-amount">
              {ing.amount} {ing.unit}
            </div>
          </li>
        ))}
      </ul>
      <div className="grocery-list-actions">
        <button 
          onClick={() => window.print()}
          className="grocery-print-btn"
        >
          🖨️ Print List
        </button>
      </div>
    </div>
  );
}

export default GroceryList;
